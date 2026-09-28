'use client';
import { useCountUp } from '../../../components/hooks/useCountUp';
import { formatHarvestDate } from '@/lib/order/orderDisplayText';
import type { FarmerOrderDetail } from '../data/orderTypes';
import styles from './orderNumbersStrip.module.css';

const DELIVERY_LABEL = { self_pickup: 'Người mua tự đến lấy', carrier: 'Giao qua vận chuyển' } as const;

function HarvestCalendar({ isoDate }: { isoDate: string | undefined }) {
  const date = isoDate ? new Date(isoDate) : null;
  const fullText = formatHarvestDate(isoDate);
  if (!date || !fullText) {
    return <div className={styles.date}><span className={styles.label}>Thu hoạch dự kiến</span><strong className={styles.noDate}>Chưa có ngày</strong></div>;
  }
  return (
    <div className={styles.date}>
      <span className={styles.label}>Thu hoạch dự kiến</span>
      <div className={styles.calendar} role="img" aria-label={fullText}>
        <span className={styles.month}>Tháng {date.getMonth() + 1}</span>
        <span className={styles.day}>{String(date.getDate()).padStart(2, '0')}</span>
        <span className={styles.year}>{date.getFullYear()}</span>
      </div>
    </div>
  );
}

export function OrderNumbersStrip({ order }: { order: FarmerOrderDetail }) {
  const unit = order.batch.unit ?? 'kg';
  const shownQuantity = useCountUp(order.quantity);
  const sharePercent = order.batch.quantityTotal > 0 ? Math.min(100, Math.round((order.quantity / order.batch.quantityTotal) * 100)) : 0;

  return (
    <section className={styles.strip} aria-label="Số lượng và giao nhận">
      <div className={styles.quantity}>
        <span className={styles.label}>Số lượng đặt</span>
        <strong className={styles.figure}>{shownQuantity.toLocaleString('vi-VN')}<small>{unit}</small></strong>
        <span className={styles.bar} role="img" aria-label={`Chiếm ${sharePercent}% sản lượng lô`}>
          <span className={styles.barFill} style={{ width: `${sharePercent}%` }} />
        </span>
        <span className={styles.hint}>{sharePercent}% trên tổng {order.batch.quantityTotal.toLocaleString('vi-VN')} {unit} của lô</span>
      </div>
      <HarvestCalendar isoDate={order.batch.harvestDateEstimate} />
      <div className={styles.delivery}>
        <span className={styles.label}>Hình thức nhận hàng</span>
        <strong className={styles.chip}>{DELIVERY_LABEL[order.deliveryMethod]}</strong>
      </div>
    </section>
  );
}
