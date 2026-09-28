import { getCurrentUser } from '@/lib/session';
import { listPreOrdersForFarmer } from '@/lib/order-services/orderViewService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới xem được danh sách này.', 403);

    return Response.json(await listPreOrdersForFarmer(user.id));
  } catch (err) {
    return errorResponse(err);
  }
}
