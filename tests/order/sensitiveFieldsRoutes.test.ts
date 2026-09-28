import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder } from '@/lib/order-services/preOrderService';
import { GET as adminOrdersRoute } from '@/app/api/admin/orders/route';
import { GET as disputesRoute } from '@/app/api/disputes/route';
import { GET as myDeliveriesRoute } from '@/app/api/deliveries/mine/route';
import { cleanupDb } from '../helpers/cleanup';

function getAs(handler: (request: Request) => Promise<Response>, userId: string) {
  return handler(new Request('http://localhost/api', { headers: { cookie: `fresho_session=${userId}` } }));
}

async function seedOrderWithDeliveryAndDispute() {
  const make = (name: string, phone: string, role: string) =>
    prisma.user.create({ data: { name, phone, address: 'addr', role, passwordHash: 'secret-hash' } });
  const farmer = await make('Farmer', '1', 'farmer');
  const buyer = await make('Buyer', '2', 'buyer');
  const admin = await make('Admin', '3', 'admin');
  const logistics = await make('Logistics', '4', 'logistics');
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
  await prisma.deliveryRecord.create({ data: { preOrderId: preOrder.id, method: 'carrier', status: 'ready_for_handover', logisticsPartnerId: logistics.id } });
  await prisma.disputeLog.create({ data: { preOrderId: preOrder.id, raisedById: buyer.id, reason: 'Giao chậm' } });
  return { admin, logistics };
}

describe('operator and logistics routes never expose password hashes', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it.each([
    ['admin orders', adminOrdersRoute, 'admin'],
    ['disputes', disputesRoute, 'admin'],
    ['my deliveries', myDeliveriesRoute, 'logistics'],
  ] as const)('%s response contains no passwordHash', async (_name, handler, who) => {
    const seeded = await seedOrderWithDeliveryAndDispute();

    const response = await getAs(handler, seeded[who].id);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).not.toContain('secret-hash');
    expect(body).not.toContain('passwordHash');
  });
});
