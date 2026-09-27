import { describe, expect, it } from 'vitest';
import { deriveBatchPlaceholder } from '@/lib/batchPlaceholder';

describe('deriveBatchPlaceholder', () => {
  it('is deterministic for the same batch id', () => {
    const a = deriveBatchPlaceholder('batch_123');
    const b = deriveBatchPlaceholder('batch_123');
    expect(a).toEqual(b);
  });

  it('returns an icon from the fixed set and a color token', () => {
    const result = deriveBatchPlaceholder('batch_abc');
    expect(['vegetable', 'fruit', 'grain', 'leaf', 'basket']).toContain(result.icon);
    expect(result.colorToken).toMatch(/^--color-accent-[1-5]$/);
  });

  it('spreads different ids across more than one icon', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const icons = new Set(ids.map((id) => deriveBatchPlaceholder(id).icon));
    expect(icons.size).toBeGreaterThan(1);
  });
});
