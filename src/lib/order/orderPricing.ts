export function calculateGoodsAmount(quantity: number, pricePerUnit: number): number {
  return Math.round(quantity * pricePerUnit);
}

export function calculateOrderTotal(goodsAmount: number, shippingFee: number): number {
  return goodsAmount + shippingFee;
}
