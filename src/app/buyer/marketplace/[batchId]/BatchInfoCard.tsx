import type { ReactNode } from 'react';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { HarvestBatchIcon, BuyerStoreIcon, LeafIcon, TrustScoreIcon, UserCircleIcon } from '../../../components/ui/icons';
import type { BuyerBatch } from '../BuyerBatchCard';
import { TrustRing } from './TrustRing';
import styles from './BatchInfoCard.module.css';

function formatHarvestDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('vi-VN');
}

function PinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function StockTile({ batch }: { batch: BuyerBatch }) {
  const ratio = batch.quantityTotal > 0 ? Math.min(batch.quantityAvailable / batch.quantityTotal, 1) : 0;
  return (
    <div className={`${styles.tile} ${styles.stockTile}`}>
      <span className={styles.tileLabel}><HarvestBatchIcon className={styles.tileIcon} />Sản lượng còn lại</span>
      <span className={styles.stockValue}>
        {batch.quantityAvailable.toLocaleString('vi-VN')}
        <span className={styles.stockUnit}> {batch.unit}</span>
      </span>
      <div className={styles.stockTrack} role="img" aria-label={`Còn ${Math.round(ratio * 100)}% tổng sản lượng`}>
        <span className={styles.stockFill} style={{ width: `${ratio * 100}%` }} />
      </div>
      <span className={styles.tileHint}>
        Đã đặt {(batch.quantityTotal - batch.quantityAvailable).toLocaleString('vi-VN')} / {batch.quantityTotal.toLocaleString('vi-VN')} {batch.unit}
      </span>
    </div>
  );
}

function PriceTile({ batch }: { batch: BuyerBatch }) {
  return (
    <div className={`${styles.tile} ${styles.priceTile}`}>
      <span className={styles.tileLabel}>Giá bán</span>
      <span className={styles.priceValue}>{formatVnd(batch.pricePerUnit)}</span>
      <span className={styles.tileHint}>mỗi {batch.unit}, chưa gồm phí vận chuyển</span>
    </div>
  );
}

function FactTile({ icon, label, value, wide, fullOnMobile }: { icon: ReactNode; label: string; value: string; wide?: boolean; fullOnMobile?: boolean }) {
  return (
    <div className={`${styles.tile} ${styles.factTile} ${wide ? styles.wideTile : ''} ${fullOnMobile ? styles.fullOnMobileTile : ''}`}>
      <span className={styles.factBadge}>{icon}</span>
      <span className={styles.factText}>
        <span className={styles.tileLabel}>{label}</span>
        <span className={styles.factValue}>{value}</span>
      </span>
    </div>
  );
}

function FarmerCard({ farmer }: { farmer: BuyerBatch['farmer'] }) {
  return (
    <div className={styles.farmerCard}>
      <TrustRing score={farmer.trustScore}>
        {farmer.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local uploads, no remote-image optimization config needed for demo scope
          <img src={farmer.avatarUrl} alt="" className={styles.farmerAvatar} width={58} height={58} loading="lazy" decoding="async" />
        ) : (
          <UserCircleIcon className={styles.farmerAvatarFallback} />
        )}
      </TrustRing>
      <div className={styles.farmerText}>
        <span className={styles.tileLabel}>Nông dân</span>
        <span className={styles.farmerName}>{farmer.name}</span>
        <span className={styles.trustScore}>
          <TrustScoreIcon className={styles.trustScoreIcon} />
          {farmer.trustScore} điểm uy tín
        </span>
      </div>
    </div>
  );
}

export function BatchInfoCard({ batch }: { batch: BuyerBatch }) {
  return (
    <div className={styles.bento}>
      <StockTile batch={batch} />
      <PriceTile batch={batch} />
      <FactTile icon={<BuyerStoreIcon className={styles.factIcon} />} label="Đặt tối thiểu" value={`${batch.minOrderQuantity} ${batch.unit}`} />
      <FactTile icon={<HarvestBatchIcon className={styles.factIcon} />} label="Thu hoạch" value={formatHarvestDate(batch.harvestDateEstimate)} />
      {batch.qualityStandard && (
        <FactTile icon={<LeafIcon className={styles.factIcon} />} label="Tiêu chuẩn chất lượng" value={batch.qualityStandard} wide />
      )}
      <FactTile icon={<PinGlyph className={styles.factIcon} />} label="Vị trí" value={batch.location} wide fullOnMobile />
      {batch.description && <p className={`${styles.tile} ${styles.noteTile}`}>{batch.description}</p>}
      <FarmerCard farmer={batch.farmer} />
    </div>
  );
}
