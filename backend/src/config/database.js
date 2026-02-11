import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Prisma Client will automatically use configuration from prisma.config.ts
const dbUrl = "postgresql://neondb_owner:npg_hwonrQb70gkE@ep-square-bush-a19u4r0y-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

if (!dbUrl) {
  console.error('❌ DATABASE_URL is missing from environment variables');
  process.exit(1);
}

// Prisma Client configuration
const prisma = new PrismaClient();

export default prisma;
