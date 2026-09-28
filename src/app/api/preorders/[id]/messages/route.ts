import { getCurrentUser } from '@/lib/session';
import { postMessage, listMessages } from '@/lib/services/orderMessageService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);

    const { id } = await params;
    const messages = await listMessages(id, user);
    return Response.json(messages);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);

    const { id } = await params;
    const { body } = await request.json();
    const message = await postMessage(id, user, body ?? '');
    console.log(`order message posted preOrderId=${id}`);
    return Response.json(message, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
