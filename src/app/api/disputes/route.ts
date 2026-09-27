import { getCurrentUser } from '@/lib/session';
import { raiseDispute } from '@/lib/services/disputeService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Login required', 403);

    const { preOrderId, reason } = await request.json();
    if (typeof preOrderId !== 'string' || preOrderId.trim() === '') {
      throw new ApiError('invalid_input', 'preOrderId is required', 400);
    }
    if (typeof reason !== 'string' || reason.trim() === '') {
      throw new ApiError('invalid_input', 'reason is required', 400);
    }

    const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId }, include: { batch: true } });
    if (!preOrder) throw new ApiError('pre_order_not_found', 'Pre-order not found', 404);
    const isParty = preOrder.buyerId === user.id || preOrder.batch.farmerId === user.id;
    if (!isParty) throw new ApiError('forbidden', 'Not a party to this pre_order', 403);

    const dispute = await raiseDispute(preOrderId, user.id, reason);
    console.log(`dispute raised preOrderId=${preOrderId}`);
    return Response.json(dispute, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') throw new ApiError('forbidden', 'Admins only', 403);

    const disputes = await prisma.disputeLog.findMany({
      include: { preOrder: { include: { batch: true, buyer: true } }, raisedBy: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(disputes);
  } catch (err) {
    return errorResponse(err);
  }
}
