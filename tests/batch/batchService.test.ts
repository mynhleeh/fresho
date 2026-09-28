import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { listOpenBatches, listBatchesByFarmer, createBatch, setBatchPhoto, updateBatch } from '@/lib/batch-services/batchService';
import { ApiError } from '@/lib/errors';
import { cleanupDb } from '../helpers/cleanup';

describe('createBatch', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('rejects a minOrderQuantity greater than quantityTotal', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' },
    });

    await expect(
      createBatch(farmer.id, {
        cropName: 'Xoai', quantityTotal: 50, unit: 'kg', pricePerUnit: 15000,
        harvestDateEstimate: new Date(), location: 'Da Lat', minOrderQuantity: 100,
      }),
    ).rejects.toMatchObject({ code: 'invalid_input' });
  });
});

describe('listOpenBatches', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('filters by cropName and maxPricePerUnit, excludes closed batches', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    await createBatch(farmer.id, {
      cropName: 'Ca chua', quantityTotal: 100, unit: 'kg', pricePerUnit: 10000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    await createBatch(farmer.id, {
      cropName: 'Dua leo', quantityTotal: 50, unit: 'kg', pricePerUnit: 20000,
      harvestDateEstimate: new Date(), location: 'Tien Giang',
    });
    const closed = await createBatch(farmer.id, {
      cropName: 'Ca chua', quantityTotal: 30, unit: 'kg', pricePerUnit: 5000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    await prisma.harvestBatch.update({ where: { id: closed.id }, data: { status: 'closed' } });

    const { items, total } = await listOpenBatches({ cropName: 'Ca chua', maxPricePerUnit: 12000 });

    expect(items).toHaveLength(1);
    expect(total).toBe(1);
    expect(items[0].cropName).toBe('Ca chua');
    expect(items[0].pricePerUnit).toBe(10000);
  });

  it('includes awaiting_harvest and ready_for_handover batches, excludes hidden and closed ones', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '13', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    const openBatch = await createBatch(farmer.id, {
      cropName: 'Xoai', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    const awaitingBatch = await createBatch(farmer.id, {
      cropName: 'Lua', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    await prisma.harvestBatch.update({ where: { id: awaitingBatch.id }, data: { status: 'awaiting_harvest' } });
    const readyBatch = await createBatch(farmer.id, {
      cropName: 'Buoi', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    await prisma.harvestBatch.update({ where: { id: readyBatch.id }, data: { status: 'ready_for_handover' } });
    const closedBatch = await createBatch(farmer.id, {
      cropName: 'Cam', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    await prisma.harvestBatch.update({ where: { id: closedBatch.id }, data: { status: 'closed' } });
    const hiddenOpenBatch = await createBatch(farmer.id, {
      cropName: 'Dua', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    await prisma.harvestBatch.update({ where: { id: hiddenOpenBatch.id }, data: { isHidden: true } });

    const { items, total } = await listOpenBatches();

    expect(items.map((b) => b.id).sort()).toEqual([openBatch.id, awaitingBatch.id, readyBatch.id].sort());
    expect(total).toBe(3);
  });

  it('filters by location substring', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '2', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    await createBatch(farmer.id, {
      cropName: 'Xoai', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Chau Thanh, Tien Giang',
    });
    await createBatch(farmer.id, {
      cropName: 'Xoai', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });

    const { items } = await listOpenBatches({ location: 'Tien Giang' });

    expect(items).toHaveLength(1);
    expect(items[0].location).toBe('Chau Thanh, Tien Giang');
  });

  it('filters by harvest date range', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '3', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    await createBatch(farmer.id, {
      cropName: 'Xoai', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date('2026-08-30'), location: 'Da Lat',
    });
    await createBatch(farmer.id, {
      cropName: 'Xoai', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date('2026-09-15'), location: 'Da Lat',
    });

    const { items } = await listOpenBatches({
      harvestDateFrom: new Date('2026-08-29'),
      harvestDateTo: new Date('2026-08-31'),
    });

    expect(items).toHaveLength(1);
    expect(items[0].harvestDateEstimate.toISOString()).toContain('2026-08-30');
  });

  it('sorts by farmer trust score when requested', async () => {
    const lowTrust = await prisma.user.create({
      data: { name: 'Low', phone: '4', address: 'A', role: 'farmer', trustScore: 10, passwordHash: 'x' },
    });
    const highTrust = await prisma.user.create({
      data: { name: 'High', phone: '5', address: 'A', role: 'farmer', trustScore: 90, passwordHash: 'x' },
    });
    await createBatch(lowTrust.id, {
      cropName: 'Xoai', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    await createBatch(highTrust.id, {
      cropName: 'Xoai', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });

    const { items } = await listOpenBatches({ sortBy: 'trustScore' });

    expect(items[0].farmer.trustScore).toBe(90);
    expect(items[1].farmer.trustScore).toBe(10);
  });

  it('paginates results using limit and offset while reporting the full total', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '14', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    for (let i = 0; i < 15; i++) {
      await createBatch(farmer.id, {
        cropName: `Xoai ${i}`, quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
        harvestDateEstimate: new Date(), location: 'Da Lat',
      });
    }

    const firstPage = await listOpenBatches({ limit: 10, offset: 0 });
    const secondPage = await listOpenBatches({ limit: 10, offset: 10 });

    expect(firstPage.items).toHaveLength(10);
    expect(firstPage.total).toBe(15);
    expect(secondPage.items).toHaveLength(5);
    expect(secondPage.total).toBe(15);
  });
});

describe('listBatchesByFarmer', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('returns all of a farmer\'s batches regardless of status, excluding other farmers\' batches', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '9', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    const otherFarmer = await prisma.user.create({
      data: { name: 'Other', phone: '10', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    const openBatch = await createBatch(farmer.id, {
      cropName: 'Xoai', quantityTotal: 100, unit: 'kg', pricePerUnit: 15000,
      harvestDateEstimate: new Date(), location: 'Da Lat',
    });
    const awaitingBatch = await createBatch(farmer.id, {
      cropName: 'Lua', quantityTotal: 200, unit: 'kg', pricePerUnit: 10000,
      harvestDateEstimate: new Date(), location: 'Soc Trang',
    });
    await prisma.harvestBatch.update({ where: { id: awaitingBatch.id }, data: { status: 'awaiting_harvest' } });
    await createBatch(otherFarmer.id, {
      cropName: 'Buoi', quantityTotal: 50, unit: 'kg', pricePerUnit: 20000,
      harvestDateEstimate: new Date(), location: 'Ben Tre',
    });

    const result = await listBatchesByFarmer(farmer.id);

    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id).sort()).toEqual([openBatch.id, awaitingBatch.id].sort());
    expect(result.every((b) => b.farmerId === farmer.id)).toBe(true);
  });
});

describe('updateBatch', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('persists location, qualityStandard, minOrderQuantity, and description on update', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '11', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    const batch = await createBatch(farmer.id, {
      cropName: 'Xoài cát', quantityTotal: 100, unit: 'kg', pricePerUnit: 20000,
      harvestDateEstimate: new Date(), location: 'Tien Giang',
    });

    const updated = await updateBatch(batch.id, farmer.id, {
      location: 'Ben Tre',
      qualityStandard: 'VietGAP',
      minOrderQuantity: 25,
      description: 'Đóng gói theo thùng xốp 10kg.',
    });

    expect(updated.location).toBe('Ben Tre');
    expect(updated.qualityStandard).toBe('VietGAP');
    expect(updated.minOrderQuantity).toBe(25);
    expect(updated.description).toBe('Đóng gói theo thùng xốp 10kg.');
  });

  it('rejects a minOrderQuantity greater than the batch\'s existing quantityTotal', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '12', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    const batch = await createBatch(farmer.id, {
      cropName: 'Xoài cát', quantityTotal: 100, unit: 'kg', pricePerUnit: 20000,
      harvestDateEstimate: new Date(), location: 'Tien Giang',
    });

    await expect(
      updateBatch(batch.id, farmer.id, { minOrderQuantity: 150 }),
    ).rejects.toMatchObject({ code: 'invalid_input' });
  });
});

describe('setBatchPhoto', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('updates photoUrl when the caller owns the batch', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '6', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    const batch = await createBatch(farmer.id, {
      cropName: 'Xoai cat', quantityTotal: 100, unit: 'kg', pricePerUnit: 20000,
      harvestDateEstimate: new Date(), location: 'Tien Giang',
    });

    const updated = await setBatchPhoto(batch.id, farmer.id, '/uploads/batches/x.jpg');

    expect(updated.photoUrl).toBe('/uploads/batches/x.jpg');
  });

  it('rejects when the caller does not own the batch', async () => {
    const owner = await prisma.user.create({
      data: { name: 'Owner', phone: '7', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    const otherFarmer = await prisma.user.create({
      data: { name: 'Other', phone: '8', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    const batch = await createBatch(owner.id, {
      cropName: 'Xoai cat', quantityTotal: 100, unit: 'kg', pricePerUnit: 20000,
      harvestDateEstimate: new Date(), location: 'Tien Giang',
    });

    await expect(setBatchPhoto(batch.id, otherFarmer.id, '/uploads/batches/x.jpg')).rejects.toThrow(ApiError);
  });
});
