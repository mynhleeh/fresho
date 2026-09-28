import { getCurrentUser } from '@/lib/session';
import { transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới từ chối được đơn.', 403);

    const { id } = await params;

    const preOrder = await prisma.preOrder.findUnique({ where: { id }, include: { batch: true } });
    if (!preOrder || preOrder.batch.farmerId !== user.id) throw new ApiError('forbidden', 'Đây không phải lô hàng của bạn.', 403);

    const updated = await transitionPreOrderStatus(id, 'reject', user);
    console.log(`pre_order rejected preOrderId=${id}`);
    return Response.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
