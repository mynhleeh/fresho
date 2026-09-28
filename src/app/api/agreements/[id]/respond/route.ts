import { getCurrentUser } from '@/lib/session';
import { respondToAgreement } from '@/lib/order-services/agreementService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);

    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (body?.decision !== 'accept' && body?.decision !== 'decline') {
      throw new ApiError('invalid_input', 'Phản hồi phải là "accept" hoặc "decline".', 400);
    }
    const agreement = await respondToAgreement(id, user, body.decision);
    console.log(`order agreement ${body.decision} preOrderId=${agreement.preOrderId} agreementId=${id}`);
    return Response.json(agreement);
  } catch (err) {
    return errorResponse(err);
  }
}
