import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, confirmPreOrder, transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import { payDeposit } from '@/lib/order-services/depositService';
import { cleanupDb } from '../helpers/cleanup';

async function seedPendingOrder() {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const otherFarmer = await prisma.user.create({ data: { name: 'F2', phone: '3', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
  return { farmer, otherFarmer, buyer, batch, preOrder };
}

describe('confirmPreOrder', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('records the farmer confirmation without moving the order out of pending_confirmation', async () => {
    const { farmer, preOrder } = await seedPendingOrder();

    const confirmed = await confirmPreOrder(preOrder.id, { id: farmer.id, role: 'farmer' });

    expect(confirmed.status).toBe('pending_confirmation');
    expect(confirmed.farmerConfirmedAt).not.toBeNull();
  });

  it('also works while the order is negotiating', async () => {
    const { farmer, preOrder } = await seedPendingOrder();
    await transitionPreOrderStatus(preOrder.id, 'negotiate', { id: farmer.id, role: 'farmer' });

    const confirmed = await confirmPreOrder(preOrder.id, { id: farmer.id, role: 'farmer' });

    expect(confirmed.farmerConfirmedAt).not.toBeNull();
  });

  it('refuses a buyer and a farmer who does not own the batch', async () => {
    const { buyer, otherFarmer, preOrder } = await seedPendingOrder();

    await expect(confirmPreOrder(preOrder.id, { id: buyer.id, role: 'buyer' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(confirmPreOrder(preOrder.id, { id: otherFarmer.id, role: 'farmer' })).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('refuses a second confirmation', async () => {
    const { farmer, preOrder } = await seedPendingOrder();
    await confirmPreOrder(preOrder.id, { id: farmer.id, role: 'farmer' });

    await expect(confirmPreOrder(preOrder.id, { id: farmer.id, role: 'farmer' })).rejects.toMatchObject({ code: 'invalid_transition' });
  });

  it('refuses when the batch already left the open stage', async () => {
    const { farmer, batch, preOrder } = await seedPendingOrder();
    await prisma.harvestBatch.update({ where: { id: batch.id }, data: { status: 'awaiting_harvest' } });

    await expect(confirmPreOrder(preOrder.id, { id: farmer.id, role: 'farmer' })).rejects.toMatchObject({ code: 'invalid_transition' });
  });

  it('moves a legacy order that already holds a deposit straight to deposited', async () => {
    const { farmer, preOrder } = await seedPendingOrder();
    await prisma.deposit.create({ data: { preOrderId: preOrder.id, amount: 20000 } });

    const confirmed = await confirmPreOrder(preOrder.id, { id: farmer.id, role: 'farmer' });

    expect(confirmed.status).toBe('deposited');
  });
});

describe('payDeposit after the farmer confirmed', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('refuses a deposit before the farmer confirmed', async () => {
    const { preOrder } = await seedPendingOrder();

    await expect(payDeposit(preOrder.id, 20000)).rejects.toMatchObject({ code: 'farmer_not_confirmed' });
    expect(await prisma.deposit.count()).toBe(0);
  });

  it('records the deposit and moves the order to deposited in one step', async () => {
    const { farmer, preOrder } = await seedPendingOrder();
    await confirmPreOrder(preOrder.id, { id: farmer.id, role: 'farmer' });

    await payDeposit(preOrder.id, 20000);

    const updated = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(updated?.status).toBe('deposited');
    expect(await prisma.ledgerEntry.count({ where: { preOrderId: preOrder.id, type: 'deposit' } })).toBe(1);
  });
});
