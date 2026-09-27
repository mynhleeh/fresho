import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatVnd } from '../../components/MoneySummaryRow';
import { batchStatusInfo } from '@/lib/orderStatus';
import { deriveBatchPlaceholder } from '@/lib/batchPlaceholder';
import { VegetableIcon, FruitIcon, GrainIcon, LeafIcon, BasketIcon } from '../../components/icons';
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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function BatchThumbnail({ batch }: { batch: Batch }) {
  const status = batchStatusInfo(batch.status);
  const dimmedClass = batch.isHidden ? styles.dimmed : '';
  const stripToneClass = styles[`strip${capitalize(status.tone)}`];

  return (
    <div className={styles.thumbnailFrame}>
      {batch.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- local uploads, no remote-image optimization config needed for demo scope
        <img src={batch.photoUrl} alt={batch.cropName} className={`${styles.photo} ${dimmedClass}`} />
      ) : (
        <ThumbnailPlaceholder batch={batch} dimmedClass={dimmedClass} />
      )}
      <div className={`${styles.statusStrip} ${stripToneClass}`}>{status.label}</div>
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

export function BatchCard(props: {
  batch: Batch;
  onEdit?: () => void;
  onToggleHidden?: () => void;
}) {
  const { batch } = props;
  const hasActions = props.onEdit || props.onToggleHidden;

  return (
    <Card className={styles.card}>
      <BatchThumbnail batch={batch} />
      <div className={styles.body}>
        <div className={styles.name}>{batch.cropName}</div>
        <div className={styles.meta}>
          Còn lại {batch.quantityAvailable}/{batch.quantityTotal} {batch.unit} · {formatVnd(batch.pricePerUnit)}/{batch.unit}
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
