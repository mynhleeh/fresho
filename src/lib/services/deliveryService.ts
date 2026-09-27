import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { transitionPreOrderStatus } from '@/lib/services/preOrderService';

export async function markBatchAwaitingHarvest(batchId: string, farmerId: string) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.farmerId !== farmerId) throw new ApiError('forbidden', 'Not your batch', 403);

  const preOrders = await prisma.preOrder.findMany({ where: { batchId, status: 'deposited' } });
  for (const po of preOrders) {
    await transitionPreOrderStatus(po.id, 'mark_awaiting_harvest', { id: farmerId, role: 'farmer' });
  }
}

export async function markBatchReadyForHandover(batchId: string, farmerId: string) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.farmerId !== farmerId) throw new ApiError('forbidden', 'Not your batch', 403);

  const preOrders = await prisma.preOrder.findMany({ where: { batchId, status: 'awaiting_harvest' } });
  for (const po of preOrders) {
    await transitionPreOrderStatus(po.id, 'mark_ready_for_handover', { id: farmerId, role: 'farmer' });
    await prisma.deliveryRecord.upsert({
      where: { preOrderId: po.id },
      create: { preOrderId: po.id, method: 'self_pickup', status: 'ready_for_handover' },
      update: {},
    });
  }
}

export async function updateDeliveryStatus(
  preOrderId: string,
  actor: { id: string; role: string },
  status: 'in_transit' | 'delivered',
  trackingNote?: string,
) {
  const record = await prisma.deliveryRecord.findUnique({
    where: { preOrderId },
    include: { preOrder: { include: { batch: true } } },
  });
  if (!record) throw new ApiError('delivery_not_found', 'Delivery record not found', 404);

  if (actor.role === 'logistics') {
    if (record.logisticsPartnerId !== actor.id) {
      throw new ApiError('forbidden', 'Not your assigned delivery', 403);
    }
  } else if (actor.role === 'farmer') {
    if (status !== 'delivered') {
      throw new ApiError('forbidden', 'Farmers can only mark self-pickup as delivered', 403);
    }
    if (record.preOrder.batch.farmerId !== actor.id) {
      throw new ApiError('forbidden', 'Not your batch', 403);
    }
  } else {
    throw new ApiError('forbidden', 'Only logistics or farmer can update delivery', 403);
  }

  const event = status === 'in_transit' ? 'mark_in_transit' : 'mark_delivered';
  await transitionPreOrderStatus(preOrderId, event, actor);

  return prisma.deliveryRecord.update({
    where: { preOrderId },
    data: { status, trackingNote, method: status === 'in_transit' ? 'carrier' : record.method },
  });
}
