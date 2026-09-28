import { Button } from '../../../components/ui/Button';
import type { BuyerBatch } from '../BuyerBatchCard';
import { AnimatedMoney } from './AnimatedMoney';
import { DeliveryStrip, type DeliveryMethod } from './DeliveryStrip';
import styles from './OrderFormCard.module.css';

export type VehicleType = 'motorbike' | 'small_truck' | 'refrigerated_truck';
export type ShippingQuote = { estimatedFee: number; pickupWindow: string; storageRequirement: string; vehicleType: string };

const VEHICLE_LABEL: Record<VehicleType, string> = {
  motorbike: 'Xe máy',
  small_truck: 'Xe tải nhỏ',
  refrigerated_truck: 'Xe lạnh',
};

function clampQuantity(quantity: number, batch: BuyerBatch): number {
  return Math.min(Math.max(quantity, batch.minOrderQuantity), batch.quantityAvailable);
}

function parseTypedQuantity(rawValue: string, batch: BuyerBatch): number {
  const digits = rawValue.replace(/\D/g, '');
  return digits === '' ? 0 : Math.min(Number(digits), batch.quantityAvailable);
}

function QuantityPanel(props: {
  batch: BuyerBatch;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  goodsAmount: number;
  quantityIsValid: boolean;
}) {
  const { batch, quantity } = props;
  return (
    <div className={styles.quantityPanel}>
      <div className={styles.quantityControls}>
        <label htmlFor="quantity" className={styles.fieldLabel}>Số lượng đặt trước</label>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.stepButton}
            aria-label="Giảm số lượng"
            onClick={() => props.onQuantityChange(clampQuantity(quantity - 1, batch))}
          >
            −
          </button>
          <input
            id="quantity"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={styles.quantityInput}
            value={quantity === 0 ? '' : String(quantity)}
            onChange={(e) => props.onQuantityChange(parseTypedQuantity(e.target.value, batch))}
            onBlur={() => props.onQuantityChange(clampQuantity(quantity, batch))}
          />
          <button
            type="button"
            className={styles.stepButton}
            aria-label="Tăng số lượng"
            onClick={() => props.onQuantityChange(clampQuantity(quantity + 1, batch))}
          >
            +
          </button>
          <span className={styles.unit}>{batch.unit}</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          aria-label="Điều chỉnh số lượng"
          min={batch.minOrderQuantity}
          max={batch.quantityAvailable}
          value={clampQuantity(quantity, batch)}
          onChange={(e) => props.onQuantityChange(Number(e.target.value))}
        />
        <div className={styles.sliderEnds}>
          <span>Tối thiểu {batch.minOrderQuantity} {batch.unit}</span>
          <span>Tối đa {batch.quantityAvailable} {batch.unit}</span>
        </div>
        {!props.quantityIsValid && (
          <span className={styles.quantityError} role="alert">
            Số lượng phải từ {batch.minOrderQuantity} đến {batch.quantityAvailable} {batch.unit}
          </span>
        )}
      </div>
      <div className={styles.goodsTile}>
        <span className={styles.goodsLabel}>Tiền hàng</span>
        <AnimatedMoney amount={props.goodsAmount} className={styles.goodsValue} />
        <span className={styles.goodsHint}>{quantity} {batch.unit} × {batch.pricePerUnit.toLocaleString('vi-VN')} đồng</span>
      </div>
    </div>
  );
}

function ShippingPanel(props: {
  vehicleType: VehicleType;
  onVehicleTypeChange: (vehicleType: VehicleType) => void;
  distanceKm: number;
  onDistanceChange: (distanceKm: number) => void;
  quote: ShippingQuote | null;
  onRequestQuote: () => void;
}) {
  return (
    <div className={styles.shippingPanel}>
      <div className={styles.shippingFields}>
        <select
          className={styles.shippingControl}
          aria-label="Loại xe"
          value={props.vehicleType}
          onChange={(e) => props.onVehicleTypeChange(e.target.value as VehicleType)}
        >
          {(Object.keys(VEHICLE_LABEL) as VehicleType[]).map((v) => (
            <option key={v} value={v}>{VEHICLE_LABEL[v]}</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          className={styles.shippingControl}
          aria-label="Khoảng cách (km)"
          value={props.distanceKm}
          onChange={(e) => props.onDistanceChange(Number(e.target.value))}
        />
        <span className={styles.unit}>km</span>
        <Button variant="outline" className={styles.quoteButton} onClick={props.onRequestQuote}>Xem báo cước</Button>
      </div>
      {props.quote ? (
        <div className={styles.quoteCard}>
          <span className={styles.goodsLabel}>Cước vận chuyển dự kiến</span>
          <AnimatedMoney amount={props.quote.estimatedFee} className={styles.quoteFee} />
          <span className={styles.goodsHint}>Lấy hàng: {props.quote.pickupWindow}</span>
          <span className={styles.goodsHint}>Bảo quản: {props.quote.storageRequirement}</span>
        </div>
      ) : (
        <span className={styles.goodsHint}>Chọn loại xe và khoảng cách để nhận báo cước trước khi gửi đơn.</span>
      )}
    </div>
  );
}

export function OrderFormCard(props: {
  batch: BuyerBatch;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  goodsAmount: number;
  quantityIsValid: boolean;
  deliveryMethod: DeliveryMethod;
  onDeliveryMethodChange: (method: DeliveryMethod) => void;
  vehicleType: VehicleType;
  onVehicleTypeChange: (vehicleType: VehicleType) => void;
  distanceKm: number;
  onDistanceChange: (distanceKm: number) => void;
  quote: ShippingQuote | null;
  onRequestQuote: () => void;
}) {
  return (
    <section className={styles.form}>
      <h2 className={styles.sectionTitle}>Bạn cần bao nhiêu?</h2>
      <QuantityPanel
        batch={props.batch}
        quantity={props.quantity}
        onQuantityChange={props.onQuantityChange}
        goodsAmount={props.goodsAmount}
        quantityIsValid={props.quantityIsValid}
      />
      <h2 className={styles.sectionTitle}>Nhận hàng bằng cách nào?</h2>
      <DeliveryStrip method={props.deliveryMethod} onChange={props.onDeliveryMethodChange} />
      {props.deliveryMethod === 'carrier' && (
        <ShippingPanel
          vehicleType={props.vehicleType}
          onVehicleTypeChange={props.onVehicleTypeChange}
          distanceKm={props.distanceKm}
          onDistanceChange={props.onDistanceChange}
          quote={props.quote}
          onRequestQuote={props.onRequestQuote}
        />
      )}
    </section>
  );
}
