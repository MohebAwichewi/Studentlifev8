## 🆘 503 SERVICE UNAVAILABLE - DIAGNOSTIC GUIDE

You're getting 503 because the app is **not starting properly** or **the database is not connecting**.

### ✅ NEW FEATURES ADDED FOR DIAGNOSTICS:

1. **Health Check Endpoint**: `https://student-life.uk/api/health`
   - Test this first! It will tell you if app and DB are working
   - Should show JSON with `"status": "healthy"`

2. **Enhanced Startup Logging**: Check cPanel logs for detailed startup info
   - Look for `✅ [SUCCESS] Server ready`
   - If you see `❌ [CRITICAL ERROR]`, that's the problem

3. **Prisma Connection Events**: Better database connection debugging

---

## 🔍 STEP-BY-STEP DIAGNOSTICS:

### Step 1: Test Health Endpoint
```
Open this in your browser:
https://student-life.uk/api/health
```

**If you see:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```
✅ App and database are working! Problem is elsewhere (see Step 3)

**If you see:**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "..."
}
```
❌ Database connection failed (see Step 2)

---

### Step 2: Check cPanel Logs

**Via SSH:**
```bash
tail -f /home/username/nodevenv/studentlife/var/log/app.log
```

**Or via cPanel UI:**
- cPanel > Node.js > Select App > Logs

**Look for one of these:**

**Case A: DATABASE_URL not set**
```
ERROR: DATABASE_URL environment variable is not set!
```
→ Go to cPanel > Node.js > Edit > Environment Variables
→ Add DATABASE_URL

**Case B: Database connection timeout**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Database is not running or wrong credentials
→ Verify DATABASE_URL is correct

**Case C: Prisma binary mismatch**
```
libc.so.6 not found
```
→ Run: `npm run postinstall` on server

**Case D: App starts but crashes later**
```
❌ [CRITICAL ERROR] app.prepare() failed
```
→ Check for TypeScript/build errors in full log

---

### Step 3: Manually Test Database Connection

**SSH into cPanel and run:**
```bash
# Test PostgreSQL connection
psql -h localhost -U your_db_user -d studentlife_db

# Should return: psql (version X.X)
# If fails with "Connection refused", database is down or wrong host
```

---

## 🚨 COMMON 503 FIXES:

### Fix 1: Ensure DATABASE_URL is Set
1. Go to **cPanel > Node.js**
2. Click your app > **Edit**
3. Scroll to **Environment Variables**
4. Add/verify:
   ```
   DATABASE_URL = postgresql://user:password@localhost:5432/db_name
   NODE_ENV = production
   ```
5. **SAVE & RESTART**

### Fix 2: Rebuild Prisma for Linux
```bash
# SSH into server
cd /home/username/public_html

# Clean old binaries
rm -rf node_modules/.prisma
rm -rf node_modules

# Reinstall
npm install

# This regenerates Prisma for Linux
npm run postinstall

# Rebuild app
npm run build

# Restart in cPanel UI
```

### Fix 3: Check PostgreSQL is Running
```bash
# SSH into server
sudo systemctl status postgresql

# If not running:
sudo systemctl start postgresql
```

### Fix 4: Verify Port is Not Blocked
```bash
# SSH into server - check if Node app is listening
netstat -tlnp | grep node

# Should show something like:
# tcp    0  0 0.0.0.0:8080    0.0.0.0:*    LISTEN    1234/node
```

---

## ⚡ QUICK RESTART PROCEDURE:

If you made environment variable changes:

1. **Via cPanel UI:**
   - Node.js > Your App > Restart

2. **Via SSH:**
   ```bash
   # Kill the Node process
   killall node
   
   # cPanel will auto-restart it
   # Wait 30 seconds for app to start
   ```

3. **Verify restart worked:**
   ```bash
   curl https://student-life.uk/api/health
   # Should return healthy JSON
   ```

---

## 📝 DEBUGGING CHECKLIST:

- [ ] Test `/api/health` endpoint
- [ ] Check cPanel Node.js logs
- [ ] Verify `DATABASE_URL` in environment variables
- [ ] Verify PostgreSQL is running
- [ ] Test database connection with `psql`
- [ ] Rebuild Prisma: `npm run postinstall`
- [ ] Check Node.js version is 18+
- [ ] Restart Node.js app in cPanel
- [ ] Wait 1-2 minutes for app to fully start

---

## 🎯 IF STILL STUCK:

Check the FULL error log:
```bash
# Get last 100 lines of error log
tail -100 /home/username/nodevenv/studentlife/var/log/app.log
```

Look for:
- `ERROR` or `Error`
- `ECONNREFUSED`
- `EADDRINUSE` (port already in use)
- `ENOMEM` (out of memory)
- Timeout messages

Share these specific errors for next steps!

---

## 🔧 ENVIRONMENT VARIABLES - EXACT FORMAT:

```
DATABASE_URL=postgresql://username:password@localhost:5432/studentlife_db
NODE_ENV=production
PORT=3000
```

**IMPORTANT:**
- No quotes around values
- `@localhost` if DB is on same server
- `@remote-host` if DB is on different server
- Include port `:5432` for PostgreSQL
- Match your actual database name

---

## ✅ SUCCESS INDICATORS:

When 503 is fixed, you should see:

```
✅ [SUCCESS] Server ready on http://0.0.0.0:3000
✅ [SUCCESS] Access at: https://student-life.uk
✅ [PRISMA] Database connected successfully
```

And `/api/health` returns:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-14T..."
}
```

Then login routes will work! 🚀
