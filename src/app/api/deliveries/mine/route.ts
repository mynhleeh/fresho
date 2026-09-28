import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ApiError, errorResponse } from '@/lib/errors';
import { PUBLIC_USER_SELECT } from '@/lib/publicUserSelect';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'logistics') throw new ApiError('forbidden', 'Chỉ đơn vị vận chuyển mới xem được danh sách này.', 403);

    const deliveries = await prisma.deliveryRecord.findMany({
      where: { logisticsPartnerId: user.id },
      include: { preOrder: { include: { batch: true, buyer: { select: PUBLIC_USER_SELECT } } } },
    });
    return Response.json(deliveries);
  } catch (err) {
    return errorResponse(err);
  }
}
