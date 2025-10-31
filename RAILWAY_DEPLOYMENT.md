# Railway Deployment Guide - FC Köln App

## 🚨 Quick Fix for Current Error

The error you're seeing is because Railway needs environment variables. Follow these steps:

### Step 1: Add Environment Variables in Railway

Go to your Railway project → **Settings → Variables** and add these:

```env
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=generate_a_random_64_character_string
SESSION_SECRET=generate_another_random_64_character_string
NODE_ENV=production
```

### Step 2: Get Your Database URL from Replit

1. In Replit, check your **Secrets** (lock icon in sidebar)
2. Copy the `DATABASE_URL` value
3. Paste it into Railway's `DATABASE_URL` variable

### Step 3: Generate Secrets

For `JWT_SECRET` and `SESSION_SECRET`, you can generate random strings:

**Option A: Using Node.js (in Replit Shell)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option B: Using OpenSSL**
```bash
openssl rand -hex 64
```

**Option C: Online Generator**
Use [randomkeygen.com](https://randomkeygen.com/) or similar (choose "CodeIgniter Encryption Keys")

### Step 4: Redeploy

After adding all environment variables, Railway will automatically redeploy. If not, click **"Deploy"** manually.

---

## 📋 Complete Environment Variables List

### Required (Must Have)
```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
JWT_SECRET=64_character_random_string_for_jwt_tokens_production_use
SESSION_SECRET=64_character_random_string_for_session_encryption
```

### Optional (Recommended)
```env
NODE_ENV=production
SENDGRID_API_KEY=SG.your_sendgrid_key_for_password_reset_emails
ADMIN_API_KEY=your_admin_api_key_if_needed
```

### Auto-Provided by Railway (Don't Add These)
```env
PORT=auto_assigned_by_railway
```

---

## 🔧 How Railway Deployment Works

Railway will:
1. ✅ Clone your GitHub repository
2. ✅ Detect Node.js from `package.json`
3. ✅ Run `npm install` (installs all dependencies including `tsx`)
4. ✅ Use `tsx server/index.ts` to start (via `railway.json` config)
5. ✅ Assign a dynamic port (your server uses `process.env.PORT`)

---

## 📁 Important Files for Railway

### `railway.json` (Already Created)
Tells Railway to use `tsx` to run TypeScript directly:
```json
{
  "deploy": {
    "startCommand": "tsx server/index.ts"
  }
}
```

### `Procfile` (Backup)
Alternative way to specify start command:
```
web: tsx server/index.ts
```

### `.env.example`
Template for environment variables (not used by Railway, just for reference)

---

## 🐛 Troubleshooting

### Error: "Cannot find module '/app/server/index.js'"
**Cause:** Railway tried to run compiled JavaScript, but TypeScript wasn't compiled.  
**Fix:** The `railway.json` file now tells Railway to use `tsx` directly - no compilation needed!

### Error: "Missing environment variables: DATABASE_URL, JWT_SECRET, SESSION_SECRET"
**Cause:** Environment variables not set in Railway.  
**Fix:** Add them in Railway Settings → Variables (see Step 1 above)

### Error: "Database connection failed"
**Cause:** Invalid `DATABASE_URL` or database not accessible.  
**Fix:** 
- Make sure you're using the Neon PostgreSQL URL from Replit
- Ensure `?sslmode=require` is at the end of the URL
- Check that your Neon database allows external connections

### Error: "Port already in use"
**Cause:** Shouldn't happen on Railway (they assign unique ports).  
**Fix:** Make sure your code uses `process.env.PORT` (already configured)

---

## 🎯 Deployment Checklist

Before deploying to Railway, make sure:

- [ ] Pushed all code to GitHub
- [ ] `railway.json` exists in repository root
- [ ] Environment variables added in Railway dashboard
- [ ] `DATABASE_URL` points to accessible PostgreSQL database
- [ ] `JWT_SECRET` and `SESSION_SECRET` are strong random strings
- [ ] Repository is connected to Railway project

---

## 🔄 Continuous Deployment

Every time you push to GitHub:
1. Railway automatically detects the push
2. Pulls latest code
3. Runs `npm install`
4. Restarts with `tsx server/index.ts`
5. Your app is live in ~2-3 minutes!

---

## 🌐 Get Your Live URL

After successful deployment:
1. Go to Railway project dashboard
2. Click **Settings → Networking**
3. Click **"Generate Domain"**
4. Your app is live at: `https://your-app-name.up.railway.app`

---

## 🔒 Security Checklist

- [ ] Strong random `JWT_SECRET` (min 64 characters)
- [ ] Strong random `SESSION_SECRET` (min 64 characters)
- [ ] `NODE_ENV=production` set
- [ ] Database URL uses SSL (`?sslmode=require`)
- [ ] No secrets committed to GitHub (check `.gitignore`)
- [ ] Default test passwords changed in production database

---

## 📊 Monitoring

Railway provides:
- **Deployment logs** - Click "View Logs" to see startup/errors
- **Metrics** - CPU, Memory, Network usage
- **Health checks** - Your `/healthz` endpoint

---

## 🆘 Still Having Issues?

1. Check Railway logs: Project → Deployments → Latest → View Logs
2. Verify environment variables: Settings → Variables
3. Test locally first: `npm start` in Replit
4. Check database connectivity: `DATABASE_URL` format correct?

---

**Your app should now be deploying successfully! 🚀**
