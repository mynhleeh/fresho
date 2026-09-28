import { describe, it, expect } from 'vitest';
import { formatHarvestDate, describeBuyerWaiting } from '@/lib/order/orderDisplayText';

describe('formatHarvestDate', () => {
  it('formats an ISO date as dd/mm/yyyy in Vietnamese order', () => {
    expect(formatHarvestDate('2026-08-30T12:00:00.000Z')).toBe('30/08/2026');
  });

  it('returns an empty string for a missing or invalid date', () => {
    expect(formatHarvestDate(undefined)).toBe('');
    expect(formatHarvestDate('not a date')).toBe('');
  });
});

describe('describeBuyerWaiting', () => {
  it.each([
    ['deposited', 'self_pickup', 'Nông dân đang chuẩn bị thu hoạch.'],
    ['awaiting_harvest', 'carrier', 'Nông dân đang chuẩn bị thu hoạch.'],
    ['ready_for_handover', 'self_pickup', 'Hàng đã sẵn sàng. Hãy đến nhận theo thông tin liên hệ của nông dân.'],
    ['ready_for_handover', 'carrier', 'Hàng đã sẵn sàng. Đang chờ nông dân giao cho vận chuyển.'],
  ])('explains what happens next for %s (%s)', (status, method, expected) => {
    expect(describeBuyerWaiting(status, method)).toBe(expected);
  });

  it('has no waiting text where the buyer has an action or the order is closed', () => {
    for (const status of ['pending_confirmation', 'in_transit', 'delivered', 'settled', 'rejected', 'cancelled']) {
      expect(describeBuyerWaiting(status, 'carrier')).toBe('');
    }
  });
});
