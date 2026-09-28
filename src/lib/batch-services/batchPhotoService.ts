import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { assertBatchOwnership } from '@/lib/batch-services/batchService';

// TODO(business-confirm): max photo count per batch is not specified in the charter;
// 6 is chosen as a reasonable demo limit for a bulk-harvest listing.
export const MAX_PHOTOS_PER_BATCH = 6;

export function listPhotosByBatch(batchId: string) {
  return prisma.harvestBatchPhoto.findMany({
    where: { batchId },
    orderBy: { position: 'asc' },
  });
}

// Batches created before the multi-photo feature existed (seeded demo data, or
// photos uploaded through the old single-photo endpoint) have `harvestBatch.photoUrl`
// set but no matching `HarvestBatchPhoto` row, so the edit panel's gallery loaded
// empty even though the batch card correctly showed the cover photo. Materializing
// that legacy photo into a real row on first read (bounded to the one batch being
// viewed, purely additive, `photoUrl` unchanged) lets the existing add/remove/set-cover
// flows handle it like any other photo from then on.
export async function listPhotosForEditing(batchId: string) {
  const existingPhotos = await listPhotosByBatch(batchId);
  if (existingPhotos.length > 0) return existingPhotos;

  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch?.photoUrl) return existingPhotos;

  await prisma.harvestBatchPhoto.create({
    data: { batchId, url: batch.photoUrl, position: 0, isCover: true },
  });
  return listPhotosByBatch(batchId);
}

export async function addBatchPhoto(batchId: string, farmerId: string, url: string) {
  await assertBatchOwnership(batchId, farmerId);

  return prisma.$transaction(async (tx) => {
    const existingPhotos = await tx.harvestBatchPhoto.findMany({ where: { batchId } });
    if (existingPhotos.length >= MAX_PHOTOS_PER_BATCH) {
      throw new ApiError('too_many_photos', `Mỗi lô hàng chỉ có tối đa ${MAX_PHOTOS_PER_BATCH} ảnh.`, 400);
    }

    const isFirstPhoto = existingPhotos.length === 0;
    const photo = await tx.harvestBatchPhoto.create({
      data: {
        batchId,
        url,
        position: existingPhotos.length,
        isCover: isFirstPhoto,
      },
    });

    if (isFirstPhoto) {
      await tx.harvestBatch.update({ where: { id: batchId }, data: { photoUrl: url } });
    }

    return photo;
  });
}

export async function setCoverPhoto(batchId: string, farmerId: string, photoId: string) {
  await assertBatchOwnership(batchId, farmerId);

  await prisma.$transaction(async (tx) => {
    const photo = await tx.harvestBatchPhoto.findUnique({ where: { id: photoId } });
    if (!photo || photo.batchId !== batchId) throw new ApiError('photo_not_found', 'Không tìm thấy ảnh.', 404);

    await tx.harvestBatchPhoto.updateMany({ where: { batchId, isCover: true }, data: { isCover: false } });
    await tx.harvestBatchPhoto.update({ where: { id: photoId }, data: { isCover: true } });
    await tx.harvestBatch.update({ where: { id: batchId }, data: { photoUrl: photo.url } });
  });
}

// TODO(business-confirm): promoting the lowest-position remaining photo to cover
// on delete is an assumption (no charter guidance); farmers might instead expect
// to be prompted to pick a new cover.
export async function deleteBatchPhoto(batchId: string, farmerId: string, photoId: string) {
  await assertBatchOwnership(batchId, farmerId);

  await prisma.$transaction(async (tx) => {
    const photo = await tx.harvestBatchPhoto.findUnique({ where: { id: photoId } });
    if (!photo || photo.batchId !== batchId) throw new ApiError('photo_not_found', 'Không tìm thấy ảnh.', 404);

    await tx.harvestBatchPhoto.delete({ where: { id: photoId } });

    if (!photo.isCover) return;

    const nextCover = await tx.harvestBatchPhoto.findFirst({
      where: { batchId },
      orderBy: { position: 'asc' },
    });

    await tx.harvestBatch.update({ where: { id: batchId }, data: { photoUrl: nextCover?.url ?? null } });
    if (nextCover) {
      await tx.harvestBatchPhoto.update({ where: { id: nextCover.id }, data: { isCover: true } });
    }
  });
}
