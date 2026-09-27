import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_ACCOUNTS, DEMO_HARVEST_BATCHES } from './seedData';

// index-aligned with DEMO_HARVEST_BATCHES: batches whose status implies at least
// one pre_order reached "deposited" (00-project-charter.rule.md §4) get one here.
const PRE_ORDER_STATUS_BY_BATCH_INDEX: Record<number, string> = {
  3: 'deposited', // "Rau muống" — fully booked (quantityAvailable: 0)
  4: 'deposited', // "Lúa ST25" — awaiting_harvest implies a deposited pre_order exists
  5: 'deposited', // "Bưởi da xanh" — ready_for_handover implies the same
};

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

  for (const [index, batch] of DEMO_HARVEST_BATCHES.entries()) {
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
      },
    });

    const preOrderStatus = PRE_ORDER_STATUS_BY_BATCH_INDEX[index];
    if (preOrderStatus) {
      // reserved quantity = whatever the batch already "used up" (quantityTotal - quantityAvailable)
      // TODO(business-confirm): seed pre_order quantities/prices below are illustrative demo values only.
      const reservedQuantity = (batch.quantityTotal - batch.quantityAvailable) || (batch.minOrderQuantity ?? 1);
      await prisma.preOrder.create({
        data: {
          batchId: createdBatch.id,
          buyerId: buyer.id,
          quantity: reservedQuantity,
          pricePerUnit: batch.pricePerUnit,
          status: preOrderStatus,
        },
      });
    }
  }

  console.log(createdUsers.map((u) => ({ id: u.id, phone: u.phone, role: u.role })));
}

main().finally(() => prisma.$disconnect());
