import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DetailBlock } from '../../../components/order/DetailBlock';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { preOrderStatusInfo } from '@/lib/order/orderStatus';
import type { FarmerOrderDetail } from '../data/orderTypes';
import styles from './fulfilmentSections.module.css';

const DISPUTE_STATUS_LABEL: Record<string, string> = { open: 'Đang xử lý', resolved: 'Đã giải quyết' };

export function ShippingSection({ order }: { order: FarmerOrderDetail }) {
  const delivery = order.delivery;
  const status = delivery ? preOrderStatusInfo(delivery.status) : null;
  const showFee = order.deliveryMethod === 'carrier' && order.shippingFeeQuote != null;

  return (
    <DetailBlock title="Giao nhận" eyebrow="Bàn giao">
      <div className={styles.shipping}>
        <div className={styles.shippingState}>
          {status ? <StatusBadge label={status.label} tone={status.tone} /> : <p className={styles.note}>Chưa có ghi nhận giao nhận. Bản ghi sẽ xuất hiện khi hàng sẵn sàng bàn giao.</p>}
          {delivery?.trackingNote && <p className={styles.tracking}>{delivery.trackingNote}</p>}
        </div>
        {showFee && (
          <p className={styles.fee}>
            <span className={styles.feeLabel}>Cước vận chuyển ước tính</span>
            <strong className={styles.feeAmount}>{formatVnd(order.shippingFeeQuote as number)}</strong>
          </p>
        )}
      </div>
    </DetailBlock>
  );
}

export function DisputesSection({ order }: { order: FarmerOrderDetail }) {
  if (order.disputes.length === 0) return null;
  return (
    <DetailBlock title="Khiếu nại từ người mua" eyebrow="Cần lưu ý" tone="kraft">
      <ul className={styles.list}>
        {order.disputes.map((dispute) => (
          <li key={dispute.id} className={styles.dispute}>
            <div className={styles.disputeHead}>
              <strong className={styles.disputeStatus}>{DISPUTE_STATUS_LABEL[dispute.status] ?? dispute.status}</strong>
              <time dateTime={dispute.createdAt}>{new Date(dispute.createdAt).toLocaleDateString('vi-VN')}</time>
            </div>
            <p className={styles.reason}>{dispute.reason}</p>
            {dispute.resolutionNote && <p className={styles.resolution}>Kết quả: {dispute.resolutionNote}</p>}
          </li>
        ))}
      </ul>
    </DetailBlock>
  );
}

export function BuyerContactSection({ order }: { order: FarmerOrderDetail }) {
  const { phone, address } = order.buyer;
  return (
    <DetailBlock title="Liên hệ người mua" eyebrow="Khi bàn giao">
      {!phone && !address && <p className={styles.note}>Số điện thoại và địa chỉ người mua sẽ hiện khi đơn sẵn sàng bàn giao.</p>}
      <dl className={styles.contact}>
        {phone && <div className={styles.phone}><dt>Số điện thoại</dt><dd><a href={`tel:${phone}`}>{phone}</a></dd></div>}
        {address && <div className={styles.address}><dt>Địa chỉ</dt><dd>{address}</dd></div>}
      </dl>
    </DetailBlock>
  );
}
