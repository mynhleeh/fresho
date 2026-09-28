import { describe, it, expect } from 'vitest';
import { moneyOf, sumExpected, type FarmerPreOrder } from '@/app/farmer/orders/data/orderTypes';

function farmerOrder(overrides: Partial<FarmerPreOrder> = {}): FarmerPreOrder {
  return {
    id: 'order-1',
    batchId: 'batch-1',
    quantity: 10,
    pricePerUnit: 10000,
    deliveryMethod: 'self_pickup',
    status: 'delivered',
    farmerConfirmedAt: null,
    agreements: [],
    buyer: { id: 'buyer-1', name: 'Buyer', trustScore: 50 },
    batch: { cropName: 'Ca chua', quantityTotal: 100 },
    deposits: [{ amount: 20000 }],
    ratings: [],
    settlement: null,
    ...overrides,
  };
}

describe('moneyOf for the farmer', () => {
  it('uses the reserved quantity before settlement', () => {
    expect(moneyOf(farmerOrder())).toEqual({ goods: 100000, deposit: 20000, expected: 100000 });
  });

  it('uses the settled goods amount once the buyer received fewer units', () => {
    const settled = farmerOrder({ status: 'settled', settlement: { finalGoodsAmount: 80000 } });

    expect(moneyOf(settled).expected).toBe(80000);
    expect(sumExpected([settled])).toBe(80000);
  });
});
