import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder } from '@/lib/order-services/preOrderService';
import { PATCH as confirmRoute } from '@/app/api/preorders/[id]/confirm/route';
import { PATCH as negotiateRoute } from '@/app/api/preorders/[id]/negotiate/route';
import { PATCH as rejectRoute } from '@/app/api/preorders/[id]/reject/route';
import { PATCH as cancelRoute } from '@/app/api/preorders/[id]/cancel/route';
import { POST as agreementsRoute } from '@/app/api/preorders/[id]/agreements/route';
import { POST as respondRoute } from '@/app/api/agreements/[id]/respond/route';
import { POST as depositRoute } from '@/app/api/preorders/[id]/deposit/route';
import { GET as getOrderRoute } from '@/app/api/preorders/[id]/route';
import { POST as awaitingHarvestRoute } from '@/app/api/batches/[id]/awaiting-harvest/route';
import { POST as readyForHandoverRoute } from '@/app/api/batches/[id]/ready-for-handover/route';
import { cleanupDb } from '../helpers/cleanup';
import { confirmAndDeposit } from '../helpers/orderFlow';

type Handler = (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>;

function callAs(handler: Handler, userId: string | null, id: string, body?: unknown) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (userId) headers.cookie = `fresho_session=${userId}`;
  const request = new Request('http://localhost/api', { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined });
  return handler(request, { params: Promise.resolve({ id }) });
}

async function seed() {
  const make = (name: string, phone: string, role: string) =>
    prisma.user.create({ data: { name, phone, address: 'addr', role, passwordHash: 'x' } });
  const farmer = await make('Farmer', '1', 'farmer');
  const otherFarmer = await make('Other farmer', '2', 'farmer');
  const buyer = await make('Buyer', '3', 'buyer');
  const otherBuyer = await make('Other buyer', '4', 'buyer');
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
  return { farmer, otherFarmer, buyer, otherBuyer, batch, preOrder };
}

describe('pre_order [id] routes ownership and role checks', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it.each([
    ['confirm', confirmRoute],
    ['negotiate', negotiateRoute],
    ['reject', rejectRoute],
  ] as Array<[string, Handler]>)('%s is refused to another farmer, a buyer and anonymous callers', async (_name, handler) => {
    const { otherFarmer, buyer, preOrder } = await seed();

    for (const caller of [otherFarmer.id, buyer.id, null]) {
      const response = await callAs(handler, caller, preOrder.id);
      expect(response.status).toBe(403);
    }
    const unchanged = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(unchanged?.status).toBe('pending_confirmation');
  });

  it('deposit is refused to another buyer and to a farmer', async () => {
    const { otherBuyer, farmer, preOrder } = await seed();

    for (const caller of [otherBuyer.id, farmer.id]) {
      expect((await callAs(depositRoute, caller, preOrder.id, { amount: 20000 })).status).toBe(403);
    }
    expect(await prisma.deposit.count()).toBe(0);
  });

  it('cancel is refused to strangers and to the farmer while the order is pending_confirmation', async () => {
    const { otherBuyer, otherFarmer, farmer, preOrder } = await seed();

    for (const caller of [otherBuyer.id, otherFarmer.id, farmer.id]) {
      expect((await callAs(cancelRoute, caller, preOrder.id)).status).toBe(403);
    }
  });

  it('cancel by the owning buyer succeeds while pending_confirmation and returns the quantity to the batch', async () => {
    const { buyer, batch, preOrder } = await seed();

    const response = await callAs(cancelRoute, buyer.id, preOrder.id);

    expect(response.status).toBe(200);
    const restored = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(restored?.quantityAvailable).toBe(100);
  });

  it('cancel by the buyer is not a valid transition once the order is deposited (needs the agreement flow)', async () => {
    const { buyer, farmer, preOrder } = await seed();
    await confirmAndDeposit(preOrder.id, farmer.id);

    const response = await callAs(cancelRoute, buyer.id, preOrder.id);

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe('invalid_transition');
  });

  it('agreement proposals are refused to strangers and anonymous callers', async () => {
    const { otherBuyer, otherFarmer, preOrder } = await seed();

    for (const caller of [otherBuyer.id, otherFarmer.id, null]) {
      const response = await callAs(agreementsRoute, caller, preOrder.id, { kind: 'cancel', refundAmount: 0 });
      expect(response.status).toBe(403);
    }
    expect(await prisma.orderAgreement.count()).toBe(0);
  });

  it('agreement responses reject unknown decisions and unknown agreements', async () => {
    const { buyer, preOrder } = await seed();

    expect((await callAs(respondRoute, buyer.id, preOrder.id, { decision: 'maybe' })).status).toBe(400);
    expect((await callAs(respondRoute, buyer.id, 'missing', { decision: 'accept' })).status).toBe(404);
  });

  it('order detail is hidden from strangers with 404 and open to the two participants', async () => {
    const { buyer, farmer, otherBuyer, otherFarmer, preOrder } = await seed();

    expect((await callAs(getOrderRoute, otherBuyer.id, preOrder.id)).status).toBe(404);
    expect((await callAs(getOrderRoute, otherFarmer.id, preOrder.id)).status).toBe(404);
    expect((await callAs(getOrderRoute, null, preOrder.id)).status).toBe(403);
    expect((await callAs(getOrderRoute, buyer.id, preOrder.id)).status).toBe(200);
    expect((await callAs(getOrderRoute, farmer.id, preOrder.id)).status).toBe(200);
  });

  it.each([
    ['awaiting-harvest', awaitingHarvestRoute],
    ['ready-for-handover', readyForHandoverRoute],
  ] as Array<[string, Handler]>)('%s batch route is refused to another farmer and to a buyer', async (_name, handler) => {
    const { otherFarmer, buyer, batch } = await seed();

    for (const caller of [otherFarmer.id, buyer.id]) {
      expect((await callAs(handler, caller, batch.id)).status).toBe(403);
    }
  });
});
