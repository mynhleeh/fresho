'use client';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { MoneySummaryRow, formatVnd } from '../../../components/order/MoneySummaryRow';
import { calculateGoodsAmount } from '@/lib/order/orderPricing';
import { getEstimatedShipping, sumDeposits, type BuyerPreOrder } from '../data/orderView';
import styles from './OrderDrawer.module.css';

type Props = { order: BuyerPreOrder; busy: boolean; onSubmit: (finalQuantity: number) => void };

function parseWholeNumber(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  return Number(text);
}

function findQuantityProblem(order: BuyerPreOrder, quantity: number | null): string | null {
  if (quantity !== null && quantity >= 1 && quantity <= order.quantity) return null;
  return `Nhập số lượng thực nhận là số nguyên từ 1 đến ${order.quantity}, không có dấu chấm hoặc chữ.`;
}

function describeRemaining(remaining: number): { label: string; value: string } {
  if (remaining < 0) return { label: 'Phần cọc thừa (ghi nhận khi đối soát)', value: formatVnd(-remaining) };
  return { label: 'Còn phải thanh toán (ước tính)', value: formatVnd(remaining) };
}

function SettlementPreview({ order, quantity }: { order: BuyerPreOrder; quantity: number }) {
  const goods = calculateGoodsAmount(quantity, order.pricePerUnit);
  const deposit = sumDeposits(order);
  const remaining = describeRemaining(goods + getEstimatedShipping(order) - deposit);
  return (
    <div className={styles.receiptBreakdown}>
      <MoneySummaryRow label={`Tiền hàng (${quantity} ${order.batch.unit})`} value={formatVnd(goods)} />
      <MoneySummaryRow label="Cước vận chuyển (ước tính)" value={formatVnd(getEstimatedShipping(order))} />
      <MoneySummaryRow label="Tiền cọc đã trả" value={`- ${formatVnd(deposit)}`} />
      <MoneySummaryRow label={remaining.label} value={remaining.value} emphasis />
    </div>
  );
}

export function ProposeSettlementForm({ order, busy, onSubmit }: Props) {
  const [quantityText, setQuantityText] = useState(String(order.quantity));
  const quantity = parseWholeNumber(quantityText);
  const problem = findQuantityProblem(order, quantity);
  return (
    <form
      className={styles.receiptForm}
      onSubmit={(event) => {
        event.preventDefault();
        if (problem === null && quantity !== null) onSubmit(quantity);
      }}
    >
      <label className={styles.field}>
        Số lượng thực nhận ({order.batch.unit})
        <input className={styles.input} inputMode="numeric" value={quantityText} onChange={(e) => setQuantityText(e.target.value)} aria-invalid={problem !== null} aria-describedby={problem ? 'settlement-problem' : undefined} />
      </label>
      {problem === null && quantity !== null && <SettlementPreview order={order} quantity={quantity} />}
      {problem && <p id="settlement-problem" role="alert" className={styles.problem}>{problem}</p>}
      <Button type="submit" loading={busy} disabled={problem !== null}>Gửi số lượng thực nhận</Button>
    </form>
  );
}
