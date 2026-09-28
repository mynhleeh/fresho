import { getCurrentUser } from '@/lib/session';
import { transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);

    const preOrder = await prisma.preOrder.findUnique({ where: { id }, include: { batch: true } });
    if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);
    const isOwner = preOrder.buyerId === user.id || preOrder.batch.farmerId === user.id;
    if (!isOwner) throw new ApiError('forbidden', 'Đây không phải đơn đặt trước của bạn.', 403);

    const updated = await transitionPreOrderStatus(id, 'cancel', user);
    console.log(`pre_order cancelled preOrderId=${id}`);
    return Response.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
