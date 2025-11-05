import { PrismaClient as PrismaClientRegular } from '@prisma/client'
import { PrismaClient as PrismaClientEdge } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Use edge client for Accelerate (production), regular client for local development
const isUsingAccelerate = process.env.DATABASE_URL?.startsWith('prisma+postgres://') || 
                          process.env.DATABASE_URL?.startsWith('prisma+postgresql://');

const createPrismaClient = () => {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set!');
    throw new Error('DATABASE_URL environment variable is missing. Please set it in Vercel Settings → Environment Variables');
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
    } catch (error: any) {
      console.error('Failed to create Prisma Accelerate client:', error);
      throw new Error(`Prisma Client initialization failed: ${error.message}`);
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
    } catch (error: any) {
      console.error('Failed to create Prisma client:', error);
      throw new Error(`Prisma Client initialization failed: ${error.message}`);
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Type helper to cast Prisma client methods for TypeScript compatibility
export const prismaQuery = prisma as unknown as PrismaClientRegular;

