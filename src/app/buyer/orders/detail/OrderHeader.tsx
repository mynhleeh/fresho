import { formatHarvestDate } from '@/lib/order/orderDisplayText';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { CropArt } from '../../../components/order/CropArt';
import { JourneyPath } from '../../../components/order/JourneyPath';
import { getOrderStatusInfo, type BuyerOrderDetail } from '../data/orderView';
import { describeNextStep } from '../data/nextStep';
import styles from './OrderHeader.module.css';

const ORDER_CODE_LENGTH = 6;

export function OrderHeader({ order, alreadyRated }: { order: BuyerOrderDetail; alreadyRated: boolean }) {
  const status = getOrderStatusInfo(order);
  const harvestDate = formatHarvestDate(order.batch.harvestDateEstimate);
  const nextStep = describeNextStep(order, alreadyRated);
  return (
    <header className={styles.hero}>
      <div className={styles.scene}>
        <div className={styles.blob}>
          <CropArt cropName={order.batch.cropName} photoUrl={order.batch.photoUrl} className={styles.crop} />
        </div>
        <div className={styles.path}><JourneyPath status={order.status} label={status.label} /></div>
      </div>
      <div className={styles.body}>
        <p className={styles.eyebrow}>Phiếu đặt trước <span className={styles.code}>#{order.id.slice(-ORDER_CODE_LENGTH).toUpperCase()}</span></p>
        <h1 className={styles.title}>{order.batch.cropName}</h1>
        {nextStep && <p className={styles.next}>{nextStep}</p>}
        <p className={styles.meta}>
          <span className={styles.quantity}>{order.quantity.toLocaleString('vi-VN')}<small>{order.batch.unit}</small></span>
          {harvestDate && <span>Thu hoạch dự kiến {harvestDate}</span>}
        </p>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>
    </header>
  );
}
