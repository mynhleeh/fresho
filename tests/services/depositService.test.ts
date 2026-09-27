import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, transitionPreOrderStatus } from '@/lib/services/preOrderService';
import { payDeposit } from '@/lib/services/depositService';
import { cleanupDb } from '../helpers/cleanup';

async function seedBatchAndBuyer() {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  return { farmer, buyer, batch };
}

describe('payDeposit', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('records a deposit while pending_confirmation', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    const deposit = await payDeposit(preOrder.id, 20000);

    expect(deposit.amount).toBe(20000);
  });

  it('records a deposit while negotiating', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await transitionPreOrderStatus(preOrder.id, 'negotiate', { id: buyer.id, role: 'farmer' });

    const deposit = await payDeposit(preOrder.id, 20000);

    expect(deposit.amount).toBe(20000);
  });

  it('rejects a deposit once the pre-order is already deposited', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await payDeposit(preOrder.id, 20000);
    await transitionPreOrderStatus(preOrder.id, 'confirm', { id: buyer.id, role: 'farmer' });

    await expect(payDeposit(preOrder.id, 20000)).rejects.toThrow('Deposit can only be recorded');
  });
});
