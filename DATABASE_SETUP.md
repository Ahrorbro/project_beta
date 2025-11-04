# Database Setup Guide

## Error: "Can't reach database server at `localhost:5432`"

This means PostgreSQL is not running or not accessible.

## Quick Fix Options

### Option 1: Install and Start PostgreSQL (if not installed)

**On macOS with Homebrew:**
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Or start manually
pg_ctl -D /usr/local/var/postgresql@14 start
```

**On macOS with Postgres.app:**
1. Download from https://postgresapp.com/
2. Install and open the app
3. Click "Start" button

### Option 2: Start PostgreSQL (if already installed)

**Check if PostgreSQL is installed:**
```bash
which psql
which postgres
```

**Start PostgreSQL service:**
```bash
# macOS with Homebrew
brew services start postgresql@14

# Or try
brew services start postgresql

# Or start manually
pg_ctl -D /usr/local/var/postgres start
```

### Option 3: Use Docker (Easiest)

If you have Docker installed:

```bash
# Run PostgreSQL in Docker
docker run --name rentify-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=rentify \
  -p 5432:5432 \
  -d postgres:14

# Then update .env.local:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rentify?schema=public"
```

## After PostgreSQL is Running

1. **Create the database:**
   ```bash
   createdb rentify
   
   # Or via psql
   psql -U postgres -c "CREATE DATABASE rentify;"
   ```

2. **Update `.env.local` with correct credentials:**
   ```bash
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/rentify?schema=public"
   ```
   
   Common defaults:
   - Username: `postgres` or your macOS username
   - Password: Usually empty for local dev, or `postgres`
   - Example: `postgresql://postgres:postgres@localhost:5432/rentify?schema=public`

3. **Initialize database tables:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

## Verify PostgreSQL is Running

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Should output: "localhost:5432 - accepting connections"
```

## Troubleshooting

### "Command not found: psql"
- PostgreSQL is not installed
- Install using Homebrew: `brew install postgresql@14`

### "Connection refused"
- PostgreSQL is not running
- Start it: `brew services start postgresql@14`

### "Authentication failed"
- Check your username and password in DATABASE_URL
- Try using your macOS username instead of 'postgres'
- For local dev, password might be empty

### "Database does not exist"
- Create it: `createdb rentify`

