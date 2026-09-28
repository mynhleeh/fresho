import { formatVnd } from './MoneySummaryRow';
import styles from './LedgerHistory.module.css';

type LedgerEntryView = { id: string; type: string; amount: number; createdAt: string };

const ENTRY_LABEL: Record<string, string> = {
  deposit: 'Tiền đặt cọc',
  final_payment: 'Thanh toán cuối',
  deposit_refund: 'Hoàn tiền cọc',
};

export function LedgerHistory({ entries }: { entries: LedgerEntryView[] }) {
  if (entries.length === 0) {
    return <p className={styles.empty}>Chưa có giao dịch tiền nào cho đơn này.</p>;
  }
  return (
    <ul className={styles.list} aria-label="Lịch sử giao dịch tiền">
      {entries.map((entry) => (
        <li key={entry.id} className={styles.entry}>
          <span className={styles.label}>{ENTRY_LABEL[entry.type] ?? entry.type}</span>
          <time className={styles.date} dateTime={entry.createdAt}>
            {new Date(entry.createdAt).toLocaleString('vi-VN')}
          </time>
          <span className={styles.amount}>{formatVnd(entry.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
