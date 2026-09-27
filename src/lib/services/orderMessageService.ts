import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

async function assertCanAccessThread(preOrderId: string, requester: { id: string; role: string }) {
  const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId }, include: { batch: true } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Pre-order not found', 404);

  const isBuyer = preOrder.buyerId === requester.id;
  const isFarmer = preOrder.batch.farmerId === requester.id;
  const isAdmin = requester.role === 'admin';
  if (!isBuyer && !isFarmer && !isAdmin) {
    throw new ApiError('forbidden', 'Not a participant on this order', 403);
  }

  return preOrder;
}

export async function postMessage(preOrderId: string, requester: { id: string; role: string }, body: string) {
  await assertCanAccessThread(preOrderId, requester);
  if (!body.trim()) throw new ApiError('invalid_input', 'Message body cannot be empty', 400);

  return prisma.orderMessage.create({
    data: { preOrderId, senderId: requester.id, body: body.trim() },
  });
}

export async function listMessages(preOrderId: string, requester: { id: string; role: string }) {
  await assertCanAccessThread(preOrderId, requester);

  return prisma.orderMessage.findMany({
    where: { preOrderId },
    orderBy: { createdAt: 'asc' },
  });
}
