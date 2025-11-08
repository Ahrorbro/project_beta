# 🚀 Vercel Deployment Checklist

**Last Updated:** $(date)

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (CRITICAL)

Add these to **Vercel Dashboard → Your Project → Settings → Environment Variables**:

#### Required for Production:
- [ ] `DATABASE_URL` - Prisma Accelerate connection string
  - Format: `prisma+postgres://...` or `prisma+postgresql://...`
  - ⚠️ Must use Prisma Accelerate for serverless

- [ ] `NEXTAUTH_SECRET` - NextAuth.js secret key
  - Generate with: `openssl rand -base64 32`
  - Or use: https://generate-secret.vercel.app/32

- [ ] `NEXTAUTH_URL` - Production URL
  - Set to: `https://your-project.vercel.app` (after first deploy)
  - Or your custom domain if configured

#### Required for File Uploads (Cloudinary):
- [ ] `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Your Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

#### Optional:
- [ ] `CRON_SECRET` - Secret token for cron job authentication (optional)
  - Only needed if you want to secure the `/api/cron/notifications` endpoint

---

## 🔧 Build Configuration

### Current Build Settings:
- ✅ **Build Command:** `npm run build`
- ✅ **Install Command:** `npm install`
- ✅ **Output Directory:** `.next` (auto-detected)

### Build Process:
1. `npm install` - Installs dependencies
2. `postinstall` - Runs `prisma generate` (with dummy DATABASE_URL)
3. `npm run build` - Runs `prisma generate` again + `next build`

---

## 🐛 Known Issues & Fixes

### ✅ Fixed Issues:

1. **Cloudinary Configuration**
   - ✅ Added validation for missing environment variables
   - ✅ Graceful error handling when Cloudinary is not configured
   - ✅ Clear error messages for debugging

2. **Prisma Client Generation**
   - ✅ Works with dummy DATABASE_URL in postinstall
   - ✅ Regenerated during build with actual DATABASE_URL

### ⚠️ Potential Issues:

1. **Missing Cloudinary Credentials**
   - **Impact:** File uploads will fail
   - **Error:** "Cloudinary is not configured"
   - **Fix:** Add Cloudinary env vars to Vercel

2. **Missing DATABASE_URL**
   - **Impact:** App will crash on startup
   - **Error:** "DATABASE_URL environment variable is missing"
   - **Fix:** Add DATABASE_URL to Vercel

3. **Missing NEXTAUTH_SECRET**
   - **Impact:** Authentication will fail
   - **Error:** "NEXTAUTH_SECRET environment variable is missing"
   - **Fix:** Add NEXTAUTH_SECRET to Vercel

4. **Wrong NEXTAUTH_URL**
   - **Impact:** Authentication redirects may fail
   - **Fix:** Update NEXTAUTH_URL after first deploy to match production URL

---

## 📋 Deployment Steps

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Configure Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings → Environment Variables**
4. Add all required variables (see list above)
5. Make sure to select **Production**, **Preview**, and **Development** environments

### Step 3: Deploy

Vercel will automatically deploy when you push to GitHub. Or manually trigger:

1. Go to: **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Or push a new commit to trigger auto-deploy

### Step 4: Verify Deployment

After deployment, check:

1. **Homepage loads:** `https://your-project.vercel.app`
2. **Login works:** Try logging in with super admin credentials
3. **File uploads work:** Test uploading a photo (if Cloudinary is configured)
4. **Database connection:** Verify data loads correctly

---

## 🔍 Troubleshooting

### Build Fails

**Check:**
- [ ] All required environment variables are set
- [ ] DATABASE_URL is valid Prisma Accelerate connection
- [ ] No TypeScript errors (run `npm run build` locally first)
- [ ] No missing dependencies

**Common Errors:**
- `DATABASE_URL is not set` → Add DATABASE_URL to Vercel
- `NEXTAUTH_SECRET is not set` → Add NEXTAUTH_SECRET to Vercel
- `Prisma Client initialization failed` → Check DATABASE_URL format

### Runtime Errors

**Check:**
- [ ] Environment variables are set for **Production** environment
- [ ] NEXTAUTH_URL matches your production domain
- [ ] Cloudinary credentials are correct (if using file uploads)

**Common Errors:**
- `Cloudinary is not configured` → Add Cloudinary env vars
- `Unauthorized` → Check NEXTAUTH_SECRET and NEXTAUTH_URL
- `Database connection failed` → Verify DATABASE_URL and Prisma Accelerate

### File Uploads Don't Work

**Check:**
- [ ] Cloudinary credentials are set in Vercel
- [ ] CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are all set
- [ ] Check Vercel function logs for Cloudinary errors

---

## 📝 Post-Deployment

### 1. Update NEXTAUTH_URL

After first successful deploy:
1. Copy your production URL (e.g., `https://your-project.vercel.app`)
2. Update `NEXTAUTH_URL` in Vercel Environment Variables
3. Redeploy to apply changes

### 2. Test All Features

- [ ] User authentication (login/signup)
- [ ] Property management (create/edit properties)
- [ ] File uploads (photos, leases)
- [ ] Payment tracking
- [ ] Maintenance requests
- [ ] Notifications

### 3. Set Up Custom Domain (Optional)

1. Go to: **Settings → Domains**
2. Add your custom domain
3. Update `NEXTAUTH_URL` to match custom domain
4. Redeploy

---

## 🔐 Security Checklist

- [ ] All secrets are in Vercel Environment Variables (not in code)
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] DATABASE_URL uses Prisma Accelerate (secure connection)
- [ ] Cloudinary API Secret is kept secure
- [ ] CRON_SECRET is set (if using cron jobs)

---

## 📊 Monitoring

### Vercel Analytics:
- Check **Deployments** tab for build logs
- Check **Functions** tab for runtime logs
- Check **Analytics** for performance metrics

### Key Metrics to Monitor:
- Build time
- Function execution time
- Error rates
- Database query performance

---

## ✅ Deployment Status

- [x] Code pushed to GitHub
- [ ] Environment variables configured in Vercel
- [ ] First deployment successful
- [ ] All features tested
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up

---

**Need Help?**
- Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
- Check function logs: Dashboard → Your Project → Functions
- Review this checklist for common issues

