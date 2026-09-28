import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

// TODO(business-confirm): unweighted average of quality/timeliness/commitment,
// scaled linearly from a 1-5 raw score to 0-100, is a placeholder until
// product/finance confirm the real weighting formula (charter §5).
export type RatingInput = { qualityScore: number; timelinessScore: number; commitmentScore: number };

function scaleToTrustScore(average: number): number {
  return Math.round(((average - 1) / 4) * 100);
}

export async function submitRating(preOrderId: string, raterId: string, rateeId: string, input: RatingInput) {
  const preOrder = await prisma.preOrder.findUnique({ where: { id: preOrderId } });
  if (!preOrder) throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);
  if (preOrder.status !== 'settled') {
    throw new ApiError('invalid_state', 'Chỉ đánh giá được đơn đã hoàn tất.', 400);
  }

  const existing = await prisma.rating.findUnique({ where: { preOrderId_raterId: { preOrderId, raterId } } });
  if (existing) throw new ApiError('already_rated', 'Bạn đã đánh giá đơn này rồi.', 400);

  const rating = await prisma.rating.create({
    data: { preOrderId, raterId, rateeId, ...input },
  });

  await recomputeTrustScore(rateeId);

  return rating;
}

export async function recomputeTrustScore(userId: string) {
  const ratings = await prisma.rating.findMany({ where: { rateeId: userId } });
  if (ratings.length === 0) return;

  const averages = ratings.map((r) => (r.qualityScore + r.timelinessScore + r.commitmentScore) / 3);
  const trustScore = scaleToTrustScore(averages.reduce((sum, a) => sum + a, 0) / averages.length);

  await prisma.user.update({ where: { id: userId }, data: { trustScore } });
}
