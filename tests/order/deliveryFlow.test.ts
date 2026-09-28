import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, confirmPreOrder } from '@/lib/order-services/preOrderService';
import { payDeposit } from '@/lib/order-services/depositService';
import { markBatchAwaitingHarvest, markBatchReadyForHandover, updateDeliveryStatus } from '@/lib/order-services/deliveryService';
import { cleanupDb } from '../helpers/cleanup';
import { confirmAndDeposit } from '../helpers/orderFlow';

async function seedDepositedOrder(deliveryMethod: 'self_pickup' | 'carrier') {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10, deliveryMethod, shippingFeeQuote: deliveryMethod === 'carrier' ? 50000 : undefined });
  await confirmAndDeposit(preOrder.id, farmer.id);
  return { farmer, batch, preOrder };
}

async function seedReadyForHandover(deliveryMethod: 'self_pickup' | 'carrier') {
  const seeded = await seedDepositedOrder(deliveryMethod);
  await markBatchAwaitingHarvest(seeded.batch.id, seeded.farmer.id);
  await markBatchReadyForHandover(seeded.batch.id, seeded.farmer.id);
  return seeded;
}

describe('delivery record for ready_for_handover', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it.each(['self_pickup', 'carrier'] as const)('keeps the %s method chosen by the buyer', async (method) => {
    const { preOrder } = await seedReadyForHandover(method);

    const record = await prisma.deliveryRecord.findUnique({ where: { preOrderId: preOrder.id } });

    expect(record?.method).toBe(method);
  });

  it('lets the farmer confirm a self-pickup handover', async () => {
    const { farmer, preOrder } = await seedReadyForHandover('self_pickup');

    await updateDeliveryStatus(preOrder.id, { id: farmer.id, role: 'farmer' }, 'delivered');

    const updated = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(updated?.status).toBe('delivered');
  });

  it('refuses a farmer marking a carrier order delivered and leaves it ready_for_handover', async () => {
    const { farmer, preOrder } = await seedReadyForHandover('carrier');

    await expect(updateDeliveryStatus(preOrder.id, { id: farmer.id, role: 'farmer' }, 'delivered'))
      .rejects.toMatchObject({ code: 'forbidden' });

    const unchanged = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(unchanged?.status).toBe('ready_for_handover');
  });
});

describe('carrier orders with an estimated shipping fee only', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('lets the farmer hand the goods to the carrier and the buyer confirm arrival', async () => {
    const { farmer, preOrder } = await seedReadyForHandover('carrier');
    const buyerId = (await prisma.preOrder.findUniqueOrThrow({ where: { id: preOrder.id } })).buyerId;

    await updateDeliveryStatus(preOrder.id, { id: farmer.id, role: 'farmer' }, 'in_transit');
    const inTransit = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(inTransit?.status).toBe('in_transit');

    await updateDeliveryStatus(preOrder.id, { id: buyerId, role: 'buyer' }, 'delivered');
    const delivered = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(delivered?.status).toBe('delivered');
  });

  it('refuses the farmer handing a self-pickup order to a carrier', async () => {
    const { farmer, preOrder } = await seedReadyForHandover('self_pickup');

    await expect(updateDeliveryStatus(preOrder.id, { id: farmer.id, role: 'farmer' }, 'in_transit'))
      .rejects.toMatchObject({ code: 'forbidden' });
  });

  it('refuses the buyer confirming arrival before the goods left, and other buyers at any time', async () => {
    const { farmer, preOrder } = await seedReadyForHandover('carrier');
    const buyerId = (await prisma.preOrder.findUniqueOrThrow({ where: { id: preOrder.id } })).buyerId;
    const otherBuyer = await prisma.user.create({ data: { name: 'B3', phone: '77', address: 'B', role: 'buyer', passwordHash: 'x' } });

    await expect(updateDeliveryStatus(preOrder.id, { id: buyerId, role: 'buyer' }, 'delivered')).rejects.toMatchObject({ code: 'forbidden' });
    await updateDeliveryStatus(preOrder.id, { id: farmer.id, role: 'farmer' }, 'in_transit');
    await expect(updateDeliveryStatus(preOrder.id, { id: otherBuyer.id, role: 'buyer' }, 'delivered')).rejects.toMatchObject({ code: 'forbidden' });
  });
});

describe('batch-level transitions respect the batch status', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('refuses ready-for-handover before the batch is awaiting_harvest', async () => {
    const { farmer, batch } = await seedDepositedOrder('self_pickup');

    await expect(markBatchReadyForHandover(batch.id, farmer.id)).rejects.toMatchObject({ code: 'invalid_state' });
  });

  it('refuses awaiting-harvest again once the batch moved on', async () => {
    const { farmer, batch } = await seedReadyForHandover('self_pickup');

    await expect(markBatchAwaitingHarvest(batch.id, farmer.id)).rejects.toMatchObject({ code: 'invalid_state' });

    const unchanged = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(unchanged?.status).toBe('ready_for_handover');
  });
});

describe('late orders after the batch left the open stage', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  async function seedPendingOrderBesideAdvancedBatch() {
    const { farmer, batch } = await seedDepositedOrder('self_pickup');
    const laterBuyer = await prisma.user.create({ data: { name: 'B2', phone: '9', address: 'B', role: 'buyer', passwordHash: 'x' } });
    const pending = await createPreOrder(laterBuyer.id, { batchId: batch.id, quantity: 10 });
    return { farmer, batch, pending };
  }

  it('refuses a deposit on a confirmed order whose batch is no longer open', async () => {
    const { farmer, batch, pending } = await seedPendingOrderBesideAdvancedBatch();
    await confirmPreOrder(pending.id, { id: farmer.id, role: 'farmer' });
    await markBatchAwaitingHarvest(batch.id, farmer.id);

    await expect(payDeposit(pending.id, 20000)).rejects.toMatchObject({ code: 'invalid_state' });
  });

  it('refuses to confirm a pending order whose batch is no longer open', async () => {
    const { farmer, batch, pending } = await seedPendingOrderBesideAdvancedBatch();
    await markBatchAwaitingHarvest(batch.id, farmer.id);

    await expect(confirmPreOrder(pending.id, { id: farmer.id, role: 'farmer' })).rejects.toMatchObject({ code: 'invalid_transition' });

    const unchanged = await prisma.preOrder.findUnique({ where: { id: pending.id } });
    expect(unchanged?.status).toBe('pending_confirmation');
  });
});
