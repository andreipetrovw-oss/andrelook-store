import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // твой код сидирования (оставь как есть)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
