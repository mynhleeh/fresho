import { calculateGoodsAmount } from '@/lib/order/orderPricing';
import { calculateDepositAmount, DEPOSIT_PERCENT } from '@/lib/order/depositAmount';
import { preOrderDisplayInfo } from '@/lib/order/orderStatus';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { buyerOrderGroup, buyerPrimaryAction, toOpenAgreement, type BuyerGroup, type OrderSnapshot } from '@/lib/order/orderWorkflow';
import type { AgreementView } from '../../../components/agreement/AgreementBanner';

export type BuyerPreOrder = {
  id: string;
  buyerId: string;
  farmerConfirmedAt: string | null;
  agreements: AgreementView[];
  quantity: number;
  pricePerUnit: number;
  deliveryMethod: string;
  shippingFeeQuote: number | null;
  status: string;
  batch: {
    id: string;
    cropName: string;
    unit: string;
    harvestDateEstimate: string;
    farmer: { id: string; name: string; trustScore: number; phone?: string | null; address?: string | null };
  };
  deposits: { amount: number }[];
  settlement: { finalPaymentAmount: number; finalGoodsAmount: number; shippingFee: number } | null;
  ratings: { raterId: string }[];
  delivery: { status: string; trackingNote: string | null; method: string } | null;
  disputes: { id: string; status: string }[];
};

export type OrderMoney = {
  goodsAmount: number;
  shippingFee: number;
  paidAmount: number;
  remainingAmount: number;
  isFinal: boolean;
};

export function toSnapshot(order: BuyerPreOrder): OrderSnapshot {
  return {
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    depositCount: order.deposits.length,
    farmerConfirmed: order.farmerConfirmedAt != null,
    agreement: toOpenAgreement(order.agreements, order.buyerId),
  };
}

export function getOrderPrimaryAction(order: BuyerPreOrder) {
  return buyerPrimaryAction(toSnapshot(order));
}

export function getOrderGroup(order: BuyerPreOrder): BuyerGroup {
  return buyerOrderGroup(toSnapshot(order));
}

export function getOrderStatusInfo(order: BuyerPreOrder) {
  return preOrderDisplayInfo(order.status, order.farmerConfirmedAt != null);
}

export function getOpenAgreement(order: BuyerPreOrder): AgreementView | null {
  return order.agreements.find((agreement) => agreement.status === 'proposed') ?? null;
}

export function getEstimatedShipping(order: BuyerPreOrder): number {
  return order.deliveryMethod === 'carrier' ? order.shippingFeeQuote ?? 0 : 0;
}

export function getGoodsAmount(order: BuyerPreOrder): number {
  return calculateGoodsAmount(order.quantity, order.pricePerUnit);
}

export function getDepositDue(order: BuyerPreOrder): number {
  return calculateDepositAmount(getGoodsAmount(order));
}

function describeShippingLine(order: BuyerPreOrder): string {
  if (order.deliveryMethod !== 'carrier') return ' Không có cước vận chuyển vì bạn tự đến lấy hàng.';
  return order.shippingFeeQuote ? ` Cước vận chuyển ước tính ${formatVnd(order.shippingFeeQuote)}.` : ' Cước vận chuyển: chưa báo giá.';
}

export function describeDepositCost(order: BuyerPreOrder): string {
  const goods = `Tiền hàng ${formatVnd(getGoodsAmount(order))}`;
  const deposit = `Nông dân đã xác nhận đơn. Bạn đặt cọc ${DEPOSIT_PERCENT}% tiền hàng: ${formatVnd(getDepositDue(order))}, thanh toán ngay.`;
  const shipping = describeShippingLine(order);
  return `${goods}. ${deposit}${shipping} Phần còn lại thanh toán sau khi bạn nhận hàng.`;
}

export function sumDeposits(order: BuyerPreOrder): number {
  return order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
}

export function getOrderMoney(order: BuyerPreOrder): OrderMoney {
  const paidAmount = sumDeposits(order);
  if (order.settlement) {
    const { finalGoodsAmount, shippingFee, finalPaymentAmount } = order.settlement;
    return { goodsAmount: finalGoodsAmount, shippingFee, paidAmount: paidAmount + finalPaymentAmount, remainingAmount: 0, isFinal: true };
  }
  const shippingFee = getEstimatedShipping(order);
  const remainingAmount = Math.max(0, getGoodsAmount(order) + shippingFee - paidAmount);
  return { goodsAmount: getGoodsAmount(order), shippingFee, paidAmount, remainingAmount, isFinal: false };
}

export function isTerminalStatus(status: string): boolean {
  return status === 'settled' || status === 'rejected' || status === 'cancelled';
}

export function canBuyerCancel(order: BuyerPreOrder): boolean {
  return order.status === 'pending_confirmation' || order.status === 'negotiating';
}

export function canProposeCancel(order: BuyerPreOrder): boolean {
  return order.status === 'deposited' && getOpenAgreement(order) === null;
}

export function canReportIssue(order: BuyerPreOrder): boolean {
  return order.status === 'in_transit' || order.status === 'delivered';
}

export function totalRemaining(orders: BuyerPreOrder[]): number {
  return orders
    .filter((order) => !isTerminalStatus(order.status))
    .reduce((sum, order) => sum + getOrderMoney(order).remainingAmount, 0);
}
