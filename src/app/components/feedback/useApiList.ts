'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NETWORK_ERROR_MESSAGE, readApiErrorMessage } from '@/lib/apiErrorMessage';

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: T[] };

export function useApiList<T>(url: string, refreshKey = 0, pollMs?: number) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current;
    const res = await fetch(url).catch(() => null);
    if (requestId !== latestRequest.current) return;
    if (!res || !res.ok) {
      const message = await readApiErrorMessage(res);
      if (requestId !== latestRequest.current) return;
      setState((previous) => (previous.status === 'ready' ? previous : { status: 'error', message }));
      return;
    }
    const items: T[] | null = await res.json().catch(() => null);
    if (requestId !== latestRequest.current) return;
    if (items) setState({ status: 'ready', items });
    else setState((previous) => (previous.status === 'ready' ? previous : { status: 'error', message: NETWORK_ERROR_MESSAGE }));
  }, [url]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { reload(); }, [reload, refreshKey]);

  useEffect(() => {
    if (!pollMs) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') reload();
    }, pollMs);
    return () => clearInterval(timer);
  }, [reload, pollMs]);

  return { state, reload };
}
