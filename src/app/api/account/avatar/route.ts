import { getCurrentUser } from '@/lib/session';
import { updateAccountAvatar } from '@/lib/services/accountService';
import { saveUploadedAvatarImage } from '@/lib/uploadStorage';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser(request);
    if (!sessionUser) throw new ApiError('unauthorized', 'unauthorized', 401);

    const formData = await request.formData();
    const file = formData.get('avatar');
    if (!(file instanceof File)) {
      throw new ApiError('invalid_input', 'avatar file is required', 400);
    }

    const url = await saveUploadedAvatarImage(file);
    const account = await updateAccountAvatar(sessionUser.id, url);
    return Response.json(account);
  } catch (err) {
    console.error('avatar upload failed', err);
    return errorResponse(err);
  }
}
