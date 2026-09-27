import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { listOpenBatches, createBatch } from '@/lib/services/batchService';
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
    ).rejects.toThrow('minOrderQuantity cannot exceed quantityTotal');
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

    const result = await listOpenBatches({ cropName: 'Ca chua', maxPricePerUnit: 12000 });

    expect(result).toHaveLength(1);
    expect(result[0].cropName).toBe('Ca chua');
    expect(result[0].pricePerUnit).toBe(10000);
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

    const result = await listOpenBatches({ location: 'Tien Giang' });

    expect(result).toHaveLength(1);
    expect(result[0].location).toBe('Chau Thanh, Tien Giang');
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

    const result = await listOpenBatches({
      harvestDateFrom: new Date('2026-08-29'),
      harvestDateTo: new Date('2026-08-31'),
    });

    expect(result).toHaveLength(1);
    expect(result[0].harvestDateEstimate.toISOString()).toContain('2026-08-30');
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

    const result = await listOpenBatches({ sortBy: 'trustScore' });

    expect(result[0].farmerId).toBe(highTrust.id);
    expect(result[1].farmerId).toBe(lowTrust.id);
  });
});
