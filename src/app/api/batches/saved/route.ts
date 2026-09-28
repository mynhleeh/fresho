import { getCurrentUser } from '@/lib/session';
import { listSavedBatches } from '@/lib/batch-services/savedBatchService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Chỉ người mua mới xem được lô hàng đã lưu.', 403);

    const batches = await listSavedBatches(user.id);
    return Response.json(batches);
  } catch (err) {
    return errorResponse(err);
  }
}
