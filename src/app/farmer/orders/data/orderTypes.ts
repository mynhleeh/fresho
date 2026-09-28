import { calculateGoodsAmount } from '@/lib/order/orderPricing';
import type { AgreementView } from '../../../components/agreement/AgreementBanner';
import { buildTimeline, toOpenAgreement, farmerOrderGroup, farmerPrimaryAction, type FarmerAction, type FarmerGroup, type OrderSnapshot } from '@/lib/order/orderWorkflow';

export type FarmerPreOrder = {
  id: string;
  batchId: string;
  quantity: number;
  pricePerUnit: number;
  deliveryMethod: 'self_pickup' | 'carrier';
  status: string;
  farmerConfirmedAt: string | null;
  agreements: AgreementView[];
  buyer: { id: string; name: string; trustScore: number; phone?: string; address?: string };
  batch: { cropName: string; unit?: string; quantityTotal: number; harvestDateEstimate?: string };
  deposits: { amount: number }[];
  ratings: { raterId: string }[];
  settlement: { finalGoodsAmount: number } | null;
};

export type OrderMoney = { goods: number; deposit: number; expected: number };

export const GROUP_LABEL: Record<FarmerGroup, string> = {
  needs_action: 'Cần xử lý',
  in_progress: 'Đang theo dõi',
  done: 'Đã hoàn tất',
};

export function toSnapshot(order: FarmerPreOrder): OrderSnapshot {
  return {
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    depositCount: order.deposits.length,
    farmerConfirmed: order.farmerConfirmedAt != null,
    agreement: toOpenAgreement(order.agreements, order.buyer.id),
  };
}

export function groupOf(order: FarmerPreOrder): FarmerGroup {
  return farmerOrderGroup(toSnapshot(order));
}

export function actionOf(order: FarmerPreOrder): FarmerAction {
  return farmerPrimaryAction(toSnapshot(order));
}

export function moneyOf(order: FarmerPreOrder): OrderMoney {
  const goods = calculateGoodsAmount(order.quantity, order.pricePerUnit);
  const deposit = order.deposits.reduce((sum, entry) => sum + entry.amount, 0);
  // TODO(business-confirm): docs define no platform commission; expected amount = goods amount.
  return { goods, deposit, expected: order.settlement?.finalGoodsAmount ?? goods };
}

export function progressPercentOf(status: string): number {
  const steps = buildTimeline(status);
  if (status === 'settled') return 100;
  const reached = steps.findIndex((step) => step.state === 'current');
  return reached < 0 ? 0 : Math.round(((reached + 1) / steps.length) * 100);
}

export function countByGroup(orders: FarmerPreOrder[]): Record<FarmerGroup, number> {
  const counts: Record<FarmerGroup, number> = { needs_action: 0, in_progress: 0, done: 0 };
  orders.forEach((order) => { counts[groupOf(order)] += 1; });
  return counts;
}

export function sumExpected(orders: FarmerPreOrder[]): number {
  return orders
    .filter((order) => !['rejected', 'cancelled'].includes(order.status))
    .reduce((sum, order) => sum + moneyOf(order).expected, 0);
}
