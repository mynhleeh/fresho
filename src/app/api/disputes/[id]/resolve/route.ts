import { getCurrentUser } from '@/lib/session';
import { resolveDispute } from '@/lib/services/disputeService';
import { ApiError, errorResponse } from '@/lib/errors';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') throw new ApiError('forbidden', 'Chỉ quản trị viên mới thực hiện được thao tác này.', 403);

    const { resolutionNote } = await request.json();
    if (typeof resolutionNote !== 'string' || resolutionNote.trim() === '') {
      throw new ApiError('invalid_input', 'Cần nhập ghi chú giải quyết.', 400);
    }

    const dispute = await resolveDispute(id, resolutionNote);
    console.log(`dispute resolved disputeId=${id}`);
    return Response.json(dispute);
  } catch (err) {
    return errorResponse(err);
  }
}
