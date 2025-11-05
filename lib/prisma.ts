import { PrismaClient as PrismaClientRegular } from '@prisma/client'
import { PrismaClient as PrismaClientEdge } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Use edge client for Accelerate (production), regular client for local development
const isUsingAccelerate = process.env.DATABASE_URL?.startsWith('prisma+postgres://') || 
                          process.env.DATABASE_URL?.startsWith('prisma+postgresql://');

const createPrismaClient = () => {
  const PrismaClientConstructor = isUsingAccelerate ? PrismaClientEdge : PrismaClientRegular;
  
  // For Accelerate edge client, don't pass datasources - let Prisma read from env directly
  // This avoids schema validation issues with prisma+postgres:// protocol
  if (isUsingAccelerate) {
    // Edge client with Accelerate - no datasources config needed
    const client = new PrismaClientConstructor({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
    return client.$extends(withAccelerate());
  } else {
    // Regular client for local development
    const client = new PrismaClientConstructor({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    return client;
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

