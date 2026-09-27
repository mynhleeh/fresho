import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.disputeLog.deleteMany();
  await prisma.deliveryRecord.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.preOrder.deleteMany();
  await prisma.harvestBatch.deleteMany();
  await prisma.user.deleteMany();

  const farmer = await prisma.user.create({
    data: { name: 'Nguyen Van A', phone: '0900000001', address: 'Da Lat, Lam Dong', role: 'farmer', trustScore: 80 },
  });
  const buyer = await prisma.user.create({
    data: { name: 'Tran Thi B', phone: '0900000002', address: 'Ha Noi', role: 'buyer', trustScore: 75 },
  });
  const admin = await prisma.user.create({
    data: { name: 'Admin Fresh O', phone: '0900000003', address: 'HCMC', role: 'admin', trustScore: 100 },
  });
  const logistics = await prisma.user.create({
    data: { name: 'Logistics Partner C', phone: '0900000004', address: 'HCMC', role: 'logistics', trustScore: 90 },
  });

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

  console.log({ farmer, buyer, admin, logistics });
}

main().finally(() => prisma.$disconnect());
