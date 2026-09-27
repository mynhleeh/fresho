import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getCurrentUser } from '@/lib/session';
import { assertBatchOwnership, setBatchPhoto } from '@/lib/services/batchService';
import { ApiError, errorResponse } from '@/lib/errors';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can upload batch photos', 403);

    const formData = await request.formData();
    const file = formData.get('photo');
    if (!(file instanceof File)) {
      throw new ApiError('invalid_input', 'photo file is required', 400);
    }
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      throw new ApiError('invalid_input', 'photo must be jpeg, png, or webp', 400);
    }
    if (file.size > MAX_BYTES) {
      throw new ApiError('invalid_input', 'photo must be 5MB or smaller', 400);
    }

    await assertBatchOwnership(id, user.id);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'batches');
    await mkdir(uploadDir, { recursive: true });
    const fileName = `${id}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    const batch = await setBatchPhoto(id, user.id, `/uploads/batches/${fileName}`);
    return Response.json(batch);
  } catch (err) {
    console.error(`[harvest_batch:${id}] photo upload failed`, err);
    return errorResponse(err);
  }
}
