import { getAdminInsights } from './src/services/analyticsService.js';
import prisma from './src/config/database.js';

async function main() {
  try {
    console.log('Testing getAdminInsights()...');
    const insights = await getAdminInsights();
    console.log('Success:', JSON.stringify(insights, null, 2));
  } catch (error) {
    console.error('CRASHED:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
