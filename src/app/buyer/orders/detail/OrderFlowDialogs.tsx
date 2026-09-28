'use client';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { CancelProposalDialog } from '../../../components/agreement/CancelProposalDialog';
import { describeDepositCost, sumDeposits } from '../data/orderView';
import type { OrderFlow } from '../data/useOrderFlow';
import { ReportIssueDialog } from './ReportIssueDialog';

export function OrderFlowDialogs({ flow }: { flow: OrderFlow }) {
  const { pending } = flow;
  const isOpen = (step: string) => pending?.step === step;
  return (
    <>
      <ConfirmDialog
        open={isOpen('deposit')}
        title="Xác nhận đặt cọc"
        description={pending ? describeDepositCost(pending.order) : ''}
        confirmLabel="Đặt cọc"
        loading={flow.busy}
        onConfirm={flow.confirmDeposit}
        onCancel={flow.closeStep}
      />
      <ConfirmDialog
        open={isOpen('arrival')}
        title="Xác nhận đã nhận hàng?"
        description="Hãy chắc chắn hàng đã đến tay bạn. Bước tiếp theo bạn sẽ nhập số lượng thực nhận để nông dân xác nhận."
        confirmLabel="Đã nhận hàng"
        loading={flow.busy}
        onConfirm={flow.confirmArrival}
        onCancel={flow.closeStep}
      />
      <CancelProposalDialog
        key={pending?.order.id ?? 'cancel-proposal-closed'}
        open={isOpen('cancel_proposal')}
        depositTotal={pending ? sumDeposits(pending.order) : 0}
        busy={flow.agreementBusy}
        onSubmit={flow.submitCancelProposal}
        onClose={flow.closeStep}
      />
      <ConfirmDialog
        open={isOpen('cancel')}
        danger
        title="Hủy đơn hàng này?"
        description="Đơn sẽ dừng lại và không thể khôi phục. Đơn chưa có tiền cọc nên bạn không mất khoản nào."
        confirmLabel="Hủy đơn"
        loading={flow.busy}
        onConfirm={flow.confirmCancel}
        onCancel={flow.closeStep}
      />
      <ReportIssueDialog
        key={pending?.order.id ?? 'report-closed'}
        preOrderId={isOpen('report') && pending ? pending.order.id : null}
        onClose={flow.closeStep}
        onReported={flow.finishReport}
      />
    </>
  );
}
