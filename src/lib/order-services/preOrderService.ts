import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { assertTransitionAllowed, nextStatusFor, type PreOrderEvent } from '@/lib/order/orderTransitions';

type TransitionClient = Pick<typeof prisma, 'preOrder' | 'harvestBatch' | 'ledgerEntry' | 'orderAgreement'>;

type CreatePreOrderInput = {
  batchId: string;
  quantity: number;
  deliveryMethod?: 'self_pickup' | 'carrier';
  shippingFeeQuote?: number;
};

function assertValidPreOrderInput(input: CreatePreOrderInput) {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new ApiError('invalid_input', 'Số lượng đặt phải là số nguyên lớn hơn 0.', 400);
  }
  if (input.deliveryMethod !== 'carrier') return;
  if (!Number.isInteger(input.shippingFeeQuote) || (input.shippingFeeQuote as number) < 0) {
    throw new ApiError('invalid_input', 'Cước vận chuyển dự kiến phải là số nguyên không âm khi đặt giao hàng.', 400);
  }
}

async function assertShippingQuoteIsStored(buyerId: string, input: CreatePreOrderInput) {
  if (input.deliveryMethod !== 'carrier') return;
  const stored = await prisma.shippingQuote.count({
    where: { batchId: input.batchId, buyerId, quantity: input.quantity, estimatedFee: input.shippingFeeQuote },
  });
  if (stored === 0) {
    throw new ApiError('invalid_shipping_quote', 'Cước vận chuyển ước tính không khớp với báo giá đã lấy. Hãy lấy báo giá vận chuyển mới rồi gửi lại đơn.', 400);
  }
}

export async function createPreOrder(buyerId: string, input: CreatePreOrderInput) {
  assertValidPreOrderInput(input);
  const batch = await prisma.harvestBatch.findUnique({ where: { id: input.batchId } });
  if (!batch) throw new ApiError('batch_not_found', 'Không tìm thấy lô hàng.', 404);
  if (batch.status !== 'open') throw new ApiError('batch_closed', 'Lô hàng này không còn mở đặt trước.', 400);
  await assertShippingQuoteIsStored(buyerId, input);
  if (input.quantity < batch.minOrderQuantity) {
    throw new ApiError('below_min_order_quantity', `Số lượng đặt tối thiểu là ${batch.minOrderQuantity}.`, 400);
  }

  return prisma.$transaction(async (tx) => {
    const reserved = await tx.harvestBatch.updateMany({
      where: { id: batch.id, status: 'open', quantityAvailable: { gte: input.quantity } },
      data: { quantityAvailable: { decrement: input.quantity } },
    });
    if (reserved.count === 0) {
      throw new ApiError('insufficient_quantity', 'Lô hàng không còn đủ số lượng để đặt.', 400);
    }
    return tx.preOrder.create({
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
  });
}

async function applyTransition(
  tx: TransitionClient,
  preOrderId: string,
  event: PreOrderEvent,
  actor: { id: string; role: string },
) {
  const preOrder = await tx.preOrder.findUnique({ where: { id: preOrderId }, include: { deposits: true, batch: true } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);

  assertTransitionAllowed(preOrder.status, event, actor.role);

  if (event === 'deposit_paid' && (!preOrder.farmerConfirmedAt || preOrder.deposits.length === 0)) {
    throw new ApiError('invalid_transition', 'Cần nông dân xác nhận và có tiền đặt cọc trước khi chuyển sang đã đặt cọc.', 400);
  }

  if (event === 'negotiate' && preOrder.farmerConfirmedAt) {
    throw new ApiError('invalid_transition', 'Nông dân đã xác nhận đơn nên không thể chuyển sang trao đổi.', 400);
  }

  const moved = await tx.preOrder.updateMany({
    where: { id: preOrderId, status: preOrder.status },
    data: { status: nextStatusFor(event) },
  });
  if (moved.count === 0) {
    throw new ApiError('invalid_transition', 'Đơn vừa được cập nhật ở nơi khác, hãy tải lại rồi thử lại.', 409);
  }
  await settleTransitionSideEffects(tx, preOrder, event);

  return tx.preOrder.findUniqueOrThrow({ where: { id: preOrderId } });
}

type OrderWithDeposits = { id: string; batchId: string; quantity: number; deposits: { amount: number }[] };

async function settleTransitionSideEffects(tx: TransitionClient, preOrder: OrderWithDeposits, event: PreOrderEvent) {
  await tx.orderAgreement.updateMany({
    where: { preOrderId: preOrder.id, status: 'proposed' },
    data: { status: 'expired', respondedAt: new Date() },
  });
  if (event !== 'reject' && event !== 'cancel' && event !== 'cancel_agreed') return;
  await tx.harvestBatch.update({
    where: { id: preOrder.batchId },
    data: { quantityAvailable: { increment: preOrder.quantity } },
  });
  const heldDeposit = preOrder.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  if (event !== 'cancel_agreed' && heldDeposit > 0) {
    await tx.ledgerEntry.create({
      data: { preOrderId: preOrder.id, type: 'deposit_refund', amount: heldDeposit, note: 'Deposit held before farmer confirmation returned on reject or cancel' },
    });
  }
}

const CONFIRMABLE_STATUSES = ['pending_confirmation', 'negotiating'];

export async function confirmPreOrder(preOrderId: string, actor: { id: string; role: string }) {
  return prisma.$transaction(async (tx) => {
    const preOrder = await tx.preOrder.findUnique({ where: { id: preOrderId }, include: { batch: true, deposits: true } });
    if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);
    if (actor.role !== 'farmer' || preOrder.batch.farmerId !== actor.id) {
      throw new ApiError('forbidden', 'Chỉ nông dân chủ lô hàng mới xác nhận được đơn này.', 403);
    }
    if (!CONFIRMABLE_STATUSES.includes(preOrder.status) || preOrder.farmerConfirmedAt) {
      throw new ApiError('invalid_transition', 'Đơn này không còn ở bước chờ xác nhận.', 400);
    }
    if (preOrder.batch.status !== 'open') {
      throw new ApiError('invalid_transition', 'Lô hàng đã chuyển sang bước thu hoạch, không thể xác nhận thêm đơn mới. Hãy từ chối đơn này.', 400);
    }
    const marked = await tx.preOrder.updateMany({
      where: { id: preOrderId, status: preOrder.status, farmerConfirmedAt: null },
      data: { farmerConfirmedAt: new Date() },
    });
    if (marked.count === 0) {
      throw new ApiError('invalid_transition', 'Đơn vừa được cập nhật ở nơi khác, hãy tải lại rồi thử lại.', 409);
    }
    if (preOrder.deposits.length > 0) {
      await applyTransition(tx, preOrderId, 'deposit_paid', { id: preOrder.buyerId, role: 'buyer' });
    }
    return tx.preOrder.findUniqueOrThrow({ where: { id: preOrderId } });
  });
}

export async function transitionPreOrderStatus(
  preOrderId: string,
  event: PreOrderEvent,
  actor: { id: string; role: string },
  tx?: TransitionClient,
) {
  if (tx) return applyTransition(tx, preOrderId, event, actor);
  return prisma.$transaction((inner) => applyTransition(inner, preOrderId, event, actor));
}
