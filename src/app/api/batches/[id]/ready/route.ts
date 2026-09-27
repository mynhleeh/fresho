import { getCurrentUser } from '@/lib/session';
import { markBatchAwaitingHarvest, markBatchReadyForHandover } from '@/lib/services/deliveryService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Farmers only', 403);

    const { stage } = await request.json();
    if (stage === 'awaiting_harvest') {
      await markBatchAwaitingHarvest(id, user.id);
    } else if (stage === 'ready_for_handover') {
      await markBatchReadyForHandover(id, user.id);
    } else {
      throw new ApiError('invalid_stage', 'stage must be awaiting_harvest or ready_for_handover', 400);
    }
    console.log(`batch stage updated batchId=${id} stage=${stage}`);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
