import type { Prisma } from '@prisma/client';
import { ApiError } from '@/lib/errors';
import { calculateGoodsAmount } from '@/lib/order/orderPricing';
import { transitionPreOrderStatus } from '@/lib/order-services/preOrderService';

import type { Actor } from '@/lib/order-services/actor';

export function estimateShippingFee(order: { deliveryMethod: string; shippingFeeQuote: number | null }): number {
  return order.deliveryMethod === 'carrier' ? order.shippingFeeQuote ?? 0 : 0;
}

export function assertValidFinalQuantity(finalQuantity: number, reservedQuantity: number) {
  if (!Number.isInteger(finalQuantity) || finalQuantity <= 0 || finalQuantity > reservedQuantity) {
    throw new ApiError('invalid_input', `Số lượng thực nhận phải là số nguyên từ 1 đến ${reservedQuantity}.`, 400);
  }
}

export async function settleWithinTransaction(
  tx: Prisma.TransactionClient,
  preOrderId: string,
  finalQuantity: number,
  actor: Actor,
) {
  const preOrder = await tx.preOrder.findUnique({ where: { id: preOrderId }, include: { deposits: true } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);
  if (preOrder.status !== 'delivered') {
    throw new ApiError('invalid_state', 'Chỉ có thể đối soát đơn đã giao.', 400);
  }
  assertValidFinalQuantity(finalQuantity, preOrder.quantity);

  const totalDeposited = preOrder.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  const finalGoodsAmount = calculateGoodsAmount(finalQuantity, preOrder.pricePerUnit);
  const shippingFee = estimateShippingFee(preOrder);
  const balance = finalGoodsAmount + shippingFee - totalDeposited;
  const finalPaymentAmount = Math.max(0, balance);

  const settlement = await tx.settlement.create({
    data: { preOrderId, finalQuantity, finalGoodsAmount, shippingFee, finalPaymentAmount },
  });
  if (finalPaymentAmount > 0) {
    await tx.ledgerEntry.create({ data: { preOrderId, type: 'final_payment', amount: finalPaymentAmount, note: 'Final payment on agreed receipt' } });
  }
  if (balance < 0) {
    await tx.ledgerEntry.create({ data: { preOrderId, type: 'deposit_refund', amount: -balance, note: 'Surplus deposit refunded at settlement' } });
  }
  await transitionPreOrderStatus(preOrderId, 'confirm_receipt', actor, tx);
  return settlement;
}
