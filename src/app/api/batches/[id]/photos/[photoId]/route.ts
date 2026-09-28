import { getCurrentUser } from '@/lib/session';
import { deleteBatchPhoto, setCoverPhoto } from '@/lib/batch-services/batchPhotoService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await params;
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới sửa được ảnh lô hàng.', 403);

    const body = await request.json();
    if (body.isCover !== true) {
      throw new ApiError('invalid_input', 'Chỉ đặt được ảnh làm ảnh bìa, không bỏ được ảnh bìa.', 400);
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
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới xóa được ảnh lô hàng.', 403);

    await deleteBatchPhoto(id, user.id, photoId);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(`[harvest_batch:${id}] delete photo failed`, err);
    return errorResponse(err);
  }
}
