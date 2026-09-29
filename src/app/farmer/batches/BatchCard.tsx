import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
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
  harvestDateEstimate?: string;
};

const PLACEHOLDER_ICONS = {
  vegetable: VegetableIcon,
  fruit: FruitIcon,
  grain: GrainIcon,
  leaf: LeafIcon,
  basket: BasketIcon,
} as const;

const PHOTO_SIZES = '(max-width: 600px) 100vw, 400px';

const harvestDateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' });

function ThumbnailPlaceholder({ batch, dimmedClass }: { batch: Batch; dimmedClass: string }) {
  const { icon, backgroundColor } = deriveBatchPlaceholder(batch.id);
  const Icon = PLACEHOLDER_ICONS[icon];
  return (
    <div className={`${styles.placeholder} ${dimmedClass}`} style={{ backgroundColor }}>
      <Icon className={styles.placeholderIcon} />
    </div>
  );
}

function BatchThumbnail({ batch }: { batch: Batch }) {
  const status = batchStatusInfo(batch.status);
  const dimmedClass = batch.isHidden ? styles.dimmed : '';
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    <div className={styles.thumbnailFrame}>
      {batch.photoUrl && batch.photoUrl !== failedUrl ? (
        <Image
          src={batch.photoUrl}
          alt={batch.cropName}
          className={`${styles.photo} ${dimmedClass}`}
          width={640}
          height={360}
          sizes={PHOTO_SIZES}
          loading="lazy"
          decoding="async"
          unoptimized={!batch.photoUrl.startsWith('/')}
          onError={() => setFailedUrl(batch.photoUrl)}
        />
      ) : (
        <ThumbnailPlaceholder batch={batch} dimmedClass={dimmedClass} />
      )}
      <div className={styles.thumbnailScrim} />
      <div className={styles.statusStrip}>
        <StatusBadge label={status.label} tone={status.tone} />
        {batch.isHidden && <StatusBadge label="Đã ẩn khỏi người mua" tone="neutral" />}
      </div>
    </div>
  );
}

function BookedProgress({ batch }: { batch: Batch }) {
  const bookedRatio = batch.quantityTotal > 0 ? (batch.quantityTotal - batch.quantityAvailable) / batch.quantityTotal : 0;
  const bookedPercent = Math.round(bookedRatio * 100);
  return (
    <div className={styles.progress}>
      <div className={styles.progressLabels}>
        <span>Đã đặt {bookedPercent}%</span>
        <span className={styles.progressRemaining}>Còn {batch.quantityAvailable.toLocaleString('vi-VN')} {batch.unit}</span>
      </div>
      <div className={styles.progressTrack} role="img" aria-label={`Đã đặt trước ${bookedPercent}% sản lượng`}>
        <span className={styles.progressFill} style={{ '--booked-ratio': bookedRatio } as CSSProperties} />
      </div>
    </div>
  );
}

function useDaysUntil(targetDate: string): number {
  const [daysLeft, setDaysLeft] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaysLeft(Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000));
  }, [targetDate]);
  return daysLeft;
}

function HarvestTimeline({ harvestDateEstimate }: { harvestDateEstimate: string }) {
  const daysLeft = useDaysUntil(harvestDateEstimate);
  const stageIndex = daysLeft <= 0 ? 2 : daysLeft <= 7 ? 1 : 0;
  return (
    <div className={styles.timeline} aria-hidden="true">
      {['Đăng lô', 'Gần thu hoạch', 'Thu hoạch'].map((stage, index) => (
        <span key={stage} className={`${styles.timelineDot} ${index <= stageIndex ? styles.timelineDotActive : ''}`} />
      ))}
      <span className={styles.timelineLabel}>
        {daysLeft > 0 ? `Còn ${daysLeft} ngày · ${harvestDateFormat.format(new Date(harvestDateEstimate))}` : `Thu hoạch ${harvestDateFormat.format(new Date(harvestDateEstimate))}`}
      </span>
    </div>
  );
}

export function BatchCard(props: {
  batch: Batch;
  onEdit?: () => void;
  onToggleHidden?: () => void;
  isEditFocusElsewhere?: boolean;
}) {
  const { batch } = props;

  if (props.isEditFocusElsewhere) {
    return (
      <Card className={`${styles.card} ${styles.skeletonCard}`} aria-hidden="true">
        <div className={styles.thumbnailFrame}>
          <div className={styles.skeletonThumbnail} />
        </div>
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <span className={styles.skeletonLine} style={{ width: '70%' }} />
          </div>
          <div className={styles.progress}>
            <span className={styles.skeletonLine} style={{ width: '45%' }} />
            <span className={styles.skeletonTrack} />
          </div>
          <div className={styles.timelineSlot}>
            <span className={styles.skeletonLine} style={{ width: '55%' }} />
          </div>
          <div className={styles.actions} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <BatchThumbnail batch={batch} />
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.name}>{batch.cropName}</span>
          <span className={styles.price}>{formatVnd(batch.pricePerUnit)}<span className={styles.priceUnit}>/{batch.unit}</span></span>
        </div>
        <BookedProgress batch={batch} />
        <div className={styles.timelineSlot}>
          {batch.harvestDateEstimate && <HarvestTimeline harvestDateEstimate={batch.harvestDateEstimate} />}
        </div>
        <div className={styles.actions}>
          {props.onEdit && <Button variant="outline" onClick={props.onEdit}>Chỉnh sửa</Button>}
          {props.onToggleHidden && (
            <Button variant="outline" onClick={props.onToggleHidden}>
              {batch.isHidden ? 'Hiện' : 'Ẩn'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
