'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { EmptyState, LoadingSkeleton } from '../../../components/feedback/StateBlock';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import { displayFont } from '../../../components/layout/displayFont';
import { calculateGoodsAmount, calculateOrderTotal } from '@/lib/order/orderPricing';
import { calculateDepositAmount } from '@/lib/order/depositAmount';

import type { BuyerBatch } from '../BuyerBatchCard';
import { BatchGallery, type BatchPhoto } from './BatchGallery';
import { BatchHero } from './BatchHero';
import { BatchInfoCard } from './BatchInfoCard';
import type { DeliveryMethod } from './DeliveryStrip';
import { OrderFormCard, type VehicleType, type ShippingQuote } from './OrderFormCard';
import { InvoiceCard } from './InvoiceCard';
import styles from './page.module.css';

export default function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const router = useRouter();
  const [batch, setBatch] = useState<BuyerBatch | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('self_pickup');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorbike');
  const [distanceKm, setDistanceKm] = useState(10);
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [photos, setPhotos] = useState<BatchPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [placedPreOrder, setPlacedPreOrder] = useState<{ id: string; goodsAmount: number } | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/batches/${batchId}/photos`);
      if (res.ok) setPhotos(await res.json());
    })();
  }, [batchId]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/batches/${batchId}`);
      if (!res.ok) { setNotFound(true); return; }
      const data: BuyerBatch = await res.json();
      setBatch(data);
      setQuantity(data.minOrderQuantity);
    })();
  }, [batchId]);

  async function requestQuote() {
    const res = await fetch('/api/shipping-quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, quantity, vehicleType, distanceKm }),
    });
    setQuote(res.ok ? await res.json() : null);
  }

  async function placePreOrder(goodsAmount: number) {
    const res = await fetch('/api/preorders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchId,
        quantity,
        deliveryMethod,
        shippingFeeQuote: deliveryMethod === 'carrier' ? quote?.estimatedFee : undefined,
      }),
    });
    if (!res.ok) {
      setFeedback({ tone: 'error', text: await readApiErrorMessage(res) });
      return null;
    }
    const preOrder = await res.json();
    const placed = { id: preOrder.id as string, goodsAmount };
    setPlacedPreOrder(placed);
    return placed;
  }

  async function submitPreOrder() {
    if (!batch) return;
    setSubmitting(true);
    setFeedback(null);
    const placed = await placePreOrder(calculateGoodsAmount(quantity, batch.pricePerUnit));
    setSubmitting(false);
    if (placed) {
      setFeedback({ tone: 'success', text: 'Đã gửi đơn đặt trước. Khi nông dân xác nhận, bạn sẽ đặt cọc trong mục Đơn hàng của tôi.' });
    }
  }

  if (notFound) {
    return (
      <AppShell role="buyer">
        <div className={styles.stateMessage}>
          <EmptyState title="Không tìm thấy lô hàng này" hint="Lô hàng có thể đã bị gỡ hoặc đường dẫn chưa đúng. Hãy quay lại danh sách để chọn lô khác." />
        </div>
      </AppShell>
    );
  }

  if (!batch) {
    return (
      <AppShell role="buyer">
        <div className={styles.stateMessage}><LoadingSkeleton rows={4} /></div>
      </AppShell>
    );
  }

  const quantityIsValid = quantity >= batch.minOrderQuantity && quantity <= batch.quantityAvailable;
  const shippingFeePending = deliveryMethod === 'carrier' && !quote;
  const goodsAmount = calculateGoodsAmount(quantity, batch.pricePerUnit);
  const shippingFee = deliveryMethod === 'carrier' ? (quote?.estimatedFee ?? 0) : 0;
  const totalAmount = calculateOrderTotal(goodsAmount, shippingFee);

  return (
    <AppShell role="buyer">
      <div className={`${styles.page} ${displayFont.variable}`}>
        <BatchHero batch={batch} onBack={() => router.push('/buyer/marketplace')} />

        <div className={styles.mainGrid}>
          <div className={styles.mainColumn}>
            <BatchInfoCard batch={batch} />
            {photos.length > 1 && <BatchGallery photos={photos} cropName={batch.cropName} />}
            {placedPreOrder && <p className={styles.lockedNote}>Đơn đã được tạo nên không thể sửa số lượng hoặc cách nhận hàng.</p>}
            <fieldset className={styles.lockedGroup} disabled={placedPreOrder !== null}>
            <OrderFormCard
              batch={batch}
              quantity={quantity}
              onQuantityChange={setQuantity}
              goodsAmount={goodsAmount}
              quantityIsValid={quantityIsValid}
              deliveryMethod={deliveryMethod}
              onDeliveryMethodChange={(method) => { setDeliveryMethod(method); setQuote(null); }}
              vehicleType={vehicleType}
              onVehicleTypeChange={setVehicleType}
              distanceKm={distanceKm}
              onDistanceChange={setDistanceKm}
              quote={quote}
              onRequestQuote={requestQuote}
            />
            </fieldset>
          </div>

          <div className={styles.sideColumn} data-slot="invoice">
            <InvoiceCard
              cropName={batch.cropName}
              quantityLabel={`${quantity} ${batch.unit}`}
              goodsAmount={goodsAmount}
              shippingFee={shippingFee}
              shippingFeePending={shippingFeePending}
              totalAmount={totalAmount}
              confirmDisabled={!quantityIsValid || shippingFeePending || placedPreOrder !== null}
              depositAmount={calculateDepositAmount(placedPreOrder?.goodsAmount ?? goodsAmount)}
              onBack={() => router.push('/buyer/marketplace')}
              onConfirm={submitPreOrder}
              submitting={submitting}
              feedback={feedback}
              ordersHref="/buyer/orders"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
