# Rentify MVP

Property Management Platform for Tanzania

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Prisma Accelerate)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

3. **Set up the database:**
```bash
npm run db:generate
npm run db:push
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Super Admin Access

- **Email:** `ahrorbek@rentify.com`
- **Password:** `ahrorbek`

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **UI Design:** Glassmorphism/Liquid Glass

## 📁 Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Super admin pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── cron/          # Scheduled tasks
│   │   └── v1/            # Versioned API endpoints
│   ├── auth/              # Authentication pages
│   ├── landlord/          # Landlord dashboard pages
│   ├── tenant/            # Tenant dashboard pages
│   └── ...                # Other pages
│
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── landlord/          # Landlord-specific components
│   ├── layouts/           # Layout components
│   ├── maps/              # Map-related components
│   ├── providers/         # Context providers
│   ├── tenant/            # Tenant-specific components
│   └── ui/                # Reusable UI components
│
├── lib/                   # Utility functions and configurations
│   ├── api-handler.ts     # API request handler
│   ├── api-response.ts    # API response utilities
│   ├── audit.ts            # Audit logging
│   ├── auth.ts             # Authentication utilities
│   ├── middleware.ts       # Middleware functions
│   ├── notifications.ts    # Notification system
│   ├── prisma.ts           # Prisma client
│   ├── subscription.ts     # Subscription logic
│   ├── types.ts            # Type definitions
│   └── utils.ts            # General utilities
│
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema definition
│
├── public/                # Static assets
│   └── uploads/           # User-uploaded files
│       ├── leases/        # Lease documents
│       ├── maintenance/   # Maintenance photos
│       └── properties/    # Property photos
│
├── scripts/               # Build and utility scripts
│   └── check-cache.js    # Cache management script
│
├── types/                 # TypeScript type definitions
│   └── next-auth.d.ts    # NextAuth type extensions
│
├── .env.example           # Environment variables template
├── .eslintrc.json         # ESLint configuration
├── .gitignore            # Git ignore rules
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vercel.json           # Vercel deployment configuration
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run clean` - Remove .next directory

## 🗄️ Database

The project uses Prisma ORM with PostgreSQL. The schema is defined in `prisma/schema.prisma`.

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create a new migration
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 🔒 Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Application URL (for production)

## 🚢 Deployment

This project is configured for deployment on Vercel. See `vercel.json` for configuration.

### Deployment Steps

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## 📄 License

Private project - All rights reserved

