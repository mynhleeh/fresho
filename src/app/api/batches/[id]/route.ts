import { getBatch, updateBatch, BUYER_VISIBLE_BATCH_STATUSES, FARMER_SELECTABLE_BATCH_STATUSES } from '@/lib/batch-services/batchService';
import { getCurrentUser } from '@/lib/session';
import { ApiError, errorResponse } from '@/lib/errors';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const batch = await getBatch(id);
    if (!batch || batch.isHidden || !BUYER_VISIBLE_BATCH_STATUSES.includes(batch.status)) {
      throw new ApiError('batch_not_found', 'Không tìm thấy lô hàng.', 404);
    }
    return Response.json(batch);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Chỉ nông dân mới sửa được lô hàng.', 403);

    const { id } = await params;
    const body = await request.json();

    if (body.cropName !== undefined && (typeof body.cropName !== 'string' || body.cropName.trim().length === 0)) {
      throw new ApiError('invalid_input', 'Tên nông sản không được để trống.', 400);
    }
    if (body.pricePerUnit !== undefined && (typeof body.pricePerUnit !== 'number' || !(body.pricePerUnit > 0))) {
      throw new ApiError('invalid_input', 'Giá phải là một số lớn hơn 0.', 400);
    }
    if (body.photoUrl !== undefined && typeof body.photoUrl !== 'string') {
      throw new ApiError('invalid_input', 'Đường dẫn ảnh phải là chuỗi ký tự.', 400);
    }
    if (body.location !== undefined && (typeof body.location !== 'string' || body.location.trim().length === 0)) {
      throw new ApiError('invalid_input', 'Địa điểm không được để trống.', 400);
    }
    if (body.qualityStandard !== undefined && typeof body.qualityStandard !== 'string') {
      throw new ApiError('invalid_input', 'Tiêu chuẩn chất lượng phải là chuỗi ký tự.', 400);
    }
    if (body.minOrderQuantity !== undefined && (typeof body.minOrderQuantity !== 'number' || !(body.minOrderQuantity > 0))) {
      throw new ApiError('invalid_input', 'Số lượng đặt tối thiểu phải là một số lớn hơn 0.', 400);
    }
    if (body.description !== undefined && typeof body.description !== 'string') {
      throw new ApiError('invalid_input', 'Mô tả phải là chuỗi ký tự.', 400);
    }
    if (body.status !== undefined && !FARMER_SELECTABLE_BATCH_STATUSES.includes(body.status)) {
      throw new ApiError('invalid_input', `Trạng thái phải là một trong: ${FARMER_SELECTABLE_BATCH_STATUSES.join(', ')}.`, 400);
    }

    const allowedUpdates: Partial<{
      cropName: string; pricePerUnit: number; photoUrl: string;
      location: string; qualityStandard: string; minOrderQuantity: number; description: string; status: string;
    }> = {};
    if (body.cropName !== undefined) allowedUpdates.cropName = body.cropName;
    if (body.pricePerUnit !== undefined) allowedUpdates.pricePerUnit = body.pricePerUnit;
    if (body.photoUrl !== undefined) allowedUpdates.photoUrl = body.photoUrl;
    if (body.location !== undefined) allowedUpdates.location = body.location;
    if (body.qualityStandard !== undefined) allowedUpdates.qualityStandard = body.qualityStandard;
    if (body.minOrderQuantity !== undefined) allowedUpdates.minOrderQuantity = body.minOrderQuantity;
    if (body.description !== undefined) allowedUpdates.description = body.description;
    if (body.status !== undefined) allowedUpdates.status = body.status;

    const batch = await updateBatch(id, user.id, allowedUpdates);
    return Response.json(batch);
  } catch (err) {
    return errorResponse(err);
  }
}
