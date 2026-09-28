import { describe, it, expect } from 'vitest';
import { ApiError } from '@/lib/errors';
import { assertTransitionAllowed, nextStatusFor, type PreOrderEvent } from '@/lib/order/orderTransitions';

const VALID: Array<[string, PreOrderEvent, string, string]> = [
  ['pending_confirmation', 'negotiate', 'farmer', 'negotiating'],
  ['pending_confirmation', 'deposit_paid', 'buyer', 'deposited'],
  ['pending_confirmation', 'reject', 'farmer', 'rejected'],
  ['pending_confirmation', 'cancel', 'buyer', 'cancelled'],
  ['negotiating', 'deposit_paid', 'buyer', 'deposited'],
  ['negotiating', 'reject', 'farmer', 'rejected'],
  ['negotiating', 'cancel', 'buyer', 'cancelled'],
  ['deposited', 'mark_awaiting_harvest', 'farmer', 'awaiting_harvest'],
  ['deposited', 'cancel_agreed', 'farmer', 'cancelled'],
  ['deposited', 'cancel_agreed', 'buyer', 'cancelled'],
  ['awaiting_harvest', 'mark_ready_for_handover', 'farmer', 'ready_for_handover'],
  ['ready_for_handover', 'mark_in_transit', 'logistics', 'in_transit'],
  ['ready_for_handover', 'mark_in_transit', 'farmer', 'in_transit'],
  ['ready_for_handover', 'mark_delivered', 'farmer', 'delivered'],
  ['in_transit', 'mark_delivered', 'logistics', 'delivered'],
  ['in_transit', 'mark_delivered', 'buyer', 'delivered'],
  ['delivered', 'confirm_receipt', 'buyer', 'settled'],
  ['delivered', 'confirm_receipt', 'farmer', 'settled'],
];

describe('assertTransitionAllowed', () => {
  it.each(VALID)('allows %s + %s for %s', (status, event, role, next) => {
    expect(() => assertTransitionAllowed(status, event, role)).not.toThrow();
    expect(nextStatusFor(event)).toBe(next);
  });

  it.each([
    ['open', 'deposit_paid', 'buyer'],
    ['settled', 'cancel', 'buyer'],
    ['rejected', 'deposit_paid', 'buyer'],
    ['cancelled', 'deposit_paid', 'buyer'],
    ['deposited', 'mark_delivered', 'farmer'],
    ['awaiting_harvest', 'cancel_agreed', 'buyer'],
    ['negotiating', 'negotiate', 'farmer'],
    ['delivered', 'cancel', 'buyer'],
    ['deposited', 'cancel', 'buyer'],
  ] as Array<[string, PreOrderEvent, string]>)('rejects %s + %s with invalid_transition', (status, event, role) => {
    expect.assertions(2);
    try {
      assertTransitionAllowed(status, event, role);
    } catch (err) {
      expect((err as ApiError).code).toBe('invalid_transition');
      expect((err as ApiError).status).toBe(400);
    }
  });

  it.each([
    ['pending_confirmation', 'deposit_paid', 'farmer'],
    ['pending_confirmation', 'reject', 'buyer'],
    ['pending_confirmation', 'cancel', 'farmer'],
    ['deposited', 'cancel_agreed', 'logistics'],
    ['delivered', 'confirm_receipt', 'logistics'],
    ['ready_for_handover', 'mark_in_transit', 'buyer'],
    ['in_transit', 'mark_delivered', 'farmer'],
    ['ready_for_handover', 'mark_delivered', 'buyer'],
    ['awaiting_harvest', 'mark_ready_for_handover', 'buyer'],
  ] as Array<[string, PreOrderEvent, string]>)('rejects %s + %s for role %s with forbidden', (status, event, role) => {
    expect.assertions(2);
    try {
      assertTransitionAllowed(status, event, role);
    } catch (err) {
      expect((err as ApiError).code).toBe('forbidden');
      expect((err as ApiError).status).toBe(403);
    }
  });
});
