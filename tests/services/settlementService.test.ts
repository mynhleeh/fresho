import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { settlePreOrder } from '@/lib/services/settlementService';
import { createPreOrder, transitionPreOrderStatus } from '@/lib/services/preOrderService';
import { cleanupDb } from '../helpers/cleanup';

describe('settlePreOrder', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('computes finalPaymentAmount as goods + shipping - deposit already paid', async () => {
    const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer' } });
    const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer' } });
    const batch = await prisma.harvestBatch.create({
      data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
    });
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await prisma.deposit.create({ data: { preOrderId: preOrder.id, amount: 20000 } });
    await transitionPreOrderStatus(preOrder.id, 'confirm', { id: farmer.id, role: 'farmer' });
    await transitionPreOrderStatus(preOrder.id, 'mark_awaiting_harvest', { id: farmer.id, role: 'farmer' });
    await transitionPreOrderStatus(preOrder.id, 'mark_ready_for_handover', { id: farmer.id, role: 'farmer' });
    await transitionPreOrderStatus(preOrder.id, 'mark_delivered', { id: farmer.id, role: 'farmer' });

    const settlement = await settlePreOrder(preOrder.id, { finalQuantity: 10, shippingFee: 15000 });

    // goods = 10 * 10000 = 100000; + shipping 15000 = 115000; - deposit 20000 = 95000
    expect(settlement.finalGoodsAmount).toBe(100000);
    expect(settlement.finalPaymentAmount).toBe(95000);

    const updated = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(updated?.status).toBe('settled');
  });
});
