import { getCurrentUser } from '@/lib/session';
import { createBatch, listBatchesByFarmer, listOpenBatches } from '@/lib/batch-services/batchService';
import { ApiError, errorResponse } from '@/lib/errors';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function parsePaginationParam(rawValue: string | null, defaultValue: number, maxValue: number): number {
  if (rawValue === null) return defaultValue;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) return defaultValue;
  return Math.min(parsed, maxValue);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get('mine') === '1') {
      const user = await getCurrentUser(request);
      if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới xem được danh sách lô hàng của mình.', 403);
      const batches = await listBatchesByFarmer(user.id);
      return Response.json(batches);
    }

    const harvestDateFrom = searchParams.get('harvestDateFrom');
    const harvestDateTo = searchParams.get('harvestDateTo');
    const sortBy = searchParams.get('sortBy');
    const limit = parsePaginationParam(searchParams.get('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = parsePaginationParam(searchParams.get('offset'), 0, Number.MAX_SAFE_INTEGER);
    const { items, total } = await listOpenBatches({
      cropName: searchParams.get('cropName') ?? undefined,
      minPricePerUnit: searchParams.get('minPricePerUnit') ? Number(searchParams.get('minPricePerUnit')) : undefined,
      maxPricePerUnit: searchParams.get('maxPricePerUnit') ? Number(searchParams.get('maxPricePerUnit')) : undefined,
      minQuantityAvailable: searchParams.get('minQuantityAvailable')
        ? Number(searchParams.get('minQuantityAvailable'))
        : undefined,
      location: searchParams.get('location') ?? undefined,
      harvestDateFrom: harvestDateFrom ? new Date(harvestDateFrom) : undefined,
      harvestDateTo: harvestDateTo ? new Date(harvestDateTo) : undefined,
      sortBy: sortBy === 'trustScore' || sortBy === 'harvestDate' ? sortBy : 'newest',
      limit,
      offset,
    });
    return Response.json({ items, total });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới đăng được lô hàng.', 403);

    const body = await request.json();

    if (typeof body.cropName !== 'string' || body.cropName.trim().length === 0) {
      throw new ApiError('invalid_input', 'Cần nhập tên nông sản.', 400);
    }
    if (typeof body.quantityTotal !== 'number' || !(body.quantityTotal > 0)) {
      throw new ApiError('invalid_input', 'Cần nhập sản lượng là một số lớn hơn 0.', 400);
    }
    if (typeof body.unit !== 'string' || body.unit.trim().length === 0) {
      throw new ApiError('invalid_input', 'Cần nhập đơn vị tính.', 400);
    }
    if (typeof body.pricePerUnit !== 'number' || !(body.pricePerUnit > 0)) {
      throw new ApiError('invalid_input', 'Cần nhập giá là một số lớn hơn 0.', 400);
    }
    if (body.harvestDateEstimate === undefined || body.harvestDateEstimate === null) {
      throw new ApiError('invalid_input', 'Cần chọn ngày thu hoạch dự kiến.', 400);
    }
    const harvestDateEstimate = new Date(body.harvestDateEstimate);
    if (isNaN(harvestDateEstimate.getTime())) {
      throw new ApiError('invalid_input', 'Ngày thu hoạch dự kiến chưa hợp lệ.', 400);
    }
    if (typeof body.location !== 'string' || body.location.trim().length === 0) {
      throw new ApiError('invalid_input', 'Cần nhập địa điểm.', 400);
    }
    if (body.minOrderQuantity !== undefined && (typeof body.minOrderQuantity !== 'number' || !(body.minOrderQuantity > 0))) {
      throw new ApiError('invalid_input', 'Số lượng đặt tối thiểu phải là một số lớn hơn 0.', 400);
    }

    const batch = await createBatch(user.id, {
      ...body,
      harvestDateEstimate,
    });
    return Response.json(batch, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
