import { getCurrentUser } from '@/lib/session';
import { deleteBatchPhoto, setCoverPhoto } from '@/lib/services/batchPhotoService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await params;
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can edit batch photos', 403);

    const body = await request.json();
    if (body.isCover !== true) {
      throw new ApiError('invalid_input', 'isCover must be true', 400);
    }

    await setCoverPhoto(id, user.id, photoId);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(`[harvest_batch:${id}] set cover photo failed`, err);
    return errorResponse(err);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await params;
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can delete batch photos', 403);

    await deleteBatchPhoto(id, user.id, photoId);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(`[harvest_batch:${id}] delete photo failed`, err);
    return errorResponse(err);
  }
}
