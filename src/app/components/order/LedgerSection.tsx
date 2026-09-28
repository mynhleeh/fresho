'use client';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { LedgerHistory } from './LedgerHistory';
import styles from './LedgerHistory.module.css';

type LedgerEntryView = { id: string; type: string; amount: number; createdAt: string };

type LedgerState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; entries: LedgerEntryView[] };

function useLedgerEntries(preOrderId: string, versionKey: string) {
  const [state, setState] = useState<LedgerState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/preorders/${preOrderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((detail) => {
        if (cancelled) return;
        setState((previous) => {
          if (detail) return { status: 'ready', entries: detail.ledgerEntries ?? [] };
          return previous.status === 'ready' ? previous : { status: 'error' };
        });
      })
      .catch(() => { if (!cancelled) setState((previous) => (previous.status === 'ready' ? previous : { status: 'error' })); });
    return () => { cancelled = true; };
  }, [preOrderId, versionKey, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((count) => count + 1);
  }, []);

  return { state, retry };
}

export function LedgerSection({ preOrderId, versionKey }: { preOrderId: string; versionKey: string }) {
  const { state, retry } = useLedgerEntries(preOrderId, versionKey);

  if (state.status === 'loading') return <p className={styles.empty} role="status">Đang tải lịch sử tiền...</p>;
  if (state.status === 'error') {
    return (
      <div role="alert">
        <p className={styles.empty}>Chưa tải được lịch sử tiền. Kiểm tra kết nối rồi thử lại.</p>
        <Button variant="outline" onClick={retry}>Thử lại</Button>
      </div>
    );
  }
  return <LedgerHistory entries={state.entries} />;
}
