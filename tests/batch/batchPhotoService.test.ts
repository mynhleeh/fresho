import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createBatch } from '@/lib/batch-services/batchService';
import { addBatchPhoto, deleteBatchPhoto, setCoverPhoto, listPhotosByBatch, listPhotosForEditing, MAX_PHOTOS_PER_BATCH } from '@/lib/batch-services/batchPhotoService';
import { ApiError } from '@/lib/errors';
import { cleanupDb } from '../helpers/cleanup';

async function createFarmerAndBatch() {
  const farmer = await prisma.user.create({
    data: { name: 'F', phone: `p${Math.random()}`, address: 'A', role: 'farmer', passwordHash: 'x' },
  });
  const batch = await createBatch(farmer.id, {
    cropName: 'Xoai cat', quantityTotal: 100, unit: 'kg', pricePerUnit: 20000,
    harvestDateEstimate: new Date(), location: 'Tien Giang',
  });
  return { farmer, batch };
}

describe('addBatchPhoto', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('marks the first uploaded photo as cover and syncs batch.photoUrl', async () => {
    const { farmer, batch } = await createFarmerAndBatch();

    const photo = await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/a.jpg');

    expect(photo.isCover).toBe(true);
    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.photoUrl).toBe('/uploads/batches/a.jpg');
  });

  it('does not change the cover when a second photo is added', async () => {
    const { farmer, batch } = await createFarmerAndBatch();
    await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/a.jpg');

    const second = await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/b.jpg');

    expect(second.isCover).toBe(false);
    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.photoUrl).toBe('/uploads/batches/a.jpg');
  });

  it('rejects uploads beyond the max photo limit', async () => {
    const { farmer, batch } = await createFarmerAndBatch();
    for (let i = 0; i < MAX_PHOTOS_PER_BATCH; i++) {
      await addBatchPhoto(batch.id, farmer.id, `/uploads/batches/${i}.jpg`);
    }

    await expect(addBatchPhoto(batch.id, farmer.id, '/uploads/batches/overflow.jpg')).rejects.toThrow(ApiError);
  });

  it('rejects when the caller does not own the batch', async () => {
    const { batch } = await createFarmerAndBatch();
    const otherFarmer = await prisma.user.create({
      data: { name: 'Other', phone: `p${Math.random()}`, address: 'A', role: 'farmer', passwordHash: 'x' },
    });

    await expect(addBatchPhoto(batch.id, otherFarmer.id, '/uploads/batches/a.jpg')).rejects.toThrow(ApiError);
  });
});

describe('setCoverPhoto', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('moves the cover flag and syncs batch.photoUrl', async () => {
    const { farmer, batch } = await createFarmerAndBatch();
    await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/a.jpg');
    const second = await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/b.jpg');

    await setCoverPhoto(batch.id, farmer.id, second.id);

    const photos = await listPhotosByBatch(batch.id);
    expect(photos.find((p) => p.id === second.id)?.isCover).toBe(true);
    expect(photos.filter((p) => p.isCover)).toHaveLength(1);
    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.photoUrl).toBe('/uploads/batches/b.jpg');
  });
});

describe('deleteBatchPhoto', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('promotes the next remaining photo to cover when the cover photo is deleted', async () => {
    const { farmer, batch } = await createFarmerAndBatch();
    const first = await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/a.jpg');
    await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/b.jpg');

    await deleteBatchPhoto(batch.id, farmer.id, first.id);

    const photos = await listPhotosByBatch(batch.id);
    expect(photos).toHaveLength(1);
    expect(photos[0].isCover).toBe(true);
    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.photoUrl).toBe('/uploads/batches/b.jpg');
  });

  it('falls back to the default placeholder when the last photo is deleted', async () => {
    const { farmer, batch } = await createFarmerAndBatch();
    const only = await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/a.jpg');

    await deleteBatchPhoto(batch.id, farmer.id, only.id);

    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.photoUrl).toBeNull();
  });

  it('keeps the current cover untouched when a non-cover photo is deleted', async () => {
    const { farmer, batch } = await createFarmerAndBatch();
    await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/a.jpg');
    const second = await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/b.jpg');

    await deleteBatchPhoto(batch.id, farmer.id, second.id);

    const updated = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updated?.photoUrl).toBe('/uploads/batches/a.jpg');
  });
});

describe('listPhotosForEditing', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('backfills a legacy cover photo (photoUrl set directly, no HarvestBatchPhoto row) so the edit panel can show it', async () => {
    const { batch } = await createFarmerAndBatch();
    await prisma.harvestBatch.update({ where: { id: batch.id }, data: { photoUrl: '/uploads/batches/legacy.jpg' } });
    expect(await listPhotosByBatch(batch.id)).toHaveLength(0);

    const photos = await listPhotosForEditing(batch.id);

    expect(photos).toHaveLength(1);
    expect(photos[0]).toMatchObject({ url: '/uploads/batches/legacy.jpg', isCover: true });
    // photoUrl itself must stay exactly as it was — this only adds the matching row.
    const unchanged = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(unchanged?.photoUrl).toBe('/uploads/batches/legacy.jpg');
  });

  it('does not duplicate rows when called again after the backfill', async () => {
    const { batch } = await createFarmerAndBatch();
    await prisma.harvestBatch.update({ where: { id: batch.id }, data: { photoUrl: '/uploads/batches/legacy.jpg' } });

    await listPhotosForEditing(batch.id);
    const photos = await listPhotosForEditing(batch.id);

    expect(photos).toHaveLength(1);
  });

  it('returns an empty list for a batch with no photo at all', async () => {
    const { batch } = await createFarmerAndBatch();

    const photos = await listPhotosForEditing(batch.id);

    expect(photos).toHaveLength(0);
  });

  it('returns the real photos untouched when they already exist', async () => {
    const { farmer, batch } = await createFarmerAndBatch();
    await addBatchPhoto(batch.id, farmer.id, '/uploads/batches/a.jpg');

    const photos = await listPhotosForEditing(batch.id);

    expect(photos).toHaveLength(1);
    expect(photos[0].url).toBe('/uploads/batches/a.jpg');
  });
});
