export type StatusTone = 'neutral' | 'warning' | 'info' | 'success' | 'danger';

const PRE_ORDER_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  open: { label: 'Đang mở đặt trước', tone: 'success' },
  pending_confirmation: { label: 'Chờ nông dân xác nhận', tone: 'warning' },
  negotiating: { label: 'Đang trao đổi', tone: 'warning' },
  deposited: { label: 'Đã đặt cọc', tone: 'info' },
  awaiting_harvest: { label: 'Chờ thu hoạch', tone: 'info' },
  ready_for_handover: { label: 'Sẵn sàng bàn giao', tone: 'info' },
  in_transit: { label: 'Đang vận chuyển', tone: 'info' },
  delivered: { label: 'Đã giao', tone: 'success' },
  settled: { label: 'Hoàn tất', tone: 'success' },
  rejected: { label: 'Đã từ chối', tone: 'danger' },
  cancelled: { label: 'Đã hủy', tone: 'danger' },
};

const BATCH_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  open: { label: 'Đang mở đặt trước', tone: 'success' },
  awaiting_harvest: { label: 'Chờ thu hoạch', tone: 'info' },
  ready_for_handover: { label: 'Sẵn sàng bàn giao', tone: 'info' },
  closed: { label: 'Kết thúc mùa vụ', tone: 'neutral' },
};

export function preOrderStatusInfo(status: string) {
  return PRE_ORDER_STATUS[status] ?? { label: status, tone: 'neutral' as StatusTone };
}

export function preOrderDisplayInfo(status: string, farmerConfirmed: boolean) {
  if (status === 'pending_confirmation' && farmerConfirmed) return { label: 'Chờ người mua đặt cọc', tone: 'warning' as StatusTone };
  return preOrderStatusInfo(status);
}

export function batchStatusInfo(status: string) {
  return BATCH_STATUS[status] ?? { label: status, tone: 'neutral' as StatusTone };
}
