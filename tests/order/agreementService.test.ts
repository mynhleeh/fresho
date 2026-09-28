import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { createPreOrder, confirmPreOrder, transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import { markBatchAwaitingHarvest } from '@/lib/order-services/deliveryService';
import { proposeSettlement, proposeCancel, respondToAgreement } from '@/lib/order-services/agreementService';
import { cleanupDb } from '../helpers/cleanup';
import { confirmAndDeposit } from '../helpers/orderFlow';

type Seeded = Awaited<ReturnType<typeof seedDeposited>>;

async function seedDeposited(deliveryMethod: 'self_pickup' | 'carrier' = 'self_pickup') {
  const make = (name: string, phone: string, role: string) =>
    prisma.user.create({ data: { name, phone, address: 'addr', role, passwordHash: 'x' } });
  const farmer = await make('Farmer', '1', 'farmer');
  const buyer = await make('Buyer', '2', 'buyer');
  const stranger = await make('Stranger', '3', 'buyer');
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  const preOrder = await createPreOrder(buyer.id, {
    batchId: batch.id, quantity: 10, deliveryMethod, shippingFeeQuote: deliveryMethod === 'carrier' ? 50000 : undefined,
  });
  await confirmAndDeposit(preOrder.id, farmer.id);
  return { farmer, buyer, stranger, batch, preOrder };
}

async function seedDelivered(deliveryMethod: 'self_pickup' | 'carrier' = 'self_pickup') {
  const seeded = await seedDeposited(deliveryMethod);
  const farmer = { id: seeded.farmer.id, role: 'farmer' };
  await transitionPreOrderStatus(seeded.preOrder.id, 'mark_awaiting_harvest', farmer);
  await transitionPreOrderStatus(seeded.preOrder.id, 'mark_ready_for_handover', farmer);
  await transitionPreOrderStatus(seeded.preOrder.id, 'mark_delivered', farmer);
  return seeded;
}

const asFarmer = (seeded: { farmer: { id: string } }) => ({ id: seeded.farmer.id, role: 'farmer' });
const asBuyer = (seeded: { buyer: { id: string } }) => ({ id: seeded.buyer.id, role: 'buyer' });
const asStranger = (seeded: Seeded) => ({ id: seeded.stranger.id, role: 'buyer' });

describe('settlement agreement', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('only the buyer of a delivered order can propose, with a valid whole quantity', async () => {
    const seeded = await seedDelivered();

    await expect(proposeSettlement(seeded.preOrder.id, asFarmer(seeded), 10)).rejects.toMatchObject({ code: 'forbidden' });
    await expect(proposeSettlement(seeded.preOrder.id, asStranger(seeded), 10)).rejects.toMatchObject({ code: 'forbidden' });
    for (const quantity of [0, 11, 1.5]) {
      await expect(proposeSettlement(seeded.preOrder.id, asBuyer(seeded), quantity)).rejects.toMatchObject({ code: 'invalid_input' });
    }
    expect(await prisma.orderAgreement.count()).toBe(0);
  });

  it('cannot be proposed before the order is delivered', async () => {
    const seeded = await seedDeposited();

    await expect(proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 10)).rejects.toMatchObject({ code: 'invalid_state' });
  });

  it('allows only one open settlement proposal at a time', async () => {
    const seeded = await seedDelivered();
    await proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 10);

    await expect(proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 9)).rejects.toMatchObject({ code: 'agreement_pending' });
  });

  it('settles only after the farmer accepts, using the estimated shipping fee', async () => {
    const seeded = await seedDelivered('carrier');
    const agreement = await proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 10);

    const stillDelivered = await prisma.preOrder.findUnique({ where: { id: seeded.preOrder.id } });
    expect(stillDelivered?.status).toBe('delivered');

    await respondToAgreement(agreement.id, asFarmer(seeded), 'accept');

    const settled = await prisma.preOrder.findUnique({ where: { id: seeded.preOrder.id }, include: { settlement: true } });
    expect(settled?.status).toBe('settled');
    expect(settled?.settlement).toMatchObject({ finalQuantity: 10, finalGoodsAmount: 100000, shippingFee: 50000, finalPaymentAmount: 130000 });
    const finalPayments = await prisma.ledgerEntry.findMany({ where: { preOrderId: seeded.preOrder.id, type: 'final_payment' } });
    expect(finalPayments.map((entry) => entry.amount)).toEqual([130000]);
  });

  it('charges no shipping for a self-pickup order', async () => {
    const seeded = await seedDelivered('self_pickup');
    const agreement = await proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 10);

    await respondToAgreement(agreement.id, asFarmer(seeded), 'accept');

    const settlement = await prisma.settlement.findUnique({ where: { preOrderId: seeded.preOrder.id } });
    expect(settlement).toMatchObject({ shippingFee: 0, finalPaymentAmount: 80000 });
  });

  it('refuses the proposer accepting their own proposal and strangers responding', async () => {
    const seeded = await seedDelivered();
    const agreement = await proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 10);

    await expect(respondToAgreement(agreement.id, asBuyer(seeded), 'accept')).rejects.toMatchObject({ code: 'forbidden' });
    await expect(respondToAgreement(agreement.id, asStranger(seeded), 'accept')).rejects.toMatchObject({ code: 'forbidden' });
    expect(await prisma.settlement.count()).toBe(0);
  });

  it('keeps the order delivered when the farmer declines, and lets the buyer propose again', async () => {
    const seeded = await seedDelivered();
    const first = await proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 8);

    await respondToAgreement(first.id, asFarmer(seeded), 'decline');

    const declined = await prisma.orderAgreement.findUnique({ where: { id: first.id } });
    expect(declined?.status).toBe('declined');
    const second = await proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 10);
    expect(second.status).toBe('proposed');
    const order = await prisma.preOrder.findUnique({ where: { id: seeded.preOrder.id } });
    expect(order?.status).toBe('delivered');
  });

  it('cannot answer a proposal twice', async () => {
    const seeded = await seedDelivered();
    const agreement = await proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 10);
    await respondToAgreement(agreement.id, asFarmer(seeded), 'decline');

    await expect(respondToAgreement(agreement.id, asFarmer(seeded), 'accept')).rejects.toMatchObject({ code: 'invalid_state' });
  });

  it('refunds the surplus deposit in the ledger when the agreed goods are worth less than the deposit', async () => {
    const seeded = await seedDelivered();
    const agreement = await proposeSettlement(seeded.preOrder.id, asBuyer(seeded), 1);

    await respondToAgreement(agreement.id, asFarmer(seeded), 'accept');

    const settlement = await prisma.settlement.findUnique({ where: { preOrderId: seeded.preOrder.id } });
    expect(settlement).toMatchObject({ finalGoodsAmount: 10000, finalPaymentAmount: 0 });
    const refunds = await prisma.ledgerEntry.findMany({ where: { preOrderId: seeded.preOrder.id, type: 'deposit_refund' } });
    expect(refunds.map((entry) => entry.amount)).toEqual([10000]);
    const order = await prisma.preOrder.findUnique({ where: { id: seeded.preOrder.id } });
    expect(order?.status).toBe('settled');
  });
});

describe('cancel agreement for a deposited order', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('either party can propose a refund between 0 and the deposit, whole VND only', async () => {
    const seeded = await seedDeposited();

    for (const refundAmount of [-1, 20001, 100.5]) {
      await expect(proposeCancel(seeded.preOrder.id, asFarmer(seeded), refundAmount)).rejects.toMatchObject({ code: 'invalid_input' });
    }
    await expect(proposeCancel(seeded.preOrder.id, asStranger(seeded), 20000)).rejects.toMatchObject({ code: 'forbidden' });
    const byFarmer = await proposeCancel(seeded.preOrder.id, asFarmer(seeded), 20000);
    expect(byFarmer.proposedById).toBe(seeded.farmer.id);
  });

  it('cancels, restores the batch quantity and records the refund once the other party accepts', async () => {
    const seeded = await seedDeposited();
    const agreement = await proposeCancel(seeded.preOrder.id, asBuyer(seeded), 15000);

    await respondToAgreement(agreement.id, asFarmer(seeded), 'accept');

    const order = await prisma.preOrder.findUnique({ where: { id: seeded.preOrder.id } });
    expect(order?.status).toBe('cancelled');
    const batch = await prisma.harvestBatch.findUnique({ where: { id: seeded.batch.id } });
    expect(batch?.quantityAvailable).toBe(100);
    const refunds = await prisma.ledgerEntry.findMany({ where: { preOrderId: seeded.preOrder.id, type: 'deposit_refund' } });
    expect(refunds.map((entry) => entry.amount)).toEqual([15000]);
  });

  it('records no refund entry for a zero refund', async () => {
    const seeded = await seedDeposited();
    const agreement = await proposeCancel(seeded.preOrder.id, asFarmer(seeded), 0);

    await respondToAgreement(agreement.id, asBuyer(seeded), 'accept');

    expect(await prisma.ledgerEntry.count({ where: { type: 'deposit_refund' } })).toBe(0);
  });

  it('leaves the order deposited when declined and refuses self-acceptance', async () => {
    const seeded = await seedDeposited();
    const agreement = await proposeCancel(seeded.preOrder.id, asFarmer(seeded), 20000);

    await expect(respondToAgreement(agreement.id, asFarmer(seeded), 'accept')).rejects.toMatchObject({ code: 'forbidden' });
    await respondToAgreement(agreement.id, asBuyer(seeded), 'decline');

    const order = await prisma.preOrder.findUnique({ where: { id: seeded.preOrder.id } });
    expect(order?.status).toBe('deposited');
  });

  it('can only be proposed while the order is deposited', async () => {
    const seeded = await seedDelivered();

    await expect(proposeCancel(seeded.preOrder.id, asFarmer(seeded), 0)).rejects.toMatchObject({ code: 'invalid_state' });
  });
});

describe('stale and legacy edge cases', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('expires an open cancel proposal once the order moves on, so it cannot block later steps', async () => {
    const seeded = await seedDeposited();
    const agreement = await proposeCancel(seeded.preOrder.id, asBuyer(seeded), 0);

    await markBatchAwaitingHarvest(seeded.batch.id, seeded.farmer.id);

    const stale = await prisma.orderAgreement.findUnique({ where: { id: agreement.id } });
    expect(stale?.status).toBe('expired');
    await expect(respondToAgreement(agreement.id, asFarmer(seeded), 'accept')).rejects.toMatchObject({ code: 'invalid_state' });
  });

  it('refuses negotiate after the farmer already confirmed', async () => {
    const seeded = await seedPending();
    await confirmPreOrder(seeded.preOrder.id, asFarmer(seeded));

    await expect(transitionPreOrderStatus(seeded.preOrder.id, 'negotiate', asFarmer(seeded)))
      .rejects.toMatchObject({ code: 'invalid_transition' });
  });

  it.each([
    ['reject', 'farmer'],
    ['cancel', 'buyer'],
  ] as const)('records a full deposit refund when a legacy order holding a deposit is %s', async (event, role) => {
    const seeded = await seedPending();
    await prisma.deposit.create({ data: { preOrderId: seeded.preOrder.id, amount: 20000 } });
    const actor = { id: role === 'farmer' ? seeded.farmer.id : seeded.buyer.id, role };

    await transitionPreOrderStatus(seeded.preOrder.id, event, actor);

    const refunds = await prisma.ledgerEntry.findMany({ where: { preOrderId: seeded.preOrder.id, type: 'deposit_refund' } });
    expect(refunds.map((entry) => entry.amount)).toEqual([20000]);
  });
});

async function seedPending() {
  const farmer = await prisma.user.create({ data: { name: 'F', phone: '11', address: 'A', role: 'farmer', passwordHash: 'x' } });
  const buyer = await prisma.user.create({ data: { name: 'B', phone: '12', address: 'B', role: 'buyer', passwordHash: 'x' } });
  const batch = await prisma.harvestBatch.create({
    data: { farmerId: farmer.id, cropName: 'Ca chua', quantityTotal: 100, quantityAvailable: 100, unit: 'kg', pricePerUnit: 10000, harvestDateEstimate: new Date() },
  });
  const preOrder = await createPreOrder(buyer.id, { batchId: batch.id, quantity: 10 });
  return { farmer, buyer, batch, preOrder };
}
