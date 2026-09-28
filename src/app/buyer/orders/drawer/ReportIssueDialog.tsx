'use client';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Overlay } from '../../../components/feedback/Overlay';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import styles from './ReportIssueDialog.module.css';

export function ReportIssueDialog({
  preOrderId,
  onClose,
  onReported,
}: {
  preOrderId: string | null;
  onClose: () => void;
  onReported: () => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!preOrderId) return;
    if (reason.trim() === '') {
      setError('Vui lòng mô tả vấn đề, ví dụ giao chậm, thiếu hàng hoặc sai chất lượng.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preOrderId, reason: reason.trim() }),
    }).catch(() => null);
    setSaving(false);
    if (!res || !res.ok) {
      setError(await readApiErrorMessage(res));
      return;
    }
    setReason('');
    setError(null);
    onReported();
  }

  return (
    <Overlay open={preOrderId !== null} onClose={onClose} label="Báo vấn đề với đơn hàng" dismissible={!saving}>
      <div className={styles.dialogBody}>
        <h2>Báo vấn đề với đơn hàng</h2>
        <label className={styles.dialogField}>
          Mô tả vấn đề
          <textarea
            className={styles.dialogInput}
            value={reason}
            placeholder="Giao chậm, thiếu hàng, sai chất lượng..."
            onChange={(e) => setReason(e.target.value)}
            aria-invalid={error !== null}
            aria-describedby={error ? 'report-error' : undefined}
          />
        </label>
        {error && <p id="report-error" role="alert" className={styles.dialogError}>{error}</p>}
        <div className={styles.dialogActions}>
          <Button variant="outline" onClick={onClose} disabled={saving}>Quay lại</Button>
          <Button onClick={submit} loading={saving}>Gửi báo cáo</Button>
        </div>
      </div>
    </Overlay>
  );
}
