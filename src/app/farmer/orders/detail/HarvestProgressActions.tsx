'use client';
import { useState } from 'react';
import { ActionGroup } from '../../../components/ui/ActionGroup';
import { Button } from '../../../components/ui/Button';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import styles from './harvestProgressActions.module.css';

type Props = {
  batchId: string;
  quantityTotal: number;
  showToast: (tone: 'success' | 'error', text: string) => void;
  onDone: () => void;
};

type Mode = 'quantity_adjusted' | 'rescheduled' | null;

export function HarvestProgressActions({ batchId, quantityTotal, showToast, onDone }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [quantity, setQuantity] = useState(String(quantityTotal));
  const [harvestDate, setHarvestDate] = useState('');
  const [busy, setBusy] = useState(false);

  async function post(body: object, successText: string) {
    setBusy(true);
    const res = await fetch(`/api/batches/${batchId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    setBusy(false);
    if (!res || !res.ok) {
      showToast('error', await readApiErrorMessage(res));
      return;
    }
    showToast('success', successText);
    setMode(null);
    onDone();
  }

  const submitQuantity = () => post({ kind: 'quantity_adjusted', newQuantityTotal: Number(quantity) }, 'Đã điều chỉnh sản lượng');
  const submitDate = () => post({ kind: 'rescheduled', newHarvestDateEstimate: harvestDate }, 'Đã dời ngày thu hoạch');

  return (
    <section className={styles.box} aria-label="Cập nhật tiến độ thu hoạch">
      <h2 className={styles.title}>Cập nhật tiến độ thu hoạch</h2>
      <p className={styles.hint}>Người mua của lô này sẽ nhận được tin nhắn cập nhật.</p>
      <ActionGroup>
        <Button disabled={busy} onClick={() => post({ kind: 'on_track' }, 'Đã báo đúng tiến độ')}>Đúng tiến độ</Button>
        <Button variant="outline" disabled={busy} onClick={() => setMode('quantity_adjusted')}>Điều chỉnh sản lượng</Button>
        <Button variant="outline" disabled={busy} onClick={() => setMode('rescheduled')}>Dời ngày thu hoạch</Button>
      </ActionGroup>
      {mode === 'quantity_adjusted' && (
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); submitQuantity(); }}>
          <label className={styles.field}>
            Tổng sản lượng mới
            <input type="number" min={1} required value={quantity} onChange={(e) => setQuantity(e.target.value)} className={styles.input} />
          </label>
          <ActionGroup><Button type="submit" disabled={busy}>Lưu sản lượng</Button></ActionGroup>
        </form>
      )}
      {mode === 'rescheduled' && (
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); submitDate(); }}>
          <label className={styles.field}>
            Ngày thu hoạch mới
            <input type="date" required value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className={styles.input} />
          </label>
          <ActionGroup><Button type="submit" disabled={busy}>Lưu ngày thu hoạch</Button></ActionGroup>
        </form>
      )}
    </section>
  );
}
