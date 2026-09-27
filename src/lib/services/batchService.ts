import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

export async function createBatch(
  farmerId: string,
  input: { cropName: string; quantityTotal: number; unit: string; pricePerUnit: number; harvestDateEstimate: Date; photoUrl?: string },
) {
  return prisma.harvestBatch.create({
    data: {
      farmerId,
      cropName: input.cropName,
      quantityTotal: input.quantityTotal,
      quantityAvailable: input.quantityTotal,
      unit: input.unit,
      pricePerUnit: input.pricePerUnit,
      harvestDateEstimate: input.harvestDateEstimate,
      photoUrl: input.photoUrl,
    },
  });
}

export async function listOpenBatches(filter?: { cropName?: string; maxPricePerUnit?: number }) {
  return prisma.harvestBatch.findMany({
    where: {
      status: 'open',
      ...(filter?.cropName ? { cropName: filter.cropName } : {}),
      ...(filter?.maxPricePerUnit !== undefined ? { pricePerUnit: { lte: filter.maxPricePerUnit } } : {}),
    },
    orderBy: { createdAt: 'desc' },
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
