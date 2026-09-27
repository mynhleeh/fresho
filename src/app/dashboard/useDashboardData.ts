'use client';
import { useEffect, useState } from 'react';
import type { AppRole } from '../components/roleNav';
import {
  adminActionItems,
  buildHarvestHorizon,
  buyerActionItems,
  countOrdersByStage,
  farmerActionItems,
  logisticsActionItems,
  type ActionItem,
  type HorizonEntry,
} from '@/lib/dashboardSummary';

type Batch = { id: string; cropName: string; unit: string; status: string; quantityTotal: number; quantityAvailable: number; harvestDateEstimate: string };
type Order = { id: string; status: string; quantity: number; batch: Batch; buyer?: { name: string } };
type Dispute = { id: string; status: string; reason: string; preOrder: Order };
type Delivery = { id: string; status: string; preOrder: Order };

type RoleSnapshot = { orders: { status: string }[]; horizonEntries: HorizonEntry[]; actionItems: ActionItem[] };

export type DashboardData = ReturnType<typeof summarizeSnapshot>;

const ACTIVE_ORDER_STATUSES = ['pending_confirmation', 'negotiating', 'deposited', 'awaiting_harvest', 'ready_for_handover', 'in_transit'];

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`dashboard fetch failed: ${url} ${response.status}`);
  return response.json();
}

function orderHorizonEntry(order: Order, detail: string): HorizonEntry {
  return { id: order.id, cropName: order.batch.cropName, harvestDate: order.batch.harvestDateEstimate, detail };
}

function orderQuantity(order: Order): string {
  return `${order.quantity.toLocaleString('vi-VN')} ${order.batch.unit}`;
}

async function loadFarmerSnapshot(today: Date): Promise<RoleSnapshot> {
  const [batches, orders] = await Promise.all([fetchJson<Batch[]>('/api/batches?mine=1'), fetchJson<Order[]>('/api/preorders/for-farmer')]);
  const horizonEntries = batches
    .filter((batch) => batch.status !== 'closed')
    .map((batch) => ({
      id: batch.id,
      cropName: batch.cropName,
      harvestDate: batch.harvestDateEstimate,
      detail: `Đặt ${(batch.quantityTotal - batch.quantityAvailable).toLocaleString('vi-VN')}/${batch.quantityTotal.toLocaleString('vi-VN')} ${batch.unit}`,
    }));
  return { orders, horizonEntries, actionItems: farmerActionItems(orders, today) };
}

async function loadBuyerSnapshot(): Promise<RoleSnapshot> {
  const orders = await fetchJson<Order[]>('/api/preorders/mine');
  const horizonEntries = orders
    .filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
    .map((order) => orderHorizonEntry(order, `Bạn đặt ${orderQuantity(order)}`));
  return { orders, horizonEntries, actionItems: buyerActionItems(orders) };
}

async function loadAdminSnapshot(): Promise<RoleSnapshot> {
  const [orders, disputes] = await Promise.all([fetchJson<Order[]>('/api/admin/orders'), fetchJson<Dispute[]>('/api/disputes')]);
  const horizonEntries = orders
    .filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
    .map((order) => orderHorizonEntry(order, `${order.buyer?.name ?? 'Người mua'} · ${orderQuantity(order)}`));
  return { orders, horizonEntries, actionItems: adminActionItems(disputes) };
}

async function loadLogisticsSnapshot(): Promise<RoleSnapshot> {
  const deliveries = await fetchJson<Delivery[]>('/api/deliveries/mine');
  const orders = deliveries.map((delivery) => delivery.preOrder);
  const horizonEntries = orders
    .filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
    .map((order) => orderHorizonEntry(order, `Giao ${orderQuantity(order)}`));
  return { orders, horizonEntries, actionItems: logisticsActionItems(deliveries) };
}

function loadRoleSnapshot(role: AppRole, today: Date): Promise<RoleSnapshot> {
  if (role === 'farmer') return loadFarmerSnapshot(today);
  if (role === 'buyer') return loadBuyerSnapshot();
  if (role === 'admin') return loadAdminSnapshot();
  return loadLogisticsSnapshot();
}

function summarizeSnapshot(snapshot: RoleSnapshot, today: Date) {
  const { stages, closedCount } = countOrdersByStage(snapshot.orders);
  const activeOrderCount = snapshot.orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status)).length;
  return { stages, closedCount, activeOrderCount, horizon: buildHarvestHorizon(snapshot.horizonEntries, today), actionItems: snapshot.actionItems };
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
