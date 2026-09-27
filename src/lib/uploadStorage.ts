import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ApiError } from '@/lib/errors';

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function saveUploadedImage(file: File, subdir: string): Promise<string> {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    throw new ApiError('invalid_input', 'photo must be jpeg, png, or webp', 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError('invalid_input', 'photo must be 5MB or smaller', 400);
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/${subdir}/${fileName}`;
}

export function saveUploadedBatchImage(file: File): Promise<string> {
  return saveUploadedImage(file, 'batches');
}

export function saveUploadedAvatarImage(file: File): Promise<string> {
  return saveUploadedImage(file, 'avatars');
}
