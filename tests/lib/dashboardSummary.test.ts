import { describe, expect, it } from 'vitest';
import { bookedVolume, buildHarvestHorizon, buyerActionItems, countOrdersByStage, farmerActionItems, orderValue, sumPaidDeposits } from '@/lib/dashboardSummary';

const today = new Date(2026, 8, 27, 15, 30);

function orderWith(status: string, harvestDateEstimate = new Date(2026, 9, 5).toISOString()) {
  return { id: `po_${status}`, status, quantity: 1200, batch: { cropName: 'Cà chua', unit: 'kg', harvestDateEstimate } };
}

describe('countOrdersByStage', () => {
  it('groups every lifecycle status into exactly one stage and counts closed orders separately', () => {
    const statuses = ['pending_confirmation', 'negotiating', 'deposited', 'awaiting_harvest', 'ready_for_handover', 'in_transit', 'delivered', 'settled', 'rejected', 'cancelled'];
    const { stages, closedCount } = countOrdersByStage(statuses.map((status) => ({ status })));
    expect(stages.map((stage) => [stage.key, stage.count])).toEqual([
      ['confirming', 2],
      ['growing', 2],
      ['handover', 2],
      ['delivered', 1],
      ['settled', 1],
    ]);
    expect(closedCount).toBe(2);
  });
});

describe('buildHarvestHorizon', () => {
  it('places entries on their local harvest day, skips past days and counts entries beyond the window', () => {
    const entries = [
      { id: 'today', cropName: 'A', harvestDate: new Date(2026, 8, 27, 8), detail: '' },
      { id: 'day3', cropName: 'B', harvestDate: new Date(2026, 8, 30, 23), detail: '' },
      { id: 'past', cropName: 'C', harvestDate: new Date(2026, 8, 20), detail: '' },
      { id: 'later', cropName: 'D', harvestDate: new Date(2026, 9, 11), detail: '' },
    ];
    const { days, laterCount } = buildHarvestHorizon(entries, today);
    expect(days).toHaveLength(14);
    expect(days[0].isToday).toBe(true);
    expect(days[0].entries.map((entry) => entry.id)).toEqual(['today']);
    expect(days[3].entries.map((entry) => entry.id)).toEqual(['day3']);
    expect(days.flatMap((day) => day.entries).map((entry) => entry.id)).not.toContain('past');
    expect(laterCount).toBe(1);
  });
});

describe('farmerActionItems', () => {
  it('flags new pre-orders, negotiations and harvests that are due', () => {
    const orders = [
      orderWith('pending_confirmation'),
      orderWith('negotiating'),
      orderWith('awaiting_harvest', new Date(2026, 8, 27).toISOString()),
      orderWith('deposited'),
    ];
    const items = farmerActionItems(orders, today);
    expect(items.map((item) => item.id)).toEqual(['po_pending_confirmation', 'po_negotiating', 'po_awaiting_harvest']);
    expect(items[0].title).toBe('Cà chua · 1.200 kg');
  });

  it('does not flag a harvest that is still in the future', () => {
    expect(farmerActionItems([orderWith('awaiting_harvest')], today)).toEqual([]);
  });
});

describe('buyerActionItems', () => {
  it('asks the buyer to confirm delivered orders', () => {
    const items = buyerActionItems([orderWith('delivered'), orderWith('settled')]);
    expect(items).toHaveLength(1);
    expect(items[0].urgent).toBe(true);
  });
});

describe('sumPaidDeposits', () => {
  it('adds only paid deposit records across orders', () => {
    const orders = [
      { deposits: [{ amount: 300_000, status: 'paid' }, { amount: 50_000, status: 'pending' }] },
      { deposits: [{ amount: 1_200_000, status: 'paid' }] },
      {},
    ];
    expect(sumPaidDeposits(orders)).toBe(1_500_000);
  });
});

describe('bookedVolume', () => {
  it('ignores closed batches and rounds the booked share', () => {
    const batches = [
      { status: 'open', quantityTotal: 600, quantityAvailable: 200 },
      { status: 'awaiting_harvest', quantityTotal: 300, quantityAvailable: 300 },
      { status: 'closed', quantityTotal: 1000, quantityAvailable: 0 },
    ];
    expect(bookedVolume(batches)).toEqual({ booked: 400, total: 900, percent: 44 });
  });

  it('reports zero percent when there is no live volume', () => {
    expect(bookedVolume([])).toEqual({ booked: 0, total: 0, percent: 0 });
  });
});

describe('orderValue', () => {
  it('multiplies integer quantity by integer unit price', () => {
    expect(orderValue({ quantity: 600, pricePerUnit: 18_000 })).toBe(10_800_000);
  });
});
