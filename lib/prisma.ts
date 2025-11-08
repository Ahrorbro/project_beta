import { PrismaClient as PrismaClientRegular } from '@prisma/client'
import { PrismaClient as PrismaClientEdge } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Check if we're in a build context (Next.js build phase)
// During build, Next.js may try to statically generate pages even if they're dynamic
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                     (typeof process.env.NEXT_PHASE !== 'undefined' && process.env.NEXT_PHASE.includes('build'));

// Use edge client for Accelerate (production), regular client for local development
const isUsingAccelerate = process.env.DATABASE_URL?.startsWith('prisma+postgres://') || 
                          process.env.DATABASE_URL?.startsWith('prisma+postgresql://');

const createPrismaClient = () => {
  // During build time, use a dummy connection string to allow Prisma Client generation
  // The actual connection will be validated at runtime when the app actually runs
  const originalDatabaseUrl = process.env.DATABASE_URL;
  
  if (!process.env.DATABASE_URL) {
    // Check if we're in build context
    if (isBuildTime || process.env.NEXT_PHASE) {
      console.warn('⚠️  DATABASE_URL not set during build. Using dummy connection for Prisma Client generation.');
      // Use dummy URL just for Prisma Client generation - won't actually connect
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    } else {
      // Runtime - DATABASE_URL is required
      console.error('DATABASE_URL is not set!');
      throw new Error('DATABASE_URL environment variable is missing. Please set it in Vercel Settings → Environment Variables');
    }
  }

  const PrismaClientConstructor = isUsingAccelerate ? PrismaClientEdge : PrismaClientRegular;
  
  // For Accelerate edge client, don't pass datasources - let Prisma read from env directly
  // This avoids schema validation issues with prisma+postgres:// protocol
  if (isUsingAccelerate) {
    // Edge client with Accelerate - no datasources config needed
    try {
      const client = new PrismaClientConstructor({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      });
      return client.$extends(withAccelerate());
    } catch (error) {
      console.error('Failed to create Prisma Accelerate client:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Prisma Client initialization failed: ${message}`);
    }
  } else {
    // Regular client for local development
    try {
      const client = new PrismaClientConstructor({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
      return client;
    } catch (error) {
      console.error('Failed to create Prisma client:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Prisma Client initialization failed: ${message}`);
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Lazy initialization - only create client when actually used
let prismaInstance: ReturnType<typeof createPrismaClient> | null = null;

const getPrismaClient = () => {
  if (!prismaInstance) {
    prismaInstance = globalForPrisma.prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
  }
  return prismaInstance;
};

// Export lazy getter - only initializes when actually called
export const prisma = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get(_target, prop) {
    const client = getPrismaClient();
    return (client as any)[prop];
  }
});

// Type helper to cast Prisma client methods for TypeScript compatibility
export const prismaQuery = prisma as unknown as PrismaClientRegular;

