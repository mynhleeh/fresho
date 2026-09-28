import type { ReactNode } from 'react';
import { ActionGroup } from '../../../components/ui/ActionGroup';
import { Button } from '../../../components/ui/Button';
import { ButtonLink } from '../../../components/ui/ButtonLink';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { DEPOSIT_PERCENT } from '@/lib/order/depositAmount';
import { getDepositDue, getOrderPrimaryAction, type BuyerPreOrder } from '../data/orderView';

type QuickActionProps = {
  order: BuyerPreOrder;
  alreadyRated: boolean;
  busy: boolean;
  onPayDeposit: (order: BuyerPreOrder) => void;
  onConfirmArrival: (order: BuyerPreOrder) => void;
};

function quickActionButton({ order, alreadyRated, busy, onPayDeposit, onConfirmArrival }: QuickActionProps): ReactNode {
  const action = getOrderPrimaryAction(order);
  const detailHref = `/buyer/orders/${order.id}`;
  if (action === 'pay_deposit') {
    return <Button disabled={busy} onClick={() => onPayDeposit(order)}>Đặt cọc {formatVnd(getDepositDue(order))} ({DEPOSIT_PERCENT}%)</Button>;
  }
  if (action === 'confirm_arrival') return <Button disabled={busy} onClick={() => onConfirmArrival(order)}>Đã nhận hàng</Button>;
  if (action === 'propose_settlement') return <ButtonLink href={`${detailHref}#settlement-form`}>Xác nhận số lượng thực nhận</ButtonLink>;
  if (action === 'rate_farmer' && !alreadyRated) return <ButtonLink href={`${detailHref}#rating-form`}>Đánh giá nông dân</ButtonLink>;
  return null;
}

export function QuickAction(props: QuickActionProps) {
  const button = quickActionButton(props);
  return button ? <ActionGroup>{button}</ActionGroup> : null;
}
