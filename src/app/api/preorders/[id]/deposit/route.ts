import { getCurrentUser } from '@/lib/session';
import { payDeposit } from '@/lib/order-services/depositService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Chỉ người mua mới đặt cọc được.', 403);

    const { id } = await params;

    const preOrder = await prisma.preOrder.findUnique({ where: { id } });
    if (!preOrder || preOrder.buyerId !== user.id) throw new ApiError('forbidden', 'Đây không phải đơn đặt trước của bạn.', 403);

    const { amount } = await request.json();
    if (typeof amount !== 'number' || !(amount > 0)) {
      throw new ApiError('invalid_input', 'Số tiền đặt cọc phải là một số lớn hơn 0.', 400);
    }

    const deposit = await payDeposit(id, amount);
    console.log(`deposit paid preOrderId=${id} amount=${amount}`);
    return Response.json(deposit, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
