import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { ActionItem, OrderStageCount } from '@/lib/dashboardSummary';
import styles from './page.module.css';

const MAX_ACTION_ITEMS = 6;

export function ActionQueue({ items, ordersHref }: { items: ActionItem[]; ordersHref: string }) {
  const sortedItems = [...items].sort((a, b) => Number(b.urgent) - Number(a.urgent));
  const visibleItems = sortedItems.slice(0, MAX_ACTION_ITEMS);

  return (
    <section className={styles.panel} aria-labelledby="action-queue-title" data-slot="actions">
      <header className={styles.panelHeader}>
        <h2 id="action-queue-title" className={styles.panelTitle}>Cần bạn xử lý</h2>
        {items.length > 0 && <span className={styles.countPill}>{items.length}</span>}
      </header>
      {visibleItems.length === 0 ? (
        <p className={styles.emptyNote}>Không có việc nào đang chờ bạn. Các đơn vẫn đúng tiến độ.</p>
      ) : (
        <ul className={styles.actionList}>
          {visibleItems.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className={styles.actionRow}>
                <span className={item.urgent ? styles.actionMarkerUrgent : styles.actionMarker} aria-hidden="true" />
                <span className={styles.actionText}>
                  <span className={styles.actionTitle}>{item.title}</span>
                  <span className={styles.actionNote}>{item.note}</span>
                </span>
                <span className={styles.actionGo}>Mở</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {items.length > MAX_ACTION_ITEMS && (
        <Link href={ordersHref} className={styles.panelFooterLink}>Xem tất cả {items.length} việc</Link>
      )}
    </section>
  );
}

export function OrderPipeline({ stages, closedCount, ordersHref }: { stages: OrderStageCount[]; closedCount: number; ordersHref: string }) {
  const totalInPipeline = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <section className={styles.panel} aria-labelledby="pipeline-title">
      <header className={styles.panelHeader}>
        <h2 id="pipeline-title" className={styles.panelTitle}>Đơn theo giai đoạn</h2>
        <Link href={ordersHref} className={styles.panelHeaderLink}>Tất cả đơn</Link>
      </header>
      <div className={styles.pipelineBar} role="img" aria-label={stages.map((stage) => `${stage.label}: ${stage.count}`).join(', ')}>
        {totalInPipeline === 0 && <span className={styles.pipelineEmptyBar} />}
        {stages.filter((stage) => stage.count > 0).map((stage) => (
          <span key={stage.key} className={`${styles.pipelineSegment} ${styles[`stage_${stage.key}`]}`} style={{ flexGrow: stage.count } as CSSProperties} />
        ))}
      </div>
      <dl className={styles.pipelineLegend}>
        {stages.map((stage) => (
          <div key={stage.key} className={styles.pipelineRow}>
            <dt className={styles.pipelineLabel}>
              <span className={`${styles.pipelineSwatch} ${styles[`stage_${stage.key}`]}`} aria-hidden="true" />
              {stage.label}
            </dt>
            <dd className={styles.pipelineCount}>{stage.count}</dd>
          </div>
        ))}
      </dl>
      {closedCount > 0 && <p className={styles.panelNote}>{closedCount} đơn đã từ chối hoặc huỷ không được tính.</p>}
    </section>
  );
}
