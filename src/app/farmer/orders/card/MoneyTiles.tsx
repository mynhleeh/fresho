import { formatVnd } from '../../../components/order/MoneySummaryRow';
import type { OrderMoney } from '../data/orderTypes';
import styles from './moneyTiles.module.css';

export function MoneyTiles({ money }: { money: OrderMoney }) {
  const depositPercent = money.goods > 0 ? Math.min(100, Math.round((money.deposit / money.goods) * 100)) : 0;
  return (
    <dl className={styles.tiles}>
      <div className={styles.tile}>
        <dt>Tiền hàng</dt>
        <dd>{formatVnd(money.goods)}</dd>
      </div>
      <div className={styles.tile}>
        <dt>Tiền cọc đã nhận</dt>
        <dd>{formatVnd(money.deposit)}</dd>
        <span className={styles.bar} role="img" aria-label={`Đã nhận cọc ${depositPercent}% tiền hàng`}>
          <span className={styles.barFill} style={{ width: `${depositPercent}%` }} />
        </span>
      </div>
      <div className={`${styles.tile} ${styles.expected}`}>
        <dt>Tiền hàng dự kiến nhận</dt>
        <dd>{formatVnd(money.expected)}</dd>
      </div>
    </dl>
  );
}
