import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Buyers only', 403);

    const preOrders = await prisma.preOrder.findMany({
      where: { buyerId: user.id },
      include: { batch: true, deposits: true, settlement: true, ratings: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(preOrders);
  } catch (err) {
    return errorResponse(err);
  }
}
