import { getCurrentUser } from '@/lib/session';
import { updateDeliveryStatus } from '@/lib/order-services/deliveryService';
import { ApiError, errorResponse } from '@/lib/errors';

const ALLOWED_STATUSES = ['in_transit', 'delivered'] as const;

export async function POST(request: Request, { params }: { params: Promise<{ preOrderId: string }> }) {
  try {
    const { preOrderId } = await params;
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Vui lòng đăng nhập.', 403);
    if (!['logistics', 'farmer', 'buyer'].includes(user.role)) {
      throw new ApiError('forbidden', 'Vai trò của bạn không được cập nhật giao hàng.', 403);
    }

    const body = await request.json().catch(() => null);
    const { status, trackingNote, actualQuantity, proofPhotoUrl } = body ?? {};
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new ApiError('invalid_status', 'Trạng thái giao hàng phải là in_transit hoặc delivered.', 400);
    }
    if (actualQuantity !== undefined && (!Number.isInteger(actualQuantity) || actualQuantity <= 0)) {
      throw new ApiError('invalid_input', 'Số lượng thực tế phải là số nguyên lớn hơn 0.', 400);
    }
    if ([trackingNote, proofPhotoUrl].some((value) => value !== undefined && typeof value !== 'string')) {
      throw new ApiError('invalid_input', 'Ghi chú và đường dẫn ảnh bàn giao phải là chuỗi ký tự.', 400);
    }
    const record = await updateDeliveryStatus(preOrderId, user, status, trackingNote, { actualQuantity, proofPhotoUrl });
    console.log(`delivery updated preOrderId=${preOrderId} status=${status}`);
    return Response.json(record);
  } catch (err) {
    return errorResponse(err);
  }
}
