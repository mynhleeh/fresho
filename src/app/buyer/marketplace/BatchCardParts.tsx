import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { deriveBatchPlaceholder } from '@/lib/batchPlaceholder';
import { isWikimediaCommonsPhoto, wikimediaThumbnailLoader } from '@/lib/wikimediaThumbnail';
import { VegetableIcon, FruitIcon, GrainIcon, LeafIcon, BasketIcon } from '../../components/ui/icons';
import type { BatchSummary } from './BuyerBatchCard';
import styles from './BuyerBatchCard.module.css';

const PLACEHOLDER_ICONS = {
  vegetable: VegetableIcon,
  fruit: FruitIcon,
  grain: GrainIcon,
  leaf: LeafIcon,
  basket: BasketIcon,
} as const;

const CARD_IMAGE_SIZES = '(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 34vw';

function PhotoPlaceholder({ batchId }: { batchId: string }) {
  const { icon, backgroundColor } = deriveBatchPlaceholder(batchId);
  const Icon = PLACEHOLDER_ICONS[icon];
  return (
    <div className={styles.placeholder} style={{ backgroundColor }}>
      <Icon className={styles.placeholderIcon} />
    </div>
  );
}

export function BatchPhoto({ batch, isEager }: { batch: BatchSummary; isEager: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [thumbnailFailedUrl, setThumbnailFailedUrl] = useState<string | null>(null);
  if (!batch.photoUrl || batch.photoUrl === failedUrl) return <PhotoPlaceholder batchId={batch.id} />;

  const useThumbnail = isWikimediaCommonsPhoto(batch.photoUrl) && batch.photoUrl !== thumbnailFailedUrl;
  return (
    <Image
      src={batch.photoUrl}
      alt=""
      fill
      sizes={CARD_IMAGE_SIZES}
      className={styles.photo}
      loading={isEager ? 'eager' : 'lazy'}
      fetchPriority={isEager ? 'high' : 'auto'}
      loader={useThumbnail ? wikimediaThumbnailLoader : undefined}
      unoptimized={!useThumbnail && !batch.photoUrl.startsWith('/')}
      onError={() => (useThumbnail ? setThumbnailFailedUrl(batch.photoUrl) : setFailedUrl(batch.photoUrl))}
    />
  );
}

export function TrustRing({ score }: { score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  return (
    <span
      className={styles.trustRing}
      style={{ '--trust-score': clampedScore } as CSSProperties}
      role="img"
      aria-label={`Điểm uy tín ${clampedScore}/100`}
    >
      <span className={styles.trustValue} aria-hidden="true">{clampedScore}</span>
    </span>
  );
}

export function BookedMeter({ batch }: { batch: BatchSummary }) {
  const bookedRatio = batch.quantityTotal > 0 ? (batch.quantityTotal - batch.quantityAvailable) / batch.quantityTotal : 0;
  const bookedPercent = Math.round(bookedRatio * 100);
  return (
    <div className={styles.meter}>
      <div className={styles.meterLabels}>
        <span>Đã đặt {bookedPercent}%</span>
        <span className={styles.meterRemaining}>Còn {batch.quantityAvailable} {batch.unit}</span>
      </div>
      <div className={styles.meterTrack} role="img" aria-label={`Đã đặt ${bookedPercent}% sản lượng`}>
        <span className={styles.meterFill} style={{ '--booked-ratio': bookedRatio } as CSSProperties} />
      </div>
    </div>
  );
}

export function BatchGridSkeleton({ count }: { count: number }) {
  return (
    <div className={styles.skeletonGrid} role="status" aria-busy="true" aria-label="Đang tải lô hàng">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonMedia} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLineShort} />
        </div>
      ))}
    </div>
  );
}
