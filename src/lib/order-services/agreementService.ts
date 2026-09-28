import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { assertValidFinalQuantity, settleWithinTransaction } from '@/lib/order-services/settlementService';
import { transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import type { Actor } from '@/lib/order-services/actor';

type Decision = 'accept' | 'decline';

async function loadOrderForParticipant(client: Prisma.TransactionClient | typeof prisma, preOrderId: string, actor: Actor) {
  const preOrder = await client.preOrder.findUnique({ where: { id: preOrderId }, include: { batch: true, deposits: true } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);
  const isBuyer = actor.role === 'buyer' && preOrder.buyerId === actor.id;
  const isFarmer = actor.role === 'farmer' && preOrder.batch.farmerId === actor.id;
  if (!isBuyer && !isFarmer) {
    throw new ApiError('forbidden', 'Bạn không phải một bên của đơn hàng này.', 403);
  }
  return { preOrder, isBuyer };
}

const REQUIRED_STATUS = { settlement: 'delivered', cancel: 'deposited' } as const;

async function createAgreement(
  preOrderId: string,
  kind: 'settlement' | 'cancel',
  proposerId: string,
  payload: { finalQuantity?: number; refundAmount?: number },
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.preOrder.count({ where: { id: preOrderId, status: REQUIRED_STATUS[kind] } });
    if (current === 0) throw new ApiError('invalid_state', 'Đơn vừa đổi trạng thái nên không thể gửi đề xuất này nữa.', 400);
    const open = await tx.orderAgreement.count({ where: { preOrderId, kind, status: 'proposed' } });
    if (open > 0) {
      throw new ApiError('agreement_pending', 'Đã có một đề xuất đang chờ bên kia phản hồi.', 400);
    }
    return tx.orderAgreement.create({ data: { preOrderId, kind, proposedById: proposerId, ...payload } });
  });
}

export async function proposeSettlement(preOrderId: string, actor: Actor, finalQuantity: number) {
  const { preOrder, isBuyer } = await loadOrderForParticipant(prisma, preOrderId, actor);
  if (!isBuyer) throw new ApiError('forbidden', 'Chỉ người mua mới đề xuất số lượng thực nhận.', 403);
  if (preOrder.status !== 'delivered') {
    throw new ApiError('invalid_state', 'Chỉ có thể đề xuất đối soát khi đơn đã giao.', 400);
  }
  assertValidFinalQuantity(finalQuantity, preOrder.quantity);
  return createAgreement(preOrderId, 'settlement', actor.id, { finalQuantity });
}

export async function proposeCancel(preOrderId: string, actor: Actor, refundAmount: number) {
  const { preOrder } = await loadOrderForParticipant(prisma, preOrderId, actor);
  if (preOrder.status !== 'deposited') {
    throw new ApiError('invalid_state', 'Chỉ có thể đề nghị hủy đơn khi đơn đang ở trạng thái đã đặt cọc.', 400);
  }
  const totalDeposited = preOrder.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  if (!Number.isInteger(refundAmount) || refundAmount < 0 || refundAmount > totalDeposited) {
    throw new ApiError('invalid_input', `Tiền hoàn cọc phải là số nguyên từ 0 đến ${totalDeposited} đồng.`, 400);
  }
  return createAgreement(preOrderId, 'cancel', actor.id, { refundAmount });
}

async function cancelWithinTransaction(tx: Prisma.TransactionClient, preOrderId: string, refundAmount: number, actor: Actor) {
  await transitionPreOrderStatus(preOrderId, 'cancel_agreed', actor, tx);
  if (refundAmount > 0) {
    await tx.ledgerEntry.create({ data: { preOrderId, type: 'deposit_refund', amount: refundAmount, note: 'Deposit refund agreed on cancellation' } });
  }
}

export async function respondToAgreement(agreementId: string, actor: Actor, decision: Decision) {
  const agreement = await prisma.orderAgreement.findUnique({ where: { id: agreementId } });
  if (!agreement) throw new ApiError('agreement_not_found', 'Không tìm thấy đề xuất này.', 404);
  if (agreement.status !== 'proposed') {
    throw new ApiError('invalid_state', 'Đề xuất này đã được phản hồi.', 400);
  }
  await loadOrderForParticipant(prisma, agreement.preOrderId, actor);
  if (agreement.proposedById === actor.id) {
    throw new ApiError('forbidden', 'Bên kia mới là người phản hồi đề xuất của bạn.', 403);
  }

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.orderAgreement.updateMany({
      where: { id: agreementId, status: 'proposed' },
      data: { status: decision === 'accept' ? 'accepted' : 'declined', respondedById: actor.id, respondedAt: new Date() },
    });
    if (claimed.count === 0) throw new ApiError('invalid_state', 'Đề xuất này đã được phản hồi.', 400);
    if (decision === 'accept' && agreement.kind === 'settlement') {
      await settleWithinTransaction(tx, agreement.preOrderId, agreement.finalQuantity ?? 0, actor);
    }
    if (decision === 'accept' && agreement.kind === 'cancel') {
      await cancelWithinTransaction(tx, agreement.preOrderId, agreement.refundAmount ?? 0, actor);
    }
    return tx.orderAgreement.findUniqueOrThrow({ where: { id: agreementId } });
  });
}
