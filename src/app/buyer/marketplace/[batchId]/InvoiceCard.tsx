import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { LeafIcon } from '../../../components/ui/icons';
import { AnimatedMoney } from './AnimatedMoney';
import styles from './InvoiceCard.module.css';

export function InvoiceCard(props: {
  cropName: string;
  quantityLabel: string;
  goodsAmount: number;
  shippingFee: number;
  shippingFeePending: boolean;
  totalAmount: number;
  confirmDisabled: boolean;
  onBack: () => void;
  onConfirm: () => void;
  submitting?: boolean;
  confirmLabel?: string;
  feedback?: { tone: 'error' | 'success'; text: string } | null;
  ordersHref?: string;
  depositAmount: number;
}) {
  return (
    <aside className={styles.ticket} aria-label="Hóa đơn đặt trước">
      <header className={styles.stub}>
        <span className={styles.stubBadge}><LeafIcon className={styles.stubIcon} /></span>
        <div className={styles.stubText}>
          <span className={styles.eyebrow}>Hóa đơn đặt trước</span>
          <span className={styles.stubTitle}>{props.cropName}</span>
          <span className={styles.stubMeta}>{props.quantityLabel}</span>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.line}>
          <span>Tiền hàng</span>
          <span>{formatVnd(props.goodsAmount)}</span>
        </div>
        <div className={styles.line}>
          <span>Cước vận chuyển</span>
          <span>{props.shippingFeePending ? 'Chưa có báo giá' : formatVnd(props.shippingFee)}</span>
        </div>

        <div className={styles.perforation} aria-hidden="true" />

        <div className={styles.total}>
          <span className={styles.totalLabel}>{props.shippingFee > 0 || props.shippingFeePending ? 'Tổng tiền (ước tính)' : 'Tổng tiền'}</span>
          <AnimatedMoney amount={props.totalAmount} className={styles.totalValue} announce />
        </div>

        <div className={styles.line}>
          <span>Đặt cọc sau khi nông dân xác nhận</span>
          <span>{formatVnd(props.depositAmount)}</span>
        </div>

        {props.feedback && (
          <p
            role={props.feedback.tone === 'error' ? 'alert' : 'status'}
            className={props.feedback.tone === 'error' ? styles.feedbackError : styles.feedbackSuccess}
          >
            {props.feedback.text}
          </p>
        )}

        {props.shippingFeePending && !props.feedback && (
          <p className={styles.feedbackHint}>Hãy lấy báo giá vận chuyển ở bước trên để gửi đơn.</p>
        )}

        <div className={styles.actions}>
          {props.feedback?.tone === 'success' && props.ordersHref ? (
            <Link href={props.ordersHref} className={styles.ordersLink}>Xem đơn hàng của tôi</Link>
          ) : (
            <Button className={styles.action} disabled={props.confirmDisabled} loading={props.submitting} onClick={props.onConfirm}>
              {props.confirmLabel ?? 'Gửi đơn đặt trước'}
            </Button>
          )}
          {props.feedback?.tone === 'error' && props.ordersHref && (
            <Link href={props.ordersHref} className={styles.secondaryLink}>Xem đơn hàng của tôi</Link>
          )}
          <Button variant="outline" className={styles.action} onClick={props.onBack} disabled={props.submitting}>
            {props.feedback?.tone === 'success' ? 'Về danh sách lô hàng' : 'Quay lại'}
          </Button>
        </div>
      </div>
    </aside>
  );
}
