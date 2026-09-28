import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

export const FARMER_SELECTABLE_BATCH_STATUSES = ['open', 'ready_for_handover', 'closed'];

// TODO(business-confirm): buyer-visible statuses assumed = all non-terminal (open, awaiting_harvest, ready_for_handover); closed excluded, unconfirmed.
export const BUYER_VISIBLE_BATCH_STATUSES = ['open', 'awaiting_harvest', 'ready_for_handover'];

export async function createBatch(
  farmerId: string,
  input: {
    cropName: string;
    quantityTotal: number;
    unit: string;
    pricePerUnit: number;
    harvestDateEstimate: Date;
    location: string;
    photoUrl?: string;
    qualityStandard?: string;
    minOrderQuantity?: number;
  },
) {
  if (input.minOrderQuantity !== undefined && input.minOrderQuantity > input.quantityTotal) {
    throw new ApiError('invalid_input', 'Số lượng đặt tối thiểu không được lớn hơn tổng sản lượng.', 400);
  }

  return prisma.harvestBatch.create({
    data: {
      farmerId,
      cropName: input.cropName,
      quantityTotal: input.quantityTotal,
      quantityAvailable: input.quantityTotal,
      unit: input.unit,
      pricePerUnit: input.pricePerUnit,
      harvestDateEstimate: input.harvestDateEstimate,
      location: input.location,
      photoUrl: input.photoUrl,
      qualityStandard: input.qualityStandard,
      minOrderQuantity: input.minOrderQuantity ?? 1,
    },
  });
}

export async function listOpenBatches(filter?: {
  cropName?: string;
  minPricePerUnit?: number;
  maxPricePerUnit?: number;
  minQuantityAvailable?: number;
  location?: string;
  harvestDateFrom?: Date;
  harvestDateTo?: Date;
  sortBy?: 'newest' | 'trustScore' | 'harvestDate';
  limit?: number;
  offset?: number;
}) {
  const where = {
      status: { in: BUYER_VISIBLE_BATCH_STATUSES },
      isHidden: false,
      ...(filter?.cropName ? { cropName: { contains: filter.cropName } } : {}),
      ...(filter?.minPricePerUnit !== undefined || filter?.maxPricePerUnit !== undefined
        ? {
            pricePerUnit: {
              ...(filter.minPricePerUnit !== undefined ? { gte: filter.minPricePerUnit } : {}),
              ...(filter.maxPricePerUnit !== undefined ? { lte: filter.maxPricePerUnit } : {}),
            },
          }
        : {}),
      ...(filter?.minQuantityAvailable !== undefined
        ? { quantityAvailable: { gte: filter.minQuantityAvailable } }
        : {}),
      ...(filter?.location ? { location: { contains: filter.location } } : {}),
      ...(filter?.harvestDateFrom || filter?.harvestDateTo
        ? {
            harvestDateEstimate: {
              ...(filter.harvestDateFrom ? { gte: filter.harvestDateFrom } : {}),
              ...(filter.harvestDateTo ? { lte: filter.harvestDateTo } : {}),
            },
          }
        : {}),
  };
  const orderBy =
    filter?.sortBy === 'harvestDate'
      ? { harvestDateEstimate: 'asc' as const }
      : filter?.sortBy === 'trustScore'
        ? { farmer: { trustScore: 'desc' as const } }
        : { createdAt: 'desc' as const };

  const [items, total] = await Promise.all([
    prisma.harvestBatch.findMany({
      where,
      include: { farmer: { select: { name: true, avatarUrl: true, trustScore: true } } },
      orderBy,
      ...(filter?.offset !== undefined ? { skip: filter.offset } : {}),
      ...(filter?.limit !== undefined ? { take: filter.limit } : {}),
    }),
    prisma.harvestBatch.count({ where }),
  ]);

  return { items, total };
}

export async function getBatch(batchId: string) {
  return prisma.harvestBatch.findUnique({
    where: { id: batchId },
    include: { farmer: { select: { name: true, avatarUrl: true, trustScore: true } } },
  });
}

export async function listBatchesByFarmer(farmerId: string) {
  return prisma.harvestBatch.findMany({
    where: { farmerId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateBatch(
  batchId: string,
  farmerId: string,
  input: Partial<{
    cropName: string;
    pricePerUnit: number;
    photoUrl: string;
    location: string;
    qualityStandard: string;
    minOrderQuantity: number;
    description: string;
    status: string;
  }>,
) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new ApiError('batch_not_found', 'Không tìm thấy lô hàng.', 404);
  if (batch.farmerId !== farmerId) throw new ApiError('forbidden', 'Đây không phải lô hàng của bạn.', 403);
  if (input.minOrderQuantity !== undefined && input.minOrderQuantity > batch.quantityTotal) {
    throw new ApiError('invalid_input', 'Số lượng đặt tối thiểu không được lớn hơn tổng sản lượng.', 400);
  }

  return prisma.harvestBatch.update({ where: { id: batchId }, data: input });
}

export async function toggleBatchHidden(batchId: string, farmerId: string) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new ApiError('batch_not_found', 'Không tìm thấy lô hàng.', 404);
  if (batch.farmerId !== farmerId) throw new ApiError('forbidden', 'Đây không phải lô hàng của bạn.', 403);

  return prisma.harvestBatch.update({ where: { id: batchId }, data: { isHidden: !batch.isHidden } });
}

export async function assertBatchOwnership(batchId: string, farmerId: string) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new ApiError('batch_not_found', 'Không tìm thấy lô hàng.', 404);
  if (batch.farmerId !== farmerId) throw new ApiError('forbidden', 'Đây không phải lô hàng của bạn.', 403);
  return batch;
}

export async function setBatchPhoto(batchId: string, farmerId: string, photoUrl: string) {
  await assertBatchOwnership(batchId, farmerId);

  return prisma.harvestBatch.update({
    where: { id: batchId },
    data: { photoUrl },
  });
}
