import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import {
  listPreOrdersForFarmer,
  listPreOrdersForBuyer,
  getPreOrderForActor,
} from '@/lib/order-services/orderViewService';
import { cleanupDb } from '../helpers/cleanup';
import { confirmAndDeposit } from '../helpers/orderFlow';

async function seedOrder() {
  const farmer = await prisma.user.create({ data: { name: 'Farmer A', phone: '0900000001', address: 'Farm road 1', role: 'farmer', passwordHash: 'secret-hash', trustScore: 7 } });
  const buyer = await prisma.user.create({ data: { name: 'Buyer B', phone: '0900000002', address: 'Kitchen street 2', role: 'buyer', passwordHash: 'secret-hash', trustScore: 4 } });
  const otherBuyer = await prisma.user.create({ data: { name: 'Buyer C', phone: '0900000003', address: 'Elsewhere 3', role: 'buyer', passwordHash: 'x' } });
  const otherFarmer = await prisma.user.create({ data: { name: 'Farmer D', phone: '0900000004', address: 'Farm road 4', role: 'farmer', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
  return { farmer, buyer, otherBuyer, otherFarmer, batch, preOrder };
}

async function advanceToReadyForHandover(preOrderId: string, farmerId: string) {
  await confirmAndDeposit(preOrderId, farmerId);
  await transitionPreOrderStatus(preOrderId, 'mark_awaiting_harvest', { id: farmerId, role: 'farmer' });
  await transitionPreOrderStatus(preOrderId, 'mark_ready_for_handover', { id: farmerId, role: 'farmer' });
}

describe('listPreOrdersForFarmer', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('returns only orders of the farmer own batches', async () => {
    const { farmer, otherFarmer } = await seedOrder();

    expect(await listPreOrdersForFarmer(farmer.id)).toHaveLength(1);
    expect(await listPreOrdersForFarmer(otherFarmer.id)).toHaveLength(0);
  });

  it('never exposes password hash and hides buyer phone and address before handover', async () => {
    const { farmer } = await seedOrder();

    const [order] = await listPreOrdersForFarmer(farmer.id);

    expect(JSON.stringify(order)).not.toContain('secret-hash');
    expect(order.buyer).toEqual({ id: expect.any(String), name: 'Buyer B', trustScore: 4 });
  });

  it('reveals buyer phone and address once the order is ready for handover', async () => {
    const { farmer, preOrder } = await seedOrder();
    await advanceToReadyForHandover(preOrder.id, farmer.id);

    const [order] = await listPreOrdersForFarmer(farmer.id);

    expect(order.buyer).toMatchObject({ name: 'Buyer B', phone: '0900000002', address: 'Kitchen street 2' });
  });
});

describe('listPreOrdersForBuyer', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('returns only the buyer own orders with the farmer name and trust score but no contact before handover', async () => {
    const { buyer, otherBuyer } = await seedOrder();

    const [order] = await listPreOrdersForBuyer(buyer.id);

    expect(order.batch.farmer).toEqual({ id: expect.any(String), name: 'Farmer A', trustScore: 7 });
    expect(JSON.stringify(order)).not.toContain('secret-hash');
    expect(await listPreOrdersForBuyer(otherBuyer.id)).toHaveLength(0);
  });

  it('reveals farmer phone and address once the order is ready for handover', async () => {
    const { buyer, farmer, preOrder } = await seedOrder();
    await advanceToReadyForHandover(preOrder.id, farmer.id);

    const [order] = await listPreOrdersForBuyer(buyer.id);

    expect(order.batch.farmer).toMatchObject({ phone: '0900000001', address: 'Farm road 1' });
  });
});

describe('getPreOrderForActor', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('returns the order with ledger entries to its buyer and to the batch farmer', async () => {
    const { buyer, farmer, preOrder } = await seedOrder();
    await confirmAndDeposit(preOrder.id, farmer.id);

    const forBuyer = await getPreOrderForActor(preOrder.id, { id: buyer.id, role: 'buyer' });
    const forFarmer = await getPreOrderForActor(preOrder.id, { id: farmer.id, role: 'farmer' });

    expect(forBuyer.ledgerEntries.map((entry) => entry.amount)).toEqual([20000]);
    expect(forFarmer.id).toBe(preOrder.id);
  });

  it.each(['otherBuyer', 'otherFarmer'] as const)('hides the order from %s with pre_order_not_found', async (who) => {
    const seeded = await seedOrder();
    const stranger = seeded[who];

    await expect(getPreOrderForActor(seeded.preOrder.id, { id: stranger.id, role: stranger.role }))
      .rejects.toMatchObject({ code: 'pre_order_not_found', status: 404 });
  });

  it('rejects logistics and unknown ids', async () => {
    const { preOrder } = await seedOrder();

    await expect(getPreOrderForActor(preOrder.id, { id: 'x', role: 'logistics' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(getPreOrderForActor('missing', { id: 'x', role: 'buyer' })).rejects.toMatchObject({ code: 'pre_order_not_found' });
  });
});
