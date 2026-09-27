import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createBatch } from '@/lib/services/batchService';
import { getPriceAndPackagingAdvisory } from '@/lib/services/priceAdvisoryService';
import { cleanupDb } from '../helpers/cleanup';

describe('getPriceAndPackagingAdvisory', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('is marked advisory-only and returns no price range when there is no history', async () => {
    const advisory = await getPriceAndPackagingAdvisory('Sau rieng');

    expect(advisory.isAdvisoryOnly).toBe(true);
    expect(advisory.sampleSize).toBe(0);
    expect(advisory.suggestedMinPrice).toBeNull();
    expect(advisory.suggestedMaxPrice).toBeNull();
  });

  it('suggests a price range from recent batches of the same crop', async () => {
    const farmer = await prisma.user.create({
      data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' },
    });
    await createBatch(farmer.id, {
      cropName: 'Dua leo loai 1', quantityTotal: 100, unit: 'kg', pricePerUnit: 10000,
      harvestDateEstimate: new Date(), location: 'Tien Giang',
    });
    await createBatch(farmer.id, {
      cropName: 'Dua leo loai 1', quantityTotal: 100, unit: 'kg', pricePerUnit: 14000,
      harvestDateEstimate: new Date(), location: 'Tien Giang',
    });

    const advisory = await getPriceAndPackagingAdvisory('Dua leo loai 1');

    expect(advisory.suggestedMinPrice).toBe(10000);
    expect(advisory.suggestedMaxPrice).toBe(14000);
    expect(advisory.sampleSize).toBe(2);
  });

  it('matches a packaging suggestion by crop keyword, case-insensitive', async () => {
    const advisory = await getPriceAndPackagingAdvisory('Xoài cát Hòa Lộc');

    expect(advisory.packagingSuggestion).toContain('carton');
  });

  it('falls back to a default packaging suggestion for an unknown crop', async () => {
    const advisory = await getPriceAndPackagingAdvisory('Mang cut');

    expect(advisory.packagingSuggestion).toBe('Đóng gói thông thoáng, tránh va đập trong vận chuyển');
  });
});
