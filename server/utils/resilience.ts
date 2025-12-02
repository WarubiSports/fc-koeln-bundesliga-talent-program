interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

const circuits = new Map<string, CircuitState>();

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIME = 60000; // 1 minute
const DEFAULT_TIMEOUT = 30000; // 30 seconds

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
  circuit.failures = 0;
  circuit.state = 'closed';
}

function recordFailure(name: string): void {
  const circuit = getCircuit(name);
  circuit.failures++;
  circuit.lastFailure = Date.now();
  
  if (circuit.failures >= FAILURE_THRESHOLD) {
    circuit.state = 'open';
    console.warn(`[Circuit Breaker] ${name} circuit OPENED after ${circuit.failures} failures`);
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
      console.log(`[Circuit Breaker] ${name} circuit entering HALF-OPEN state`);
      return true;
    }
    return false;
  }
  
  return true; // half-open allows one attempt
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
        console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed for ${circuitName || 'operation'}, retrying in ${Math.round(delay + jitter)}ms`);
        await sleep(delay + jitter);
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
