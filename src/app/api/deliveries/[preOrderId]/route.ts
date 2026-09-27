import { getCurrentUser } from '@/lib/session';
import { updateDeliveryStatus } from '@/lib/services/deliveryService';
import { ApiError, errorResponse } from '@/lib/errors';

const ALLOWED_STATUSES = ['in_transit', 'delivered'] as const;

export async function POST(request: Request, { params }: { params: Promise<{ preOrderId: string }> }) {
  try {
    const { preOrderId } = await params;
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Login required', 403);
    if (user.role !== 'logistics' && user.role !== 'farmer') {
      throw new ApiError('forbidden', 'Only logistics or farmer can update delivery', 403);
    }

    const { status, trackingNote, actualQuantity, proofPhotoUrl } = await request.json();
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new ApiError('invalid_status', 'status must be in_transit or delivered', 400);
    }
    const record = await updateDeliveryStatus(preOrderId, user, status, trackingNote, {
      actualQuantity: actualQuantity !== undefined ? Number(actualQuantity) : undefined,
      proofPhotoUrl,
    });
    console.log(`delivery updated preOrderId=${preOrderId} status=${status}`);
    return Response.json(record);
  } catch (err) {
    return errorResponse(err);
  }
}
