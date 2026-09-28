export const DEPOSIT_PERCENT = 20;

export function calculateDepositAmount(goodsAmount: number): number {
  return Math.round((goodsAmount * DEPOSIT_PERCENT) / 100);
}
