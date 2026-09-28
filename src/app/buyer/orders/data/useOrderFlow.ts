'use client';
import { useState } from 'react';
import { useAgreementActions } from '../../../components/agreement/useAgreementActions';
import { useOrderActions } from './useOrderActions';
import type { BuyerPreOrder } from './orderView';

type ShowToast = (tone: 'success' | 'error', text: string) => void;
type FlowStep = 'deposit' | 'cancel' | 'arrival' | 'cancel_proposal' | 'report';
type PendingStep = { step: FlowStep; order: BuyerPreOrder };

export function useOrderFlow(reload: () => void, showToast: ShowToast) {
  const actions = useOrderActions(reload, showToast);
  const agreements = useAgreementActions(showToast, reload);
  const [pending, setPending] = useState<PendingStep | null>(null);

  const openStep = (step: FlowStep) => (order: BuyerPreOrder) => setPending({ step, order });
  const closeStep = () => setPending(null);

  async function confirmPending(run: (order: BuyerPreOrder) => Promise<boolean>) {
    if (!pending) return;
    await run(pending.order);
    closeStep();
  }

  async function submitCancelProposal(refundAmount: number) {
    if (!pending) return;
    const sent = await agreements.proposeCancel(pending.order.id, refundAmount);
    if (sent) closeStep();
  }

  function finishReport() {
    closeStep();
    showToast('success', 'Đã gửi báo cáo vấn đề, đội ngũ hỗ trợ sẽ xử lý.');
    reload();
  }

  return {
    pending,
    busy: actions.busy,
    agreementBusy: agreements.busy,
    openDeposit: openStep('deposit'),
    openCancel: openStep('cancel'),
    openArrival: openStep('arrival'),
    openCancelProposal: openStep('cancel_proposal'),
    openReport: openStep('report'),
    closeStep,
    confirmDeposit: () => confirmPending(actions.payDeposit),
    confirmCancel: () => confirmPending(actions.cancelOrder),
    confirmArrival: () => confirmPending(actions.confirmArrival),
    submitCancelProposal,
    finishReport,
    respond: agreements.respond,
    proposeSettlement: agreements.proposeSettlement,
  };
}

export type OrderFlow = ReturnType<typeof useOrderFlow>;
