'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Overlay } from '../../components/Overlay';
import { MoneySummaryRow, formatVnd } from '../../components/MoneySummaryRow';
import { BuyerBatchCard, type BuyerBatch } from './BuyerBatchCard';
import { FilterPanel, EMPTY_FILTERS, type BatchFilters } from './FilterPanel';
import styles from './page.module.css';

type Batch = BuyerBatch;
type VehicleType = 'motorbike' | 'small_truck' | 'refrigerated_truck';
type ShippingQuote = { estimatedFee: number; pickupWindow: string; storageRequirement: string; vehicleType: string };

const VEHICLE_LABEL: Record<VehicleType, string> = {
  motorbike: 'Xe máy',
  small_truck: 'Xe tải nhỏ',
  refrigerated_truck: 'Xe lạnh',
};

const PAGE_SIZE = 10;

export default function Marketplace() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [totalBatches, setTotalBatches] = useState(0);
  const [page, setPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'self_pickup' | 'carrier'>('self_pickup');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorbike');
  const [distanceKm, setDistanceKm] = useState(10);
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [filters, setFilters] = useState<BatchFilters>(EMPTY_FILTERS);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());
  const [messagingBatch, setMessagingBatch] = useState<Batch | null>(null);

  async function load(activeFilters: BatchFilters, targetPage: number) {
    const params = new URLSearchParams();
    if (activeFilters.cropName) params.set('cropName', activeFilters.cropName);
    if (activeFilters.minQuantity) params.set('minQuantityAvailable', activeFilters.minQuantity);
    if (activeFilters.location) params.set('location', activeFilters.location);
    if (activeFilters.minPrice) params.set('minPricePerUnit', activeFilters.minPrice);
    if (activeFilters.maxPrice) params.set('maxPricePerUnit', activeFilters.maxPrice);
    if (activeFilters.harvestDateFrom) params.set('harvestDateFrom', activeFilters.harvestDateFrom);
    if (activeFilters.harvestDateTo) params.set('harvestDateTo', activeFilters.harvestDateTo);
    if (activeFilters.sortBy !== 'newest') params.set('sortBy', activeFilters.sortBy);
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String((targetPage - 1) * PAGE_SIZE));
    const res = await fetch(`/api/batches?${params.toString()}`);
    if (!res.ok) return;
    const data: { items: Batch[]; total: number } = await res.json();
    setBatches(data.items);
    setTotalBatches(data.total);
    setPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadSaved() {
    const res = await fetch('/api/batches/saved');
    if (!res.ok) return;
    const saved: Batch[] = await res.json();
    setSavedIds(new Set(saved.map((b) => b.id)));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(EMPTY_FILTERS, 1); loadSaved(); }, []);

  function applyFilters(nextFilters: BatchFilters) {
    setFilters(nextFilters);
    load(nextFilters, 1);
  }

  function goToPage(nextPage: number) {
    load(filters, nextPage);
  }

  async function toggleSave(batchId: string) {
    const isSaved = savedIds.has(batchId);
    await fetch(`/api/batches/${batchId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
    const next = new Set(savedIds);
    if (isSaved) next.delete(batchId); else next.add(batchId);
    setSavedIds(next);
  }

  function toggleCompare(batchId: string) {
    const next = new Set(comparedIds);
    if (next.has(batchId)) next.delete(batchId); else next.add(batchId);
    setComparedIds(next);
  }

  async function requestQuote(batchId: string, quantity: number) {
    const res = await fetch('/api/shipping-quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, quantity, vehicleType, distanceKm }),
    });
    setQuote(res.ok ? await res.json() : null);
  }

  async function order(batchId: string) {
    const quantity = quantities[batchId] ?? 1;
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
    const preOrder = await res.json();
    if (res.ok) {
      const batch = batches.find((b) => b.id === batchId);
      if (!batch) {
        alert('Batch không còn tồn tại, vui lòng tải lại trang');
        load(filters, page);
        return;
      }
      const depositRes = await fetch(`/api/preorders/${preOrder.id}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(quantity * batch.pricePerUnit * 0.2) }),
      });
      if (depositRes.ok) {
        alert('Đã đặt trước và thanh toán cọc');
      } else {
        const depositError = await depositRes.json();
        alert(`Đã đặt trước nhưng thanh toán cọc thất bại: ${depositError.message ?? depositError.code}`);
      }
      setSelectedId(null);
      setQuote(null);
      load(filters, page);
    } else {
      alert(preOrder.message);
    }
  }

  const selectedBatch = batches.find((b) => b.id === selectedId) ?? null;
  const selectedQuantity = selectedBatch ? (quantities[selectedBatch.id] ?? 1) : 0;
  const goodsAmount = selectedBatch ? selectedQuantity * selectedBatch.pricePerUnit : 0;
  const depositAmount = Math.round(goodsAmount * 0.2);

  return (
    <AppShell role="buyer">
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Tìm nông sản</h1>
          <p className={styles.subheading}>Khám phá các lô hàng sắp thu hoạch.</p>
        </div>

        <FilterPanel onApply={applyFilters} />

        {comparedIds.size > 0 && (
          <div className={styles.compareBar}>
            Đang so sánh {comparedIds.size} lô hàng
            <Button variant="outline" onClick={() => setComparedIds(new Set())}>Bỏ chọn tất cả</Button>
          </div>
        )}

        <div className={styles.grid}>
          {batches.map((b) => (
            <BuyerBatchCard
              key={b.id}
              batch={b}
              isSaved={savedIds.has(b.id)}
              isCompared={comparedIds.has(b.id)}
              isSelected={selectedId === b.id}
              onSelect={() => setSelectedId(b.id)}
              onToggleSave={() => toggleSave(b.id)}
              onToggleCompare={() => toggleCompare(b.id)}
              onMessage={() => setMessagingBatch(b)}
            />
          ))}
        </div>

        {totalBatches > PAGE_SIZE && (
          <div className={styles.pagination}>
            <Button variant="outline" disabled={page === 1} onClick={() => goToPage(page - 1)}>
              Trước
            </Button>
            <span className={styles.pageIndicator}>
              Trang {page} / {Math.ceil(totalBatches / PAGE_SIZE)}
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(totalBatches / PAGE_SIZE)}
              onClick={() => goToPage(page + 1)}
            >
              Sau
            </Button>
          </div>
        )}

        {selectedBatch && (
          <Card className={styles.orderPanel}>
            <span className={styles.orderPanelTitle}>Đặt trước lô hàng — {selectedBatch.cropName}</span>
            <div className={styles.quantityRow}>
              <label htmlFor="quantity">Số lượng đặt trước</label>
              <input
                id="quantity"
                type="number"
                min={selectedBatch.minOrderQuantity}
                max={selectedBatch.quantityAvailable}
                defaultValue={selectedBatch.minOrderQuantity}
                onChange={(e) => setQuantities({ ...quantities, [selectedBatch.id]: Number(e.target.value) })}
              />
              <span>{selectedBatch.unit}</span>
            </div>
            <MoneySummaryRow label="Tiền hàng" value={formatVnd(goodsAmount)} />

            <div className={styles.quantityRow}>
              <label htmlFor="deliveryMethod">Phương thức nhận hàng</label>
              <select
                id="deliveryMethod"
                value={deliveryMethod}
                onChange={(e) => { setDeliveryMethod(e.target.value as 'self_pickup' | 'carrier'); setQuote(null); }}
              >
                <option value="self_pickup">Tự đến lấy</option>
                <option value="carrier">Đặt vận chuyển</option>
              </select>
            </div>

            {deliveryMethod === 'carrier' && (
              <>
                <div className={styles.quantityRow}>
                  <label htmlFor="vehicleType">Loại xe</label>
                  <select id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
                    {(Object.keys(VEHICLE_LABEL) as VehicleType[]).map((v) => (
                      <option key={v} value={v}>{VEHICLE_LABEL[v]}</option>
                    ))}
                  </select>
                  <label htmlFor="distanceKm">Khoảng cách (km)</label>
                  <input
                    id="distanceKm"
                    type="number"
                    min={1}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                  />
                  <Button variant="outline" onClick={() => requestQuote(selectedBatch.id, selectedQuantity)}>
                    Xem báo cước
                  </Button>
                </div>
                {quote && (
                  <>
                    <MoneySummaryRow label="Cước vận chuyển dự kiến" value={formatVnd(quote.estimatedFee)} />
                    <div className={styles.batchMeta}>Thời gian lấy hàng: {quote.pickupWindow}</div>
                    <div className={styles.batchMeta}>Yêu cầu bảo quản: {quote.storageRequirement}</div>
                  </>
                )}
              </>
            )}

            <div className={styles.depositCallout}>
              <div className={styles.depositCalloutLabel}>Đặt cọc hôm nay (20%)</div>
              <div className={styles.depositCalloutValue}>{formatVnd(depositAmount)}</div>
            </div>
            <Button onClick={() => order(selectedBatch.id)}>Xác nhận và đặt cọc</Button>
          </Card>
        )}
      </div>

      <Overlay open={messagingBatch !== null} onClose={() => setMessagingBatch(null)}>
        {messagingBatch && (
          <div className={styles.messageOverlay}>
            <span className={styles.orderPanelTitle}>Nhắn tin với {messagingBatch.farmer.name}</span>
            <p className={styles.batchMeta}>
              {/* TODO(business-confirm): chưa có kênh chat tự do lúc browse — OrderMessage hiện chỉ gắn theo pre_order đã tồn tại */}
              Bạn cần đặt trước lô hàng &quot;{messagingBatch.cropName}&quot; để mở kênh nhắn tin trực tiếp với nông dân.
            </p>
            <Button onClick={() => { setSelectedId(messagingBatch.id); setMessagingBatch(null); }}>
              Xem lô hàng để đặt trước
            </Button>
          </div>
        )}
      </Overlay>
    </AppShell>
  );
}
