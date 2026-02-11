import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Prisma Client will automatically use configuration from prisma.config.ts
const dbUrl = "";

if (!dbUrl) {
  console.error('❌ DATABASE_URL is missing from environment variables');
  process.exit(1);
}

// Prisma Client configuration
const prisma = new PrismaClient();

export default prisma;
