import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://lucy:password@localhost:5432/library_dev';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
