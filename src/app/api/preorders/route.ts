import { getCurrentUser } from '@/lib/session';
import { createPreOrder } from '@/lib/services/preOrderService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Only buyers can place pre-orders', 403);

    const { batchId, quantity } = await request.json();

    if (typeof batchId !== 'string' || batchId.trim().length === 0) {
      throw new ApiError('invalid_input', 'batchId must be a non-empty string', 400);
    }
    if (typeof quantity !== 'number' || !(quantity > 0)) {
      throw new ApiError('invalid_input', 'quantity must be a number greater than 0', 400);
    }

    const preOrder = await createPreOrder(user.id, { batchId, quantity });
    console.log(`pre_order created preOrderId=${preOrder.id} batchId=${batchId}`);
    return Response.json(preOrder, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
