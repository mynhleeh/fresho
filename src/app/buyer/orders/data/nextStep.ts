import { describeBuyerWaiting } from '@/lib/order/orderDisplayText';
import { getOrderPrimaryAction, type BuyerPreOrder } from './orderView';

const NEXT_STEP_BY_ACTION: Record<string, string> = {
  respond_agreement: 'Có đề xuất cần bạn phản hồi',
  pay_deposit: 'Nông dân đã xác nhận. Đặt cọc để giữ hàng.',
  confirm_arrival: 'Xác nhận khi hàng đã đến tay bạn.',
  propose_settlement: 'Xác nhận số lượng thực nhận để đối soát.',
  wait_for_agreement: 'Đang chờ nông dân phản hồi đề xuất',
  wait_for_farmer: 'Đang chờ nông dân xác nhận',
};

export function describeNextStep(order: BuyerPreOrder, alreadyRated: boolean): string {
  const action = getOrderPrimaryAction(order);
  if (NEXT_STEP_BY_ACTION[action]) return NEXT_STEP_BY_ACTION[action];
  if (action === 'rate_farmer') return alreadyRated ? '' : 'Đơn đã hoàn tất. Hãy đánh giá nông dân.';
  return describeBuyerWaiting(order.status, order.deliveryMethod);
}
