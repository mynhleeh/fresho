import { getCurrentUser } from '@/lib/session';
import { getPriceAndPackagingAdvisory } from '@/lib/batch-services/priceAdvisoryService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới xin được gợi ý giá.', 403);

    const { searchParams } = new URL(request.url);
    const cropName = searchParams.get('cropName');
    if (!cropName || cropName.trim().length === 0) {
      throw new ApiError('invalid_input', 'Cần nhập tên nông sản.', 400);
    }

    const advisory = await getPriceAndPackagingAdvisory(cropName);
    return Response.json(advisory);
  } catch (err) {
    return errorResponse(err);
  }
}
