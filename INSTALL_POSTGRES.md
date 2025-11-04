# Install PostgreSQL - Quick Guide

## ❌ Current Status
PostgreSQL is **NOT installed** on your system. You need to install it first.

## 🚀 Quick Installation (Choose One)

### Option 1: Using Homebrew (Recommended for macOS)

**Step 1: Install Homebrew (if not installed)**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Step 2: Install PostgreSQL**
```bash
brew install postgresql@14
```

**Step 3: Start PostgreSQL**
```bash
brew services start postgresql@14
```

**Step 4: Create Database**
```bash
createdb rentify
```

**Step 5: Update `.env.local`**
```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/rentify?schema=public"
```

Or if you need a password:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rentify?schema=public"
```

**Step 6: Initialize Database Tables**
```bash
npm run db:generate
npm run db:push
```

**Step 7: Restart Dev Server**
```bash
npm run dev
```

---

### Option 2: Using Docker (Easiest - No Installation Needed)

**Step 1: Install Docker Desktop**
- Download from: https://www.docker.com/products/docker-desktop
- Install and open Docker Desktop

**Step 2: Run PostgreSQL Container**
```bash
docker run --name rentify-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=rentify \
  -p 5432:5432 \
  -d postgres:14
```

**Step 3: Update `.env.local`**
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rentify?schema=public"
```

**Step 4: Initialize Database Tables**
```bash
npm run db:generate
npm run db:push
```

**Step 5: Restart Dev Server**
```bash
npm run dev
```

---

### Option 3: Using Postgres.app (GUI - Easiest)

**Step 1: Download Postgres.app**
- Download from: https://postgresapp.com/
- Drag to Applications folder

**Step 2: Open Postgres.app**
- Click "Initialize" to create a new server
- Click "Start" button

**Step 3: Create Database**
- Open Terminal and run:
```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb rentify
```

**Step 4: Update `.env.local`**
```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/rentify?schema=public"
```

**Step 5: Initialize Database Tables**
```bash
npm run db:generate
npm run db:push
```

**Step 6: Restart Dev Server**
```bash
npm run dev
```

---

## ✅ Verify Installation

After installation, verify PostgreSQL is running:
```bash
pg_isready -h localhost -p 5432
```

Should output: `localhost:5432 - accepting connections`

---

## 🎯 After Installation

Once PostgreSQL is installed and running:

1. **Create the database:**
   ```bash
   createdb rentify
   ```

2. **Update `.env.local`** with correct credentials

3. **Initialize tables:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

5. **Login with:**
   - Email: `ahrorbek@rentify.com`
   - Password: `ahrorbek`

---

## 📝 Notes

- **Docker** is the easiest if you already have Docker Desktop
- **Postgres.app** is the simplest GUI option
- **Homebrew** is best for developers who prefer command line

After installation, the database connection error will disappear and login will work!

