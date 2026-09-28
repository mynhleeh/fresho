import { getCurrentUser } from '@/lib/session';
import { raiseDispute } from '@/lib/services/disputeService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';
import { PUBLIC_USER_SELECT } from '@/lib/publicUserSelect';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);

    const { preOrderId, reason } = await request.json();
    if (typeof preOrderId !== 'string' || preOrderId.trim() === '') {
      throw new ApiError('invalid_input', 'Cần chọn đơn hàng cần báo vấn đề.', 400);
    }
    if (typeof reason !== 'string' || reason.trim() === '') {
      throw new ApiError('invalid_input', 'Cần nhập lý do báo vấn đề.', 400);
    }

    const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId }, include: { batch: true } });
    if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);
    const isParty = preOrder.buyerId === user.id || preOrder.batch.farmerId === user.id;
    if (!isParty) throw new ApiError('forbidden', 'Bạn không phải một bên của đơn hàng này.', 403);

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
    if (!user || user.role !== 'admin') throw new ApiError('forbidden', 'Chỉ quản trị viên mới thực hiện được thao tác này.', 403);

    const disputes = await prisma.disputeLog.findMany({
      include: { preOrder: { include: { batch: true, buyer: { select: PUBLIC_USER_SELECT } } }, raisedBy: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(disputes);
  } catch (err) {
    return errorResponse(err);
  }
}
