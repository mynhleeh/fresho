'use client';
import { useState } from 'react';
import { ActionGroup } from '../ui/ActionGroup';
import { Button } from '../ui/Button';
import { formatVnd } from '../order/MoneySummaryRow';
import styles from './AgreementBanner.module.css';

export type AgreementView = {
  id: string;
  kind: string;
  proposedById: string;
  finalQuantity: number | null;
  refundAmount: number | null;
  status: string;
};

type Props = {
  agreement: AgreementView;
  viewerId: string;
  proposerName: string;
  unit: string;
  busy: boolean;
  onRespond: (agreement: AgreementView, decision: 'accept' | 'decline') => void;
};

const DISMISS_KEY_PREFIX = 'agreement-dismissed:';

function readDismissed(agreementId: string): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY_PREFIX + agreementId) === '1';
  } catch {
    return false;
  }
}

function rememberDismissed(agreementId: string) {
  try {
    window.localStorage.setItem(DISMISS_KEY_PREFIX + agreementId, '1');
  } catch {
    return;
  }
}

function summarizeProposal(agreement: AgreementView, unit: string): string {
  if (agreement.kind === 'settlement') return `xác nhận đã nhận ${agreement.finalQuantity} ${unit}`;
  return `hủy đơn, đề xuất hoàn ${formatVnd(agreement.refundAmount ?? 0)} tiền cọc (hai bên tự thỏa thuận)`;
}

function describeDeclined(agreement: AgreementView, isMine: boolean, proposerName: string): string {
  if (!isMine) return 'Bạn đã không đồng ý đề xuất này. Đơn giữ nguyên như cũ.';
  const next = agreement.kind === 'settlement' ? 'Bạn có thể đề xuất lại số lượng khác hoặc báo vấn đề.' : 'Bạn có thể đề nghị lại với số tiền hoàn khác.';
  return `${proposerName} không đồng ý đề xuất của bạn. Đơn giữ nguyên như cũ. ${next}`;
}

function describeProposal(agreement: AgreementView, isMine: boolean, proposerName: string, unit: string): string {
  const summary = summarizeProposal(agreement, unit);
  if (isMine) return `Bạn đề xuất: ${summary}.`;
  const outcome = agreement.kind === 'settlement' ? 'Đơn được đối soát theo số lượng này' : 'Đơn sẽ hủy';
  return `${proposerName} đề xuất: ${summary}. Nếu bạn đồng ý: ${outcome}.`;
}

export function AgreementBanner({ agreement, viewerId, proposerName, unit, busy, onRespond }: Props) {
  const isMine = agreement.proposedById === viewerId;
  const [dismissed, setDismissed] = useState(() => readDismissed(agreement.id));
  if (agreement.status === 'declined') {
    if (dismissed) return null;
    return (
      <section className={styles.banner} aria-label="Đề xuất đã bị từ chối">
        <p className={styles.heading} role="status">Đề xuất không được đồng ý</p>
        <p className={styles.text}>{describeDeclined(agreement, isMine, proposerName)}</p>
        <ActionGroup>
          <Button variant="outline" onClick={() => { rememberDismissed(agreement.id); setDismissed(true); }}>Đã hiểu</Button>
        </ActionGroup>
      </section>
    );
  }
  return (
    <section className={styles.banner} aria-label="Đề xuất đang chờ phản hồi">
      <p className={styles.heading} role="status">{isMine ? 'Đang chờ bên kia phản hồi' : 'Cần bạn phản hồi'}</p>
      <p className={styles.text}>{describeProposal(agreement, isMine, proposerName, unit)}</p>
      {!isMine && (
        <>
          <ActionGroup>
            <Button disabled={busy} onClick={() => onRespond(agreement, 'accept')}>Đồng ý</Button>
            <Button variant="outline" disabled={busy} onClick={() => onRespond(agreement, 'decline')}>Không đồng ý</Button>
          </ActionGroup>
          <p className={styles.hint}>Nếu bạn không đồng ý, đơn giữ nguyên như hiện tại.</p>
        </>
      )}
    </section>
  );
}
