import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { postProgressUpdate } from '@/lib/services/harvestProgressService';
import { createPreOrder } from '@/lib/services/preOrderService';
import { cleanupDb } from '../helpers/cleanup';

async function seedBatchWithReservation(reservedQuantity: number) {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Dua leo', quantityTotal: 1000, quantityAvailable: 1000, unit: 'kg', pricePerUnit: 12000, harvestDateEstimate: new Date() },
  });
  if (reservedQuantity > 0) {
    await createPreOrder(buyer.id, { batchId: batch.id, quantity: reservedQuantity });
  }
  return { farmer, buyer, batch };
}

describe('postProgressUpdate', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('logs an on_track update without changing batch quantities', async () => {
    const { farmer, batch } = await seedBatchWithReservation(0);

    await postProgressUpdate(batch.id, farmer.id, { kind: 'on_track', note: 'Vẫn đúng lịch' });

    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.quantityTotal).toBe(1000);
    const logs = await prisma.harvestProgressUpdate.findMany({ where: { batchId: batch.id } });
    expect(logs).toHaveLength(1);
    expect(logs[0].kind).toBe('on_track');
  });

  it('reduces quantityTotal and quantityAvailable together on quantity_adjusted', async () => {
    const { farmer, batch } = await seedBatchWithReservation(200);

    await postProgressUpdate(batch.id, farmer.id, { kind: 'quantity_adjusted', newQuantityTotal: 700 });

    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.quantityTotal).toBe(700);
    expect(updated?.quantityAvailable).toBe(500); // 700 - 200 already reserved
  });

  it('rejects a quantity_adjusted update that would drop below already-reserved quantity', async () => {
    const { farmer, batch } = await seedBatchWithReservation(200);

    await expect(
      postProgressUpdate(batch.id, farmer.id, { kind: 'quantity_adjusted', newQuantityTotal: 100 }),
    ).rejects.toThrow('invalid_state');
  });

  it('rejects a quantity_adjusted update that would drop below the batch minOrderQuantity', async () => {
    const { farmer, batch } = await seedBatchWithReservation(0);
    await prisma.harvestBatch.update({ where: { id: batch.id }, data: { minOrderQuantity: 50 } });

    await expect(
      postProgressUpdate(batch.id, farmer.id, { kind: 'quantity_adjusted', newQuantityTotal: 30 }),
    ).rejects.toThrow(ApiError);

    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.quantityTotal).toBe(1000);
  });

  it('rejects a quantity_adjusted update to zero or negative quantity', async () => {
    const { farmer, batch } = await seedBatchWithReservation(0);

    await expect(
      postProgressUpdate(batch.id, farmer.id, { kind: 'quantity_adjusted', newQuantityTotal: 0 }),
    ).rejects.toThrow(ApiError);
  });

  it('updates harvestDateEstimate on rescheduled', async () => {
    const { farmer, batch } = await seedBatchWithReservation(0);
    const newDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);

    await postProgressUpdate(batch.id, farmer.id, { kind: 'rescheduled', newHarvestDateEstimate: newDate });

    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.harvestDateEstimate.toISOString()).toBe(newDate.toISOString());
  });

  it('rejects updates from a farmer who does not own the batch', async () => {
    const { batch } = await seedBatchWithReservation(0);
    const otherFarmer = await prisma.user.create({ data: { name: 'F2', phone: '9', address: 'X', role: 'farmer' } });

    await expect(
      postProgressUpdate(batch.id, otherFarmer.id, { kind: 'on_track' }),
    ).rejects.toThrow('Not your batch');
  });
});
