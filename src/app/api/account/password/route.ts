import { getCurrentUser } from '@/lib/session';
import { changeAccountPassword } from '@/lib/services/accountService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request) {
  let userId = 'unknown';
  try {
    const sessionUser = await getCurrentUser(request);
    if (!sessionUser) throw new ApiError('unauthorized', 'unauthorized', 401);
    userId = sessionUser.id;

    const body = await request.json();
    await changeAccountPassword(sessionUser.id, {
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error(`[user:${userId}] password change failed`, err);
    return errorResponse(err);
  }
}
