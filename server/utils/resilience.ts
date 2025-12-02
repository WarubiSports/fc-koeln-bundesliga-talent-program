interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

interface ResilienceEvent {
  type: 'circuit_open' | 'circuit_half_open' | 'circuit_closed' | 'retry' | 'timeout' | 'rate_limit';
  service: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

const circuits = new Map<string, CircuitState>();
const eventListeners: ((event: ResilienceEvent) => void)[] = [];

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIME = 60000; // 1 minute
const DEFAULT_TIMEOUT = 30000; // 30 seconds

function emitEvent(event: ResilienceEvent): void {
  console.log(JSON.stringify({ level: 'info', category: 'resilience', ...event }));
  eventListeners.forEach(listener => listener(event));
}

export function onResilienceEvent(listener: (event: ResilienceEvent) => void): () => void {
  eventListeners.push(listener);
  return () => {
    const index = eventListeners.indexOf(listener);
    if (index > -1) eventListeners.splice(index, 1);
  };
}

export class CircuitBreakerError extends Error {
  constructor(service: string) {
    super(`Service ${service} is temporarily unavailable. Please try again later.`);
    this.name = 'CircuitBreakerError';
  }
}

function getCircuit(name: string): CircuitState {
  if (!circuits.has(name)) {
    circuits.set(name, { failures: 0, lastFailure: 0, state: 'closed' });
  }
  return circuits.get(name)!;
}

function recordSuccess(name: string): void {
  const circuit = getCircuit(name);
  const wasOpen = circuit.state !== 'closed';
  circuit.failures = 0;
  circuit.state = 'closed';
  
  if (wasOpen) {
    emitEvent({
      type: 'circuit_closed',
      service: name,
      timestamp: new Date().toISOString(),
      details: { message: 'Circuit recovered and closed' }
    });
  }
}

function recordFailure(name: string): void {
  const circuit = getCircuit(name);
  circuit.failures++;
  circuit.lastFailure = Date.now();
  
  if (circuit.failures >= FAILURE_THRESHOLD && circuit.state !== 'open') {
    circuit.state = 'open';
    emitEvent({
      type: 'circuit_open',
      service: name,
      timestamp: new Date().toISOString(),
      details: { failures: circuit.failures, threshold: FAILURE_THRESHOLD }
    });
  }
}

function canAttempt(name: string): boolean {
  const circuit = getCircuit(name);
  
  if (circuit.state === 'closed') {
    return true;
  }
  
  if (circuit.state === 'open') {
    if (Date.now() - circuit.lastFailure > RECOVERY_TIME) {
      circuit.state = 'half-open';
      emitEvent({
        type: 'circuit_half_open',
        service: name,
        timestamp: new Date().toISOString(),
        details: { message: 'Circuit entering recovery mode' }
      });
      return true;
    }
    return false;
  }
  
  return true;
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
  circuitName?: string;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = DEFAULT_TIMEOUT,
    circuitName
  } = options;

  if (circuitName && !canAttempt(circuitName)) {
    throw new CircuitBreakerError(circuitName);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(operation(), timeout);
      
      if (circuitName) {
        recordSuccess(circuitName);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (circuitName) {
        recordFailure(circuitName);
      }

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const jitter = delay * 0.2 * Math.random();
        const totalDelay = Math.round(delay + jitter);
        
        emitEvent({
          type: 'retry',
          service: circuitName || 'unknown',
          timestamp: new Date().toISOString(),
          details: { 
            attempt: attempt + 1, 
            maxRetries: maxRetries + 1, 
            delayMs: totalDelay,
            error: lastError?.message 
          }
        });
        
        await sleep(totalDelay);
      }
    }
  }

  throw lastError;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getCircuitStatus(name: string): { state: string; failures: number } {
  const circuit = getCircuit(name);
  return { state: circuit.state, failures: circuit.failures };
}

export function resetCircuit(name: string): void {
  circuits.delete(name);
  console.log(`[Circuit Breaker] ${name} circuit reset`);
}
