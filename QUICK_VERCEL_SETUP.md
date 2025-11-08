# ⚡ Quick Vercel Environment Variables Setup

**Fast guide to copy your variables to Vercel**

---

## 🎯 What You Need to Do

### Step 1: Open Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Click on your project (or create one if needed)
3. Go to: **Settings** → **Environment Variables**

---

### Step 2: Copy Variables from Your Local File

Your `.env.local` file has these variables. Copy each one to Vercel:

#### ✅ Variables You Already Have:

1. **DATABASE_URL** - Copy from `.env.local`
2. **NEXTAUTH_SECRET** - Copy from `.env.local`
3. **CLOUDINARY_CLOUD_NAME** - Copy from `.env.local` (if set)
4. **CLOUDINARY_API_KEY** - Copy from `.env.local` (if set)
5. **CLOUDINARY_API_SECRET** - Copy from `.env.local` (if set)

#### ⚠️ Variable to Update:

6. **NEXTAUTH_URL** - **DON'T copy from local!**
   - Local has: `http://localhost:3000`
   - Vercel needs: `https://your-project.vercel.app`
   - **Wait until after first deploy** to set this to your production URL

---

## 📋 Quick Copy-Paste Steps

For each variable in Vercel:

1. Click **"Add New"** button
2. Enter the **Key** (variable name)
3. Enter the **Value** (from your `.env.local`)
4. Select **all environments** (Production, Preview, Development)
5. Click **Save**

---

## 🔑 Variable-by-Variable Guide

### 1. DATABASE_URL
```
Key: DATABASE_URL
Value: [Copy from your .env.local file]
Environments: ✅ Production ✅ Preview ✅ Development
```

### 2. NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: [Copy from your .env.local file]
Environments: ✅ Production ✅ Preview ✅ Development
```

### 3. NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://your-project.vercel.app
⚠️ Replace "your-project" with your actual Vercel project name
⚠️ Or wait until after first deploy to get the exact URL
Environments: ✅ Production ✅ Preview ✅ Development
```

### 4. CLOUDINARY_CLOUD_NAME
```
Key: CLOUDINARY_CLOUD_NAME
Value: [Copy from your .env.local file]
⚠️ If empty in .env.local, get from Cloudinary dashboard
Environments: ✅ Production ✅ Preview ✅ Development
```

### 5. CLOUDINARY_API_KEY
```
Key: CLOUDINARY_API_KEY
Value: [Copy from your .env.local file]
⚠️ If empty in .env.local, get from Cloudinary dashboard
Environments: ✅ Production ✅ Preview ✅ Development
```

### 6. CLOUDINARY_API_SECRET
```
Key: CLOUDINARY_API_SECRET
Value: [Copy from your .env.local file]
⚠️ If empty in .env.local, get from Cloudinary dashboard
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 🆓 Get Cloudinary Credentials (If Needed)

If your Cloudinary variables are empty:

1. **Sign up (free):** https://cloudinary.com/users/register/free
2. **Get credentials:**
   - Go to: https://console.cloudinary.com
   - Click **Dashboard**
   - Scroll to **Account Details**
   - Copy:
     - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
     - **API Key** → `CLOUDINARY_API_KEY`
     - **API Secret** → Click "Reveal" → `CLOUDINARY_API_SECRET`

---

## ✅ After Adding Variables

1. **Redeploy your project:**
   - Go to **Deployments** tab
   - Click **⋯** on latest deployment
   - Click **Redeploy**

2. **Or push a new commit** to trigger auto-deploy

---

## 🔍 Verify It Worked

After deployment:

- ✅ Build should complete successfully
- ✅ Visit your site: `https://your-project.vercel.app`
- ✅ Try logging in
- ✅ Test file upload (if Cloudinary is configured)

---

## 🆘 Need Help?

- **Full guide:** See `VERCEL_ENV_SETUP.md`
- **Deployment checklist:** See `DEPLOYMENT_CHECKLIST.md`
- **Vercel logs:** Dashboard → Your Project → Deployments → View Logs

---

**That's it!** Once you add these variables, your app should deploy and work perfectly. 🚀

