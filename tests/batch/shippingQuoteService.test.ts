import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { quoteShipping } from '@/lib/batch-services/shippingQuoteService';
import { cleanupDb } from '../helpers/cleanup';

describe('quoteShipping', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('rejects a quote request for a batch that does not exist', async () => {
    const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer' } });

    await expect(
      quoteShipping({ batchId: 'missing-batch', buyerId: buyer.id, quantity: 10, vehicleType: 'motorbike', distanceKm: 5 }),
    ).rejects.toMatchObject({ code: 'batch_not_found' });
  });

  it('charges more for a longer distance and a heavier load, same vehicle type', async () => {
    const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer' } });
    const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer' } });
    const batch = await prisma.harvestBatch.create({
      data: { farmerId: farmer.id, cropName: 'Dua leo', quantityTotal: 1000, quantityAvailable: 1000, unit: 'kg', pricePerUnit: 12000, harvestDateEstimate: new Date() },
    });

    const near = await quoteShipping({ batchId: batch.id, buyerId: buyer.id, quantity: 100, vehicleType: 'small_truck', distanceKm: 10 });
    const far = await quoteShipping({ batchId: batch.id, buyerId: buyer.id, quantity: 100, vehicleType: 'small_truck', distanceKm: 100 });
    const heavier = await quoteShipping({ batchId: batch.id, buyerId: buyer.id, quantity: 800, vehicleType: 'small_truck', distanceKm: 10 });

    expect(far.estimatedFee).toBeGreaterThan(near.estimatedFee);
    expect(heavier.estimatedFee).toBeGreaterThan(near.estimatedFee);
  });

  it('charges more for a refrigerated_truck than a motorbike over the same distance and quantity', async () => {
    const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer' } });
    const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer' } });
    const batch = await prisma.harvestBatch.create({
      data: { farmerId: farmer.id, cropName: 'Dua leo', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 12000, harvestDateEstimate: new Date() },
    });

    const bike = await quoteShipping({ batchId: batch.id, buyerId: buyer.id, quantity: 20, vehicleType: 'motorbike', distanceKm: 15 });
    const fridge = await quoteShipping({ batchId: batch.id, buyerId: buyer.id, quantity: 20, vehicleType: 'refrigerated_truck', distanceKm: 15 });

    expect(fridge.estimatedFee).toBeGreaterThan(bike.estimatedFee);
  });

  it('persists an append-only ShippingQuote row per request', async () => {
    const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer' } });
    const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer' } });
    const batch = await prisma.harvestBatch.create({
      data: { farmerId: farmer.id, cropName: 'Dua leo', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 12000, harvestDateEstimate: new Date() },
    });

    await quoteShipping({ batchId: batch.id, buyerId: buyer.id, quantity: 20, vehicleType: 'motorbike', distanceKm: 15 });
    await quoteShipping({ batchId: batch.id, buyerId: buyer.id, quantity: 20, vehicleType: 'motorbike', distanceKm: 15 });

    const rows = await prisma.shippingQuote.findMany({ where: { batchId: batch.id } });
    expect(rows).toHaveLength(2);
  });
});
