import Link from 'next/link';
import { StatusBadge } from '../components/StatusBadge';
import { formatVnd, orderValue, type DashboardKpi } from '@/lib/dashboardSummary';
import { preOrderStatusInfo } from '@/lib/orderStatus';
import type { DashboardOrder } from './useDashboardData';
import styles from './page.module.css';

export function KpiRow({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <section className={styles.kpiRow} aria-label="Số liệu chính">
      {kpis.map((kpi) => (
        <article key={kpi.label} className={kpi.highlight ? `${styles.kpiTile} ${styles.kpiHighlight}` : styles.kpiTile}>
          <h2 className={styles.kpiLabel}>{kpi.label}</h2>
          <p className={styles.kpiValue}>{kpi.value}</p>
          <p className={styles.kpiNote}>{kpi.note}</p>
        </article>
      ))}
    </section>
  );
}

function formatHarvestDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export function RecentOrdersTable({ orders, ordersHref }: { orders: DashboardOrder[]; ordersHref: string }) {
  return (
    <section className={styles.panel} aria-labelledby="recent-orders-title">
      <header className={styles.panelHeader}>
        <h2 id="recent-orders-title" className={styles.panelTitle}>Đơn gần đây</h2>
        <Link href={ordersHref} className={styles.panelHeaderLink}>Xem tất cả</Link>
      </header>
      {orders.length === 0 ? (
        <p className={styles.emptyNote}>Chưa có đơn đặt trước nào.</p>
      ) : (
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th scope="col">Nông sản</th>
              <th scope="col" className={styles.numericCell}>Số lượng</th>
              <th scope="col" className={styles.numericCell}>Giá trị đặt</th>
              <th scope="col">Ngày thu</th>
              <th scope="col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = preOrderStatusInfo(order.status);
              return (
                <tr key={order.id}>
                  <td data-label="Nông sản" className={styles.cropCell}>{order.batch.cropName}</td>
                  <td data-label="Số lượng" className={styles.numericCell}>{order.quantity.toLocaleString('vi-VN')} {order.batch.unit}</td>
                  <td data-label="Giá trị đặt" className={styles.numericCell}>{formatVnd(orderValue(order))}</td>
                  <td data-label="Ngày thu">{formatHarvestDate(order.batch.harvestDateEstimate)}</td>
                  <td data-label="Trạng thái"><StatusBadge label={status.label} tone={status.tone} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
