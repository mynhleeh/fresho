'use client';
import { useCallback, useState } from 'react';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import { getDepositDue, type BuyerPreOrder } from './orderView';

type ShowToast = (tone: 'success' | 'error', text: string) => void;

function jsonRequest(method: string, body?: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) };
}

export function useOrderActions(reload: () => void, showToast: ShowToast) {
  const [busy, setBusy] = useState(false);

  const runAction = useCallback(async (url: string, init: RequestInit, successText: string): Promise<boolean> => {
    setBusy(true);
    try {
      const res = await fetch(url, init).catch(() => null);
      if (!res || !res.ok) {
        showToast('error', await readApiErrorMessage(res));
        return false;
      }
      showToast('success', successText);
      reload();
      return true;
    } finally {
      setBusy(false);
    }
  }, [reload, showToast]);

  const payDeposit = (order: BuyerPreOrder) =>
    runAction(`/api/preorders/${order.id}/deposit`, jsonRequest('POST', { amount: getDepositDue(order) }), 'Đã đặt cọc. Nông dân sẽ chuẩn bị hàng cho bạn.');

  const cancelOrder = (order: BuyerPreOrder) =>
    runAction(`/api/preorders/${order.id}/cancel`, jsonRequest('PATCH'), 'Đã hủy đơn hàng.');

  const confirmArrival = (order: BuyerPreOrder) =>
    runAction(`/api/deliveries/${order.id}`, jsonRequest('POST', { status: 'delivered' }), 'Đã xác nhận nhận hàng. Hãy nhập số lượng thực nhận.');

  return { busy, payDeposit, cancelOrder, confirmArrival };
}
