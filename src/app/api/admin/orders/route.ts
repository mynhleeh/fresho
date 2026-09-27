import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') throw new ApiError('forbidden', 'Admins only', 403);

    const preOrders = await prisma.preOrder.findMany({
      include: { batch: true, buyer: true, deposits: true, settlement: true, disputes: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(preOrders);
  } catch (err) {
    return errorResponse(err);
  }
}
