import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { transitionPreOrderStatus } from '@/lib/services/preOrderService';

export async function settlePreOrder(preOrderId: string, input: { finalQuantity: number; shippingFee: number }) {
  const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId }, include: { deposits: true } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Pre-order not found', 404);
  if (preOrder.status !== 'delivered') {
    throw new ApiError('invalid_state', 'Can only settle a delivered pre-order', 400);
  }

  const totalDeposited = preOrder.deposits.reduce((sum, d) => sum + d.amount, 0);
  const finalGoodsAmount = input.finalQuantity * preOrder.pricePerUnit;
  const finalPaymentAmount = finalGoodsAmount + input.shippingFee - totalDeposited;

  const settlement = await prisma.$transaction(async (tx) => {
    const created = await tx.settlement.create({
      data: {
        preOrderId,
        finalQuantity: input.finalQuantity,
        finalGoodsAmount,
        shippingFee: input.shippingFee,
        finalPaymentAmount,
      },
    });
    await tx.ledgerEntry.create({
      data: { preOrderId, type: 'final_payment', amount: finalPaymentAmount, note: 'Final payment on receipt' },
    });
    return created;
  });

  await transitionPreOrderStatus(preOrderId, 'confirm_receipt', { id: preOrder.buyerId, role: 'buyer' });

  return settlement;
}
