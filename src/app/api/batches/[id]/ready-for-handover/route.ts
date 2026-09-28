import { getCurrentUser } from '@/lib/session';
import { markBatchReadyForHandover } from '@/lib/order-services/deliveryService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') {
      throw new ApiError('forbidden', 'Chỉ nông dân mới có thể đánh dấu lô sẵn sàng bàn giao.', 403);
    }

    const { id } = await params;
    await markBatchReadyForHandover(id, user.id);
    console.log(`harvest_batch ready_for_handover harvestBatchId=${id}`);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
