import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { transitionPreOrderStatus } from '@/lib/order-services/preOrderService';

async function assertBatchInStatus(batchId: string, farmerId: string, expectedStatus: string) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.farmerId !== farmerId) throw new ApiError('forbidden', 'Đây không phải lô hàng của bạn.', 403);
  if (batch.status !== expectedStatus) {
    throw new ApiError('invalid_state', 'Lô hàng chưa ở bước phù hợp để thực hiện thao tác này.', 400);
  }
}

async function moveBatchStatus(tx: Pick<typeof prisma, 'harvestBatch'>, batchId: string, from: string, to: string) {
  const moved = await tx.harvestBatch.updateMany({ where: { id: batchId, status: from }, data: { status: to } });
  if (moved.count === 0) {
    throw new ApiError('invalid_state', 'Lô hàng vừa được cập nhật ở nơi khác, hãy tải lại rồi thử lại.', 409);
  }
}

export async function markBatchAwaitingHarvest(batchId: string, farmerId: string) {
  await assertBatchInStatus(batchId, farmerId, 'open');

  await prisma.$transaction(async (tx) => {
    const preOrders = await tx.preOrder.findMany({ where: { batchId, status: 'deposited' } });
    for (const order of preOrders) {
      await transitionPreOrderStatus(order.id, 'mark_awaiting_harvest', { id: farmerId, role: 'farmer' }, tx);
    }
    await moveBatchStatus(tx, batchId, 'open', 'awaiting_harvest');
  });
}

export async function markBatchReadyForHandover(batchId: string, farmerId: string) {
  await assertBatchInStatus(batchId, farmerId, 'awaiting_harvest');

  await prisma.$transaction(async (tx) => {
    const preOrders = await tx.preOrder.findMany({ where: { batchId, status: 'awaiting_harvest' } });
    for (const order of preOrders) {
      await transitionPreOrderStatus(order.id, 'mark_ready_for_handover', { id: farmerId, role: 'farmer' }, tx);
      await tx.deliveryRecord.upsert({
        where: { preOrderId: order.id },
        create: { preOrderId: order.id, method: order.deliveryMethod, status: 'ready_for_handover' },
        update: {},
      });
    }
    await moveBatchStatus(tx, batchId, 'awaiting_harvest', 'ready_for_handover');
  });
}

type DeliveryRecordWithOrder = {
  logisticsPartnerId: string | null;
  preOrder: { buyerId: string; deliveryMethod: string; batch: { farmerId: string } };
};

function assertMayUpdateDelivery(actor: { id: string; role: string }, status: 'in_transit' | 'delivered', record: DeliveryRecordWithOrder) {
  const { preOrder } = record;
  const forbidden = (message: string) => new ApiError('forbidden', message, 403);
  if (actor.role === 'logistics') {
    if (record.logisticsPartnerId !== actor.id) throw forbidden('Đơn giao hàng này không được giao cho bạn.');
    return;
  }
  if (actor.role === 'farmer') {
    if (preOrder.batch.farmerId !== actor.id) throw forbidden('Đây không phải lô hàng của bạn.');
    const selfPickupHandover = status === 'delivered' && preOrder.deliveryMethod === 'self_pickup';
    const carrierHandover = status === 'in_transit' && preOrder.deliveryMethod === 'carrier';
    if (!selfPickupHandover && !carrierHandover) {
      throw forbidden('Nông dân chỉ xác nhận bàn giao tự lấy hoặc đã giao cho vận chuyển.');
    }
    return;
  }
  if (actor.role === 'buyer') {
    if (preOrder.buyerId !== actor.id || status !== 'delivered' || preOrder.deliveryMethod !== 'carrier') {
      throw forbidden('Bạn chỉ xác nhận đã nhận hàng cho đơn giao qua vận chuyển của chính mình.');
    }
    return;
  }
  throw forbidden('Vai trò của bạn không được cập nhật giao hàng.');
}

export async function updateDeliveryStatus(
  preOrderId: string,
  actor: { id: string; role: string },
  status: 'in_transit' | 'delivered',
  trackingNote?: string,
  handoverProof?: { actualQuantity?: number; proofPhotoUrl?: string },
) {
  const record = await prisma.deliveryRecord.findUnique({
    where: { preOrderId },
    include: { preOrder: { include: { batch: true } } },
  });
  if (!record) throw new ApiError('delivery_not_found', 'Delivery record not found', 404);

  assertMayUpdateDelivery(actor, status, record);

  const event = status === 'in_transit' ? 'mark_in_transit' : 'mark_delivered';
  return prisma.$transaction(async (tx) => {
    await transitionPreOrderStatus(preOrderId, event, actor, tx);
    return tx.deliveryRecord.update({
      where: { preOrderId },
      data: {
        status,
        trackingNote,
        method: record.method,
        ...(status === 'delivered' ? {
          actualQuantity: handoverProof?.actualQuantity,
          proofPhotoUrl: handoverProof?.proofPhotoUrl,
        } : {}),
      },
    });
  });
}
