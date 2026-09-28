import type { ReactNode } from 'react';
import { PickupArt, CarrierArt } from './DeliveryArt';
import styles from './DeliveryStrip.module.css';

export type DeliveryMethod = 'self_pickup' | 'carrier';

function DeliveryOption(props: {
  art: ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={props.selected}
      className={`${styles.option} ${props.selected ? styles.optionSelected : ''}`}
      onClick={props.onSelect}
    >
      <span className={styles.art}>{props.art}</span>
      <span className={styles.optionBody}>
        <span className={styles.optionLabel}>{props.label}</span>
        <span className={styles.optionDescription}>{props.description}</span>
      </span>
      <span className={styles.check} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    </button>
  );
}

export function DeliveryStrip({ method, onChange }: { method: DeliveryMethod; onChange: (method: DeliveryMethod) => void }) {
  return (
    <div className={styles.strip} role="group" aria-label="Phương thức nhận hàng">
      <DeliveryOption
        art={<PickupArt className={styles.artSvg} />}
        label="Tự đến lấy"
        description="Bạn tự bố trí phương tiện đến vườn nhận hàng, không mất phí vận chuyển"
        selected={method === 'self_pickup'}
        onSelect={() => onChange('self_pickup')}
      />
      <DeliveryOption
        art={<CarrierArt className={styles.artSvg} />}
        label="Đặt vận chuyển"
        description="Nền tảng gửi yêu cầu báo giá đến đối tác logistics phù hợp"
        selected={method === 'carrier'}
        onSelect={() => onChange('carrier')}
      />
    </div>
  );
}
