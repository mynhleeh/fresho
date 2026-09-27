import { getCurrentUser } from '@/lib/session';
import { updateBatch } from '@/lib/services/batchService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can edit batches', 403);

    const { id } = await params;
    const body = await request.json();

    if (body.cropName !== undefined && (typeof body.cropName !== 'string' || body.cropName.trim().length === 0)) {
      throw new ApiError('invalid_input', 'cropName must be a non-empty string', 400);
    }
    if (body.pricePerUnit !== undefined && (typeof body.pricePerUnit !== 'number' || !(body.pricePerUnit > 0))) {
      throw new ApiError('invalid_input', 'pricePerUnit must be a number greater than 0', 400);
    }
    if (body.photoUrl !== undefined && typeof body.photoUrl !== 'string') {
      throw new ApiError('invalid_input', 'photoUrl must be a string', 400);
    }
    if (body.location !== undefined && (typeof body.location !== 'string' || body.location.trim().length === 0)) {
      throw new ApiError('invalid_input', 'location must be a non-empty string', 400);
    }
    if (body.qualityStandard !== undefined && typeof body.qualityStandard !== 'string') {
      throw new ApiError('invalid_input', 'qualityStandard must be a string', 400);
    }
    if (body.minOrderQuantity !== undefined && (typeof body.minOrderQuantity !== 'number' || !(body.minOrderQuantity > 0))) {
      throw new ApiError('invalid_input', 'minOrderQuantity must be a number greater than 0', 400);
    }
    if (body.description !== undefined && typeof body.description !== 'string') {
      throw new ApiError('invalid_input', 'description must be a string', 400);
    }

    const allowedUpdates: Partial<{
      cropName: string; pricePerUnit: number; photoUrl: string;
      location: string; qualityStandard: string; minOrderQuantity: number; description: string;
    }> = {};
    if (body.cropName !== undefined) allowedUpdates.cropName = body.cropName;
    if (body.pricePerUnit !== undefined) allowedUpdates.pricePerUnit = body.pricePerUnit;
    if (body.photoUrl !== undefined) allowedUpdates.photoUrl = body.photoUrl;
    if (body.location !== undefined) allowedUpdates.location = body.location;
    if (body.qualityStandard !== undefined) allowedUpdates.qualityStandard = body.qualityStandard;
    if (body.minOrderQuantity !== undefined) allowedUpdates.minOrderQuantity = body.minOrderQuantity;
    if (body.description !== undefined) allowedUpdates.description = body.description;

    const batch = await updateBatch(id, user.id, allowedUpdates);
    return Response.json(batch);
  } catch (err) {
    return errorResponse(err);
  }
}
