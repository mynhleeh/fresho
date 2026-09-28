import { memo } from 'react';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Button } from '../../components/ui/Button';
import { formatVnd } from '../../components/order/MoneySummaryRow';
import { BookmarkIcon, UserCircleIcon } from '../../components/ui/icons';
import { BatchPhoto, BookedMeter, TrustRing } from './BatchCardParts';
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

export type BatchSummary = Pick<
  BuyerBatch,
  'id' | 'cropName' | 'quantityAvailable' | 'quantityTotal' | 'unit' | 'pricePerUnit' | 'location' | 'harvestDateEstimate' | 'photoUrl' | 'farmer'
>;

const harvestDateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

type BatchCardProps = {
  batch: BatchSummary;
  isSaved: boolean;
  isCompared: boolean;
  isFeatured: boolean;
  isEager: boolean;
  onToggleSave: (batchId: string) => void;
  onToggleCompare: (batchId: string) => void;
  onMessage: (batch: BatchSummary) => void;
};

function FarmerRow({ farmer }: { farmer: BatchSummary['farmer'] }) {
  return (
    <div className={styles.farmerRow}>
      {farmer.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={farmer.avatarUrl} alt="" className={styles.avatar} width={40} height={40} loading="lazy" decoding="async" />
      ) : (
        <UserCircleIcon className={styles.avatarFallback} />
      )}
      <span className={styles.farmerName}>{farmer.name}</span>
      <TrustRing score={farmer.trustScore} />
    </div>
  );
}

function BatchActions({ batch, isSaved, isCompared, onToggleSave, onToggleCompare, onMessage }: BatchCardProps) {
  return (
    <div className={styles.actions}>
      <div className={styles.primaryRow}>
        <ButtonLink href={`/buyer/marketplace/${batch.id}`} className={styles.viewLink}>Xem lô hàng</ButtonLink>
        <Button
          variant="outline"
          className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
          aria-label={`Lưu lô ${batch.cropName}`}
          aria-pressed={isSaved}
          onClick={() => onToggleSave(batch.id)}
        >
          <BookmarkIcon className={styles.actionIcon} />
        </Button>
      </div>
      <div className={styles.secondaryRow}>
        <Button
          variant="ghost"
          className={styles.secondaryAction}
          aria-label={`So sánh lô ${batch.cropName}`}
          aria-pressed={isCompared}
          onClick={() => onToggleCompare(batch.id)}
        >
          {isCompared ? 'Bỏ so sánh' : 'So sánh'}
        </Button>
        <Button variant="ghost" className={styles.secondaryAction} aria-label={`Nhắn tin về lô ${batch.cropName}`} onClick={() => onMessage(batch)}>
          Nhắn tin
        </Button>
      </div>
    </div>
  );
}

function BuyerBatchCardView(props: BatchCardProps) {
  const { batch, isCompared, isFeatured, isEager } = props;
  const cardClass = `${styles.card} ${isFeatured ? styles.featured : ''} ${isCompared ? styles.compared : ''}`;

  return (
    <article className={cardClass}>
      <div className={styles.media}>
        <BatchPhoto batch={batch} isEager={isEager} />
        <span className={styles.harvestBadge}>Thu hoạch {harvestDateFormat.format(new Date(batch.harvestDateEstimate))}</span>
      </div>
      <div className={styles.body}>
        <FarmerRow farmer={batch.farmer} />
        <div className={styles.titleGroup}>
          <h3 className={styles.cropName}>{batch.cropName}</h3>
          <span className={styles.location}>{batch.location}</span>
        </div>
        <p className={styles.price}>
          {formatVnd(batch.pricePerUnit)}<span className={styles.priceUnit}>/{batch.unit}</span>
        </p>
        <BookedMeter batch={batch} />
        <BatchActions {...props} />
      </div>
    </article>
  );
}

export const BuyerBatchCard = memo(BuyerBatchCardView);
