import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

export async function raiseDispute(preOrderId: string, raisedById: string, reason: string) {
  const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Pre-order not found', 404);

  return prisma.disputeLog.create({ data: { preOrderId, raisedById, reason } });
}

export async function resolveDispute(disputeId: string, resolutionNote: string) {
  const dispute = await prisma.disputeLog.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new ApiError('dispute_not_found', 'Dispute not found', 404);
  if (dispute.status === 'resolved') throw new ApiError('invalid_state', 'Dispute already resolved', 400);

  return prisma.disputeLog.update({ where: { id: disputeId }, data: { status: 'resolved', resolutionNote } });
}
