# 🔐 Vercel Environment Variables - Ready to Add

**Copy these exact values to Vercel**

---

## ✅ Variables to Add in Vercel

Go to: **https://vercel.com/dashboard** → Your Project → **Settings** → **Environment Variables**

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
Value: Root
Environments: ✅ Production ✅ Preview ✅ Development
```

### 5. CLOUDINARY_API_KEY
```
Key: CLOUDINARY_API_KEY
Value: 474918443619372
Environments: ✅ Production ✅ Preview ✅ Development
```

### 6. CLOUDINARY_API_SECRET
```
Key: CLOUDINARY_API_SECRET
Value: gSDCpxcJQfIafDGvTiDTVpWSX9k
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 📋 Quick Steps

1. **Open Vercel:** https://vercel.com/dashboard
2. **Select your project**
3. **Go to:** Settings → Environment Variables
4. **For each variable above:**
   - Click "Add New"
   - Paste the Key and Value
   - Select all environments
   - Click Save

---

## ⚠️ Important Notes

1. **Cloud Name Verification:**
   - If "Root" doesn't work, check your Cloudinary dashboard
   - Go to: https://console.cloudinary.com → Dashboard
   - The cloud name is shown at the top (usually a short string)

2. **NEXTAUTH_URL:**
   - Set this AFTER your first deploy
   - Vercel will give you a URL like: `https://your-project-name.vercel.app`
   - Use that exact URL

3. **Security:**
   - Never commit these values to Git
   - Keep them secure
   - Don't share your API Secret publicly

---

## ✅ After Adding Variables

1. **Redeploy:**
   - Go to Deployments tab
   - Click ⋯ on latest deployment
   - Click Redeploy

2. **Or push a commit** to trigger auto-deploy

---

## 🔍 Verify It Works

After deployment:
- ✅ Build should complete successfully
- ✅ Visit your site
- ✅ Try logging in
- ✅ Test file upload (should work now!)

---

**All set!** Your Cloudinary credentials are now in `.env.local` and ready to add to Vercel. 🚀

