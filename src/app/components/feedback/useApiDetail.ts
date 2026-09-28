'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NETWORK_ERROR_MESSAGE, readApiErrorMessage } from '@/lib/apiErrorMessage';

type DetailState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string; missing: boolean }
  | { status: 'ready'; data: T };

const MISSING_STATUSES = [403, 404];

export function useApiDetail<T>(url: string, pollMs?: number) {
  const [state, setState] = useState<DetailState<T>>({ status: 'loading' });
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current;
    const res = await fetch(url).catch(() => null);
    if (requestId !== latestRequest.current) return;
    if (!res || !res.ok) {
      const missing = res !== null && MISSING_STATUSES.includes(res.status);
      const message = await readApiErrorMessage(res);
      if (requestId !== latestRequest.current) return;
      setState((previous) => (previous.status === 'ready' && !missing ? previous : { status: 'error', message, missing }));
      return;
    }
    const data: T | null = await res.json().catch(() => null);
    if (requestId !== latestRequest.current) return;
    if (data) setState({ status: 'ready', data });
    else setState((previous) => (previous.status === 'ready' ? previous : { status: 'error', message: NETWORK_ERROR_MESSAGE, missing: false }));
  }, [url]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!pollMs) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') reload();
    }, pollMs);
    return () => clearInterval(timer);
  }, [reload, pollMs]);

  return { state, reload };
}
