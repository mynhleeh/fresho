'use client';
import type { CSSProperties } from 'react';
import { useCountUp } from '../../../components/hooks/useCountUp';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import type { OrderMoney } from '../data/orderTypes';
import styles from './moneyTiles.module.css';

function ReceiptLine({ label, amount }: { label: string; amount: number }) {
  return (
    <div className={styles.line}>
      <dt>{label}</dt>
      <span className={styles.leader} aria-hidden="true" />
      <dd>{formatVnd(amount)}</dd>
    </div>
  );
}

export function MoneyTiles({ money }: { money: OrderMoney }) {
  const depositPercent = money.goods > 0 ? Math.min(100, Math.round((money.deposit / money.goods) * 100)) : 0;
  const shownExpected = useCountUp(money.expected);
  return (
    <dl className={styles.receipt}>
      <ReceiptLine label="Tiền hàng" amount={money.goods} />
      <ReceiptLine label="Tiền cọc đã nhận" amount={money.deposit} />
      <span className={styles.bar} role="img" aria-label={`Đã nhận cọc ${depositPercent}% tiền hàng`}>
        <span className={styles.barFill} style={{ '--fill': depositPercent / 100 } as CSSProperties} />
      </span>
      <div className={styles.total}>
        <dt>Tiền hàng dự kiến nhận</dt>
        <dd>{formatVnd(shownExpected)}</dd>
      </div>
    </dl>
  );
}
