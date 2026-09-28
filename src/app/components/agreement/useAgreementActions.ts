'use client';
import { useCallback, useState } from 'react';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';

type ShowToast = (tone: 'success' | 'error', text: string) => void;
type Decision = 'accept' | 'decline';

const RESPONSE_TEXT: Record<string, Record<Decision, string>> = {
  settlement: { accept: 'Đã đồng ý số lượng thực nhận. Đơn được đối soát theo số lượng này.', decline: 'Đã không đồng ý. Đơn giữ nguyên, người mua có thể đề xuất lại hoặc báo vấn đề.' },
  cancel: { accept: 'Đã đồng ý hủy đơn.', decline: 'Đã không đồng ý hủy đơn. Đơn giữ nguyên.' },
};

function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export function useAgreementActions(showToast: ShowToast, onDone: () => void) {
  const [busy, setBusy] = useState(false);

  const send = useCallback(async (request: Promise<Response>, successText: string): Promise<boolean> => {
    setBusy(true);
    try {
      const res = await request.catch(() => null);
      if (!res || !res.ok) {
        showToast('error', await readApiErrorMessage(res));
        return false;
      }
      showToast('success', successText);
      onDone();
      return true;
    } finally {
      setBusy(false);
    }
  }, [showToast, onDone]);

  const proposeCancel = (preOrderId: string, refundAmount: number) =>
    send(postJson(`/api/preorders/${preOrderId}/agreements`, { kind: 'cancel', refundAmount }), 'Đã gửi đề nghị hủy đơn. Đơn chỉ hủy khi bên kia đồng ý.');

  const proposeSettlement = (preOrderId: string, finalQuantity: number) =>
    send(postJson(`/api/preorders/${preOrderId}/agreements`, { kind: 'settlement', finalQuantity }), 'Đã gửi số lượng thực nhận. Đơn hoàn tất khi nông dân đồng ý.');

  const respond = (agreement: { id: string; kind: string }, decision: Decision) =>
    send(postJson(`/api/agreements/${agreement.id}/respond`, { decision }), RESPONSE_TEXT[agreement.kind]?.[decision] ?? 'Đã gửi phản hồi.');

  return { busy, proposeCancel, proposeSettlement, respond };
}
