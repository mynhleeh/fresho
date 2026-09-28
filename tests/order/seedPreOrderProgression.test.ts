import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder } from '@/lib/order-services/preOrderService';
import { advanceDemoPreOrder } from '../../prisma/seedPreOrderProgression';
import { cleanupDb } from '../helpers/cleanup';

async function seedActors() {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
  const logistics = await prisma.user.create({ data: { name: 'L', phone: '3', address: 'C', role: 'logistics', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  return { farmer, buyer, logistics, batch };
}

describe('advanceDemoPreOrder', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('does not skip the deposit-before-confirm rule when advancing to deposited', async () => {
    const { farmer, buyer, logistics, batch } = await seedActors();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await advanceDemoPreOrder(preOrder.id, batch.id, farmer.id, buyer.id, logistics.id, 'deposited');

    const updated = await prisma.preOrder.findUniqueOrThrow({ where: { id: preOrder.id }, include: { deposits: true } });
    expect(updated.status).toBe('deposited');
    expect(updated.deposits).toHaveLength(1);
    expect(updated.deposits[0].amount).toBe(Math.round(10 * 10000 * 0.2));
  });

  it('walks the full event sequence to settled, creating exactly one deposit and one settlement', async () => {
    const { farmer, buyer, logistics, batch } = await seedActors();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await advanceDemoPreOrder(preOrder.id, batch.id, farmer.id, buyer.id, logistics.id, 'settled');

    const updated = await prisma.preOrder.findUniqueOrThrow({
      where: { id: preOrder.id },
      include: { deposits: true, settlement: true, delivery: true },
    });
    expect(updated.status).toBe('settled');
    expect(updated.deposits).toHaveLength(1);
    expect(updated.settlement).not.toBeNull();
    expect(updated.delivery?.status).toBe('delivered');
    expect(updated.delivery?.logisticsPartnerId).toBe(logistics.id);

    const updatedBatch = await prisma.harvestBatch.findUniqueOrThrow({ where: { id: batch.id } });
    expect(updatedBatch.status).toBe('ready_for_handover');
  });

  it('stops at rejected without ever recording a deposit, and restores batch quantity', async () => {
    const { farmer, buyer, logistics, batch } = await seedActors();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await advanceDemoPreOrder(preOrder.id, batch.id, farmer.id, buyer.id, logistics.id, 'rejected');

    const updated = await prisma.preOrder.findUniqueOrThrow({ where: { id: preOrder.id }, include: { deposits: true } });
    expect(updated.status).toBe('rejected');
    expect(updated.deposits).toHaveLength(0);

    const updatedBatch = await prisma.harvestBatch.findUniqueOrThrow({ where: { id: batch.id } });
    expect(updatedBatch.quantityAvailable).toBe(100);
  });
});
