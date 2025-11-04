# Rentify Setup Guide

## Environment Variables

The `.env.local` file has been created. You need to update the `DATABASE_URL` with your actual PostgreSQL connection string.

### Current `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/rentify?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generated-secret]"
```

### Update DATABASE_URL:
Replace `user`, `password`, and database name with your actual PostgreSQL credentials:

```bash
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE_NAME?schema=public"
```

## Database Setup

1. **Create the database:**
   ```bash
   # In PostgreSQL
   CREATE DATABASE rentify;
   ```

2. **Run Prisma migrations:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

## Super Admin Credentials

- **Email:** `ahrorbek@rentify.com`
- **Password:** `ahrorbek`

The super admin account will be automatically created on first login.

## Testing Login

1. Make sure your PostgreSQL database is running
2. Update `.env.local` with your database credentials
3. Run `npm run db:push` to create tables
4. Restart the dev server: `npm run dev`
5. Try logging in with super admin credentials

## Troubleshooting

### Can't log in after signup?
- Check if the database is connected (look for errors in terminal)
- Verify `.env.local` has correct `DATABASE_URL`
- Check if user was created: `npm run db:studio` (opens Prisma Studio)

### Super Admin login not working?
- Make sure you're using exact email: `ahrorbek@rentify.com` (lowercase)
- Password: `ahrorbek` (lowercase)
- Check terminal for database connection errors

### Database connection errors?
- Verify PostgreSQL is running: `pg_isready`
- Check your DATABASE_URL format
- Ensure database exists: `psql -l | grep rentify`

