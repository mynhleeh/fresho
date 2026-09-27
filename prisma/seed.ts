import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_ACCOUNTS, DEMO_HARVEST_BATCHES } from './seedData';

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

  const buyer = createdUsers.find((user) => user.role === 'buyer');
  if (!buyer) throw new Error('DEMO_ACCOUNTS must include a buyer account');

  for (const batch of DEMO_HARVEST_BATCHES) {
    const createdBatch = await prisma.harvestBatch.create({
      data: {
        farmerId: farmer.id,
        cropName: batch.cropName,
        quantityTotal: batch.quantityTotal,
        quantityAvailable: batch.quantityAvailable,
        unit: batch.unit,
        pricePerUnit: batch.pricePerUnit,
        harvestDateEstimate: new Date(Date.now() + batch.harvestDateOffsetDays * 24 * 60 * 60 * 1000),
        status: batch.status,
        photoUrl: batch.photoUrl,
        location: batch.location,
        qualityStandard: batch.qualityStandard,
        minOrderQuantity: batch.minOrderQuantity ?? 1,
        description: batch.description,
      },
    });

    if (batch.preOrderStatus) {
      // TODO(business-confirm): seed pre_order quantities/prices below are illustrative demo values only.
      const reservedQuantity = (batch.quantityTotal - batch.quantityAvailable) || (batch.minOrderQuantity ?? 1);
      const preOrder = await prisma.preOrder.create({
        data: {
          batchId: createdBatch.id,
          buyerId: buyer.id,
          quantity: reservedQuantity,
          pricePerUnit: batch.pricePerUnit,
          status: batch.preOrderStatus,
        },
      });

      const depositAmount = Math.round(reservedQuantity * batch.pricePerUnit * 0.2);
      await prisma.deposit.create({
        data: { preOrderId: preOrder.id, amount: depositAmount },
      });
      await prisma.ledgerEntry.create({
        data: { preOrderId: preOrder.id, type: 'deposit', amount: depositAmount, note: 'Deposit paid' },
      });

      if (batch.preOrderStatus === 'ready_for_handover') {
        await prisma.deliveryRecord.create({
          data: { preOrderId: preOrder.id, method: 'self_pickup', status: 'ready_for_handover' },
        });
      }
    }
  }

  console.log(createdUsers.map((u) => ({ id: u.id, phone: u.phone, role: u.role })));
}

main().finally(() => prisma.$disconnect());
