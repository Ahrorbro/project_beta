# 📋 VERCEL ENVIRONMENT VARIABLES CHECKLIST

## 🔑 REQUIRED VARIABLES (Copy These Exactly):

### 1. DATABASE_URL
**Name:** `DATABASE_URL`

**Value:**
```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19FbGZoTVhyeUYwVm90c21sM18wbXYiLCJhcGlfa2V5IjoiMDFLOUFQR0pQQU1QUDY3UVk2NDQ5SDdDNEIiLCJ0ZW5hbnRfaWQiOiIyOTc2OWY1YmQ4MWE5M2ExN2JlNDljMzFmODNiZjdjYThkMDFlYjBhOWM5ZjM3NTc5NWYwZGQ3MTc5NTM0M2JmIiwiaW50ZXJuYWxfc2VjcmV0IjoiZGM4NDU4MDktMmNjNy00NGUxLWI2YWYtNmMxODJjMmEzYWY5In0.FUdw6EB5jKATHt3E5TzG_Rl02gMqs7O_IrCWNfrUjE0
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 2. NEXTAUTH_SECRET
**Name:** `NEXTAUTH_SECRET`

**Value:**
```
fZkiG86o9mvOOGC+DvCmQ4IVY9QiR9PUP14z3EVBlIU=
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 3. NEXTAUTH_URL
**Name:** `NEXTAUTH_URL`

**Value:**
```
https://projectbeta.vercel.app
```

**Environments:** ✅ Production only

---

## 📋 STEP-BY-STEP INSTRUCTIONS:

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com
2. Sign in to your account
3. Select your project: **projectbeta**

### Step 2: Navigate to Environment Variables
1. Click **Settings** (top navigation)
2. Click **Environment Variables** (left sidebar)

### Step 3: Add Each Variable

#### Add DATABASE_URL:
1. Click **"Add New"** button
2. **Name:** Type exactly: `DATABASE_URL`
3. **Value:** Paste the full Prisma Accelerate URL above
4. **Environments:** Check all three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

#### Add NEXTAUTH_SECRET:
1. Click **"Add New"** button again
2. **Name:** Type exactly: `NEXTAUTH_SECRET`
3. **Value:** `fZkiG86o9mvOOGC+DvCmQ4IVY9QiR9PUP14z3EVBlIU=`
4. **Environments:** Check all three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

#### Add NEXTAUTH_URL:
1. Click **"Add New"** button again
2. **Name:** Type exactly: `NEXTAUTH_URL`
3. **Value:** `https://projectbeta.vercel.app`
4. **Environments:** Check only:
   - ✅ Production
5. Click **"Save"**

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

---

## ✅ VERIFICATION:

After adding all variables and redeploying:

1. **Visit:** https://projectbeta.vercel.app
2. **Try:** https://projectbeta.vercel.app/auth/login
3. **Check:** App should load without 500 error

---

## 🆘 IF STILL GETTING 500 ERROR:

1. **Double-check variable names:**
   - Must be exactly: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   - No extra spaces, no typos

2. **Verify values:**
   - DATABASE_URL starts with `prisma+postgres://`
   - NEXTAUTH_SECRET is exactly 64 characters
   - NEXTAUTH_URL matches your Vercel URL exactly

3. **Check environments:**
   - DATABASE_URL: All environments ✅
   - NEXTAUTH_SECRET: All environments ✅
   - NEXTAUTH_URL: Production only ✅

4. **Redeploy after adding:**
   - Always redeploy after adding/changing environment variables
   - Environment variables are only available after redeploy

---

## 📞 NEED HELP?

If you're still having issues, you can:
1. Take a screenshot of your Environment Variables page
2. Share what you see there
3. I'll help verify everything is correct

---

## ✅ SUMMARY:

**The 500 error is almost always caused by missing environment variables.**

**Fix:** Add all 3 variables in Vercel Settings → Environment Variables, then redeploy.

**After fixing:** Your app should work! 🎉

