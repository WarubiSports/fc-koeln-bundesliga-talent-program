/**
 * Security utilities for sanitizing inputs and masking secrets
 */

const SENSITIVE_HEADERS = ['x-app-key', 'x-admin-key', 'authorization', 'cookie'];
const SENSITIVE_FIELDS = ['password', 'apiKey', 'api_key', 'secret', 'token'];

/**
 * Mask sensitive values in an object for safe logging
 */
export function maskSensitiveData(obj: Record<string, any>): Record<string, any> {
  const masked: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      masked[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * Mask sensitive headers for logging
 */
export function maskHeaders(headers: Record<string, any>): Record<string, any> {
  const masked: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      masked[key] = value ? '[PRESENT]' : '[ABSENT]';
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * Sanitize user input to prevent prompt injection
 * Removes or escapes potentially harmful patterns
 */
export function sanitizeForPrompt(input: string): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input
    .replace(/```/g, '')
    .replace(/\*\*/g, '')
    .replace(/ignore (all |previous |above )?instructions?/gi, '[filtered]')
    .replace(/disregard (all |previous |above )?instructions?/gi, '[filtered]')
    .replace(/forget (all |previous |above )?instructions?/gi, '[filtered]')
    .replace(/new instructions?:/gi, '[filtered]')
    .replace(/system prompt:/gi, '[filtered]')
    .replace(/\{?\{?\s*system\s*\}?\}?/gi, '[filtered]')
    .replace(/\[\[.*?\]\]/g, '')
    .replace(/<\/?script.*?>/gi, '')
    .replace(/<\/?style.*?>/gi, '');
  
  sanitized = sanitized.slice(0, 1000);
  
  return sanitized.trim();
}

/**
 * Sanitize an entire player profile object
 */
export function sanitizePlayerProfile(profile: any): any {
  if (!profile || typeof profile !== 'object') return profile;
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(profile)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeForPrompt(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' ? sanitizePlayerProfile(item) : 
        typeof item === 'string' ? sanitizeForPrompt(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePlayerProfile(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
