import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Farmers only', 403);

    const preOrders = await prisma.preOrder.findMany({
      where: { batch: { farmerId: user.id } },
      include: { batch: true, buyer: true, deposits: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(preOrders);
  } catch (err) {
    return errorResponse(err);
  }
}
