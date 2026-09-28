export type PriceTrend = 'up' | 'down' | 'stable';

export type MarketPriceQuote = {
  productId: string;
  productName: string;
  region: string;
  farmGateLow: number;
  farmGateHigh: number;
  wholesaleLow: number;
  wholesaleHigh: number;
  trend: PriceTrend;
  weeklyChangePercent: number;
};

export const MARKET_SNAPSHOT_DATE = '28/09/2026';

export const marketPriceQuotes: MarketPriceQuote[] = [
  {
    productId: 'cucumber',
    productName: 'Dưa leo loại 1',
    region: 'Tiền Giang – Long An',
    farmGateLow: 10_500,
    farmGateHigh: 13_000,
    wholesaleLow: 14_000,
    wholesaleHigh: 17_000,
    trend: 'up',
    weeklyChangePercent: 8,
  },
  {
    productId: 'tomato',
    productName: 'Cà chua',
    region: 'Lâm Đồng',
    farmGateLow: 12_000,
    farmGateHigh: 15_500,
    wholesaleLow: 16_000,
    wholesaleHigh: 20_000,
    trend: 'up',
    weeklyChangePercent: 5,
  },
  {
    productId: 'bok-choy',
    productName: 'Cải ngọt',
    region: 'Hóc Môn – Củ Chi',
    farmGateLow: 9_000,
    farmGateHigh: 12_000,
    wholesaleLow: 13_000,
    wholesaleHigh: 16_000,
    trend: 'up',
    weeklyChangePercent: 12,
  },
  {
    productId: 'cabbage',
    productName: 'Bắp cải',
    region: 'Lâm Đồng',
    farmGateLow: 5_000,
    farmGateHigh: 7_000,
    wholesaleLow: 8_000,
    wholesaleHigh: 10_000,
    trend: 'stable',
    weeklyChangePercent: 0,
  },
  {
    productId: 'wax-gourd',
    productName: 'Bí xanh',
    region: 'Tiền Giang',
    farmGateLow: 6_000,
    farmGateHigh: 8_500,
    wholesaleLow: 9_500,
    wholesaleHigh: 12_000,
    trend: 'down',
    weeklyChangePercent: -4,
  },
];

export function findMarketPriceQuote(productId: string): MarketPriceQuote | undefined {
  return marketPriceQuotes.find((quote) => quote.productId === productId);
}
