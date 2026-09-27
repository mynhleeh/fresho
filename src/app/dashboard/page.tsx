'use client';
import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { displayFont } from '../components/displayFont';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS } from '../auth/roleLabels';
import type { AppRole } from '../components/roleNav';
import { useCreateBatchPanel } from '../farmer/batches/CreateBatchPanelContext';
import { HarvestHorizon } from './HarvestHorizon';
import { ActionQueue, OrderPipeline } from './DashboardPanels';
import { KpiRow, RecentOrdersTable } from './DashboardOverview';
import { useDashboardData, type DashboardData } from './useDashboardData';
import styles from './page.module.css';

const ORDERS_HREF: Record<AppRole, string> = {
  farmer: '/farmer/orders',
  buyer: '/buyer/orders',
  admin: '/admin/orders',
  logistics: '/logistics/deliveries',
};

const HORIZON_ENTRY_NOUN: Record<AppRole, string> = {
  farmer: 'lô hàng',
  buyer: 'đơn của bạn',
  admin: 'đơn',
  logistics: 'chuyến hàng',
};

function greetingForHour(hour: number): string {
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 14) return 'Chào buổi trưa';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = (user?.role ?? 'farmer') as AppRole;
  const { data, failed } = useDashboardData(user ? role : null);
  const now = new Date();

  return (
    <AppShell role={role}>
      <div className={`${styles.page} ${displayFont.variable}`}>
        <header className={styles.greeting}>
          <div className={styles.greetingText}>
            <span className={styles.dateLine} suppressHydrationWarning>{now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <h1 className={styles.heading} suppressHydrationWarning>
              {greetingForHour(now.getHours())}, <span className={styles.headingName}>{user?.name ?? 'bạn'}</span>
            </h1>
            <p className={styles.summaryLine}>
              {ROLE_LABELS[role] ?? role}
              {data && ` · ${data.actionItems.length > 0 ? `${data.actionItems.length} việc đang chờ bạn` : 'Không có việc nào đang chờ'}`}
            </p>
          </div>
          <RolePrimaryAction role={role} />
        </header>
        <DashboardBody data={data} failed={failed} role={role} />
      </div>
    </AppShell>
  );
}

function DashboardBody({ data, failed, role }: { data: DashboardData | null; failed: boolean; role: AppRole }) {
  if (failed) return <p className={styles.errorNote} role="alert">Không tải được số liệu trang chủ. Tải lại trang để thử lần nữa.</p>;
  if (!data) return <div className={styles.skeleton} aria-busy="true" aria-label="Đang tải số liệu" />;

  return (
    <>
      <KpiRow kpis={data.kpis} />
      <div className={styles.mainGrid}>
        <div className={styles.mainColumn}>
          <HarvestHorizon days={data.horizon.days} laterCount={data.horizon.laterCount} entryNoun={HORIZON_ENTRY_NOUN[role]} />
          <RecentOrdersTable orders={data.recentOrders} ordersHref={ORDERS_HREF[role]} />
        </div>
        <div className={styles.sideColumn}>
          <ActionQueue items={data.actionItems} ordersHref={ORDERS_HREF[role]} />
          <OrderPipeline stages={data.stages} closedCount={data.closedCount} ordersHref={ORDERS_HREF[role]} />
        </div>
      </div>
    </>
  );
}

function RolePrimaryAction({ role }: { role: AppRole }) {
  const createBatchPanel = useCreateBatchPanel();
  if (role === 'farmer') {
    return <button type="button" className={styles.primaryAction} onClick={createBatchPanel.open}>Đăng mùa vụ mới</button>;
  }
  if (role === 'buyer') {
    return <Link href="/buyer/marketplace" className={styles.primaryAction}>Tìm nông sản</Link>;
  }
  return null;
}
