import { getCurrentUser } from '@/lib/session';
import { createBatch, listBatchesByFarmer, listOpenBatches } from '@/lib/services/batchService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get('mine') === '1') {
      const user = await getCurrentUser(request);
      if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can list their own batches', 403);
      const batches = await listBatchesByFarmer(user.id);
      return Response.json(batches);
    }

    const harvestDateFrom = searchParams.get('harvestDateFrom');
    const harvestDateTo = searchParams.get('harvestDateTo');
    const sortBy = searchParams.get('sortBy');
    const batches = await listOpenBatches({
      cropName: searchParams.get('cropName') ?? undefined,
      maxPricePerUnit: searchParams.get('maxPricePerUnit') ? Number(searchParams.get('maxPricePerUnit')) : undefined,
      location: searchParams.get('location') ?? undefined,
      harvestDateFrom: harvestDateFrom ? new Date(harvestDateFrom) : undefined,
      harvestDateTo: harvestDateTo ? new Date(harvestDateTo) : undefined,
      sortBy: sortBy === 'trustScore' || sortBy === 'harvestDate' ? sortBy : 'newest',
    });
    return Response.json(batches);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can post batches', 403);

    const body = await request.json();

    if (typeof body.cropName !== 'string' || body.cropName.trim().length === 0) {
      throw new ApiError('invalid_input', 'cropName is required and must be a non-empty string', 400);
    }
    if (typeof body.quantityTotal !== 'number' || !(body.quantityTotal > 0)) {
      throw new ApiError('invalid_input', 'quantityTotal is required and must be a number greater than 0', 400);
    }
    if (typeof body.unit !== 'string' || body.unit.trim().length === 0) {
      throw new ApiError('invalid_input', 'unit is required and must be a non-empty string', 400);
    }
    if (typeof body.pricePerUnit !== 'number' || !(body.pricePerUnit > 0)) {
      throw new ApiError('invalid_input', 'pricePerUnit is required and must be a number greater than 0', 400);
    }
    if (body.harvestDateEstimate === undefined || body.harvestDateEstimate === null) {
      throw new ApiError('invalid_input', 'harvestDateEstimate is required', 400);
    }
    const harvestDateEstimate = new Date(body.harvestDateEstimate);
    if (isNaN(harvestDateEstimate.getTime())) {
      throw new ApiError('invalid_input', 'harvestDateEstimate must be a valid date', 400);
    }
    if (typeof body.location !== 'string' || body.location.trim().length === 0) {
      throw new ApiError('invalid_input', 'location is required and must be a non-empty string', 400);
    }
    if (body.minOrderQuantity !== undefined && (typeof body.minOrderQuantity !== 'number' || !(body.minOrderQuantity > 0))) {
      throw new ApiError('invalid_input', 'minOrderQuantity must be a number greater than 0', 400);
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
