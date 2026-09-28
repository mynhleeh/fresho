import { getCurrentUser } from '@/lib/session';
import { getAccount, updateAccountProfile } from '@/lib/services/accountService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const sessionUser = await getCurrentUser(request);
    if (!sessionUser) throw new ApiError('unauthorized', 'Vui lòng đăng nhập.', 401);

    const account = await getAccount(sessionUser.id);
    return Response.json(account);
  } catch (err) {
    console.error('account fetch failed', err);
    return errorResponse(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getCurrentUser(request);
    if (!sessionUser) throw new ApiError('unauthorized', 'Vui lòng đăng nhập.', 401);

    const body = await request.json();
    const account = await updateAccountProfile(sessionUser.id, { name: body.name, phone: body.phone });
    return Response.json(account);
  } catch (err) {
    console.error('account update failed', err);
    return errorResponse(err);
  }
}
