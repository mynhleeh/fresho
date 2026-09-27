import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, transitionPreOrderStatus } from '@/lib/services/preOrderService';
import * as preOrderService from '@/lib/services/preOrderService';
import { markBatchAwaitingHarvest, markBatchReadyForHandover } from '@/lib/services/deliveryService';
import { cleanupDb } from '../helpers/cleanup';

async function seedDepositedPreOrder() {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
  await prisma.deposit.create({ data: { preOrderId: preOrder.id, amount: 20000 } });
  await transitionPreOrderStatus(preOrder.id, 'confirm', { id: buyer.id, role: 'farmer' });
  return { farmer, buyer, batch, preOrder };
}

describe('markBatchAwaitingHarvest', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('updates harvestBatch.status to awaiting_harvest', async () => {
    const { farmer, batch, preOrder } = await seedDepositedPreOrder();

    await markBatchAwaitingHarvest(batch.id, farmer.id);

    const updatedBatch = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updatedBatch?.status).toBe('awaiting_harvest');
    const updatedPreOrder = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(updatedPreOrder?.status).toBe('awaiting_harvest');
  });

  it('leaves harvestBatch.status untouched when the farmer does not own the batch', async () => {
    const { batch } = await seedDepositedPreOrder();
    const otherFarmer = await prisma.user.create({ data: { name: 'F2', phone: '4', address: 'D', role: 'farmer', passwordHash: 'x' } });

    await expect(markBatchAwaitingHarvest(batch.id, otherFarmer.id)).rejects.toThrow('Not your batch');

    const untouchedBatch = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(untouchedBatch?.status).toBe('open');
  });
});

describe('markBatchReadyForHandover', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('updates harvestBatch.status to ready_for_handover', async () => {
    const { farmer, batch, preOrder } = await seedDepositedPreOrder();
    await markBatchAwaitingHarvest(batch.id, farmer.id);

    await markBatchReadyForHandover(batch.id, farmer.id);

    const updatedBatch = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updatedBatch?.status).toBe('ready_for_handover');
    const updatedPreOrder = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(updatedPreOrder?.status).toBe('ready_for_handover');
    const deliveryRecord = await prisma.deliveryRecord.findUnique({ where: { preOrderId: preOrder.id } });
    expect(deliveryRecord?.status).toBe('ready_for_handover');
  });

  it('leaves harvestBatch.status untouched when the farmer does not own the batch', async () => {
    const { batch } = await seedDepositedPreOrder();
    await markBatchAwaitingHarvest(batch.id, (await prisma.harvestBatch.findUniqueOrThrow({ where: { id: batch.id } })).farmerId);
    const otherFarmer = await prisma.user.create({ data: { name: 'F3', phone: '5', address: 'E', role: 'farmer', passwordHash: 'x' } });

    await expect(markBatchReadyForHandover(batch.id, otherFarmer.id)).rejects.toThrow('Not your batch');

    const untouchedBatch = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(untouchedBatch?.status).toBe('awaiting_harvest');
  });

  it('rolls back the whole transaction when a cascaded pre_order update fails mid-transaction', async () => {
    const { farmer, batch, preOrder } = await seedDepositedPreOrder();
    await markBatchAwaitingHarvest(batch.id, farmer.id);
    const cascadeFailure = new Error('simulated cascade failure');
    const transitionSpy = vi.spyOn(preOrderService, 'transitionPreOrderStatus').mockRejectedValueOnce(cascadeFailure);

    await expect(markBatchReadyForHandover(batch.id, farmer.id)).rejects.toThrow('simulated cascade failure');
    transitionSpy.mockRestore();

    const untouchedBatch = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(untouchedBatch?.status).toBe('awaiting_harvest');
    const untouchedPreOrder = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(untouchedPreOrder?.status).toBe('awaiting_harvest');
    const deliveryRecord = await prisma.deliveryRecord.findUnique({ where: { preOrderId: preOrder.id } });
    expect(deliveryRecord).toBeNull();
  });
});
