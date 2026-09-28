import Link from 'next/link';
import { CropArt } from '../../../components/order/CropArt';
import { JourneyPath } from '../../../components/order/JourneyPath';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { getOrderMoney, getOrderStatusInfo, type BuyerPreOrder } from '../data/orderView';
import { describeNextStep } from '../data/nextStep';
import { QuickAction } from './QuickAction';
import styles from './OrderCard.module.css';

export type CardVariant = 'todo' | 'following' | 'history';

type OrderCardProps = {
  order: BuyerPreOrder;
  variant: CardVariant;
  alreadyRated: boolean;
  busy: boolean;
  onPayDeposit: (order: BuyerPreOrder) => void;
  onConfirmArrival: (order: BuyerPreOrder) => void;
};

function isStopped(order: BuyerPreOrder): boolean {
  return order.status === 'rejected' || order.status === 'cancelled';
}

function OrderLink({ order, className, children }: { order: BuyerPreOrder; className: string; children: React.ReactNode }) {
  return (
    <Link href={`/buyer/orders/${order.id}`} className={className}>
      {children}
    </Link>
  );
}

function Figures({ order }: { order: BuyerPreOrder }) {
  const money = getOrderMoney(order);
  const includesShipping = !isStopped(order) && money.shippingFee > 0;
  const amount = includesShipping ? money.goodsAmount + money.shippingFee : money.goodsAmount;
  return (
    <div className={styles.figures}>
      <span className={styles.figure}>{order.quantity.toLocaleString('vi-VN')}<small>{order.batch.unit}</small></span>
      <span className={styles.figure}>{formatVnd(amount)}<small>{includesShipping ? 'gồm cước' : 'tiền hàng'}</small></span>
    </div>
  );
}

function TodoTicket({ order, alreadyRated, busy, onPayDeposit, onConfirmArrival }: Omit<OrderCardProps, 'variant'>) {
  const status = getOrderStatusInfo(order);
  const nextStep = describeNextStep(order, alreadyRated);
  return (
    <article className={styles.ticket} data-stopped={isStopped(order) || undefined}>
      <OrderLink order={order} className={styles.ticketBody}>
        <span className={styles.blob}><CropArt cropName={order.batch.cropName} photoUrl={order.batch.photoUrl} className={styles.ticketArt} /></span>
        <div className={styles.ticketText}>
          <span className={styles.eyebrow}>{status.label}</span>
          <h3 className={styles.ticketCrop}>{order.batch.cropName}</h3>
          <span className={styles.partner}>{order.batch.farmer.name}</span>
        </div>
        <Figures order={order} />
        <div className={styles.ticketPath}><JourneyPath status={order.status} label={status.label} /></div>
      </OrderLink>
      <div className={styles.ticketFooter}>
        {nextStep && <p className={styles.ticketNext}>{nextStep}</p>}
        <QuickAction order={order} alreadyRated={alreadyRated} busy={busy} onPayDeposit={onPayDeposit} onConfirmArrival={onConfirmArrival} />
      </div>
    </article>
  );
}

function FollowingStrip({ order, alreadyRated, busy, onPayDeposit, onConfirmArrival }: Omit<OrderCardProps, 'variant'>) {
  const status = getOrderStatusInfo(order);
  const nextStep = describeNextStep(order, alreadyRated);
  return (
    <article className={styles.strip} data-stopped={isStopped(order) || undefined}>
      <OrderLink order={order} className={styles.stripBody}>
        <CropArt cropName={order.batch.cropName} photoUrl={order.batch.photoUrl} className={styles.stripArt} />
        <div className={styles.stripText}>
          <span className={styles.eyebrow}>{status.label}</span>
          <h3 className={styles.stripCrop}>{order.batch.cropName}</h3>
          <span className={styles.partner}>{order.batch.farmer.name}</span>
        </div>
        <div className={styles.stripPath}><JourneyPath status={order.status} label={status.label} /></div>
        <Figures order={order} />
      </OrderLink>
      {nextStep && (
        <div className={styles.stripFooter}>
          <p className={styles.stripNext}>{nextStep}</p>
          <QuickAction order={order} alreadyRated={alreadyRated} busy={busy} onPayDeposit={onPayDeposit} onConfirmArrival={onConfirmArrival} />
        </div>
      )}
    </article>
  );
}

function HistoryChip({ order, alreadyRated, busy, onPayDeposit, onConfirmArrival }: Omit<OrderCardProps, 'variant'>) {
  const status = getOrderStatusInfo(order);
  const nextStep = describeNextStep(order, alreadyRated);
  return (
    <article className={styles.chip} data-stopped={isStopped(order) || undefined}>
      <OrderLink order={order} className={styles.chipBody}>
        <CropArt cropName={order.batch.cropName} photoUrl={order.batch.photoUrl} className={styles.chipArt} />
        <div className={styles.chipText}>
          <h3 className={styles.chipCrop}>{order.batch.cropName}</h3>
          <span className={styles.eyebrow}>{status.label}</span>
        </div>
        <Figures order={order} />
      </OrderLink>
      {nextStep && <p className={styles.chipNext}>{nextStep}</p>}
      <QuickAction order={order} alreadyRated={alreadyRated} busy={busy} onPayDeposit={onPayDeposit} onConfirmArrival={onConfirmArrival} />
    </article>
  );
}

export function OrderCard({ variant, ...rest }: OrderCardProps) {
  if (variant === 'todo') return <TodoTicket {...rest} />;
  if (variant === 'following') return <FollowingStrip {...rest} />;
  return <HistoryChip {...rest} />;
}
