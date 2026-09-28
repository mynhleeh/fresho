import { getCurrentUser } from '@/lib/session';
import { quoteShipping, type VehicleType } from '@/lib/batch-services/shippingQuoteService';
import { ApiError, errorResponse } from '@/lib/errors';

const VEHICLE_TYPES: VehicleType[] = ['motorbike', 'small_truck', 'refrigerated_truck'];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'buyer') throw new ApiError('forbidden', 'Chỉ người mua mới xin báo giá vận chuyển được.', 403);

    const { batchId, quantity, vehicleType, distanceKm } = await request.json();
    if (!VEHICLE_TYPES.includes(vehicleType)) {
      throw new ApiError('invalid_input', `Loại xe phải là một trong: ${VEHICLE_TYPES.join(', ')}.`, 400);
    }

    const quote = await quoteShipping({
      batchId,
      buyerId: user.id,
      quantity: Number(quantity),
      vehicleType,
      distanceKm: Number(distanceKm),
    });
    console.log(`shipping quote created batchId=${batchId}`);
    return Response.json(quote, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
