'use client';
import { useCountUp } from '../../../components/hooks/useCountUp';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { PaidSplitBar } from '../card/OrderVisuals';
import { getOrderMoney, sumDeposits, type BuyerOrderDetail } from '../data/orderView';
import styles from './MoneyPanels.module.css';

function CountUpAmount({ amount }: { amount: number }) {
  return <>{formatVnd(useCountUp(amount))}</>;
}

function ReceiptLine({ label, amount }: { label: string; amount: number }) {
  return (
    <div className={styles.line}>
      <dt className={styles.lineLabel}>{label}</dt>
      <dd className={styles.lineAmount}>{formatVnd(amount)}</dd>
    </div>
  );
}

function isStopped(order: BuyerOrderDetail): boolean {
  return order.status === 'rejected' || order.status === 'cancelled';
}

export function MoneyStrip({ order }: { order: BuyerOrderDetail }) {
  const money = getOrderMoney(order);
  const settled = order.status === 'settled';
  const stopped = isStopped(order);
  const finalAmount = order.settlement && settled ? order.settlement.finalPaymentAmount : money.remainingAmount;
  return (
    <section className={styles.strip} aria-label="Thanh toán">
      {!stopped && (
        <div className={styles.dominant}>
          <p className={styles.dominantLabel}>{settled ? 'Thanh toán cuối' : 'Còn phải trả (ước tính)'}</p>
          <p className={styles.dominantAmount}><CountUpAmount amount={finalAmount} /></p>
          <PaidSplitBar money={money} settled={settled} />
        </div>
      )}
      <dl className={styles.receipt}>
        <ReceiptLine label="Tiền hàng" amount={money.goodsAmount} />
        <ReceiptLine label="Tiền cọc đã trả" amount={sumDeposits(order)} />
        {!stopped && <ReceiptLine label={settled ? 'Cước vận chuyển' : 'Cước vận chuyển (ước tính)'} amount={money.shippingFee} />}
      </dl>
    </section>
  );
}

export function PaymentSummary({ order }: { order: BuyerOrderDetail }) {
  const money = getOrderMoney(order);
  const settled = order.status === 'settled';
  if (isStopped(order)) return null;
  return (
    <section className={styles.summary} aria-label="Tóm tắt thanh toán">
      <p className={styles.summaryLabel}>{settled ? 'Đã thanh toán' : 'Còn phải trả (ước tính)'}</p>
      <p className={styles.summaryAmount}><CountUpAmount amount={settled ? money.paidAmount : money.remainingAmount} /></p>
      <PaidSplitBar money={money} settled={settled} />
    </section>
  );
}
