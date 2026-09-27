import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'logistics') throw new ApiError('forbidden', 'Logistics only', 403);

    const deliveries = await prisma.deliveryRecord.findMany({
      where: { logisticsPartnerId: user.id },
      include: { preOrder: { include: { batch: true, buyer: true } } },
    });
    return Response.json(deliveries);
  } catch (err) {
    return errorResponse(err);
  }
}
