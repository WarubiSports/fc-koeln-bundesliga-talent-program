# Warubi Platform - App Onboarding Guide

Welcome to the Warubi Multi-App Backend Platform! This guide will walk you through integrating your application with the platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Your API Key](#getting-your-api-key)
3. [Making Your First Request](#making-your-first-request)
4. [Setting Up Authentication](#setting-up-authentication)
5. [Building Your App Routes](#building-your-app-routes)
6. [Multi-Tenant Data Isolation](#multi-tenant-data-isolation)
7. [Testing Your Integration](#testing-your-integration)
8. [Monitoring & Metrics](#monitoring--metrics)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- Access to the Warubi platform admin interface
- Your app's allowed origins (domains where your frontend will run)
- Basic understanding of REST APIs and authentication
- Node.js development environment (if building backend routes)

---

## Getting Your API Key

### Step 1: Register Your App

Contact the platform administrator with:
- **App ID**: Unique identifier (lowercase, no spaces, e.g., `myapp`)
- **App Name**: Human-readable name (e.g., `My Awesome App`)
- **Allowed Origins**: Array of frontend URLs (e.g., `["https://myapp.com", "http://localhost:3000"]`)
- **Rate Limit**: Requests per minute (default: 600)

### Step 2: Receive Your API Key

The administrator will create your app and provide:
```json
{
  "success": true,
  "app": {
    "id": "myapp",
    "name": "My Awesome App",
    "allowedOrigins": ["https://myapp.com"],
    "rateLimitPerMin": 600
  },
  "apiKey": "waru_a1b2c3d4e5f6..."
}
```

⚠️ **IMPORTANT**: Save this API key securely! It won't be shown again.

### Step 3: Store Your API Key

Store your API key as an environment variable:
```bash
# In your .env file
WARUBI_API_KEY=waru_a1b2c3d4e5f6...
```

Never commit your API key to version control!

---

## Making Your First Request

### Health Check

Test the platform is running:
```bash
curl https://platform.warubi.com/healthz
# Response: {"status":"ok"}
```

### Authenticated Ping

Test your API key works:
```bash
curl -H "X-App-Key: waru_a1b2c3d4e5f6..." \
  https://platform.warubi.com/api/ping

# Response:
{
  "pong": true,
  "app": "My Awesome App",
  "timestamp": "2025-10-27T20:00:00.000Z"
}
```

### Get Platform Info

Check your app context:
```bash
curl -H "X-App-Key: YOUR_KEY" \
  https://platform.warubi.com/api/info

# Response:
{
  "platform": "Warubi Multi-App Backend",
  "version": "1.0.0",
  "app": {
    "id": "myapp",
    "name": "My Awesome App"
  },
  "rateLimit": {
    "limit": 600,
    "remaining": 599
  }
}
```

---

## Setting Up Authentication

### Frontend Integration

#### React/JavaScript Example

```javascript
// api.js
const API_BASE_URL = 'https://platform.warubi.com';
const API_KEY = import.meta.env.VITE_WARUBI_API_KEY; // Use env vars

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-App-Key': API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Usage
const data = await apiRequest('/api/users');
```

#### TypeScript Example

```typescript
// api.ts
interface ApiOptions extends RequestInit {
  headers?: HeadersInit;
}

class WarubiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://platform.warubi.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }
}

// Usage
const client = new WarubiClient(import.meta.env.VITE_WARUBI_API_KEY);
const users = await client.request<User[]>('/api/users');
```

### Development Mode

For localhost development, the platform auto-defaults to the first registered app if no API key is provided:

```javascript
// Works in development (localhost only)
fetch('http://localhost:5000/api/info')
  .then(res => res.json())
  .then(console.log);

// ⚠️ Production requires X-App-Key header!
```

---

## Building Your App Routes

### Creating Custom Routes

Add your app-specific routes in `server/routes/yourapp.ts`:

```typescript
import express from 'express';
import { pool } from '../db.cjs'; // PostgreSQL connection pool

const router = express.Router();

// All routes here have req.appCtx from middleware
// req.appCtx = { id: 'myapp', name: 'My Awesome App', origins: [...], rps: 600 }

// Example: Get users for your app
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE app_id = $1',
      [req.appCtx.id] // Critical: Always filter by app_id!
    );

    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// Example: Create a user
router.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;

    const result = await pool.query(
      'INSERT INTO users (email, name, app_id) VALUES ($1, $2, $3) RETURNING *',
      [email, name, req.appCtx.id] // Always include app_id!
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
});

export default router;
```

### Register Your Routes

In `server/index.ts`:

```typescript
import myAppRoutes from './routes/myapp.js';
app.use('/api', myAppRoutes);
```

---

## Multi-Tenant Data Isolation

### Database Schema Requirements

All your tables MUST include an `app_id` column:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  app_id VARCHAR(50) NOT NULL,  -- Required!
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX idx_users_app_id ON users(app_id);
```

### Golden Rules

1. **ALWAYS filter by app_id** in WHERE clauses
2. **ALWAYS insert app_id** from `req.appCtx.id`
3. **NEVER trust client-provided app_id**
4. **Test cross-app isolation** in your tests

### Example: Safe Query Pattern

```javascript
// ✅ GOOD: Filters by app_id
const users = await pool.query(
  'SELECT * FROM users WHERE app_id = $1 AND status = $2',
  [req.appCtx.id, 'active']
);

// ❌ BAD: Missing app_id filter
const users = await pool.query(
  'SELECT * FROM users WHERE status = $1',
  ['active'] // SECURITY RISK: Returns all apps' users!
);

// ✅ GOOD: Includes app_id on insert
await pool.query(
  'INSERT INTO users (email, name, app_id) VALUES ($1, $2, $3)',
  [email, name, req.appCtx.id]
);

// ❌ BAD: Uses client-provided app_id
await pool.query(
  'INSERT INTO users (email, name, app_id) VALUES ($1, $2, $3)',
  [email, name, req.body.app_id] // SECURITY RISK: Client can spoof!
);
```

---

## Testing Your Integration

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('My App API', () => {
  it('should require API key', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(401);

    expect(response.body.error).toBe('Missing X-App-Key header');
  });

  it('should return users for authenticated app', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('X-App-Key', 'test_key')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
```

### Integration Tests

Test multi-tenant isolation:

```typescript
it('should not return other apps\' data', async () => {
  const result = await pool.query(
    'SELECT * FROM users WHERE app_id = $1 AND email = $2',
    ['my-app', 'user@other-app.com']
  );

  expect(result.rows.length).toBe(0);
});
```

---

## Monitoring & Metrics

### Check Your App Metrics

```bash
curl -H "X-App-Key: YOUR_KEY" \
  https://platform.warubi.com/api/metrics

# Response:
{
  "success": true,
  "appId": "myapp",
  "metrics": {
    "requestCount": 1543,
    "errorCount": 12,
    "errorRate": "0.78%",
    "avgDuration": "45.23ms",
    "statusCodes": {
      "200": 1490,
      "400": 8,
      "500": 4
    },
    "periodStart": "2025-10-27T19:00:00.000Z"
  }
}
```

### Rate Limiting

Monitor your rate limit headers:
```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 595
X-RateLimit-Reset: 1730061876
```

If you hit the limit (429 response):
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Try again in 45 seconds.",
  "retryAfter": 45
}
```

---

## Best Practices

### Security

1. ✅ Store API keys in environment variables
2. ✅ Use HTTPS in production
3. ✅ Always filter database queries by `app_id`
4. ✅ Validate and sanitize all user inputs
5. ✅ Use parameterized SQL queries to prevent injection
6. ❌ Never log API keys
7. ❌ Never expose API keys in client-side code

### Performance

1. ✅ Cache frequently accessed data
2. ✅ Use database indexes on `app_id` columns
3. ✅ Implement pagination for large datasets
4. ✅ Monitor your metrics regularly
5. ❌ Don't make unnecessary API calls

### Error Handling

```javascript
try {
  const data = await apiRequest('/api/users');
  // Handle success
} catch (error) {
  if (error.message.includes('429')) {
    // Rate limit exceeded - implement retry logic
    console.error('Rate limited, retrying in 60 seconds...');
  } else if (error.message.includes('401')) {
    // Authentication failed
    console.error('Invalid API key');
  } else {
    // Other errors
    console.error('API error:', error.message);
  }
}
```

---

## Troubleshooting

### Issue: "Missing X-App-Key header"

**Solution**: Ensure you're sending the header in all API requests:
```javascript
headers: {
  'X-App-Key': 'your_api_key_here'
}
```

### Issue: "Invalid API key"

**Solutions**:
1. Verify your API key is correct (no extra spaces/characters)
2. Check if your app has been deactivated (contact admin)
3. Regenerate your API key if compromised

### Issue: "Rate limit exceeded"

**Solutions**:
1. Implement exponential backoff retry logic
2. Cache responses to reduce API calls
3. Request a rate limit increase from admin

### Issue: CORS errors

**Solutions**:
1. Verify your origin is in the allowed origins list
2. Contact admin to add your domain
3. Check for typos in the origin URL (http vs https, trailing slashes)

### Issue: Seeing data from other apps

**Solutions**:
1. ⚠️ CRITICAL: You're not filtering by `app_id`!
2. Review all database queries
3. Add `WHERE app_id = $1` to all SELECT statements
4. Run integration tests to verify isolation

### Issue: "App disabled"

**Solution**: Contact the platform administrator - your app may have been deactivated.

---

## API Key Rotation

If your key is compromised:

1. Contact admin to regenerate your key
2. Update your environment variables
3. Deploy the updated configuration
4. The old key is immediately invalidated

---

## Support

Need help? Contact:
- **Platform Admin**: admin@warubi.com
- **Documentation**: https://docs.warubi.com
- **Status Page**: https://status.warubi.com

---

## Quick Reference

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/healthz` | GET | No | Health check |
| `/api/ping` | GET | Yes | Test authentication |
| `/api/info` | GET | Yes | Get app context |
| `/api/metrics` | GET | Yes | Get app metrics |
| `/api/*` | ALL | Yes | Your app routes |

### Headers

```
X-App-Key: your_api_key_here
Content-Type: application/json
```

### Environment Variables

```bash
# Frontend
VITE_WARUBI_API_KEY=waru_...
VITE_API_BASE_URL=https://platform.warubi.com

# Backend
WARUBI_API_KEY=waru_...
```

---

**Happy Building! 🚀**
