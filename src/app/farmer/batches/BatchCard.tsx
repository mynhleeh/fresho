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
  onStartHarvest: () => void;
  onMarkReady: () => void;
  onToggleProgress: () => void;
  progressOpen: boolean;
  onPostProgress: (kind: 'on_track' | 'quantity_adjusted' | 'rescheduled') => void;
  progressQuantity: number;
  onProgressQuantityChange: (n: number) => void;
  progressDate: string;
  onProgressDateChange: (d: string) => void;
}) {
  const { batch } = props;
  const status = batchStatusInfo(batch.status);

  return (
    <Card className={styles.card}>
      <BatchThumbnail batch={batch} />
      <div className={styles.body}>
        <div className={styles.name}>{batch.cropName}</div>
        <div className={styles.meta}>
          Còn lại {batch.quantityAvailable}/{batch.quantityTotal} {batch.unit} · {formatVnd(batch.pricePerUnit)}/{batch.unit}
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
        <div className={styles.actions}>
          <Button variant="outline" onClick={props.onStartHarvest}>Bắt đầu thu hoạch</Button>
          <Button onClick={props.onMarkReady}>Sẵn sàng giao</Button>
          <Button variant="outline" onClick={props.onToggleProgress}>Cập nhật tiến độ</Button>
        </div>
        {props.progressOpen && (
          <div className={styles.progressPanel}>
            <Button variant="outline" onClick={() => props.onPostProgress('on_track')}>Đúng tiến độ</Button>
            <div className={styles.field}>
              <label htmlFor={`newQty-${batch.id}`}>Điều chỉnh sản lượng</label>
              <input
                id={`newQty-${batch.id}`}
                type="number"
                defaultValue={batch.quantityTotal}
                onChange={(e) => props.onProgressQuantityChange(Number(e.target.value))}
              />
              <Button variant="outline" onClick={() => props.onPostProgress('quantity_adjusted')}>Lưu sản lượng</Button>
            </div>
            <div className={styles.field}>
              <label htmlFor={`newDate-${batch.id}`}>Dời ngày thu hoạch</label>
              <input
                id={`newDate-${batch.id}`}
                type="date"
                onChange={(e) => props.onProgressDateChange(e.target.value)}
              />
              <Button variant="outline" onClick={() => props.onPostProgress('rescheduled')}>Lưu ngày mới</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
