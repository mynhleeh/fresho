import { useState } from 'react';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatVnd } from '../../components/order/MoneySummaryRow';
import { deriveBatchPlaceholder } from '@/lib/batchPlaceholder';
import { VegetableIcon, FruitIcon, GrainIcon, LeafIcon, BasketIcon, BookmarkIcon, TrustScoreIcon, UserCircleIcon } from '../../components/ui/icons';
import styles from './BuyerBatchCard.module.css';

export type BuyerBatch = {
  id: string;
  cropName: string;
  quantityAvailable: number;
  quantityTotal: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  qualityStandard: string | null;
  minOrderQuantity: number;
  harvestDateEstimate: string;
  photoUrl: string | null;
  description: string | null;
  farmer: { name: string; avatarUrl: string | null; trustScore: number };
};

const PLACEHOLDER_ICONS = {
  vegetable: VegetableIcon,
  fruit: FruitIcon,
  grain: GrainIcon,
  leaf: LeafIcon,
  basket: BasketIcon,
} as const;

function BatchThumbnail({ batch }: { batch: BuyerBatch }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (batch.photoUrl && batch.photoUrl !== failedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- local uploads, no remote-image optimization config needed for demo scope
      <img
        src={batch.photoUrl}
        alt={batch.cropName}
        className={styles.photo}
        width={130}
        height={220}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(batch.photoUrl)}
      />
    );
  }
  const { icon, backgroundColor } = deriveBatchPlaceholder(batch.id);
  const Icon = PLACEHOLDER_ICONS[icon];
  return (
    <div className={styles.placeholder} style={{ backgroundColor }}>
      <Icon className={styles.placeholderIcon} />
    </div>
  );
}

function formatHarvestDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('vi-VN');
}

export function BuyerBatchCard(props: {
  batch: BuyerBatch;
  isSaved: boolean;
  isCompared: boolean;
  onToggleSave: () => void;
  onToggleCompare: () => void;
  onMessage: () => void;
}) {
  const { batch } = props;

  return (
    <Card className={styles.card}>
      <div className={styles.thumbnailFrame}>
        <BatchThumbnail batch={batch} />
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.cropName}>{batch.cropName}</span>
          <span className={styles.price}>{formatVnd(batch.pricePerUnit)}/{batch.unit}</span>
        </div>
        <span className={styles.meta}>
          Còn lại {batch.quantityAvailable} {batch.unit} · Tối thiểu {batch.minOrderQuantity} {batch.unit}
        </span>
        <span className={styles.meta}>{batch.location} · Dự kiến thu hoạch {formatHarvestDate(batch.harvestDateEstimate)}</span>
        {batch.qualityStandard && <span className={styles.meta}>{batch.qualityStandard}</span>}

        <div className={styles.farmerRow}>
          {batch.farmer.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local uploads, no remote-image optimization config needed for demo scope
            <img
              src={batch.farmer.avatarUrl}
              alt={batch.farmer.name}
              className={styles.avatar}
              width={24}
              height={24}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <UserCircleIcon className={styles.avatarFallback} />
          )}
          <span className={styles.farmerName}>{batch.farmer.name}</span>
          <span className={styles.trustScore}>
            <TrustScoreIcon className={styles.trustScoreIcon} />
            {batch.farmer.trustScore}
          </span>
        </div>

        <div className={styles.actions}>
          <ButtonLink href={`/buyer/marketplace/${batch.id}`} className={styles.viewLink}>Xem lô hàng</ButtonLink>
          <Button variant="outline" onClick={props.onToggleSave}>
            <BookmarkIcon className={styles.actionIcon} />
            {props.isSaved ? 'Đã lưu' : 'Lưu lô'}
          </Button>
          <Button variant="outline" onClick={props.onToggleCompare}>
            {props.isCompared ? 'Bỏ so sánh' : 'So sánh'}
          </Button>
          <Button variant="outline" onClick={props.onMessage}>
            Nhắn tin
          </Button>
        </div>
      </div>
    </Card>
  );
}
