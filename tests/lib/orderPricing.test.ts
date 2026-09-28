import { describe, it, expect } from 'vitest';
import { calculateGoodsAmount, calculateOrderTotal } from '@/lib/order/orderPricing';

describe('calculateGoodsAmount', () => {
  it('multiplies quantity by unit price', () => {
    expect(calculateGoodsAmount(800, 12000)).toBe(9600000);
  });

  it('rounds to the nearest integer VND', () => {
    expect(calculateGoodsAmount(3, 1000.4)).toBe(3001);
  });
});

describe('calculateOrderTotal', () => {
  it('adds shipping fee to goods amount', () => {
    expect(calculateOrderTotal(9600000, 250000)).toBe(9850000);
  });

  it('equals goods amount when shipping fee is zero for self pickup', () => {
    expect(calculateOrderTotal(9600000, 0)).toBe(9600000);
  });
});
