import { getCurrentUser } from '@/lib/session';
import { payDeposit } from '@/lib/services/depositService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Only buyers can pay a deposit', 403);

    const { id } = await params;

    const preOrder = await prisma.preOrder.findUnique({ where: { id } });
    if (!preOrder || preOrder.buyerId !== user.id) throw new ApiError('forbidden', 'Not your pre-order', 403);

    const { amount } = await request.json();
    if (typeof amount !== 'number' || !(amount > 0)) {
      throw new ApiError('invalid_input', 'amount must be a number greater than 0', 400);
    }

    const deposit = await payDeposit(id, amount);
    console.log(`deposit paid preOrderId=${id} amount=${amount}`);
    return Response.json(deposit, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
