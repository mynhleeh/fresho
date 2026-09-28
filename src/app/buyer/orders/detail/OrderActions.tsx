import { Button } from '../../../components/ui/Button';
import { ButtonLink } from '../../../components/ui/ButtonLink';
import { ActionGroup } from '../../../components/ui/ActionGroup';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import type { OrderFlow } from '../data/useOrderFlow';
import {
  canBuyerCancel, canReportIssue, getDepositDue, getOrderPrimaryAction, type BuyerOrderDetail,
} from '../data/orderView';

type ActionProps = { order: BuyerOrderDetail; alreadyRated: boolean; flow: OrderFlow };

export function hasPrimaryAction(order: BuyerOrderDetail, alreadyRated: boolean): boolean {
  const action = getOrderPrimaryAction(order);
  return action === 'pay_deposit' || action === 'confirm_arrival' || action === 'propose_settlement' || (action === 'rate_farmer' && !alreadyRated);
}

function PrimaryButton({ order, alreadyRated, flow }: ActionProps) {
  const action = getOrderPrimaryAction(order);
  if (action === 'pay_deposit') return <Button disabled={flow.busy} onClick={() => flow.openDeposit(order)}>Đặt cọc {formatVnd(getDepositDue(order))}</Button>;
  if (action === 'confirm_arrival') return <Button disabled={flow.busy} onClick={() => flow.openArrival(order)}>Đã nhận hàng</Button>;
  if (action === 'propose_settlement') return <ButtonLink href="#settlement-form">Xác nhận số lượng thực nhận</ButtonLink>;
  if (action === 'rate_farmer' && !alreadyRated) return <ButtonLink href="#rating-form">Đánh giá nông dân</ButtonLink>;
  return null;
}

export function PrimaryActionGroup(props: ActionProps) {
  return <ActionGroup><PrimaryButton {...props} /></ActionGroup>;
}

export function OrderActions(props: ActionProps) {
  const { order, flow } = props;
  return (
    <ActionGroup>
      <PrimaryButton {...props} />
      {canReportIssue(order) && <Button variant="outline" disabled={flow.busy} onClick={() => flow.openReport(order)}>Báo vấn đề</Button>}
      {canBuyerCancel(order) && <Button variant="ghost" disabled={flow.busy} onClick={() => flow.openCancel(order)}>Hủy đơn</Button>}
    </ActionGroup>
  );
}
