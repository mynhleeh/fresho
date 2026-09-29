import { useState } from 'react';
import Image from 'next/image';
import { Button } from '../../../components/ui/Button';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { LeafIcon } from '../../../components/ui/icons';
import type { BuyerBatch } from '../BuyerBatchCard';
import { CropScene } from './CropScene';
import styles from './BatchHero.module.css';

const DAY_IN_MS = 86_400_000;
const PHOTO_SIZES = '(max-width: 900px) 100vw, 520px';

function formatHarvestDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('vi-VN');
}

function describeHarvestCountdown(daysLeft: number): string {
  if (daysLeft > 0) return `Còn ${daysLeft} ngày`;
  if (daysLeft === 0) return 'Thu hoạch hôm nay';
  return 'Đã đến kỳ thu hoạch';
}

function HeroVisual({ batch }: { batch: BuyerBatch }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    <div className={styles.visual}>
      <span className={styles.blobBack} aria-hidden="true" />
      <span className={styles.blobAccent} aria-hidden="true" />
      <div className={styles.frame}>
        {batch.photoUrl && batch.photoUrl !== failedUrl ? (
          <Image
            src={batch.photoUrl}
            alt={batch.cropName}
            className={styles.photo}
            width={520}
            height={420}
            sizes={PHOTO_SIZES}
            decoding="async"
            fetchPriority="high"
            unoptimized={!batch.photoUrl.startsWith('/')}
            onError={() => setFailedUrl(batch.photoUrl)}
          />
        ) : (
          <CropScene cropName={batch.cropName} />
        )}
      </div>
    </div>
  );
}

function HarvestTimeline({ batch, daysLeft }: { batch: BuyerBatch; daysLeft: number }) {
  return (
    <div className={styles.timeline}>
      <span className={styles.timelineNode} aria-hidden="true"><LeafIcon className={styles.timelineIcon} /></span>
      <span className={styles.timelineTrack} aria-hidden="true" />
      <span className={styles.timelineBadge}>{describeHarvestCountdown(daysLeft)}</span>
      <span className={styles.timelineTrack} aria-hidden="true" />
      <span className={styles.timelineEnd}>{formatHarvestDate(batch.harvestDateEstimate)}</span>
    </div>
  );
}

export function BatchHero({ batch, onBack }: { batch: BuyerBatch; onBack: () => void }) {
  const [now] = useState(() => Date.now());
  const daysLeft = Math.ceil((new Date(batch.harvestDateEstimate).getTime() - now) / DAY_IN_MS);

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Button variant="outline" className={styles.backButton} onClick={onBack}>← Danh sách lô hàng</Button>
          <span className={styles.eyebrow}>Thu hoạch dự kiến</span>
          <h1 className={styles.title}>{batch.cropName}</h1>
          <div className={styles.priceLine}>
            <span className={styles.price}>{formatVnd(batch.pricePerUnit)}</span>
            <span className={styles.priceUnit}>/{batch.unit}</span>
          </div>
          <div className={styles.chips}>
            {batch.qualityStandard && <span className={styles.chip}>{batch.qualityStandard}</span>}
            <span className={styles.chip}>{batch.location}</span>
          </div>
          <HarvestTimeline batch={batch} daysLeft={daysLeft} />
        </div>
        <HeroVisual batch={batch} />
      </div>
    </section>
  );
}
