'use client';
import { useCallback, useState } from 'react';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import { SUCCESS_TEXT, type ActionKind } from './orderActionCopy';
import type { FarmerPreOrder } from './orderTypes';

type ShowToast = (tone: 'success' | 'error', text: string) => void;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function requestFor(order: FarmerPreOrder, kind: ActionKind): Promise<Response> {
  if (kind === 'start_harvest_wait') return fetch(`/api/batches/${order.batchId}/awaiting-harvest`, { method: 'POST' });
  if (kind === 'mark_ready_for_handover') return fetch(`/api/batches/${order.batchId}/ready-for-handover`, { method: 'POST' });
  if (kind === 'confirm_self_pickup') {
    return fetch(`/api/deliveries/${order.id}`, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ status: 'delivered' }) });
  }
  if (kind === 'hand_to_carrier') {
    return fetch(`/api/deliveries/${order.id}`, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ status: 'in_transit' }) });
  }
  return fetch(`/api/preorders/${order.id}/${kind}`, { method: 'PATCH' });
}

export function useOrderActions(showToast: ShowToast, onDone: () => void) {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (order: FarmerPreOrder, kind: ActionKind) => {
    setBusy(true);
    try {
      const res = await requestFor(order, kind).catch(() => null);
      if (!res || !res.ok) {
        showToast('error', await readApiErrorMessage(res));
        return false;
      }
      showToast('success', SUCCESS_TEXT[kind]);
      onDone();
      return true;
    } finally {
      setBusy(false);
    }
  }, [showToast, onDone]);

  return { busy, run };
}
