import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ApiError, errorResponse } from '@/lib/errors';
import { PUBLIC_USER_SELECT } from '@/lib/publicUserSelect';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') throw new ApiError('forbidden', 'Chỉ quản trị viên mới thực hiện được thao tác này.', 403);

    const preOrders = await prisma.preOrder.findMany({
      include: { batch: true, buyer: { select: PUBLIC_USER_SELECT }, deposits: true, settlement: true, disputes: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(preOrders);
  } catch (err) {
    return errorResponse(err);
  }
}
