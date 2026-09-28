import { CropArt } from '../../../components/order/CropArt';
import { JourneyPath } from '../../../components/order/JourneyPath';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { preOrderDisplayInfo } from '@/lib/order/orderStatus';
import { nextStepTextOf } from '../data/orderActionCopy';
import { actionOf, type FarmerOrderDetail } from '../data/orderTypes';
import styles from './orderHeaderBand.module.css';

const SHORT_ID_LENGTH = 6;

export function OrderHeaderBand({ order }: { order: FarmerOrderDetail }) {
  const status = preOrderDisplayInfo(order.status, order.farmerConfirmedAt != null);
  const shortId = order.id.slice(-SHORT_ID_LENGTH).toUpperCase();

  return (
    <header className={styles.band}>
      <div className={styles.scene}>
        <CropArt cropName={order.batch.cropName} photoUrl={order.batch.photoUrl} className={styles.art} />
        <div className={styles.journey}><JourneyPath status={order.status} label={status.label} /></div>
      </div>
      <div className={styles.text}>
        <span className={styles.eyebrow}>{status.label}</span>
        <h1 className={styles.title}>{order.batch.cropName}</h1>
        <p className={styles.nextStep}>{nextStepTextOf(order, actionOf(order))}</p>
        <div className={styles.meta}>
          <span className={styles.stamp}>Mã đơn #{shortId}</span>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </div>
    </header>
  );
}
