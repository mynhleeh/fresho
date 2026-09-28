import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { calculateGoodsAmount } from '@/lib/order/orderPricing';
import { calculateDepositAmount, DEPOSIT_PERCENT } from '@/lib/order/depositAmount';
import { transitionPreOrderStatus } from '@/lib/order-services/preOrderService';

export async function payDeposit(preOrderId: string, amount: number) {
  const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId }, include: { batch: true } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);
  if (!['pending_confirmation', 'negotiating'].includes(preOrder.status)) {
    throw new ApiError('invalid_state', 'Chỉ có thể đặt cọc khi đơn đang chờ xác nhận hoặc đang trao đổi.', 400);
  }
  if (!preOrder.farmerConfirmedAt) {
    throw new ApiError('farmer_not_confirmed', 'Nông dân chưa xác nhận đơn nên chưa thể đặt cọc.', 400);
  }
  if (preOrder.batch.status !== 'open') {
    throw new ApiError('invalid_state', 'Lô hàng đã chuyển sang bước thu hoạch nên không nhận thêm tiền đặt cọc.', 400);
  }
  const expected = calculateDepositAmount(calculateGoodsAmount(preOrder.quantity, preOrder.pricePerUnit));
  if (!Number.isInteger(amount) || amount !== expected) {
    throw new ApiError('invalid_deposit_amount', `Tiền đặt cọc phải bằng ${DEPOSIT_PERCENT}% tiền hàng (${expected} đồng).`, 400);
  }

  return prisma.$transaction(async (tx) => {
    const openBatch = await tx.harvestBatch.count({ where: { id: preOrder.batchId, status: 'open' } });
    if (openBatch === 0) {
      throw new ApiError('invalid_state', 'Lô hàng đã chuyển sang bước thu hoạch nên không nhận thêm tiền đặt cọc.', 400);
    }
    if ((await tx.deposit.count({ where: { preOrderId } })) > 0) {
      throw new ApiError('deposit_already_paid', 'Đơn này đã được đặt cọc.', 400);
    }
    const deposit = await tx.deposit.create({ data: { preOrderId, amount } });
    await tx.ledgerEntry.create({
      data: { preOrderId, type: 'deposit', amount, note: 'Deposit paid' },
    });
    await transitionPreOrderStatus(preOrderId, 'deposit_paid', { id: preOrder.buyerId, role: 'buyer' }, tx);
    return deposit;
  });
}
