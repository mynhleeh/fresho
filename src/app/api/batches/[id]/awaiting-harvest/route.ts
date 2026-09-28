import { getCurrentUser } from '@/lib/session';
import { markBatchAwaitingHarvest } from '@/lib/order-services/deliveryService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') {
      throw new ApiError('forbidden', 'Chỉ nông dân mới có thể chuyển lô sang chờ thu hoạch.', 403);
    }

    const { id } = await params;
    await markBatchAwaitingHarvest(id, user.id);
    console.log(`harvest_batch awaiting_harvest harvestBatchId=${id}`);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
