import styles from './MoneySummaryRow.module.css';

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đồng`;
}

export function MoneySummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className={`${styles.row} ${emphasis ? styles.emphasis : ''}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
