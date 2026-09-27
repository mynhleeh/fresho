import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

export type PreOrderEvent =
  | 'negotiate' | 'confirm' | 'reject' | 'mark_awaiting_harvest' | 'mark_ready_for_handover'
  | 'mark_in_transit' | 'mark_delivered' | 'confirm_receipt' | 'cancel';

const TRANSITIONS: Record<string, PreOrderEvent[]> = {
  pending_confirmation: ['negotiate', 'confirm', 'reject', 'cancel'],
  negotiating: ['confirm', 'reject', 'cancel'],
  deposited: ['mark_awaiting_harvest', 'cancel'],
  awaiting_harvest: ['mark_ready_for_handover'],
  ready_for_handover: ['mark_in_transit', 'mark_delivered'],
  in_transit: ['mark_delivered'],
  delivered: ['confirm_receipt'],
};

const NEXT_STATUS: Record<PreOrderEvent, string> = {
  negotiate: 'negotiating',
  confirm: 'deposited',
  reject: 'rejected',
  cancel: 'cancelled',
  mark_awaiting_harvest: 'awaiting_harvest',
  mark_ready_for_handover: 'ready_for_handover',
  mark_in_transit: 'in_transit',
  mark_delivered: 'delivered',
  confirm_receipt: 'settled',
};

export async function createPreOrder(
  buyerId: string,
  input: { batchId: string; quantity: number; deliveryMethod?: 'self_pickup' | 'carrier'; shippingFeeQuote?: number },
) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: input.batchId } });
  if (!batch) throw new ApiError('batch_not_found', 'Batch not found', 404);
  if (batch.status !== 'open') throw new ApiError('batch_closed', 'Batch is not open', 400);
  if (input.quantity > batch.quantityAvailable) throw new ApiError('insufficient_quantity', 'Not enough quantity available', 400);
  if (input.quantity < batch.minOrderQuantity) {
    throw new ApiError('below_min_order_quantity', `Quantity must be at least ${batch.minOrderQuantity}`, 400);
  }

  return prisma.$transaction(async (tx) => {
    const preOrder = await tx.preOrder.create({
      data: {
        batchId: batch.id,
        buyerId,
        quantity: input.quantity,
        pricePerUnit: batch.pricePerUnit,
        deliveryMethod: input.deliveryMethod ?? 'self_pickup',
        shippingFeeQuote: input.deliveryMethod === 'carrier' ? input.shippingFeeQuote : null,
        status: 'pending_confirmation',
      },
    });
    await tx.harvestBatch.update({
      where: { id: batch.id },
      data: { quantityAvailable: batch.quantityAvailable - input.quantity },
    });
    return preOrder;
  });
}

export async function transitionPreOrderStatus(
  preOrderId: string,
  event: PreOrderEvent,
  _actor: { id: string; role: string },
) {
  const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId }, include: { deposits: true } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Pre-order not found', 404);

  const allowed = TRANSITIONS[preOrder.status] ?? [];
  if (!allowed.includes(event)) {
    throw new ApiError('invalid_transition', `invalid_transition: cannot apply '${event}' from status '${preOrder.status}'`, 400);
  }

  if (event === 'confirm' && preOrder.deposits.length === 0) {
    throw new ApiError('invalid_transition', 'invalid_transition: cannot confirm before a deposit is recorded', 400);
  }

  if (event === 'reject' || event === 'cancel') {
    const [, updated] = await prisma.$transaction([
      prisma.harvestBatch.update({
        where: { id: preOrder.batchId },
        data: { quantityAvailable: { increment: preOrder.quantity } },
      }),
      prisma.preOrder.update({
        where: { id: preOrderId },
        data: { status: NEXT_STATUS[event] as never },
      }),
    ]);
    return updated;
  }

  return prisma.preOrder.update({
    where: { id: preOrderId },
    data: { status: NEXT_STATUS[event] as never },
  });
}
