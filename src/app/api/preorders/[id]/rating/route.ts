import { getCurrentUser } from '@/lib/session';
import { submitRating } from '@/lib/services/ratingService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

function isValidScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);

    const { id } = await params;
    const preOrder = await prisma.preOrder.findUnique({ where: { id }, include: { batch: true } });
    if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);

    const isBuyer = preOrder.buyerId === user.id;
    const isFarmer = preOrder.batch.farmerId === user.id;
    if (!isBuyer && !isFarmer) throw new ApiError('forbidden', 'Bạn không phải một bên của đơn hàng này.', 403);

    const { qualityScore, timelinessScore, commitmentScore } = await request.json();
    if (!isValidScore(qualityScore) || !isValidScore(timelinessScore) || !isValidScore(commitmentScore)) {
      throw new ApiError('invalid_input', 'Điểm đánh giá phải là số nguyên từ 1 đến 5.', 400);
    }

    const rateeId = isBuyer ? preOrder.batch.farmerId : preOrder.buyerId;
    const rating = await submitRating(id, user.id, rateeId, { qualityScore, timelinessScore, commitmentScore });
    console.log(`rating submitted preOrderId=${id}`);
    return Response.json(rating, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
