import { prisma } from '@/lib/db';
import { confirmPreOrder, transitionPreOrderStatus } from '@/lib/order-services/preOrderService';
import { calculateDepositAmount } from '@/lib/order/depositAmount';
import { calculateGoodsAmount } from '@/lib/order/orderPricing';
import { payDeposit } from '@/lib/order-services/depositService';
import { markBatchAwaitingHarvest, markBatchReadyForHandover, updateDeliveryStatus } from '@/lib/order-services/deliveryService';
import { proposeSettlement, respondToAgreement } from '@/lib/order-services/agreementService';
import type { DemoPreOrderTargetStatus } from './seedData';

export async function advanceDemoPreOrder(
  preOrderId: string,
  batchId: string,
  farmerId: string,
  buyerId: string,
  logisticsUserId: string,
  target: DemoPreOrderTargetStatus,
): Promise<void> {
  if (target === 'pending_confirmation') return;

  if (target === 'rejected') {
    await transitionPreOrderStatus(preOrderId, 'reject', { id: farmerId, role: 'farmer' });
    return;
  }
  if (target === 'cancelled') {
    await transitionPreOrderStatus(preOrderId, 'cancel', { id: buyerId, role: 'buyer' });
    return;
  }
  if (target === 'negotiating') {
    await transitionPreOrderStatus(preOrderId, 'negotiate', { id: farmerId, role: 'farmer' });
    return;
  }

  const preOrder = await prisma.preOrder.findUniqueOrThrow({ where: { id: preOrderId } });
  await confirmPreOrder(preOrderId, { id: farmerId, role: 'farmer' });
  await payDeposit(preOrderId, calculateDepositAmount(calculateGoodsAmount(preOrder.quantity, preOrder.pricePerUnit)));
  if (target === 'deposited') return;

  const needsCarrier = target === 'in_transit' || target === 'delivered' || target === 'settled';
  if (needsCarrier) {
    await prisma.preOrder.update({ where: { id: preOrderId }, data: { deliveryMethod: 'carrier', shippingFeeQuote: 0 } });
  }
  await markBatchAwaitingHarvest(batchId, farmerId);
  if (target === 'awaiting_harvest') return;

  await markBatchReadyForHandover(batchId, farmerId);
  if (target === 'ready_for_handover') return;

  await prisma.deliveryRecord.update({ where: { preOrderId }, data: { logisticsPartnerId: logisticsUserId } });
  await updateDeliveryStatus(preOrderId, { id: logisticsUserId, role: 'logistics' }, 'in_transit');
  if (target === 'in_transit') return;

  await updateDeliveryStatus(preOrderId, { id: logisticsUserId, role: 'logistics' }, 'delivered');
  if (target === 'delivered') return;

  const agreement = await proposeSettlement(preOrderId, { id: buyerId, role: 'buyer' }, preOrder.quantity);
  await respondToAgreement(agreement.id, { id: farmerId, role: 'farmer' }, 'accept');
}
