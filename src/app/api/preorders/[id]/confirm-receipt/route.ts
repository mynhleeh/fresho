import { getCurrentUser } from '@/lib/session';
import { settlePreOrder } from '@/lib/services/settlementService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Only buyers can confirm receipt', 403);

    const { id } = await params;

    const preOrder = await prisma.preOrder.findUnique({ where: { id } });
    if (!preOrder || preOrder.buyerId !== user.id) throw new ApiError('forbidden', 'Not your pre-order', 403);

    const { finalQuantity, shippingFee } = await request.json();

    if (typeof finalQuantity !== 'number' || !Number.isInteger(finalQuantity) || finalQuantity <= 0) {
      throw new ApiError('invalid_input', 'finalQuantity must be a positive integer', 400);
    }
    if (typeof shippingFee !== 'number' || !Number.isInteger(shippingFee) || shippingFee < 0) {
      throw new ApiError('invalid_input', 'shippingFee must be a non-negative integer', 400);
    }
    // TODO(business-confirm): allowing finalQuantity < preOrder.quantity assumes shortfalls are settled at the original unit price with no separate penalty/adjustment — revisit if the business wants different handling for under-delivery.
    if (finalQuantity > preOrder.quantity) {
      throw new ApiError('invalid_input', 'finalQuantity cannot exceed the reserved quantity', 400);
    }

    const settlement = await settlePreOrder(id, { finalQuantity, shippingFee });
    console.log(`pre_order settled preOrderId=${id}`);
    return Response.json(settlement);
  } catch (err) {
    return errorResponse(err);
  }
}
