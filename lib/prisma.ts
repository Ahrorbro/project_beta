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
  // Check if we're in build context
  // On Vercel, NEXT_PHASE is set during build, VERCEL env var is set at runtime
  const isBuildContext = isBuildTime || 
                         process.env.NEXT_PHASE === 'phase-production-build' ||
                         (process.env.NODE_ENV === 'production' && process.env.VERCEL === undefined && !process.env.DATABASE_URL);
  
  // During build time, use a dummy connection string to allow Prisma Client generation
  // The actual connection will be validated at runtime when the app actually runs
  if (!process.env.DATABASE_URL) {
    if (isBuildContext) {
      console.warn('⚠️  DATABASE_URL not set during build. Using dummy connection for Prisma Client generation.');
      // Use dummy URL just for Prisma Client generation - won't actually connect
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    } else {
      // Runtime on Vercel - DATABASE_URL must be set
      // Log all environment info for debugging
      const envInfo = {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL ? '✅ set' : '❌ not set',
        VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
        NEXT_PHASE: process.env.NEXT_PHASE || 'not set (runtime)',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')).join(', ') || 'none'
      };
      
      console.error('❌ DATABASE_URL is not set at runtime!');
      console.error('Environment Debug Info:', JSON.stringify(envInfo, null, 2));
      
      // Provide detailed error message with troubleshooting steps
      const errorMessage = [
        'DATABASE_URL environment variable is missing at runtime.',
        '',
        'Troubleshooting Steps:',
        '1. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables',
        '2. Verify DATABASE_URL exists (exact spelling, case-sensitive)',
        '3. Check it\'s enabled for: Production ✅ Preview ✅ Development ✅',
        '4. After adding/updating, you MUST redeploy:',
        '   - Go to Deployments tab',
        '   - Click ⋯ on latest deployment → Redeploy',
        '   - OR push a new commit to trigger auto-deploy',
        '5. Verify the value is correct (should start with prisma+postgres:// or postgresql://)',
        '',
        `Current Environment: ${envInfo.VERCEL_ENV || 'unknown'}`,
        `Vercel Detected: ${envInfo.VERCEL}`
      ].join('\n');
      
      throw new Error(errorMessage);
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

