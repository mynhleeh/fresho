import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_ACCOUNTS } from './seedData';

const prisma = new PrismaClient();

function demoPasswordHashForPhone(phone: string): string {
  return bcrypt.hashSync(`demo${phone.slice(-3)}`, 10);
}

async function main() {
  await prisma.disputeLog.deleteMany();
  await prisma.deliveryRecord.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.preOrder.deleteMany();
  await prisma.harvestBatch.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await Promise.all(
    DEMO_ACCOUNTS.map((account) =>
      prisma.user.create({
        data: { ...account, passwordHash: demoPasswordHashForPhone(account.phone) },
      }),
    ),
  );

  const farmer = createdUsers.find((user) => user.role === 'farmer');
  if (!farmer) throw new Error('DEMO_ACCOUNTS must include a farmer account');

  await prisma.harvestBatch.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Ca chua',
      quantityTotal: 500,
      quantityAvailable: 500,
      unit: 'kg',
      pricePerUnit: 15000,
      harvestDateEstimate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'open',
    },
  });

  console.log(createdUsers.map((u) => ({ id: u.id, phone: u.phone, role: u.role })));
}

main().finally(() => prisma.$disconnect());
