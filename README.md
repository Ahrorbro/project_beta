# Rentify MVP

Property Management Platform for Tanzania

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the database:
```bash
npm run db:generate
npm run db:push
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Super Admin Access

- Email: `ahrorbek@rentify.com`
- Password: `ahrorbek`

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- PostgreSQL + Prisma
- NextAuth.js
- Tailwind CSS
- Liquid Glass UI/UX Design

## Project Structure

```
/app          - Next.js app router pages
/components   - React components
/lib          - Utility functions and configurations
/prisma       - Database schema and migrations
/public       - Static assets
```

