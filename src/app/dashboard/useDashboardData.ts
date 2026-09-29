'use client';
import { useEffect, useState } from 'react';
import type { AppRole } from '../components/layout/roleNav';
import {
  adminActionItems,
  bookedVolume,
  buildHarvestHorizon,
  buyerActionItems,
  countOrdersByStage,
  farmerActionItems,
  formatVnd,
  logisticsActionItems,
  orderValue,
  sumPaidDeposits,
  type ActionItem,
  type DashboardKpi,
  type HorizonEntry,
} from '@/lib/dashboardSummary';
import { toThumbnailSrc } from './thumbnailSrc';

type Batch = { id: string; cropName: string; photoUrl?: string | null; unit: string; status: string; quantityTotal: number; quantityAvailable: number; harvestDateEstimate: string };
type Deposit = { amount: number; status: string };
export type DashboardOrder = { id: string; status: string; quantity: number; pricePerUnit: number; createdAt: string; batch: Batch; deposits?: Deposit[] };
type Dispute = { id: string; status: string; reason: string; preOrder: DashboardOrder };
type Delivery = { id: string; status: string; preOrder: DashboardOrder };

type RoleSnapshot = { orders: DashboardOrder[]; horizonEntries: HorizonEntry[]; actionItems: ActionItem[]; kpis: DashboardKpi[] };

export type DashboardData = ReturnType<typeof summarizeSnapshot>;

const ACTIVE_ORDER_STATUSES = ['pending_confirmation', 'negotiating', 'deposited', 'awaiting_harvest', 'ready_for_handover', 'in_transit'];
const RECENT_ORDER_LIMIT = 5;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`dashboard fetch failed: ${url} ${response.status}`);
  return response.json();
}

function isActive(order: { status: string }): boolean {
  return ACTIVE_ORDER_STATUSES.includes(order.status);
}

function isNotClosed(order: { status: string }): boolean {
  return order.status !== 'cancelled' && order.status !== 'rejected';
}

function countWithStatus(items: { status: string }[], statuses: string[]): number {
  return items.filter((item) => statuses.includes(item.status)).length;
}

function formatQuantity(quantity: number, unit: string): string {
  return `${quantity.toLocaleString('vi-VN')} ${unit}`;
}

function activeOrderEntries(orders: DashboardOrder[]): HorizonEntry[] {
  return orders
    .filter(isActive)
    .map((order) => ({ id: order.id, cropName: order.batch.cropName, photoUrl: order.batch.photoUrl, harvestDate: order.batch.harvestDateEstimate, detail: formatQuantity(order.quantity, order.batch.unit) }));
}

async function loadFarmerSnapshot(today: Date): Promise<RoleSnapshot> {
  const [batches, orders] = await Promise.all([fetchJson<Batch[]>('/api/batches?mine=1'), fetchJson<DashboardOrder[]>('/api/preorders/for-farmer')]);
  const volume = bookedVolume(batches);
  const horizonEntries = batches
    .filter((batch) => batch.status !== 'closed')
    .map((batch) => ({ id: batch.id, cropName: batch.cropName, photoUrl: batch.photoUrl, harvestDate: batch.harvestDateEstimate, detail: `Đã đặt ${formatQuantity(batch.quantityTotal - batch.quantityAvailable, batch.unit)} / ${batch.quantityTotal.toLocaleString('vi-VN')}` }));
  const kpis: DashboardKpi[] = [
    { label: 'Lô đang mở đặt trước', value: String(countWithStatus(batches, ['open'])), note: `${batches.filter((batch) => batch.status !== 'closed').length} lô chưa kết thúc` },
    { label: 'Sản lượng đã được đặt', value: `${volume.percent}%`, note: `${volume.booked.toLocaleString('vi-VN')} / ${volume.total.toLocaleString('vi-VN')} trên các lô chưa kết thúc`, highlight: true },
    { label: 'Đơn đang chạy', value: String(orders.filter(isActive).length), note: `${countWithStatus(orders, ['pending_confirmation'])} đơn chờ bạn xác nhận` },
    { label: 'Tiền cọc người mua đã trả', value: formatVnd(sumPaidDeposits(orders.filter(isNotClosed))), note: 'Trên các đơn chưa huỷ hoặc từ chối' },
  ];
  return { orders, horizonEntries, actionItems: farmerActionItems(orders, today), kpis };
}

async function loadBuyerSnapshot(): Promise<RoleSnapshot> {
  const orders = await fetchJson<DashboardOrder[]>('/api/preorders/mine');
  const kpis: DashboardKpi[] = [
    { label: 'Đơn đang chạy', value: String(orders.filter(isActive).length), note: `${countWithStatus(orders, ['pending_confirmation', 'negotiating'])} đơn chờ nông dân xác nhận` },
    { label: 'Đang giao tới bạn', value: String(countWithStatus(orders, ['ready_for_handover', 'in_transit'])), note: 'Sẵn sàng bàn giao hoặc đang vận chuyển' },
    { label: 'Chờ bạn xác nhận', value: String(countWithStatus(orders, ['delivered'])), note: 'Đã giao, cần xác nhận và đối soát', highlight: countWithStatus(orders, ['delivered']) > 0 },
    { label: 'Tiền cọc bạn đã trả', value: formatVnd(sumPaidDeposits(orders.filter(isNotClosed))), note: 'Trên các đơn chưa huỷ hoặc từ chối' },
  ];
  return { orders, horizonEntries: activeOrderEntries(orders), actionItems: buyerActionItems(orders), kpis };
}

async function loadAdminSnapshot(): Promise<RoleSnapshot> {
  const [orders, disputes] = await Promise.all([fetchJson<DashboardOrder[]>('/api/admin/orders'), fetchJson<Dispute[]>('/api/disputes')]);
  const activeValue = orders.filter(isActive).reduce((sum, order) => sum + orderValue(order), 0);
  const kpis: DashboardKpi[] = [
    { label: 'Đơn đang chạy', value: String(orders.filter(isActive).length), note: `Trên tổng ${orders.length} đơn` },
    { label: 'Khiếu nại đang mở', value: String(countWithStatus(disputes, ['open'])), note: `${disputes.length} khiếu nại từ trước tới nay`, highlight: countWithStatus(disputes, ['open']) > 0 },
    { label: 'Đơn hoàn tất', value: String(countWithStatus(orders, ['settled'])), note: 'Đã đối soát xong' },
    { label: 'Giá trị hàng đang đặt', value: formatVnd(activeValue), note: 'Số lượng × đơn giá, chưa gồm cước vận chuyển' },
  ];
  return { orders, horizonEntries: activeOrderEntries(orders), actionItems: adminActionItems(disputes), kpis };
}

async function loadLogisticsSnapshot(): Promise<RoleSnapshot> {
  const deliveries = await fetchJson<Delivery[]>('/api/deliveries/mine');
  const orders = deliveries.map((delivery) => delivery.preOrder);
  const kpis: DashboardKpi[] = [
    { label: 'Chờ lấy hàng', value: String(countWithStatus(deliveries, ['ready_for_handover'])), note: 'Hàng đã sẵn sàng tại nông trại', highlight: countWithStatus(deliveries, ['ready_for_handover']) > 0 },
    { label: 'Đang vận chuyển', value: String(countWithStatus(deliveries, ['in_transit'])), note: 'Cần xác nhận khi giao xong' },
    { label: 'Đã giao', value: String(countWithStatus(deliveries, ['delivered'])), note: 'Chuyến đã hoàn thành' },
    { label: 'Tổng chuyến được giao', value: String(deliveries.length), note: 'Tính cả chuyến đã hoàn thành' },
  ];
  return { orders, horizonEntries: activeOrderEntries(orders), actionItems: logisticsActionItems(deliveries), kpis };
}

function loadRoleSnapshot(role: AppRole, today: Date): Promise<RoleSnapshot> {
  if (role === 'farmer') return loadFarmerSnapshot(today);
  if (role === 'buyer') return loadBuyerSnapshot();
  if (role === 'admin') return loadAdminSnapshot();
  return loadLogisticsSnapshot();
}

function withThumbnailPhoto(order: DashboardOrder): DashboardOrder {
  return { ...order, batch: { ...order.batch, photoUrl: toThumbnailSrc(order.batch.photoUrl) } };
}

function summarizeSnapshot(snapshot: RoleSnapshot, today: Date) {
  const { stages, closedCount } = countOrdersByStage(snapshot.orders);
  const recentOrders = [...snapshot.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, RECENT_ORDER_LIMIT).map(withThumbnailPhoto);
  const horizonEntries = snapshot.horizonEntries.map((entry) => ({ ...entry, photoUrl: toThumbnailSrc(entry.photoUrl) }));
  return {
    kpis: snapshot.kpis,
    stages,
    closedCount,
    recentOrders,
    horizon: buildHarvestHorizon(horizonEntries, today),
    actionItems: snapshot.actionItems,
  };
}

export function useDashboardData(role: AppRole | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    const today = new Date();
    loadRoleSnapshot(role, today)
      .then((snapshot) => { if (!cancelled) setData(summarizeSnapshot(snapshot, today)); })
      .catch((error) => { console.error(error); if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [role]);

  return { data, failed };
}
