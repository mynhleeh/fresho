import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { listOpenBatches, createBatch } from '@/lib/services/batchService';
import { cleanupDb } from '../helpers/cleanup';

describe('listOpenBatches', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('filters by cropName and maxPricePerUnit, excludes closed batches', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '1', address: 'A', role: 'farmer' },
    });
    await createBatch(farmer.id, {
      cropName: 'Ca chua', quantityTotal: 100, unit: 'kg', pricePerUnit: 10000,
      harvestDateEstimate: new Date(),
    });
    await createBatch(farmer.id, {
      cropName: 'Dua leo', quantityTotal: 50, unit: 'kg', pricePerUnit: 20000,
      harvestDateEstimate: new Date(),
    });
    const closed = await createBatch(farmer.id, {
      cropName: 'Ca chua', quantityTotal: 30, unit: 'kg', pricePerUnit: 5000,
      harvestDateEstimate: new Date(),
    });
    await prisma.harvestBatch.update({ where: { id: closed.id }, data: { status: 'closed' } });

    const result = await listOpenBatches({ cropName: 'Ca chua', maxPricePerUnit: 12000 });

    expect(result).toHaveLength(1);
    expect(result[0].cropName).toBe('Ca chua');
    expect(result[0].pricePerUnit).toBe(10000);
  });
});
