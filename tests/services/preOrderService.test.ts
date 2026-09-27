import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, transitionPreOrderStatus } from '@/lib/services/preOrderService';
import { cleanupDb } from '../helpers/cleanup';

async function seedBatchAndBuyer() {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  return { farmer, buyer, batch };
}

describe('createPreOrder', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('rejects a quantity below the batch minimum order quantity', async () => {
    const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
    const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
    const batch = await prisma.harvestBatch.create({
      data: {
        farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100,
        unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date(), minOrderQuantity: 20,
      },
    });

    await expect(
      createPreOrder(buyer.id, { batchId: batch.id, quantity: 5 }),
    ).rejects.toThrow('Quantity must be at least 20');
  });
});

describe('transitionPreOrderStatus', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('rejects confirm before a deposit exists', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await expect(
      transitionPreOrderStatus(preOrder.id, 'confirm', { id: buyer.id, role: 'buyer' }),
    ).rejects.toThrow('invalid_transition');
  });

  it('moves pending_confirmation -> deposited after a deposit is recorded', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await prisma.deposit.create({ data: { preOrderId: preOrder.id, amount: 20000 } });

    const updated = await transitionPreOrderStatus(preOrder.id, 'confirm', { id: buyer.id, role: 'farmer' });

    expect(updated.status).toBe('deposited');
  });

  it('moves pending_confirmation -> negotiating on negotiate, then can still confirm after a deposit', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    const negotiating = await transitionPreOrderStatus(preOrder.id, 'negotiate', { id: buyer.id, role: 'farmer' });
    expect(negotiating.status).toBe('negotiating');

    await prisma.deposit.create({ data: { preOrderId: preOrder.id, amount: 20000 } });
    const confirmed = await transitionPreOrderStatus(preOrder.id, 'confirm', { id: buyer.id, role: 'farmer' });
    expect(confirmed.status).toBe('deposited');
  });

  it('rejects a pre-order while negotiating and restores batch quantity', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await transitionPreOrderStatus(preOrder.id, 'negotiate', { id: buyer.id, role: 'farmer' });

    const rejected = await transitionPreOrderStatus(preOrder.id, 'reject', { id: buyer.id, role: 'farmer' });

    expect(rejected.status).toBe('rejected');
    const updatedBatch = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updatedBatch?.quantityAvailable).toBe(100);
  });

  it('rejects an event not valid from the current status', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await expect(
      transitionPreOrderStatus(preOrder.id, 'mark_delivered', { id: buyer.id, role: 'buyer' }),
    ).rejects.toThrow('invalid_transition');
  });

  it('walks the full happy path to settled', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await prisma.deposit.create({ data: { preOrderId: preOrder.id, amount: 20000 } });

    await transitionPreOrderStatus(preOrder.id, 'confirm', { id: buyer.id, role: 'farmer' });
    await transitionPreOrderStatus(preOrder.id, 'mark_awaiting_harvest', { id: buyer.id, role: 'farmer' });
    await transitionPreOrderStatus(preOrder.id, 'mark_ready_for_handover', { id: buyer.id, role: 'farmer' });
    await transitionPreOrderStatus(preOrder.id, 'mark_in_transit', { id: buyer.id, role: 'logistics' });
    await transitionPreOrderStatus(preOrder.id, 'mark_delivered', { id: buyer.id, role: 'logistics' });
    const final = await transitionPreOrderStatus(preOrder.id, 'confirm_receipt', { id: buyer.id, role: 'buyer' });

    expect(final.status).toBe('settled');
  });
});
