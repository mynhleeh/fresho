import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

export type VehicleType = 'motorbike' | 'small_truck' | 'refrigerated_truck';

// TODO(business-confirm): rate card is a placeholder until finance confirms real
// carrier pricing — base fee + per-km + per-kg tiers, ordered lightest to heaviest.
const BASE_FEE: Record<VehicleType, number> = {
  motorbike: 15000,
  small_truck: 50000,
  refrigerated_truck: 120000,
};
const PER_KM_RATE: Record<VehicleType, number> = {
  motorbike: 3000,
  small_truck: 8000,
  refrigerated_truck: 15000,
};
const PER_KG_RATE: Record<VehicleType, number> = {
  motorbike: 200,
  small_truck: 500,
  refrigerated_truck: 900,
};
const PICKUP_WINDOW: Record<VehicleType, string> = {
  motorbike: 'Trong ngày',
  small_truck: 'Trong vòng 24 giờ',
  refrigerated_truck: 'Trong vòng 48 giờ',
};
const STORAGE_REQUIREMENT: Record<VehicleType, string> = {
  motorbike: 'Không yêu cầu bảo quản lạnh',
  small_truck: 'Che chắn, thông gió tiêu chuẩn',
  refrigerated_truck: 'Bảo quản lạnh liên tục',
};

const MAX_DISTANCE_KM = 2000;

function assertValidQuoteInput(quantity: number, distanceKm: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ApiError('invalid_input', 'Số lượng để báo giá vận chuyển phải là số nguyên lớn hơn 0.', 400);
  }
  if (!Number.isInteger(distanceKm) || distanceKm <= 0 || distanceKm > MAX_DISTANCE_KM) {
    throw new ApiError('invalid_input', `Khoảng cách vận chuyển phải là số nguyên km từ 1 đến ${MAX_DISTANCE_KM}.`, 400);
  }
}

export async function quoteShipping(input: {
  batchId: string;
  buyerId: string;
  quantity: number;
  vehicleType: VehicleType;
  distanceKm: number;
}) {
  assertValidQuoteInput(input.quantity, input.distanceKm);
  const batch = await prisma.harvestBatch.findUnique({ where: { id: input.batchId } });
  if (!batch) throw new ApiError('batch_not_found', 'Không tìm thấy lô hàng.', 404);

  const estimatedFee = Math.round(
    BASE_FEE[input.vehicleType] +
      input.distanceKm * PER_KM_RATE[input.vehicleType] +
      input.quantity * PER_KG_RATE[input.vehicleType],
  );

  return prisma.shippingQuote.create({
    data: {
      batchId: input.batchId,
      buyerId: input.buyerId,
      quantity: input.quantity,
      distanceKm: input.distanceKm,
      vehicleType: input.vehicleType,
      estimatedFee,
      pickupWindow: PICKUP_WINDOW[input.vehicleType],
      storageRequirement: STORAGE_REQUIREMENT[input.vehicleType],
    },
  });
}
