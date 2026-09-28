import { getCurrentUser } from '@/lib/session';
import { proposeCancel, proposeSettlement } from '@/lib/order-services/agreementService';
import { ApiError, errorResponse } from '@/lib/errors';

function requireNumber(value: unknown, label: string): number {
  if (typeof value !== 'number') throw new ApiError('invalid_input', `${label} phải là một số.`, 400);
  return value;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);

    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (body?.kind === 'settlement') {
      const agreement = await proposeSettlement(id, user, requireNumber(body.finalQuantity, 'Số lượng thực nhận'));
      console.log(`pre_order settlement proposed preOrderId=${id} agreementId=${agreement.id}`);
      return Response.json(agreement, { status: 201 });
    }
    if (body?.kind === 'cancel') {
      const agreement = await proposeCancel(id, user, requireNumber(body.refundAmount, 'Số tiền hoàn cọc'));
      console.log(`pre_order cancel proposed preOrderId=${id} agreementId=${agreement.id}`);
      return Response.json(agreement, { status: 201 });
    }
    throw new ApiError('invalid_input', 'Loại đề xuất phải là "settlement" hoặc "cancel".', 400);
  } catch (err) {
    return errorResponse(err);
  }
}
