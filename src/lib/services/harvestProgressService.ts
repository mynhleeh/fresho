import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { postMessage } from '@/lib/services/orderMessageService';

export type ProgressKind = 'on_track' | 'quantity_adjusted' | 'rescheduled';

const NOTIFIABLE_STATUSES = ['deposited', 'awaiting_harvest'];

export async function postProgressUpdate(
  batchId: string,
  farmerId: string,
  input: { kind: ProgressKind; note?: string; newQuantityTotal?: number; newHarvestDateEstimate?: Date },
) {
  const batch = await prisma.harvestBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new ApiError('batch_not_found', 'Batch not found', 404);
  if (batch.farmerId !== farmerId) throw new ApiError('forbidden', 'Not your batch', 403);

  const reserved = batch.quantityTotal - batch.quantityAvailable;
  let previousValue: string | undefined;
  let newValue: string | undefined;

  if (input.kind === 'quantity_adjusted') {
    if (input.newQuantityTotal === undefined) {
      throw new ApiError('invalid_input', 'newQuantityTotal is required for quantity_adjusted', 400);
    }
    if (input.newQuantityTotal <= 0 || input.newQuantityTotal < reserved) {
      throw new ApiError('invalid_state', `invalid_state: newQuantityTotal cannot drop below already-reserved quantity (${reserved})`, 400);
    }
    if (input.newQuantityTotal < batch.minOrderQuantity) {
      throw new ApiError('invalid_input', 'minOrderQuantity cannot exceed quantityTotal', 400);
    }
    previousValue = String(batch.quantityTotal);
    newValue = String(input.newQuantityTotal);
    await prisma.harvestBatch.update({
      where: { id: batchId },
      data: { quantityTotal: input.newQuantityTotal, quantityAvailable: input.newQuantityTotal - reserved },
    });
  } else if (input.kind === 'rescheduled') {
    if (!input.newHarvestDateEstimate) {
      throw new ApiError('invalid_input', 'newHarvestDateEstimate is required for rescheduled', 400);
    }
    previousValue = batch.harvestDateEstimate.toISOString();
    newValue = input.newHarvestDateEstimate.toISOString();
    await prisma.harvestBatch.update({
      where: { id: batchId },
      data: { harvestDateEstimate: input.newHarvestDateEstimate },
    });
  }

  const update = await prisma.harvestProgressUpdate.create({
    data: { batchId, farmerId, kind: input.kind, note: input.note, previousValue, newValue },
  });

  const affectedPreOrders = await prisma.preOrder.findMany({
    where: { batchId, status: { in: NOTIFIABLE_STATUSES } },
  });
  const summary = progressSummary(input.kind, previousValue, newValue, input.note);
  for (const preOrder of affectedPreOrders) {
    await postMessage(preOrder.id, { id: farmerId, role: 'farmer' }, summary);
  }

  return update;
}

function progressSummary(kind: ProgressKind, previousValue?: string, newValue?: string, note?: string): string {
  if (kind === 'on_track') return note ? `Cập nhật tiến độ: Đúng tiến độ — ${note}` : 'Cập nhật tiến độ: Đúng tiến độ';
  if (kind === 'quantity_adjusted') return `Cập nhật tiến độ: Điều chỉnh sản lượng từ ${previousValue} sang ${newValue}`;
  return `Cập nhật tiến độ: Dời ngày thu hoạch từ ${previousValue} sang ${newValue}`;
}
