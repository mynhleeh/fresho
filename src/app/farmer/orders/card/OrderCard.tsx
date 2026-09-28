import Link from 'next/link';
import { ActionGroup } from '../../../components/ui/ActionGroup';
import { Button } from '../../../components/ui/Button';
import { CropArt } from '../../../components/order/CropArt';
import { JourneyPath } from '../../../components/order/JourneyPath';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { preOrderDisplayInfo } from '@/lib/order/orderStatus';
import { ACTION_LABEL, PRIMARY_KIND, nextStepTextOf, type ActionKind } from '../data/orderActionCopy';
import { actionOf, moneyOf, type FarmerPreOrder } from '../data/orderTypes';
import styles from './orderCard.module.css';

export type OrderCardVariant = 'queue' | 'tracking' | 'done';

type Props = {
  order: FarmerPreOrder;
  variant: OrderCardVariant;
  busy: boolean;
  onAct: (order: FarmerPreOrder, kind: ActionKind) => void;
};

function Figures({ order, className }: { order: FarmerPreOrder; className: string }) {
  const unit = order.batch.unit ?? 'kg';
  return (
    <span className={className}>
      <span className={styles.figure}>{order.quantity.toLocaleString('vi-VN')}<small>{unit}</small></span>
      <span className={styles.figure}>{formatVnd(moneyOf(order).expected)}<small>tiền hàng</small></span>
    </span>
  );
}

function Foot({ order, busy, onAct, className }: Props & { className: string }) {
  const action = actionOf(order);
  const quickKind = PRIMARY_KIND[action];
  return (
    <div className={className}>
      <p className={styles.nextStep}>{nextStepTextOf(order, action)}</p>
      {quickKind && (
        <ActionGroup>
          <Button disabled={busy} onClick={() => onAct(order, quickKind)}>{ACTION_LABEL[quickKind]}</Button>
        </ActionGroup>
      )}
    </div>
  );
}

function statusLabelOf(order: FarmerPreOrder): string {
  return preOrderDisplayInfo(order.status, order.farmerConfirmedAt != null).label;
}

function QueueCard(props: Props) {
  const { order } = props;
  return (
    <article className={styles.queue}>
      <Link href={`/farmer/orders/${order.id}`} className={styles.queueBody}>
        <CropArt cropName={order.batch.cropName} photoUrl={order.batch.photoUrl} className={styles.queueArt} />
        <span className={styles.queueTitle}>
          <span className={styles.queueCrop}>{order.batch.cropName}</span>
          <span className={styles.partner}>{order.buyer.name}</span>
        </span>
        <Figures order={order} className={styles.queueFigures} />
        <span className={styles.queueJourney}><JourneyPath status={order.status} label={statusLabelOf(order)} /></span>
      </Link>
      <Foot {...props} className={styles.queueFoot} />
    </article>
  );
}

function TrackingStrip(props: Props) {
  const { order } = props;
  return (
    <article className={styles.strip}>
      <Link href={`/farmer/orders/${order.id}`} className={styles.stripBody}>
        <CropArt cropName={order.batch.cropName} photoUrl={order.batch.photoUrl} className={styles.stripArt} />
        <span className={styles.stripTitle}>
          <span className={styles.stripCrop}>{order.batch.cropName}</span>
          <span className={styles.partner}>{order.buyer.name}</span>
        </span>
        <span className={styles.stripJourney}><JourneyPath status={order.status} label={statusLabelOf(order)} /></span>
        <Figures order={order} className={styles.stripFigures} />
      </Link>
      <Foot {...props} className={styles.stripFoot} />
    </article>
  );
}

function DoneChip(props: Props) {
  const { order } = props;
  return (
    <article className={styles.chip}>
      <Link href={`/farmer/orders/${order.id}`} className={styles.chipBody}>
        <CropArt cropName={order.batch.cropName} photoUrl={order.batch.photoUrl} className={styles.chipArt} />
        <span className={styles.chipTitle}>
          <span className={styles.chipEyebrow}>{statusLabelOf(order)}</span>
          <span className={styles.chipCrop}>{order.batch.cropName}</span>
          <span className={styles.partner}>{order.buyer.name}</span>
        </span>
        <Figures order={order} className={styles.chipFigures} />
      </Link>
      <Foot {...props} className={styles.chipFoot} />
    </article>
  );
}

export function OrderCard(props: Props) {
  if (props.variant === 'queue') return <QueueCard {...props} />;
  return props.variant === 'tracking' ? <TrackingStrip {...props} /> : <DoneChip {...props} />;
}
