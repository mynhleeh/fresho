export type OrderStageKey = 'confirming' | 'growing' | 'handover' | 'delivered' | 'settled';

export type OrderStageCount = { key: OrderStageKey; label: string; count: number };

const ORDER_STAGES: { key: OrderStageKey; label: string; statuses: string[] }[] = [
  { key: 'confirming', label: 'Chờ xác nhận', statuses: ['pending_confirmation', 'negotiating'] },
  { key: 'growing', label: 'Đã cọc, chờ thu hoạch', statuses: ['deposited', 'awaiting_harvest'] },
  { key: 'handover', label: 'Bàn giao & vận chuyển', statuses: ['ready_for_handover', 'in_transit'] },
  { key: 'delivered', label: 'Chờ đối soát', statuses: ['delivered'] },
  { key: 'settled', label: 'Hoàn tất', statuses: ['settled'] },
];

const CLOSED_ORDER_STATUSES = ['rejected', 'cancelled'];

export function countOrdersByStage(orders: { status: string }[]): { stages: OrderStageCount[]; closedCount: number } {
  const stages = ORDER_STAGES.map((stage) => ({
    key: stage.key,
    label: stage.label,
    count: orders.filter((order) => stage.statuses.includes(order.status)).length,
  }));
  const closedCount = orders.filter((order) => CLOSED_ORDER_STATUSES.includes(order.status)).length;
  return { stages, closedCount };
}

export type HorizonEntry = { id: string; cropName: string; harvestDate: string | Date; detail: string };

export type HorizonDay = { dateKey: string; date: Date; isToday: boolean; isWeekend: boolean; entries: HorizonEntry[] };

export const HARVEST_HORIZON_DAYS = 14;

function startOfLocalDay(value: string | Date): Date {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function buildHarvestHorizon(entries: HorizonEntry[], today: Date, dayCount = HARVEST_HORIZON_DAYS) {
  const firstDay = startOfLocalDay(today);
  const days: HorizonDay[] = Array.from({ length: dayCount }, (_, offset) => {
    const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + offset);
    return { dateKey: localDateKey(date), date, isToday: offset === 0, isWeekend: date.getDay() === 0 || date.getDay() === 6, entries: [] };
  });
  const dayByKey = new Map(days.map((day) => [day.dateKey, day]));
  let laterCount = 0;

  for (const entry of entries) {
    const harvestDay = startOfLocalDay(entry.harvestDate);
    if (harvestDay < firstDay) continue;
    const matchingDay = dayByKey.get(localDateKey(harvestDay));
    if (matchingDay) matchingDay.entries.push(entry);
    else laterCount += 1;
  }

  return { days, laterCount };
}

export type ActionItem = { id: string; title: string; note: string; href: string; urgent: boolean };

type OrderForAction = { id: string; status: string; quantity: number; batch: { cropName: string; unit: string; harvestDateEstimate: string } };

function orderTitle(order: OrderForAction): string {
  return `${order.batch.cropName} · ${order.quantity.toLocaleString('vi-VN')} ${order.batch.unit}`;
}

export function farmerActionItems(orders: OrderForAction[], today: Date): ActionItem[] {
  const todayStart = startOfLocalDay(today);
  return orders.flatMap((order): ActionItem[] => {
    const href = '/farmer/orders';
    if (order.status === 'pending_confirmation') return [{ id: order.id, title: orderTitle(order), note: 'Đơn đặt trước mới, cần xác nhận hoặc từ chối', href, urgent: true }];
    if (order.status === 'negotiating') return [{ id: order.id, title: orderTitle(order), note: 'Đang trao đổi, cần chốt quyết định', href, urgent: false }];
    const harvestDue = startOfLocalDay(order.batch.harvestDateEstimate) <= todayStart;
    if (order.status === 'awaiting_harvest' && harvestDue) return [{ id: order.id, title: orderTitle(order), note: 'Đã tới ngày thu hoạch dự kiến, cập nhật sẵn sàng bàn giao', href, urgent: true }];
    return [];
  });
}

export function buyerActionItems(orders: OrderForAction[]): ActionItem[] {
  return orders.flatMap((order): ActionItem[] => {
    const href = '/buyer/orders';
    if (order.status === 'delivered') return [{ id: order.id, title: orderTitle(order), note: 'Hàng đã giao, cần xác nhận nhận hàng và đối soát', href, urgent: true }];
    if (order.status === 'negotiating') return [{ id: order.id, title: orderTitle(order), note: 'Nông dân muốn trao đổi thêm về đơn này', href, urgent: false }];
    return [];
  });
}

type DisputeForAction = { id: string; status: string; reason: string; preOrder: { batch: { cropName: string } } };

export function adminActionItems(disputes: DisputeForAction[]): ActionItem[] {
  return disputes
    .filter((dispute) => dispute.status === 'open')
    .map((dispute) => ({ id: dispute.id, title: dispute.preOrder.batch.cropName, note: `Khiếu nại: ${dispute.reason}`, href: '/admin/disputes', urgent: true }));
}

type DeliveryForAction = { id: string; status: string; preOrder: OrderForAction };

export function logisticsActionItems(deliveries: DeliveryForAction[]): ActionItem[] {
  return deliveries.flatMap((delivery): ActionItem[] => {
    const href = '/logistics/deliveries';
    const title = orderTitle(delivery.preOrder);
    if (delivery.status === 'ready_for_handover') return [{ id: delivery.id, title, note: 'Hàng sẵn sàng, cần tới nhận tại nông trại', href, urgent: true }];
    if (delivery.status === 'in_transit') return [{ id: delivery.id, title, note: 'Đang vận chuyển, xác nhận khi đã giao', href, urgent: false }];
    return [];
  });
}
