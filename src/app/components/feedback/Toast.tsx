'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircleIcon, WarningIcon } from '../ui/icons';
import styles from './Toast.module.css';

type ToastMessage = { id: number; tone: 'success' | 'error'; text: string };

const TOAST_DURATION_MS = 4500;

export function useToast() {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((tone: ToastMessage['tone'], text: string) => {
    nextId.current += 1;
    setMessage({ id: nextId.current, tone, text });
  }, []);

  useEffect(() => {
    if (!message || message.tone === 'error') return;
    const timer = setTimeout(() => setMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message]);

  const dismissToast = useCallback(() => setMessage(null), []);

  return { message, showToast, dismissToast };
}

export function Toast({ message, onDismiss }: { message: ToastMessage | null; onDismiss: () => void }) {
  const Icon = message?.tone === 'error' ? WarningIcon : CheckCircleIcon;
  return (
    <div className={styles.region} role="status" aria-live="polite" aria-atomic="true">
      {message && (
        <div key={message.id} className={`${styles.toast} ${styles[message.tone]}`} role={message.tone === 'error' ? 'alert' : undefined}>
          <Icon className={styles.icon} />
          <span className={styles.text}>{message.text}</span>
          <button type="button" className={styles.close} onClick={onDismiss} aria-label="Đóng thông báo">×</button>
        </div>
      )}
    </div>
  );
}
