import { describe, expect, it } from 'vitest';
import { deriveBatchPlaceholder } from '@/lib/batchPlaceholder';

describe('deriveBatchPlaceholder', () => {
  it('is deterministic for the same batch id', () => {
    const a = deriveBatchPlaceholder('batch_123');
    const b = deriveBatchPlaceholder('batch_123');
    expect(a).toEqual(b);
  });

  it('returns an icon from the fixed set and an on-theme HSL background color', () => {
    const result = deriveBatchPlaceholder('batch_abc');
    expect(['vegetable', 'fruit', 'grain', 'leaf', 'basket']).toContain(result.icon);
    const match = result.backgroundColor.match(/^hsl\((\d+), (\d+)%, (\d+)%\)$/);
    expect(match).not.toBeNull();
    const [hue, saturation, lightness] = [Number(match![1]), Number(match![2]), Number(match![3])];
    expect(saturation).toBeGreaterThanOrEqual(55);
    expect(saturation).toBeLessThanOrEqual(65);
    expect(lightness).toBeGreaterThanOrEqual(40);
    expect(lightness).toBeLessThanOrEqual(45);
    const inSafeBand = [[0, 15], [20, 45], [45, 60], [95, 140], [200, 225]].some(
      ([min, max]) => hue >= min && hue <= max,
    );
    expect(inSafeBand).toBe(true);
  });

  it('spreads different ids across more than one icon', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const icons = new Set(ids.map((id) => deriveBatchPlaceholder(id).icon));
    expect(icons.size).toBeGreaterThan(1);
  });
});
