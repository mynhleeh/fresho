import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { submitRating } from '@/lib/services/ratingService';
import { cleanupDb } from '../helpers/cleanup';

async function seedSettledPreOrder() {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', trustScore: 0 } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', trustScore: 0 } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Dua leo', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 12000, harvestDateEstimate: new Date() },
  });
  const preOrder = await prisma.preOrder.create({
    data: { batchId: batch.id, buyerId: buyer.id, quantity: 10, pricePerUnit: 12000, status: 'settled' },
  });
  return { farmer, buyer, preOrder };
}

describe('submitRating', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('rejects rating a pre_order that is not settled', async () => {
    const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer' } });
    const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer' } });
    const batch = await prisma.harvestBatch.create({
      data: { farmerId: farmer.id, cropName: 'Dua leo', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 12000, harvestDateEstimate: new Date() },
    });
    const preOrder = await prisma.preOrder.create({
      data: { batchId: batch.id, buyerId: buyer.id, quantity: 10, pricePerUnit: 12000, status: 'delivered' },
    });

    await expect(
      submitRating(preOrder.id, buyer.id, farmer.id, { qualityScore: 5, timelinessScore: 5, commitmentScore: 5 }),
    ).rejects.toMatchObject({ code: 'invalid_state' });
  });

  it('rejects a second rating from the same rater on the same pre_order', async () => {
    const { buyer, farmer, preOrder } = await seedSettledPreOrder();
    await submitRating(preOrder.id, buyer.id, farmer.id, { qualityScore: 5, timelinessScore: 5, commitmentScore: 5 });

    await expect(
      submitRating(preOrder.id, buyer.id, farmer.id, { qualityScore: 4, timelinessScore: 4, commitmentScore: 4 }),
    ).rejects.toMatchObject({ code: 'already_rated' });
  });

  it('recomputes trust_score as the unweighted mean of a user’s received ratings', async () => {
    const { buyer, farmer, preOrder } = await seedSettledPreOrder();
    await submitRating(preOrder.id, buyer.id, farmer.id, { qualityScore: 4, timelinessScore: 5, commitmentScore: 3 });

    const updatedFarmer = await prisma.user.findUnique({ where: { id: farmer.id } });
    // (4+5+3)/3 = 4 -> scaled to 0-100 over a 1-5 range = ((4-1)/4)*100 = 75
    expect(updatedFarmer?.trustScore).toBe(75);
  });

  it('averages across multiple ratings for the same ratee over time', async () => {
    const { buyer, farmer, preOrder } = await seedSettledPreOrder();
    await submitRating(preOrder.id, buyer.id, farmer.id, { qualityScore: 5, timelinessScore: 5, commitmentScore: 5 });

    const secondBatch = await prisma.harvestBatch.create({
      data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 50, quantityAvailable: 50, unit: 'kg', pricePerUnit: 8000, harvestDateEstimate: new Date() },
    });
    const secondPreOrder = await prisma.preOrder.create({
      data: { batchId: secondBatch.id, buyerId: buyer.id, quantity: 5, pricePerUnit: 8000, status: 'settled' },
    });
    await submitRating(secondPreOrder.id, buyer.id, farmer.id, { qualityScore: 1, timelinessScore: 1, commitmentScore: 1 });

    const updatedFarmer = await prisma.user.findUnique({ where: { id: farmer.id } });
    // first rating avg=5 (scaled 100), second avg=1 (scaled 0) -> mean of the two scaled scores = 50
    expect(updatedFarmer?.trustScore).toBe(50);
  });
});
