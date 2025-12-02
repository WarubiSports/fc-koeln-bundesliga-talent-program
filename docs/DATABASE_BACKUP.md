# Database Backup & Recovery Guide

## Overview

The Warubi Platform uses **Neon PostgreSQL**, a serverless Postgres provider that includes built-in backup and recovery capabilities.

## Automatic Backups

### Point-in-Time Recovery (PITR)

Neon provides **automatic continuous backups** with Point-in-Time Recovery:

- **Retention Period**: 7 days (Free tier) / 30 days (Pro tier)
- **Granularity**: Recover to any point within the retention window
- **No Configuration Required**: Enabled by default on all Neon databases

### How It Works

1. Neon continuously records all database changes (WAL - Write-Ahead Log)
2. You can restore your database to any second within the retention period
3. Restoration creates a new database branch, preserving the original

## Recovery Procedures

### Accessing Recovery Options

1. Log in to the [Neon Console](https://console.neon.tech)
2. Select your project
3. Navigate to **Branches** in the sidebar
4. Click **Restore** next to your main branch

### Restoring to a Specific Point in Time

1. In the Neon Console, go to **Branches** → **Restore**
2. Select "Point in time" recovery type
3. Choose the date and time to restore to
4. Click **Restore** to create a new branch with the recovered data
5. Optionally, rename the original branch and promote the restored branch

### Using Neon CLI

```bash
# Install Neon CLI
npm install -g neonctl

# Authenticate
neonctl auth

# List available branches
neonctl branches list --project-id your-project-id

# Create a restored branch from a point in time
neonctl branches create \
  --project-id your-project-id \
  --name restored-branch \
  --parent main \
  --timestamp "2024-12-01T12:00:00Z"
```

## Manual Backup (Export)

For additional protection, you can create manual exports:

### Using pg_dump

```bash
# Set your connection string
export DATABASE_URL="your-neon-connection-string"

# Full database dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema only
pg_dump --schema-only $DATABASE_URL > schema_backup.sql

# Data only
pg_dump --data-only $DATABASE_URL > data_backup.sql
```

### Restoring from pg_dump

```bash
# Restore from SQL file
psql $DATABASE_URL < backup_20241201_120000.sql

# Restore from compressed file
gunzip -c backup_20241201_120000.sql.gz | psql $DATABASE_URL
```

## Best Practices

### Pre-Deployment Checklist

1. **Verify Neon PITR is active**: Check Neon Console → Project Settings → Storage
2. **Test recovery process**: Practice restoring to a test branch before you need it
3. **Document connection strings**: Keep backup of connection strings in secure location

### Scheduled Manual Exports

For critical data, consider scheduled exports:

```bash
# Cron job for daily backups (add to crontab)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/warubi_$(date +\%Y\%m\%d).sql.gz
```

### Multi-Region Considerations

- Neon stores data in your selected region
- For additional redundancy, export backups to different cloud storage (S3, GCS)

## Recovery Scenarios

### Scenario 1: Accidental Data Deletion

1. Identify when the deletion occurred
2. Use Neon PITR to restore to 1 minute before the deletion
3. Export the needed data from the restored branch
4. Import into the main branch or swap branches

### Scenario 2: Database Corruption

1. Use Neon Console to identify the last known good state
2. Create a new branch from that point in time
3. Verify data integrity on the new branch
4. Promote the new branch as main

### Scenario 3: Schema Migration Gone Wrong

1. The Replit platform creates automatic checkpoints
2. Use Replit's **Rollback** feature to restore code + database
3. Alternatively, use Neon PITR to restore database only

## Environment Variables

The platform uses these database-related environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full connection string |
| `PGHOST` | Database host |
| `PGPORT` | Database port |
| `PGUSER` | Database username |
| `PGPASSWORD` | Database password |
| `PGDATABASE` | Database name |

## Monitoring

### Health Check Endpoints

- `/healthz` - Simple liveness check
- `/healthz/ready` - Database connectivity verification

### Database Connection Monitoring

The platform logs database connection errors and includes:
- Connection pool status
- Query execution times (via request logging)
- Error rates

## Support

- **Neon Support**: [neon.tech/docs](https://neon.tech/docs)
- **Replit Support**: [replit.com/support](https://replit.com/support)

## Verification Checklist

Before considering the backup system production-ready, verify:

- [ ] Neon PITR is enabled in console (Settings → Storage)
- [ ] `/healthz/ready` endpoint returns healthy status
- [ ] Manual `pg_dump` export works successfully
- [ ] Team knows how to perform recovery (document in runbook)
- [ ] Tested PITR recovery on a non-production branch
