import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
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
};

const PLACEHOLDER_ICONS = {
  vegetable: VegetableIcon,
  fruit: FruitIcon,
  grain: GrainIcon,
  leaf: LeafIcon,
  basket: BasketIcon,
} as const;

function BatchThumbnail({ batch }: { batch: Batch }) {
  if (batch.photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- local uploads, no remote-image optimization config needed for demo scope
    return <img src={batch.photoUrl} alt={batch.cropName} className={styles.photo} />;
  }
  const { icon, colorToken } = deriveBatchPlaceholder(batch.id);
  const Icon = PLACEHOLDER_ICONS[icon];
  return (
    <div className={styles.placeholder} style={{ backgroundColor: `var(${colorToken})` }}>
      <Icon className={styles.placeholderIcon} />
    </div>
  );
}

export function BatchCard(props: {
  batch: Batch;
  onStartHarvest?: () => void;
  onMarkReady?: () => void;
  onEdit?: () => void;
}) {
  const { batch } = props;
  const status = batchStatusInfo(batch.status);
  const hasActions = props.onStartHarvest || props.onMarkReady || props.onEdit;

  return (
    <Card className={styles.card}>
      <BatchThumbnail batch={batch} />
      <div className={styles.body}>
        <div className={styles.name}>{batch.cropName}</div>
        <div className={styles.meta}>
          Còn lại {batch.quantityAvailable}/{batch.quantityTotal} {batch.unit} · {formatVnd(batch.pricePerUnit)}/{batch.unit}
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
        {hasActions && (
          <div className={styles.actions}>
            {props.onStartHarvest && <Button variant="outline" onClick={props.onStartHarvest}>Bắt đầu thu hoạch</Button>}
            {props.onMarkReady && <Button onClick={props.onMarkReady}>Sẵn sàng giao</Button>}
            {props.onEdit && <Button variant="outline" onClick={props.onEdit}>Chỉnh sửa</Button>}
          </div>
        )}
      </div>
    </Card>
  );
}
