import { PrismaClient as PrismaClientRegular } from '@prisma/client'
import { PrismaClient as PrismaClientEdge } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Use edge client for Accelerate (production), regular client for local development
const isUsingAccelerate = process.env.DATABASE_URL?.startsWith('prisma+postgres://') || 
                          process.env.DATABASE_URL?.startsWith('prisma+postgresql://');

const createPrismaClient = () => {
  // During build time, if we have an Accelerate URL but Prisma doesn't validate it,
  // we'll catch the error and create a client without explicit datasources
  try {
    const PrismaClientConstructor = isUsingAccelerate ? PrismaClientEdge : PrismaClientRegular;
    
    // For Accelerate, don't pass datasources - let Prisma read from env directly
    // This avoids schema validation issues with prisma+postgres:// protocol
    const client = isUsingAccelerate
      ? new PrismaClientConstructor({
          log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        })
      : new PrismaClientConstructor({
          log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
        });
    
    // Only use Accelerate extension if using Accelerate URL
    return isUsingAccelerate ? client.$extends(withAccelerate()) : client;
  } catch (error: any) {
    // If validation fails during build (e.g., Accelerate URL format), 
    // create client without explicit datasources config
    if (error?.message?.includes('protocol') || error?.message?.includes('postgres')) {
      const PrismaClientConstructor = isUsingAccelerate ? PrismaClientEdge : PrismaClientRegular;
      return new PrismaClientConstructor({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }).$extends(withAccelerate());
    }
    throw error;
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

