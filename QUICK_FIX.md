# Quick Fix for Login Issues

## ✅ CORRECT Super Admin Credentials

**Email:** `ahrorbek@rentify.com` (single 'y', NOT rentifyy.com)
**Password:** `ahrorbek`

## ⚠️ Common Mistakes

1. **Email typo:** Make sure it's `rentify.com` not `rentifyy.com`
2. **Case sensitive:** All lowercase
3. **Database connection:** Make sure PostgreSQL is running and DATABASE_URL is correct

## 🔧 Quick Setup Steps

1. **Update `.env.local` with your actual database credentials:**
   ```bash
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/rentify?schema=public"
   ```

2. **Create database and tables:**
   ```bash
   # Create database in PostgreSQL
   createdb rentify
   
   # Or via psql
   psql -c "CREATE DATABASE rentify;"
   
   # Generate Prisma client and push schema
   npm run db:generate
   npm run db:push
   ```

3. **Restart dev server:**
   ```bash
   # Kill current server (Ctrl+C)
   npm run dev
   ```

4. **Login with:**
   - Email: `ahrorbek@rentify.com`
   - Password: `ahrorbek`

## 🐛 Troubleshooting

### If login still fails:
1. Check terminal for database connection errors
2. Verify PostgreSQL is running: `pg_isready`
3. Check if database exists: `psql -l | grep rentify`
4. Verify `.env.local` has correct DATABASE_URL
5. Check browser console for errors (F12)

### Google Password Manager Warning
The warning about the password being in a data breach is just Google's security feature. You can ignore it for now or use a different password for production.

