import { describe, expect, it } from 'vitest';
import { buildHarvestHorizon, buyerActionItems, countOrdersByStage, farmerActionItems } from '@/lib/dashboardSummary';

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
