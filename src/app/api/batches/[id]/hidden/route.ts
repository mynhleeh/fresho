import { getCurrentUser } from '@/lib/session';
import { toggleBatchHidden } from '@/lib/batch-services/batchService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới thực hiện được thao tác này.', 403);

    const batch = await toggleBatchHidden(id, user.id);
    return Response.json(batch);
  } catch (err) {
    return errorResponse(err);
  }
}
