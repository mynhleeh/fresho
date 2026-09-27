import { prisma } from '@/lib/db';

export async function saveBatch(buyerId: string, batchId: string) {
  return prisma.savedBatch.upsert({
    where: { batchId_buyerId: { batchId, buyerId } },
    update: {},
    create: { batchId, buyerId },
  });
}

export async function unsaveBatch(buyerId: string, batchId: string) {
  await prisma.savedBatch.deleteMany({ where: { batchId, buyerId } });
}

export async function listSavedBatches(buyerId: string) {
  const saved = await prisma.savedBatch.findMany({
    where: { buyerId },
    include: { batch: true },
    orderBy: { createdAt: 'desc' },
  });
  return saved.map((entry) => entry.batch);
}
