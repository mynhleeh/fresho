import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import { cleanupDb } from '../helpers/cleanup';
import { confirmAndDeposit, createStoredShippingQuote } from '../helpers/orderFlow';

async function seedBatchAndBuyer() {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  return { farmer, buyer, batch };
}

describe('createPreOrder', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('rejects a quantity below the batch minimum order quantity', async () => {
    const farmer = await prisma.user.create({ data: { name: 'F', phone: '1', address: 'A', role: 'farmer', passwordHash: 'x' } });
    const buyer = await prisma.user.create({ data: { name: 'B', phone: '2', address: 'B', role: 'buyer', passwordHash: 'x' } });
    const batch = await prisma.harvestBatch.create({
      data: {
        farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100,
        unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date(), minOrderQuantity: 20,
      },
    });

    await expect(
      createPreOrder(buyer.id, { batchId: batch.id, quantity: 5 }),
    ).rejects.toMatchObject({ code: 'below_min_order_quantity' });
  });
});

describe('transitionPreOrderStatus', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('moves pending_confirmation -> negotiating on negotiate', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    const negotiating = await transitionPreOrderStatus(preOrder.id, 'negotiate', { id: farmer.id, role: 'farmer' });

    expect(negotiating.status).toBe('negotiating');
  });

  it('moves pending_confirmation -> deposited once the farmer confirmed and the buyer deposited', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await confirmAndDeposit(preOrder.id, farmer.id);

    const updated = await prisma.preOrder.findUnique({ where: { id: preOrder.id } });
    expect(updated?.status).toBe('deposited');
  });

  it('rejects deposit_paid when the farmer has not confirmed', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await expect(
      transitionPreOrderStatus(preOrder.id, 'deposit_paid', { id: buyer.id, role: 'buyer' }),
    ).rejects.toMatchObject({ code: 'invalid_transition' });
  });

  it('rejects a pre-order while negotiating and restores batch quantity', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    await transitionPreOrderStatus(preOrder.id, 'negotiate', { id: buyer.id, role: 'farmer' });

    const rejected = await transitionPreOrderStatus(preOrder.id, 'reject', { id: buyer.id, role: 'farmer' });

    expect(rejected.status).toBe('rejected');
    const updatedBatch = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(updatedBatch?.quantityAvailable).toBe(100);
  });

  it('rejects an event not valid from the current status', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await expect(
      transitionPreOrderStatus(preOrder.id, 'mark_delivered', { id: buyer.id, role: 'buyer' }),
    ).rejects.toMatchObject({ code: 'invalid_transition' });
  });

  it('walks the full happy path to settled', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });

    await confirmAndDeposit(preOrder.id, farmer.id);
    await transitionPreOrderStatus(preOrder.id, 'mark_awaiting_harvest', { id: farmer.id, role: 'farmer' });
    await transitionPreOrderStatus(preOrder.id, 'mark_ready_for_handover', { id: farmer.id, role: 'farmer' });
    await transitionPreOrderStatus(preOrder.id, 'mark_in_transit', { id: buyer.id, role: 'logistics' });
    await transitionPreOrderStatus(preOrder.id, 'mark_delivered', { id: buyer.id, role: 'logistics' });
    const final = await transitionPreOrderStatus(preOrder.id, 'confirm_receipt', { id: buyer.id, role: 'buyer' });

    expect(final.status).toBe('settled');
  });
});

describe('pre_order concurrency and input guards', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('restores the batch quantity only once when reject is called twice at the same time', async () => {
    const { farmer, buyer, batch } = await seedBatchAndBuyer();
    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
    const actor = { id: farmer.id, role: 'farmer' };

    const results = await Promise.allSettled([
      transitionPreOrderStatus(preOrder.id, 'reject', actor),
      transitionPreOrderStatus(preOrder.id, 'reject', actor),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const restored = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(restored?.quantityAvailable).toBe(100);
  });

  it('does not let two buyers reserve more than the available quantity', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const otherBuyer = await prisma.user.create({ data: { name: 'B2', phone: '3', address: 'B', role: 'buyer', passwordHash: 'x' } });

    const results = await Promise.allSettled([
      createPreOrder(buyer.id, { batchId: batch.id, quantity: 60 }),
      createPreOrder(otherBuyer.id, { batchId: batch.id, quantity: 60 }),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const after = await prisma.harvestBatch.findUnique({ where: { id: batch.id } });
    expect(after?.quantityAvailable).toBe(40);
  });

  it.each([
    [{ quantity: 1.5 }],
    [{ quantity: 0 }],
    [{ quantity: Infinity }],
    [{ quantity: 10, deliveryMethod: 'carrier' as const, shippingFeeQuote: -1 }],
    [{ quantity: 10, deliveryMethod: 'carrier' as const, shippingFeeQuote: 10.5 }],
    [{ quantity: 10, deliveryMethod: 'carrier' as const }],
  ])('rejects invalid pre_order input %j', async (input) => {
    const { buyer, batch } = await seedBatchAndBuyer();

    await expect(createPreOrder(buyer.id, { batchId: batch.id, ...input })).rejects.toMatchObject({ code: 'invalid_input' });

    expect(await prisma.preOrder.count()).toBe(0);
  });
});

describe('carrier shipping estimate must come from a stored quote', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('accepts the estimate of a quote stored for this buyer, batch and quantity', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const fee = await createStoredShippingQuote(batch.id, buyer.id, 10);

    const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10, deliveryMethod: 'carrier', shippingFeeQuote: fee });

    expect(preOrder.shippingFeeQuote).toBe(fee);
  });

  it('rejects an estimate that matches no stored quote, such as a forged zero', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    await createStoredShippingQuote(batch.id, buyer.id, 10);

    await expect(createPreOrder(buyer.id, { batchId: batch.id, quantity: 10, deliveryMethod: 'carrier', shippingFeeQuote: 0 }))
      .rejects.toMatchObject({ code: 'invalid_shipping_quote' });
    expect(await prisma.preOrder.count()).toBe(0);
  });

  it('rejects a quote stored for another quantity or another buyer', async () => {
    const { buyer, batch } = await seedBatchAndBuyer();
    const otherBuyer = await prisma.user.create({ data: { name: 'B9', phone: '99', address: 'B', role: 'buyer', passwordHash: 'x' } });
    const smallOrderFee = await createStoredShippingQuote(batch.id, buyer.id, 2);
    const otherBuyerFee = await createStoredShippingQuote(batch.id, otherBuyer.id, 10);

    await expect(createPreOrder(buyer.id, { batchId: batch.id, quantity: 10, deliveryMethod: 'carrier', shippingFeeQuote: smallOrderFee }))
      .rejects.toMatchObject({ code: 'invalid_shipping_quote' });
    await expect(createPreOrder(buyer.id, { batchId: batch.id, quantity: 10, deliveryMethod: 'carrier', shippingFeeQuote: otherBuyerFee }))
      .rejects.toMatchObject({ code: 'invalid_shipping_quote' });
  });
});
