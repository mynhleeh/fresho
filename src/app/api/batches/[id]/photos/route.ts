import { getCurrentUser } from '@/lib/session';
import { addBatchPhoto, listPhotosByBatch, listPhotosForEditing } from '@/lib/services/batchPhotoService';
import { assertBatchOwnership, getBatch } from '@/lib/services/batchService';
import { saveUploadedBatchImage } from '@/lib/uploadStorage';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getCurrentUser(request);
    const batch = await getBatch(id);
    const isOwningFarmer = !!user && user.role === 'farmer' && batch?.farmerId === user.id;

    const photos = isOwningFarmer ? await listPhotosForEditing(id) : await listPhotosByBatch(id);
    return Response.json(photos);
  } catch (err) {
    console.error(`[harvest_batch:${id}] list photos failed`, err);
    return errorResponse(err);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can upload batch photos', 403);
    await assertBatchOwnership(id, user.id);

    const formData = await request.formData();
    const file = formData.get('photo');
    if (!(file instanceof File)) {
      throw new ApiError('invalid_input', 'photo file is required', 400);
    }

    const url = await saveUploadedBatchImage(file);
    const photo = await addBatchPhoto(id, user.id, url);
    return Response.json(photo, { status: 201 });
  } catch (err) {
    console.error(`[harvest_batch:${id}] photo upload failed`, err);
    return errorResponse(err);
  }
}
