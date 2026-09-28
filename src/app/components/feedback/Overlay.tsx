'use client';
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Overlay.module.css';

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function useFocusRestore(open: boolean, panelRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => opener?.focus();
  }, [open, panelRef]);
}

function useBodyScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
}

function trapTab(event: KeyboardEvent<HTMLDivElement>, panel: HTMLDivElement) {
  const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === panel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function Overlay({
  open,
  onClose,
  label,
  dismissible = true,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label?: string;
  dismissible?: boolean;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusRestore(open, panelRef);
  useBodyScrollLock(open);

  if (!open) return null;

  const requestClose = () => {
    if (dismissible) onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      requestClose();
    } else if (event.key === 'Tab' && panelRef.current) {
      trapTab(event, panelRef.current);
    }
  };

  return (
    <div className={styles.backdrop} onClick={requestClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
}
