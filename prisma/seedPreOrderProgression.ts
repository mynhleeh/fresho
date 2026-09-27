import { prisma } from '@/lib/db';
import { transitionPreOrderStatus } from '@/lib/services/preOrderService';
import { payDeposit } from '@/lib/services/depositService';
import { markBatchAwaitingHarvest, markBatchReadyForHandover, updateDeliveryStatus } from '@/lib/services/deliveryService';
import { settlePreOrder } from '@/lib/services/settlementService';
import type { DemoPreOrderTargetStatus } from './seedData';

// Advances a freshly created pre_order through the exact event sequence required by
// preOrderService's state machine (00-project-charter.rule.md §4) to reach `target`,
// reusing existing services rather than writing new status/deposit logic for seed data.
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
  // TODO(business-confirm): demo deposit is a flat 20% of goods value; real deposit terms are negotiated per order.
  const depositAmount = Math.round(preOrder.quantity * preOrder.pricePerUnit * 0.2);
  await payDeposit(preOrderId, depositAmount);
  await transitionPreOrderStatus(preOrderId, 'confirm', { id: farmerId, role: 'farmer' });
  if (target === 'deposited') return;

  await markBatchAwaitingHarvest(batchId, farmerId);
  if (target === 'awaiting_harvest') return;

  await markBatchReadyForHandover(batchId, farmerId);
  if (target === 'ready_for_handover') return;

  await prisma.deliveryRecord.update({ where: { preOrderId }, data: { logisticsPartnerId: logisticsUserId } });
  await updateDeliveryStatus(preOrderId, { id: logisticsUserId, role: 'logistics' }, 'in_transit');
  if (target === 'in_transit') return;

  await updateDeliveryStatus(preOrderId, { id: logisticsUserId, role: 'logistics' }, 'delivered');
  if (target === 'delivered') return;

  // TODO(business-confirm): demo settlement assumes no quantity shrinkage and a zero shipping fee.
  await settlePreOrder(preOrderId, { finalQuantity: preOrder.quantity, shippingFee: 0 });
}
