import { getCurrentUser } from '@/lib/session';
import { getPriceAndPackagingAdvisory } from '@/lib/services/priceAdvisoryService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can request advisory', 403);

    const { searchParams } = new URL(request.url);
    const cropName = searchParams.get('cropName');
    if (!cropName || cropName.trim().length === 0) {
      throw new ApiError('invalid_input', 'cropName is required', 400);
    }

    const advisory = await getPriceAndPackagingAdvisory(cropName);
    return Response.json(advisory);
  } catch (err) {
    return errorResponse(err);
  }
}
