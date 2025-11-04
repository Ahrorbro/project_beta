# Environment Variables Template
# Copy this file to .env.local and fill in your values

# Database Connection (PostgreSQL)
# For Vercel: Use your Vercel Postgres connection string
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# NextAuth Configuration
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# NextAuth URL
# For local development:
NEXTAUTH_URL="http://localhost:3000"

# For production (Vercel):
# NEXTAUTH_URL="https://your-app-name.vercel.app"

