'use client';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Overlay } from '../feedback/Overlay';
import { formatVnd } from '../order/MoneySummaryRow';
import styles from './CancelProposalDialog.module.css';

type Props = {
  open: boolean;
  depositTotal: number;
  busy: boolean;
  onSubmit: (refundAmount: number) => void;
  onClose: () => void;
};

function parseRefund(text: string, depositTotal: number): { value: number | null; problem: string | null } {
  if (!/^\d+$/.test(text.trim())) return { value: null, problem: `Nhập số tiền là số nguyên từ 0 đến ${formatVnd(depositTotal)}.` };
  const value = Number(text);
  if (value > depositTotal) return { value: null, problem: `Số tiền hoàn không được lớn hơn tiền cọc (${formatVnd(depositTotal)}).` };
  return { value, problem: null };
}

function CancelProposalForm({ depositTotal, busy, onSubmit, onClose }: Omit<Props, 'open'>) {
  const [refundText, setRefundText] = useState('');
  const { value, problem: rawProblem } = parseRefund(refundText, depositTotal);
  const problem = refundText === '' ? null : rawProblem;
  return (
    <form
      className={styles.body}
      onSubmit={(event) => {
        event.preventDefault();
        if (value !== null) onSubmit(value);
      }}
    >
      <h2 className={styles.title}>Đề nghị hủy đơn</h2>
      <p className={styles.description}>
        Đơn chỉ hủy khi bên kia đồng ý. Hãy đề xuất số tiền cọc hoàn lại; hai bên tự thỏa thuận, tiền cọc hiện tại là {formatVnd(depositTotal)}.
      </p>
      <label className={styles.field}>
        Số tiền cọc đề xuất hoàn lại (đồng)
        <input
          className={styles.input}
          inputMode="numeric"
          value={refundText}
          onChange={(event) => setRefundText(event.target.value)}
          aria-invalid={problem !== null}
          aria-describedby={problem ? 'cancel-refund-problem' : undefined}
        />
      </label>
      {problem && <p id="cancel-refund-problem" role="alert" className={styles.problem}>{problem}</p>}
      <div className={styles.actions}>
        <Button variant="outline" type="button" onClick={onClose} disabled={busy}>Quay lại</Button>
        <Button variant="danger" type="submit" loading={busy} disabled={value === null || refundText === ''}>Gửi đề nghị hủy</Button>
      </div>
    </form>
  );
}

export function CancelProposalDialog({ open, ...formProps }: Props) {
  return (
    <Overlay open={open} onClose={formProps.onClose} label="Đề nghị hủy đơn" dismissible={!formProps.busy}>
      <CancelProposalForm {...formProps} />
    </Overlay>
  );
}
