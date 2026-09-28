import { getCurrentUser } from '@/lib/session';
import { getPreOrderForActor } from '@/lib/order-services/orderViewService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);

    const { id } = await params;
    return Response.json(await getPreOrderForActor(id, user));
  } catch (err) {
    return errorResponse(err);
  }
}
