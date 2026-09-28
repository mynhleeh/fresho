import type { FarmerAction } from '@/lib/order/orderWorkflow';
import type { FarmerPreOrder } from './orderTypes';

export type ActionKind =
  | 'confirm' | 'negotiate' | 'reject'
  | 'start_harvest_wait' | 'mark_ready_for_handover' | 'confirm_self_pickup' | 'hand_to_carrier';

export const ACTION_LABEL: Record<ActionKind, string> = {
  confirm: 'Xác nhận đơn',
  negotiate: 'Yêu cầu trao đổi',
  reject: 'Từ chối',
  start_harvest_wait: 'Bắt đầu chờ thu hoạch',
  mark_ready_for_handover: 'Báo hàng sẵn sàng bàn giao',
  confirm_self_pickup: 'Xác nhận đã bàn giao',
  hand_to_carrier: 'Đã giao cho vận chuyển',
};

export const SUCCESS_TEXT: Record<ActionKind, string> = {
  confirm: 'Đã xác nhận đơn. Đang chờ người mua đặt cọc',
  negotiate: 'Đã gửi yêu cầu trao đổi',
  reject: 'Đã từ chối đơn',
  start_harvest_wait: 'Đã chuyển đơn sang chờ thu hoạch',
  mark_ready_for_handover: 'Đã báo hàng sẵn sàng bàn giao',
  confirm_self_pickup: 'Đã xác nhận bàn giao',
  hand_to_carrier: 'Đã ghi nhận giao hàng cho đơn vị vận chuyển',
};

export const WAIT_TEXT: Partial<Record<FarmerAction, string>> = {
  wait_for_deposit: 'Đã xác nhận, đang chờ người mua đặt cọc',
  wait_for_buyer_receipt: 'Đã giao hàng. Đang chờ người mua xác nhận nhận hàng để đối soát.',
};

export const PRIMARY_KIND: Partial<Record<FarmerAction, ActionKind>> = {
  confirm: 'confirm',
  start_harvest_wait: 'start_harvest_wait',
  mark_ready_for_handover: 'mark_ready_for_handover',
  confirm_self_pickup: 'confirm_self_pickup',
  hand_to_carrier: 'hand_to_carrier',
};

type ConfirmCopy = { title: string; description: string; confirmLabel: string; danger: boolean };

const BATCH_LEVEL_NOTE = 'Thao tác này áp dụng cho tất cả đơn của cùng lô hàng đang ở bước này, không chỉ đơn này.';

export const IN_TRANSIT_WAIT_TEXT = 'Đã giao cho vận chuyển. Đang chờ người mua xác nhận hàng đã đến.';

export const CONFIRM_COPY: Partial<Record<ActionKind, ConfirmCopy>> = {
  reject: {
    title: 'Từ chối đơn đặt trước?',
    description: 'Người mua sẽ được báo đơn bị từ chối và không thể khôi phục đơn này.',
    confirmLabel: 'Từ chối đơn',
    danger: true,
  },
  start_harvest_wait: {
    title: 'Chuyển sang chờ thu hoạch?',
    description: `${BATCH_LEVEL_NOTE} Các đơn đã nhận cọc của lô này sẽ chuyển sang trạng thái chờ thu hoạch.`,
    confirmLabel: 'Chuyển sang chờ thu hoạch',
    danger: false,
  },
  mark_ready_for_handover: {
    title: 'Báo hàng sẵn sàng bàn giao?',
    description: `${BATCH_LEVEL_NOTE} Người mua sẽ thấy thông tin liên hệ của bạn và có thể nhận hàng.`,
    confirmLabel: 'Báo sẵn sàng',
    danger: false,
  },
  confirm_self_pickup: {
    title: 'Xác nhận đã bàn giao hàng?',
    description: 'Chỉ xác nhận khi người mua đã tự đến lấy hàng. Bạn không thể hoàn tác thao tác này.',
    confirmLabel: 'Xác nhận đã bàn giao',
    danger: false,
  },
  hand_to_carrier: {
    title: 'Đã giao hàng cho đơn vị vận chuyển?',
    description: 'Chỉ xác nhận khi đơn vị vận chuyển đã nhận hàng từ bạn. Người mua sẽ xác nhận khi hàng đến nơi.',
    confirmLabel: 'Đã giao cho vận chuyển',
    danger: false,
  },
};

const NEXT_STEP_TEXT: Partial<Record<FarmerAction, string>> = {
  ...WAIT_TEXT,
  confirm: 'Xác nhận hoặc từ chối đơn này',
  start_harvest_wait: 'Đã nhận cọc, chuyển đơn sang chờ thu hoạch',
  mark_ready_for_handover: 'Báo sẵn sàng khi thu hoạch xong',
  confirm_self_pickup: 'Xác nhận sau khi người mua lấy hàng',
  hand_to_carrier: 'Giao hàng cho đơn vị vận chuyển',
  respond_agreement: 'Có đề xuất cần bạn phản hồi',
  wait_for_agreement: 'Đang chờ người mua phản hồi đề xuất của bạn',
};

export function nextStepTextOf(order: FarmerPreOrder, action: FarmerAction): string {
  const text = NEXT_STEP_TEXT[action];
  if (text) return text;
  if (order.status === 'in_transit') return IN_TRANSIT_WAIT_TEXT;
  return 'Không cần bạn làm gì lúc này';
}

export function secondaryKindsOf(order: FarmerPreOrder): ActionKind[] {
  if (order.status === 'pending_confirmation') return order.farmerConfirmedAt ? ['reject'] : ['negotiate', 'reject'];
  if (order.status === 'negotiating') return ['reject'];
  return [];
}

export function canProposeCancel(order: FarmerPreOrder): boolean {
  return order.status === 'deposited' && !order.agreements.some((agreement) => agreement.status === 'proposed');
}
