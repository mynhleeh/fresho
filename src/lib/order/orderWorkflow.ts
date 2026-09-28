export type OpenAgreement = { kind: 'settlement' | 'cancel'; proposedBy: 'buyer' | 'farmer' };

export type OrderSnapshot = {
  status: string;
  deliveryMethod: string;
  depositCount: number;
  farmerConfirmed: boolean;
  agreement: OpenAgreement | null;
};

export function toOpenAgreement(
  agreements: { kind: string; proposedById: string; status: string }[] | undefined,
  buyerId: string,
): OpenAgreement | null {
  const open = agreements?.find((agreement) => agreement.status === 'proposed');
  if (!open) return null;
  return { kind: open.kind as OpenAgreement['kind'], proposedBy: open.proposedById === buyerId ? 'buyer' : 'farmer' };
}

export function pickAgreementForDisplay<T extends { status: string }>(agreements: T[] | undefined): T | null {
  const newest = agreements?.[0];
  return newest && (newest.status === 'proposed' || newest.status === 'declined') ? newest : null;
}

export type TimelineStep = { status: string; state: 'done' | 'current' | 'upcoming' };

export type FarmerAction =
  | 'confirm' | 'wait_for_deposit' | 'start_harvest_wait' | 'mark_ready_for_handover'
  | 'confirm_self_pickup' | 'hand_to_carrier' | 'wait_for_buyer_receipt'
  | 'respond_agreement' | 'wait_for_agreement' | 'none';

export type BuyerAction =
  | 'pay_deposit' | 'wait_for_farmer' | 'confirm_arrival' | 'propose_settlement'
  | 'respond_agreement' | 'wait_for_agreement' | 'rate_farmer' | 'none';

export type FarmerGroup = 'needs_action' | 'in_progress' | 'done';
export type BuyerGroup = 'todo' | 'following' | 'history';

const TIMELINE_STATUSES = [
  'pending_confirmation', 'deposited', 'awaiting_harvest', 'ready_for_handover', 'in_transit', 'delivered', 'settled',
];

const TERMINAL_STATUSES = ['settled', 'rejected', 'cancelled'];

export function buildTimeline(status: string): TimelineStep[] {
  const timelineStatus = status === 'negotiating' ? 'pending_confirmation' : status;
  const currentIndex = TIMELINE_STATUSES.indexOf(timelineStatus);
  return TIMELINE_STATUSES.map((stepStatus, index) => {
    if (status === 'settled') return { status: stepStatus, state: 'done' };
    if (currentIndex === -1) return { status: stepStatus, state: 'upcoming' };
    if (index < currentIndex) return { status: stepStatus, state: 'done' };
    return { status: stepStatus, state: index === currentIndex ? 'current' : 'upcoming' };
  });
}

function agreementActionFor(order: OrderSnapshot, viewer: 'buyer' | 'farmer'): 'respond_agreement' | 'wait_for_agreement' | null {
  if (!order.agreement) return null;
  return order.agreement.proposedBy === viewer ? 'wait_for_agreement' : 'respond_agreement';
}

export function farmerPrimaryAction(order: OrderSnapshot): FarmerAction {
  const agreementAction = agreementActionFor(order, 'farmer');
  if (agreementAction) return agreementAction;
  switch (order.status) {
    case 'pending_confirmation':
    case 'negotiating':
      return order.farmerConfirmed ? 'wait_for_deposit' : 'confirm';
    case 'deposited':
      return 'start_harvest_wait';
    case 'awaiting_harvest':
      return 'mark_ready_for_handover';
    case 'ready_for_handover':
      return order.deliveryMethod === 'carrier' ? 'hand_to_carrier' : 'confirm_self_pickup';
    case 'delivered':
      return 'wait_for_buyer_receipt';
    default:
      return 'none';
  }
}

export function buyerPrimaryAction(order: OrderSnapshot): BuyerAction {
  const agreementAction = agreementActionFor(order, 'buyer');
  if (agreementAction) return agreementAction;
  switch (order.status) {
    case 'pending_confirmation':
    case 'negotiating':
      return order.farmerConfirmed && order.depositCount === 0 ? 'pay_deposit' : 'wait_for_farmer';
    case 'in_transit':
      return 'confirm_arrival';
    case 'delivered':
      return 'propose_settlement';
    case 'settled':
      return 'rate_farmer';
    default:
      return 'none';
  }
}

const FARMER_ACTIONS_NEEDING_YOU: FarmerAction[] = [
  'confirm', 'start_harvest_wait', 'mark_ready_for_handover', 'confirm_self_pickup', 'hand_to_carrier', 'respond_agreement',
];

const BUYER_ACTIONS_NEEDING_YOU: BuyerAction[] = ['pay_deposit', 'confirm_arrival', 'propose_settlement', 'respond_agreement'];

export function farmerOrderGroup(order: OrderSnapshot): FarmerGroup {
  if (TERMINAL_STATUSES.includes(order.status)) return 'done';
  return FARMER_ACTIONS_NEEDING_YOU.includes(farmerPrimaryAction(order)) ? 'needs_action' : 'in_progress';
}

export function buyerOrderGroup(order: OrderSnapshot): BuyerGroup {
  if (TERMINAL_STATUSES.includes(order.status)) return 'history';
  return BUYER_ACTIONS_NEEDING_YOU.includes(buyerPrimaryAction(order)) ? 'todo' : 'following';
}
