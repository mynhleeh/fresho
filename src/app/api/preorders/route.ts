import { getCurrentUser } from '@/lib/session';
import { createPreOrder } from '@/lib/order-services/preOrderService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Chỉ người mua mới đặt trước được.', 403);

    const { batchId, quantity, deliveryMethod, shippingFeeQuote } = await request.json();

    if (typeof batchId !== 'string' || batchId.trim().length === 0) {
      throw new ApiError('invalid_input', 'Cần chọn lô hàng để đặt trước.', 400);
    }
    if (typeof quantity !== 'number' || !(quantity > 0)) {
      throw new ApiError('invalid_input', 'Số lượng đặt phải là một số lớn hơn 0.', 400);
    }
    if (deliveryMethod !== undefined && deliveryMethod !== 'self_pickup' && deliveryMethod !== 'carrier') {
      throw new ApiError('invalid_input', 'Phương thức nhận hàng phải là tự đến lấy hoặc giao bằng vận chuyển.', 400);
    }

    const preOrder = await createPreOrder(user.id, { batchId, quantity, deliveryMethod, shippingFeeQuote });
    console.log(`pre_order created preOrderId=${preOrder.id} batchId=${batchId}`);
    return Response.json(preOrder, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
