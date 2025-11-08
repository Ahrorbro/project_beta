# 🔐 Vercel Environment Variables Setup Guide

**Step-by-step guide to add all required environment variables to Vercel**

---

## 📋 Complete List of Required Variables

### 🔴 Critical (App won't work without these):

1. **DATABASE_URL**
   - Your Prisma Accelerate connection string
   - Format: `prisma+postgres://...` or `prisma+postgresql://...`
   - ⚠️ Must use Prisma Accelerate for Vercel serverless

2. **NEXTAUTH_SECRET**
   - Secret key for NextAuth.js authentication
   - Should be a long random string
   - Generate with: `openssl rand -base64 32`

3. **NEXTAUTH_URL**
   - Your production URL
   - Set to: `https://your-project.vercel.app` (after first deploy)
   - Or your custom domain if you have one

### 🟡 Required for File Uploads (Cloudinary):

4. **CLOUDINARY_CLOUD_NAME**
   - Your Cloudinary cloud name
   - Get from: https://console.cloudinary.com → Dashboard → Account Details

5. **CLOUDINARY_API_KEY**
   - Your Cloudinary API key
   - Get from: https://console.cloudinary.com → Dashboard → Account Details

6. **CLOUDINARY_API_SECRET**
   - Your Cloudinary API secret
   - Get from: https://console.cloudinary.com → Dashboard → Account Details
   - ⚠️ Keep this secret! Never commit to Git.

### 🟢 Optional:

7. **CRON_SECRET** (optional)
   - Secret token for cron job authentication
   - Only needed if you want to secure `/api/cron/notifications` endpoint
   - Generate with: `openssl rand -base64 32`

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Local Environment Variables

Your local `.env.local` file should have these values. Copy them to use in Vercel.

**Note:** Don't copy `NEXTAUTH_URL` from local - it should be your production URL in Vercel.

---

### Step 2: Get Cloudinary Credentials (If Not Done)

1. **Sign up for free Cloudinary account:**
   - Go to: https://cloudinary.com/users/register/free
   - Sign up with email, Google, or GitHub

2. **Get your credentials:**
   - Go to: https://console.cloudinary.com
   - Click on **Dashboard** (or your cloud name)
   - Scroll down to **Account Details** section
   - You'll see:
     - **Cloud Name** → This is `CLOUDINARY_CLOUD_NAME`
     - **API Key** → This is `CLOUDINARY_API_KEY`
     - **API Secret** → Click "Reveal" to see → This is `CLOUDINARY_API_SECRET`

3. **Copy all three values** - you'll need them for Vercel

---

### Step 3: Add Variables to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project (or create one if you haven't)

2. **Navigate to Environment Variables:**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add each variable:**

   For each variable below, click **Add New** and fill in:

   #### Variable 1: DATABASE_URL
   - **Key:** `DATABASE_URL`
   - **Value:** Your Prisma Accelerate connection string (from your `.env.local`)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   #### Variable 2: NEXTAUTH_SECRET
   - **Key:** `NEXTAUTH_SECRET`
   - **Value:** Your secret key (from your `.env.local` or generate new one)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   #### Variable 3: NEXTAUTH_URL
   - **Key:** `NEXTAUTH_URL`
   - **Value:** `https://your-project.vercel.app` (replace with your actual Vercel URL)
   - **Note:** After first deploy, Vercel will give you a URL. Use that.
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   #### Variable 4: CLOUDINARY_CLOUD_NAME
   - **Key:** `CLOUDINARY_CLOUD_NAME`
   - **Value:** Your Cloudinary cloud name (from Step 2)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   #### Variable 5: CLOUDINARY_API_KEY
   - **Key:** `CLOUDINARY_API_KEY`
   - **Value:** Your Cloudinary API key (from Step 2)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   #### Variable 6: CLOUDINARY_API_SECRET
   - **Key:** `CLOUDINARY_API_SECRET`
   - **Value:** Your Cloudinary API secret (from Step 2)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   #### Variable 7: CRON_SECRET (Optional)
   - **Key:** `CRON_SECRET`
   - **Value:** Generate a random secret (optional)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

---

### Step 4: Verify All Variables

After adding all variables, you should see:

```
✅ DATABASE_URL
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
✅ CRON_SECRET (optional)
```

---

### Step 5: Redeploy

After adding environment variables:

1. **Option A: Automatic Redeploy**
   - Push a new commit to trigger auto-deploy
   - Or wait for next push

2. **Option B: Manual Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**
   - Select **Use existing Build Cache** (optional)
   - Click **Redeploy**

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Build completes successfully (check deployment logs)
- [ ] Homepage loads: `https://your-project.vercel.app`
- [ ] Login works (try super admin: `ahrorbek@rentify.com` / `ahrorbek`)
- [ ] File uploads work (test uploading a photo)
- [ ] No errors in Vercel function logs

---

## 🐛 Troubleshooting

### Issue: "DATABASE_URL is not set"

**Solution:**
- Verify `DATABASE_URL` is added in Vercel
- Check it's set for **Production** environment
- Verify the connection string is correct
- Make sure it uses Prisma Accelerate format (`prisma+postgres://...`)

### Issue: "NEXTAUTH_SECRET is not set"

**Solution:**
- Add `NEXTAUTH_SECRET` to Vercel
- Make sure it's set for **Production** environment
- Generate a new one if needed: `openssl rand -base64 32`

### Issue: "Cloudinary is not configured"

**Solution:**
- Add all three Cloudinary variables to Vercel:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Verify credentials are correct
- Check Cloudinary dashboard to confirm

### Issue: Authentication redirects fail

**Solution:**
- Update `NEXTAUTH_URL` to match your production domain
- Should be: `https://your-project.vercel.app` (not `http://localhost:3000`)
- Redeploy after updating

### Issue: Build succeeds but app crashes

**Solution:**
- Check Vercel function logs for specific errors
- Verify all environment variables are set
- Make sure variables are set for **Production** environment (not just Development)

---

## 📝 Quick Reference

### Generate Secrets (if needed):

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET (optional)
openssl rand -base64 32
```

### Vercel Dashboard Links:

- **Dashboard:** https://vercel.com/dashboard
- **Environment Variables:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables
- **Deployments:** https://vercel.com/dashboard → Your Project → Deployments
- **Function Logs:** https://vercel.com/dashboard → Your Project → Functions

### Cloudinary Links:

- **Sign Up:** https://cloudinary.com/users/register/free
- **Dashboard:** https://console.cloudinary.com
- **Account Details:** https://console.cloudinary.com → Dashboard → Account Details

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] All 6 required variables added to Vercel
- [ ] All variables set for Production, Preview, and Development
- [ ] Cloudinary credentials obtained and added
- [ ] NEXTAUTH_URL set to production domain
- [ ] Project redeployed after adding variables
- [ ] All features tested and working

---

**Need Help?**
- Check deployment logs in Vercel
- Review function logs for runtime errors
- Verify environment variables are correctly set
- Test locally first with `.env.local` to ensure values are correct

