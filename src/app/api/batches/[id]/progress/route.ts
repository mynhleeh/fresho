import { getCurrentUser } from '@/lib/session';
import { postProgressUpdate, type ProgressKind } from '@/lib/services/harvestProgressService';
import { ApiError, errorResponse } from '@/lib/errors';
import { prisma } from '@/lib/db';

const PROGRESS_KINDS: ProgressKind[] = ['on_track', 'quantity_adjusted', 'rescheduled'];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) throw new ApiError('forbidden', 'Login required', 403);

    const { id } = await params;
    const batch = await prisma.harvestBatch.findUnique({ where: { id } });
    if (!batch) throw new ApiError('batch_not_found', 'Batch not found', 404);

    const isFarmer = batch.farmerId === user.id;
    const isAdmin = user.role === 'admin';
    const isBuyerWithOrder = user.role === 'buyer' && (await prisma.preOrder.count({ where: { batchId: id, buyerId: user.id } })) > 0;
    if (!isFarmer && !isAdmin && !isBuyerWithOrder) throw new ApiError('forbidden', 'Not a participant on this batch', 403);

    const updates = await prisma.harvestProgressUpdate.findMany({ where: { batchId: id }, orderBy: { createdAt: 'asc' } });
    return Response.json(updates);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'farmer') throw new ApiError('forbidden', 'Only farmers can post progress updates', 403);

    const { id } = await params;
    const { kind, note, newQuantityTotal, newHarvestDateEstimate } = await request.json();
    if (!PROGRESS_KINDS.includes(kind)) {
      throw new ApiError('invalid_input', `kind must be one of ${PROGRESS_KINDS.join(', ')}`, 400);
    }

    const update = await postProgressUpdate(id, user.id, {
      kind,
      note,
      newQuantityTotal: newQuantityTotal !== undefined ? Number(newQuantityTotal) : undefined,
      newHarvestDateEstimate: newHarvestDateEstimate ? new Date(newHarvestDateEstimate) : undefined,
    });
    console.log(`harvest progress update batchId=${id} kind=${kind}`);
    return Response.json(update, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
