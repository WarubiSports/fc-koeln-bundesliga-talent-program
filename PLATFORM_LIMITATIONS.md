# Warubi Platform - Known Limitations

## Current Version: 1.0.0 (Development-Ready)

This document outlines the current limitations of the Warubi multi-app platform and planned improvements for production readiness.

---

## 🟡 Current Limitations

### 1. Rate Limiting (In-Memory Store)

**Limitation:**
- Rate limits are stored in-memory per server process
- Counters reset when server restarts
- Does NOT work with horizontal scaling (multiple server instances)

**Impact:**
- Single server deployments only
- Rate limit counters lost on crash/restart
- Load balancers will give each instance separate counters

**Workaround:**
- Acceptable for development and single-instance production
- Deploy to single Railway instance (no horizontal scaling)

**Future Fix:**
- Migrate to Redis or PostgreSQL-based rate limiting
- Use token bucket or sliding window algorithm with shared storage

---

### 2. Admin Authentication (Simple Key-Based)

**Limitation:**
- Admin endpoints protected by single `X-Admin-Key` header
- No role-based access control (RBAC)
- No audit logging of admin actions
- No IP allowlisting

**Impact:**
- Anyone with admin key has full platform access
- No granular permissions (create vs delete apps)
- Key rotation requires manual environment variable update

**Workaround:**
- Keep `ADMIN_API_KEY` secret (use Replit Secrets)
- Rotate key regularly
- Limit admin endpoint access to trusted networks if possible

**Future Fix:**
- Implement JWT-based admin authentication
- Add role-based permissions (superadmin, app-admin)
- IP allowlisting for admin endpoints
- Audit log for all admin operations

---

### 3. Multi-Tenant Data Isolation (Not Enforced)

**Limitation:**
- `app_id` columns are nullable in database
- No foreign key constraints to `apps` table
- No database-level indexes on `app_id`
- Application code must manually filter by `app_id`

**Impact:**
- Possible to query data across apps if code doesn't filter
- No automatic enforcement of data isolation
- Performance issues on large tables without indexes

**Workaround:**
- Carefully audit all database queries to include `WHERE app_id = $1`
- Test thoroughly with multiple apps
- Code reviews must verify app_id filtering

**Future Fix:**
- Make `app_id` NOT NULL after initial data migration
- Add foreign key constraints: `FOREIGN KEY (app_id) REFERENCES apps(id)`
- Create indexes: `CREATE INDEX idx_users_app_id ON users(app_id)`
- Add database-level Row Level Security (RLS) policies

---

### 4. No App Usage Analytics

**Limitation:**
- No tracking of API usage per app
- No visibility into which endpoints are called most
- No storage usage metrics per app

**Impact:**
- Cannot bill apps based on usage
- No data for capacity planning
- Difficult to debug app-specific issues

**Future Fix:**
- Add usage tracking table
- Instrument all API endpoints
- Dashboard showing requests/day, storage, rate limit hits

---

### 5. Single Database (No Sharding)

**Limitation:**
- All apps share single PostgreSQL database
- All tables in one schema
- No data sharding by app

**Impact:**
- Limited to single database capacity
- One noisy app can impact all apps
- Cannot isolate sensitive apps to separate databases

**Future Fix:**
- Implement database-per-app option for premium apps
- Horizontal sharding for high-volume apps
- Read replicas for analytics workloads

---

## ✅ What IS Production-Ready

- ✅ API key authentication with SHA256 hashing
- ✅ Per-app rate limiting (single instance)
- ✅ CORS per app based on allowed origins
- ✅ Graceful shutdown handling
- ✅ Health check endpoints
- ✅ Structured JSON logging
- ✅ Admin CRUD for app management
- ✅ Multi-tenant schema (app_id in all tables)

---

## 📋 Production Readiness Checklist

### Critical (Must Fix Before Production)
- [ ] Move rate limiting to Redis/PostgreSQL
- [ ] Make `app_id` NOT NULL with foreign keys
- [ ] Add indexes on all `app_id` columns
- [ ] Implement proper admin authentication (JWT + RBAC)
- [ ] Add IP allowlisting for admin endpoints
- [ ] Audit logging for admin actions
- [ ] Enforce app_id filtering in ALL queries

### Important (Should Fix Soon)
- [ ] Usage analytics and billing metrics
- [ ] Request/response logging per app
- [ ] Database backup and restore procedures
- [ ] Monitoring and alerting setup
- [ ] Rate limit notifications (warn before blocking)
- [ ] API key rotation mechanism

### Nice to Have (Future Enhancements)
- [ ] Multi-region deployment support
- [ ] Database sharding by app
- [ ] Read replicas for analytics
- [ ] GraphQL API option
- [ ] Webhook support for apps
- [ ] Self-service app creation portal

---

## 🔧 Deployment Recommendations

### Development
- Single Railway instance
- Use Replit Secrets for `ADMIN_API_KEY`
- Keep `APPKEY_CORE_SEED` for core app
- PostgreSQL from Railway or Neon

### Staging
- Same as development
- Test with 2-3 apps minimum
- Load test rate limiting
- Verify data isolation

### Production (Current Capabilities)
- **Max**: Single Railway instance
- **Max Apps**: ~50 (limited by rate limiting memory)
- **Max Users**: ~10,000 per app
- **Monitoring**: Manual via logs
- **Backup**: Railway automated backups

### Production (After Fixes)
- Horizontal scaling with Redis
- Unlimited apps
- Millions of users
- Automated monitoring
- Point-in-time recovery

---

## 📞 Support

For questions or to report issues:
- GitHub Issues: [Your repo]
- Email: [Your email]
- Documentation: `/api/docs`

---

**Last Updated:** January 2025
**Platform Version:** 1.0.0
**Status:** Development-Ready
