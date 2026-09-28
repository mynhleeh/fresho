import { ApiError } from '@/lib/errors';

export type PreOrderEvent =
  | 'negotiate' | 'deposit_paid' | 'reject' | 'mark_awaiting_harvest' | 'mark_ready_for_handover'
  | 'mark_in_transit' | 'mark_delivered' | 'confirm_receipt' | 'cancel' | 'cancel_agreed';

type ActorRole = string;

const TRANSITION_ROLES: Record<string, Partial<Record<PreOrderEvent, ActorRole[]>>> = {
  pending_confirmation: { negotiate: ['farmer'], deposit_paid: ['buyer'], reject: ['farmer'], cancel: ['buyer'] },
  negotiating: { deposit_paid: ['buyer'], reject: ['farmer'], cancel: ['buyer'] },
  deposited: { mark_awaiting_harvest: ['farmer'], cancel_agreed: ['farmer', 'buyer'] },
  awaiting_harvest: { mark_ready_for_handover: ['farmer'] },
  ready_for_handover: { mark_in_transit: ['logistics', 'farmer'], mark_delivered: ['farmer'] },
  in_transit: { mark_delivered: ['logistics', 'buyer'] },
  delivered: { confirm_receipt: ['buyer', 'farmer'] },
};

const NEXT_STATUS: Record<PreOrderEvent, string> = {
  negotiate: 'negotiating',
  deposit_paid: 'deposited',
  reject: 'rejected',
  cancel: 'cancelled',
  cancel_agreed: 'cancelled',
  mark_awaiting_harvest: 'awaiting_harvest',
  mark_ready_for_handover: 'ready_for_handover',
  mark_in_transit: 'in_transit',
  mark_delivered: 'delivered',
  confirm_receipt: 'settled',
};

export function nextStatusFor(event: PreOrderEvent): string {
  return NEXT_STATUS[event];
}

export function assertTransitionAllowed(status: string, event: PreOrderEvent, role: ActorRole): void {
  const allowedRoles = TRANSITION_ROLES[status]?.[event];
  if (!allowedRoles) {
    throw new ApiError('invalid_transition', `Không thể thực hiện thao tác này khi đơn đang ở trạng thái "${status}".`, 400);
  }
  if (!allowedRoles.includes(role)) {
    throw new ApiError('forbidden', 'Bạn không có quyền thực hiện thao tác này ở trạng thái hiện tại của đơn.', 403);
  }
}
