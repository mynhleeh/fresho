import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

export async function payDeposit(preOrderId: string, amount: number) {
  const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Pre-order not found', 404);
  if (preOrder.status !== 'pending_confirmation') {
    throw new ApiError('invalid_state', 'Deposit can only be recorded while pending confirmation', 400);
  }

  return prisma.$transaction(async (tx) => {
    const deposit = await tx.deposit.create({ data: { preOrderId, amount } });
    await tx.ledgerEntry.create({
      data: { preOrderId, type: 'deposit', amount, note: 'Deposit paid' },
    });
    return deposit;
  });
}
