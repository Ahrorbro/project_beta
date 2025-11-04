# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Vercel Postgres or external provider)

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (already configured)
   - **Output Directory**: `.next` (default)

## Step 3: Environment Variables

Add these environment variables in Vercel dashboard (Settings → Environment Variables):

### Required Variables:
```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Notes:
- **DATABASE_URL**: Use your Vercel Postgres connection string or external PostgreSQL URL
- **NEXTAUTH_URL**: Update after first deployment with your actual Vercel URL
- Add variables for **Production**, **Preview**, and **Development** environments

## Step 4: Database Setup

### Option A: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage → Create Database → Postgres
2. Copy the connection string
3. Add as `DATABASE_URL` environment variable
4. Run migrations: `npx prisma migrate deploy` (via Vercel CLI or database dashboard)

### Option B: External PostgreSQL
1. Get connection string from your provider
2. Add as `DATABASE_URL` environment variable
3. Run migrations locally or via database provider

## Step 5: Run Database Migrations

After deployment, you need to run Prisma migrations:

### Via Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
```

### Or via Database Dashboard:
Use Prisma Studio or your database provider's SQL editor to run migrations manually.

## Step 6: Verify Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Test login functionality
3. Check database connections

## Build Configuration

The project is configured with:
- ✅ `postinstall` script: Automatically generates Prisma Client
- ✅ Build script: `prisma generate && next build`
- ✅ Proper Next.js configuration
- ✅ All TypeScript errors fixed
- ✅ All React Hook warnings fixed

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database allows connections from Vercel IPs
- Ensure migrations are run

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your deployment URL
- Clear browser cookies if needed

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Test login functionality
- [ ] Test tenant signup flow
- [ ] Test payment recording
- [ ] Verify all API routes work
- [ ] Check admin panel access

## Need Help?

Check Vercel logs:
- Dashboard → Your Project → Deployments → Click deployment → Logs

Common issues:
- Missing environment variables → Check Settings → Environment Variables
- Database connection → Verify DATABASE_URL format
- Build errors → Check build logs for specific errors

