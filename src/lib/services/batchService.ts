import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

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
    throw new ApiError('invalid_input', 'minOrderQuantity cannot exceed quantityTotal', 400);
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
  maxPricePerUnit?: number;
  location?: string;
  harvestDateFrom?: Date;
  harvestDateTo?: Date;
  sortBy?: 'newest' | 'trustScore' | 'harvestDate';
}) {
  return prisma.harvestBatch.findMany({
    where: {
      status: 'open',
      ...(filter?.cropName ? { cropName: { contains: filter.cropName } } : {}),
      ...(filter?.maxPricePerUnit !== undefined ? { pricePerUnit: { lte: filter.maxPricePerUnit } } : {}),
      ...(filter?.location ? { location: { contains: filter.location } } : {}),
      ...(filter?.harvestDateFrom || filter?.harvestDateTo
        ? {
            harvestDateEstimate: {
              ...(filter.harvestDateFrom ? { gte: filter.harvestDateFrom } : {}),
              ...(filter.harvestDateTo ? { lte: filter.harvestDateTo } : {}),
            },
          }
        : {}),
    },
    include: { farmer: { select: { trustScore: true } } },
    orderBy:
      filter?.sortBy === 'harvestDate'
        ? { harvestDateEstimate: 'asc' }
        : filter?.sortBy === 'trustScore'
          ? { farmer: { trustScore: 'desc' } }
          : { createdAt: 'desc' },
  });
}

export async function updateBatch(
  batchId: string,
  farmerId: string,
  input: Partial<{ cropName: string; pricePerUnit: number; photoUrl: string }>,
) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new ApiError('batch_not_found', 'Batch not found', 404);
  if (batch.farmerId !== farmerId) throw new ApiError('forbidden', 'Not your batch', 403);

  return prisma.harvestBatch.update({ where: { id: batchId }, data: input });
}
