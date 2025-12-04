import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `var prisma`
  // This prevents TypeScript errors
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'], // optional
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
