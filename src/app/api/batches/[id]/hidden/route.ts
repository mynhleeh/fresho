import { getCurrentUser } from '@/lib/session';
import { toggleBatchHidden } from '@/lib/services/batchService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Farmers only', 403);

    const batch = await toggleBatchHidden(id, user.id);
    return Response.json(batch);
  } catch (err) {
    return errorResponse(err);
  }
}
