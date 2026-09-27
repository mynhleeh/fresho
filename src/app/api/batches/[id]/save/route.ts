import { getCurrentUser } from '@/lib/session';
import { saveBatch, unsaveBatch } from '@/lib/services/savedBatchService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Only buyers can save batches', 403);

    const { id } = await params;
    const saved = await saveBatch(user.id, id);
    return Response.json(saved, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Only buyers can unsave batches', 403);

    const { id } = await params;
    await unsaveBatch(user.id, id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
