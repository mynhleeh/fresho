import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, confirmPreOrder, transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import { payDeposit } from '@/lib/order-services/depositService';
import { calculateDepositAmount } from '@/lib/order/depositAmount';
import { cleanupDb } from '../helpers/cleanup';
import { confirmAndDeposit } from '../helpers/orderFlow';

async function createConfirmedPreOrder(farmerId: string, buyerId: string, batchId: string) {
  const preOrder = await createPreOrder(buyerId, { batchId, quantity: 10 });
  await confirmPreOrder(preOrder.id, { id: farmerId, role: 'farmer' });
  return preOrder;
}

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
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createConfirmedPreOrder(farmer.id, buyer.id, batch.id);

    const deposit = await payDeposit(preOrder.id, 20000);

    expect(deposit.amount).toBe(20000);
  });

  it('records a deposit while negotiating once the farmer confirmed', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await transitionPreOrderStatus(preOrder.id, 'negotiate', { id: farmer.id, role: 'farmer' });
    await confirmPreOrder(preOrder.id, { id: farmer.id, role: 'farmer' });

    const deposit = await payDeposit(preOrder.id, 20000);

    expect(deposit.amount).toBe(20000);
  });

  it('rejects a deposit once the pre-order is already deposited', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await confirmAndDeposit(preOrder.id, farmer.id);

    await expect(payDeposit(preOrder.id, 20000)).rejects.toMatchObject({ code: 'invalid_state' });
  });

  it('rejects a deposit that differs from 20% of the goods amount', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createConfirmedPreOrder(farmer.id, buyer.id, batch.id);

    await expect(payDeposit(preOrder.id, 5000)).rejects.toMatchObject({ code: 'invalid_deposit_amount' });
    expect(await prisma.ledgerEntry.count()).toBe(0);
  });

  it('rejects a non-integer deposit amount', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createConfirmedPreOrder(farmer.id, buyer.id, batch.id);

    await expect(payDeposit(preOrder.id, 20000.5)).rejects.toMatchObject({ code: 'invalid_deposit_amount' });
  });

  it('rejects a second deposit for the same pre-order', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createConfirmedPreOrder(farmer.id, buyer.id, batch.id);
    await payDeposit(preOrder.id, 20000);

    await expect(payDeposit(preOrder.id, 20000)).rejects.toMatchObject({ code: 'invalid_state' });
  });
});

describe('payDeposit concurrency', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('records only one deposit when paid twice at the same time', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createConfirmedPreOrder(farmer.id, buyer.id, batch.id);

    const results = await Promise.allSettled([payDeposit(preOrder.id, 20000), payDeposit(preOrder.id, 20000)]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma.deposit.count()).toBe(1);
    expect(await prisma.ledgerEntry.count()).toBe(1);
  });
});

describe('calculateDepositAmount', () => {
  it('returns 20% of the goods amount as a whole VND value', () => {
    expect(calculateDepositAmount(9600000)).toBe(1920000);
    expect(calculateDepositAmount(33333)).toBe(6667);
  });
});
