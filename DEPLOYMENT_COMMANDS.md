# 🚀 Complete Deployment Commands

## Step 1: Push to GitHub

```bash
cd /Users/a1234/Documents/Ahrorbek

# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Ready for Vercel deployment - All routes fixed and configured"

# Push to GitHub
git push origin main
```

## Step 2: Generate NEXTAUTH_SECRET (if you don't have it)

```bash
openssl rand -base64 32
```

**Copy the output** - you'll need it for Vercel environment variables.

## Step 3: Deploy on Vercel

After pushing to GitHub:

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Click **"Deploy"** (first deployment may fail - that's normal)
5. After deployment, get your Vercel URL (e.g., `https://your-app-name.vercel.app`)

## Step 4: Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these 3 variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19JNHdITTA4LUhlNjdNNnN3emxfMXciLCJhcGlfa2V5IjoiMDFLOTg4NkEySFpLQjZSQkI3VjRTWjZYRTQiLCJ0ZW5hbnRfaWQiOiIyOTc2OWY1YmQ4MWE5M2ExN2JlNDljMzFmODNiZjdjYThkMDFlYjBhOWM5ZjM3NTc5NWYwZGQ3MTc5NTM0M2JmIiwiaW50ZXJuYWxfc2VjcmV0IjoiZGM4NDU4MDktMmNjNy00NGUxLWI2YWYtNmMxODJjMmEzYWY5In0._5idoJoLbpz_3vKZ8uUO_zK2jBAzl9sLDlmItRJbeso` | All |
| `NEXTAUTH_SECRET` | `SaLBzITpwJ7IzHyvXdAFjvzOibYq1czrpqSPYAQ9VXY=` | All |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Production |

## Step 5: Redeploy on Vercel

After adding environment variables:
1. Go to **"Deployments"** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete ✅

## Step 6: Run Database Migrations

After successful deployment:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

## Step 7: Verify Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Test login with Super Admin:
   - Email: `ahrorbek@rentify.com`
   - Password: `ahrorbek`
3. Test all features

---

## Quick Commands Summary

```bash
# Push to GitHub
cd /Users/a1234/Documents/Ahrorbek
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# Generate NEXTAUTH_SECRET (if needed)
openssl rand -base64 32

# After Vercel deployment - Setup migrations
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
```

---

## Troubleshooting

**If build fails:**
- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check build logs in Vercel dashboard

**If app doesn't work:**
- Make sure migrations are run (`npx prisma migrate deploy`)
- Check NEXTAUTH_URL matches your Vercel URL exactly
- Verify all environment variables are set for Production environment

**If database connection errors:**
- Verify DATABASE_URL is correct
- Check Prisma Accelerate dashboard for connection status
- Make sure migrations have been run

