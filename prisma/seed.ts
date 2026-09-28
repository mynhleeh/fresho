import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/db';
import { DEMO_ACCOUNTS, DEMO_HARVEST_BATCHES, DEMO_PRE_ORDERS } from './seedData';
import { createPreOrder } from '../src/lib/order-services/preOrderService';
import { advanceDemoPreOrder } from './seedPreOrderProgression';

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
  await prisma.savedBatch.deleteMany();
  await prisma.harvestProgressUpdate.deleteMany();
  await prisma.harvestBatchPhoto.deleteMany();
  await prisma.harvestBatch.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await Promise.all(
    DEMO_ACCOUNTS.map((account) => {
      const { farmerKey: _farmerKey, buyerKey: _buyerKey, ...userFields } = account;
      return prisma.user.create({
        data: { ...userFields, passwordHash: demoPasswordHashForPhone(account.phone) },
      });
    }),
  );

  const farmersByKey = new Map(
    DEMO_ACCOUNTS.map((account, index) => [account.farmerKey, createdUsers[index]] as const).filter(
      (entry): entry is [string, (typeof createdUsers)[number]] => entry[0] !== undefined,
    ),
  );
  if (farmersByKey.size === 0) throw new Error('DEMO_ACCOUNTS must include a farmer account');

  const buyersByKey = new Map(
    DEMO_ACCOUNTS.map((account, index) => [account.buyerKey, createdUsers[index]] as const).filter(
      (entry): entry is [string, (typeof createdUsers)[number]] => entry[0] !== undefined,
    ),
  );
  if (buyersByKey.size === 0) throw new Error('DEMO_ACCOUNTS must include a buyer account');

  const buyer = createdUsers.find((user) => user.role === 'buyer');
  if (!buyer) throw new Error('DEMO_ACCOUNTS must include a buyer account');

  const logisticsUser = createdUsers.find((user) => user.role === 'logistics');
  if (!logisticsUser) throw new Error('DEMO_ACCOUNTS must include a logistics account');

  const batchesByKey = new Map<string, Awaited<ReturnType<typeof prisma.harvestBatch.create>>>();

  for (const batch of DEMO_HARVEST_BATCHES) {
    const farmer = farmersByKey.get(batch.farmerKey);
    if (!farmer) throw new Error(`No DEMO_ACCOUNTS farmer found for farmerKey "${batch.farmerKey}"`);

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

    batchesByKey.set(batch.batchKey, createdBatch);

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

  for (const demoPreOrder of DEMO_PRE_ORDERS) {
    const preOrderBuyer = buyersByKey.get(demoPreOrder.buyerKey);
    if (!preOrderBuyer) throw new Error(`No DEMO_ACCOUNTS buyer found for buyerKey "${demoPreOrder.buyerKey}"`);

    const targetBatch = batchesByKey.get(demoPreOrder.batchKey);
    if (!targetBatch) throw new Error(`No DEMO_HARVEST_BATCHES batch found for batchKey "${demoPreOrder.batchKey}"`);

    const preOrder = await createPreOrder(preOrderBuyer.id, {
      batchId: targetBatch.id,
      quantity: demoPreOrder.quantity,
    });

    await advanceDemoPreOrder(
      preOrder.id,
      targetBatch.id,
      targetBatch.farmerId,
      preOrderBuyer.id,
      logisticsUser.id,
      demoPreOrder.targetStatus,
    );
  }

  console.log(createdUsers.map((u) => ({ id: u.id, phone: u.phone, role: u.role })));
}

main().finally(() => prisma.$disconnect());
