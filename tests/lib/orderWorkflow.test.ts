import { describe, it, expect } from 'vitest';
import {
  buildTimeline,
  toOpenAgreement,
  pickAgreementForDisplay,
  farmerPrimaryAction,
  buyerPrimaryAction,
  farmerOrderGroup,
  buyerOrderGroup,
  type OrderSnapshot,
} from '@/lib/order/orderWorkflow';
import { preOrderDisplayInfo } from '@/lib/order/orderStatus';

function order(status: string, overrides: Partial<OrderSnapshot> = {}): OrderSnapshot {
  return { status, deliveryMethod: 'self_pickup', depositCount: 0, farmerConfirmed: false, agreement: null, ...overrides };
}

const paid = { depositCount: 1, farmerConfirmed: true };
const confirmed = { farmerConfirmed: true };
const buyerSettlement = { agreement: { kind: 'settlement' as const, proposedBy: 'buyer' as const } };
const farmerCancel = { agreement: { kind: 'cancel' as const, proposedBy: 'farmer' as const } };
const buyerCancel = { agreement: { kind: 'cancel' as const, proposedBy: 'buyer' as const } };

describe('buildTimeline', () => {
  it('marks earlier steps done, the current step, and later steps upcoming', () => {
    const steps = buildTimeline('ready_for_handover');

    expect(steps.map((step) => step.state)).toEqual(['done', 'done', 'done', 'current', 'upcoming', 'upcoming', 'upcoming']);
    expect(steps[3].status).toBe('ready_for_handover');
  });

  it('treats settled as fully done', () => {
    expect(buildTimeline('settled').every((step) => step.state === 'done')).toBe(true);
  });

  it('keeps negotiating on the first step as current', () => {
    const steps = buildTimeline('negotiating');

    expect(steps[0].state).toBe('current');
    expect(steps.slice(1).every((step) => step.state === 'upcoming')).toBe(true);
  });

  it.each(['rejected', 'cancelled'])('has no current step for %s', (status) => {
    expect(buildTimeline(status).some((step) => step.state === 'current')).toBe(false);
  });
});

describe('preOrderDisplayInfo', () => {
  it('shows a waiting-for-deposit label once the farmer confirmed a pending order', () => {
    expect(preOrderDisplayInfo('pending_confirmation', true).label).toBe('Chờ người mua đặt cọc');
    expect(preOrderDisplayInfo('pending_confirmation', false).label).toBe('Chờ nông dân xác nhận');
    expect(preOrderDisplayInfo('deposited', true).label).toBe('Đã đặt cọc');
  });
});

describe('farmerPrimaryAction', () => {
  it.each([
    [order('pending_confirmation'), 'confirm'],
    [order('negotiating'), 'confirm'],
    [order('pending_confirmation', confirmed), 'wait_for_deposit'],
    [order('deposited', paid), 'start_harvest_wait'],
    [order('deposited', { ...paid, ...buyerCancel }), 'respond_agreement'],
    [order('deposited', { ...paid, ...farmerCancel }), 'wait_for_agreement'],
    [order('awaiting_harvest', paid), 'mark_ready_for_handover'],
    [order('ready_for_handover', paid), 'confirm_self_pickup'],
    [order('ready_for_handover', { ...paid, deliveryMethod: 'carrier' }), 'hand_to_carrier'],
    [order('in_transit', { ...paid, deliveryMethod: 'carrier' }), 'none'],
    [order('delivered', paid), 'wait_for_buyer_receipt'],
    [order('delivered', { ...paid, ...buyerSettlement }), 'respond_agreement'],
    [order('settled', paid), 'none'],
    [order('rejected'), 'none'],
    [order('cancelled'), 'none'],
  ])('maps %j to %s', (snapshot, expected) => {
    expect(farmerPrimaryAction(snapshot)).toBe(expected);
  });
});

describe('buyerPrimaryAction', () => {
  it.each([
    [order('pending_confirmation'), 'wait_for_farmer'],
    [order('negotiating'), 'wait_for_farmer'],
    [order('pending_confirmation', confirmed), 'pay_deposit'],
    [order('negotiating', confirmed), 'pay_deposit'],
    [order('deposited', paid), 'none'],
    [order('deposited', { ...paid, ...farmerCancel }), 'respond_agreement'],
    [order('deposited', { ...paid, ...buyerCancel }), 'wait_for_agreement'],
    [order('in_transit', { ...paid, deliveryMethod: 'carrier' }), 'confirm_arrival'],
    [order('delivered', paid), 'propose_settlement'],
    [order('delivered', { ...paid, ...buyerSettlement }), 'wait_for_agreement'],
    [order('settled', paid), 'rate_farmer'],
    [order('rejected'), 'none'],
  ])('maps %j to %s', (snapshot, expected) => {
    expect(buyerPrimaryAction(snapshot)).toBe(expected);
  });
});

describe('order groups', () => {
  it.each([
    [order('pending_confirmation'), 'needs_action'],
    [order('pending_confirmation', confirmed), 'in_progress'],
    [order('deposited', paid), 'needs_action'],
    [order('deposited', { ...paid, ...buyerCancel }), 'needs_action'],
    [order('awaiting_harvest', paid), 'needs_action'],
    [order('ready_for_handover', paid), 'needs_action'],
    [order('ready_for_handover', { ...paid, deliveryMethod: 'carrier' }), 'needs_action'],
    [order('in_transit', { ...paid, deliveryMethod: 'carrier' }), 'in_progress'],
    [order('delivered', paid), 'in_progress'],
    [order('delivered', { ...paid, ...buyerSettlement }), 'needs_action'],
    [order('settled', paid), 'done'],
    [order('rejected'), 'done'],
    [order('cancelled'), 'done'],
  ])('puts farmer order %j into %s', (snapshot, group) => {
    expect(farmerOrderGroup(snapshot)).toBe(group);
  });

  it.each([
    [order('pending_confirmation'), 'following'],
    [order('pending_confirmation', confirmed), 'todo'],
    [order('in_transit', { ...paid, deliveryMethod: 'carrier' }), 'todo'],
    [order('delivered', paid), 'todo'],
    [order('delivered', { ...paid, ...buyerSettlement }), 'following'],
    [order('deposited', { ...paid, ...farmerCancel }), 'todo'],
    [order('settled', paid), 'history'],
    [order('cancelled'), 'history'],
  ])('puts buyer order %j into %s', (snapshot, group) => {
    expect(buyerOrderGroup(snapshot)).toBe(group);
  });
});

describe('toOpenAgreement', () => {
  const agreements = [
    { kind: 'settlement', proposedById: 'buyer-1', status: 'declined' },
    { kind: 'cancel', proposedById: 'farmer-1', status: 'proposed' },
  ];

  it('returns the still-open proposal and who made it', () => {
    expect(toOpenAgreement(agreements, 'buyer-1')).toEqual({ kind: 'cancel', proposedBy: 'farmer' });
    expect(toOpenAgreement([{ kind: 'settlement', proposedById: 'buyer-1', status: 'proposed' }], 'buyer-1'))
      .toEqual({ kind: 'settlement', proposedBy: 'buyer' });
  });

  it('returns null when nothing is open or the list is missing', () => {
    expect(toOpenAgreement([agreements[0]], 'buyer-1')).toBeNull();
    expect(toOpenAgreement(undefined, 'buyer-1')).toBeNull();
  });
});

describe('pickAgreementForDisplay', () => {
  it('shows the newest agreement while it is open or declined, so the proposer learns the outcome', () => {
    const open = { id: 'a2', status: 'proposed' };
    const declined = { id: 'a1', status: 'declined' };

    expect(pickAgreementForDisplay([open, declined])).toBe(open);
    expect(pickAgreementForDisplay([declined])).toBe(declined);
  });

  it('shows nothing when the newest agreement was accepted or there is none', () => {
    expect(pickAgreementForDisplay([{ id: 'a1', status: 'accepted' }])).toBeNull();
    expect(pickAgreementForDisplay([])).toBeNull();
    expect(pickAgreementForDisplay(undefined)).toBeNull();
  });
});
