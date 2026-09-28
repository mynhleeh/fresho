import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatVnd } from '../../components/order/MoneySummaryRow';
import { batchStatusInfo } from '@/lib/order/orderStatus';
import { deriveBatchPlaceholder } from '@/lib/batchPlaceholder';
import { VegetableIcon, FruitIcon, GrainIcon, LeafIcon, BasketIcon } from '../../components/ui/icons';
import styles from './BatchCard.module.css';

export type Batch = {
  id: string;
  cropName: string;
  quantityTotal: number;
  quantityAvailable: number;
  unit: string;
  pricePerUnit: number;
  status: string;
  photoUrl: string | null;
  isHidden?: boolean;
};

const PLACEHOLDER_ICONS = {
  vegetable: VegetableIcon,
  fruit: FruitIcon,
  grain: GrainIcon,
  leaf: LeafIcon,
  basket: BasketIcon,
} as const;

function BatchThumbnail({ batch }: { batch: Batch }) {
  const status = batchStatusInfo(batch.status);
  const dimmedClass = batch.isHidden ? styles.dimmed : '';

  return (
    <div className={styles.thumbnailFrame}>
      {batch.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- local uploads, no remote-image optimization config needed for demo scope
        <img src={batch.photoUrl} alt={batch.cropName} className={`${styles.photo} ${dimmedClass}`} />
      ) : (
        <ThumbnailPlaceholder batch={batch} dimmedClass={dimmedClass} />
      )}
      <div className={styles.statusStrip}>
        <StatusBadge label={status.label} tone={status.tone} />
        {batch.isHidden && <StatusBadge label="Đã ẩn khỏi người mua" tone="neutral" />}
      </div>
    </div>
  );
}

function ThumbnailPlaceholder({ batch, dimmedClass }: { batch: Batch; dimmedClass: string }) {
  const { icon, backgroundColor } = deriveBatchPlaceholder(batch.id);
  const Icon = PLACEHOLDER_ICONS[icon];
  return (
    <div className={`${styles.placeholder} ${dimmedClass}`} style={{ backgroundColor }}>
      <Icon className={styles.placeholderIcon} />
    </div>
  );
}

// True when a different batch's edit panel is open, so this card should recede
// into a low-detail gray frame rather than compete visually with the focused one.
// Distinct from Batch.isHidden, which is the buyer-facing public visibility toggle.
export function BatchCard(props: {
  batch: Batch;
  onEdit?: () => void;
  onToggleHidden?: () => void;
  isEditFocusElsewhere?: boolean;
}) {
  const { batch } = props;
  const hasActions = props.onEdit || props.onToggleHidden;

  if (props.isEditFocusElsewhere) {
    return (
      <Card className={`${styles.card} ${styles.skeletonCard}`} aria-hidden="true">
        <div className={styles.thumbnailFrame}>
          <div className={styles.skeletonThumbnail} />
        </div>
        <div className={styles.body}>
          <div className={styles.skeletonLine} style={{ width: '70%' }} />
          <div className={styles.skeletonLine} style={{ width: '45%' }} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <BatchThumbnail batch={batch} />
      <div className={styles.body}>
        <div className={styles.name}>{batch.cropName}</div>
        <div className={styles.meta}>
          Còn lại {batch.quantityAvailable.toLocaleString('vi-VN')}/{batch.quantityTotal.toLocaleString('vi-VN')} {batch.unit} · {formatVnd(batch.pricePerUnit)}/{batch.unit}
        </div>
        {hasActions && (
          <div className={styles.actions}>
            {props.onEdit && <Button variant="outline" onClick={props.onEdit}>Chỉnh sửa</Button>}
            {props.onToggleHidden && (
              <Button variant="outline" onClick={props.onToggleHidden}>
                {batch.isHidden ? 'Hiện' : 'Ẩn'}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
