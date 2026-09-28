'use client';
import { useCallback, useState } from 'react';
import { CONFIRM_COPY, type ActionKind } from './orderActionCopy';
import type { FarmerPreOrder } from './orderTypes';

type PendingAction = { order: FarmerPreOrder; kind: ActionKind };
type RunAction = (order: FarmerPreOrder, kind: ActionKind) => Promise<boolean>;

export function useActionRequests(run: RunAction, onRejected?: () => void) {
  const [pending, setPending] = useState<PendingAction | null>(null);

  const requestAction = useCallback((order: FarmerPreOrder, kind: ActionKind) => {
    if (CONFIRM_COPY[kind]) setPending({ order, kind });
    else run(order, kind);
  }, [run]);

  const confirmPending = useCallback(async () => {
    if (!pending) return;
    const { order, kind } = pending;
    const done = await run(order, kind);
    setPending(null);
    if (done && kind === 'reject') onRejected?.();
  }, [pending, run, onRejected]);

  const dismissPending = useCallback(() => setPending(null), []);

  return { pending, requestAction, confirmPending, dismissPending };
}
