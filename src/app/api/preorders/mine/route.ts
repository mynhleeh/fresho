import { getCurrentUser } from '@/lib/session';
import { listPreOrdersForBuyer } from '@/lib/order-services/orderViewService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Chỉ người mua mới xem được danh sách này.', 403);

    return Response.json(await listPreOrdersForBuyer(user.id));
  } catch (err) {
    return errorResponse(err);
  }
}
