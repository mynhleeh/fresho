import { prisma } from '@/lib/db';

// TODO(business-confirm): packaging suggestions are a placeholder keyword map until
// the team confirms real packaging guidance per crop; advisory only, farmer decides.
const PACKAGING_BY_KEYWORD: Array<{ keyword: string; suggestion: string }> = [
  { keyword: 'dưa leo', suggestion: 'Đóng sọt nhựa thoáng khí 20kg, lót giấy chống dập' },
  { keyword: 'xoài', suggestion: 'Đóng thùng carton có lót xốp, tối đa 10kg/thùng' },
  { keyword: 'rau', suggestion: 'Bó và đóng túi lưới thoáng khí, bảo quản mát' },
  { keyword: 'cà chua', suggestion: 'Đóng khay nhựa 1 lớp, tránh chồng cao gây dập' },
];
const DEFAULT_PACKAGING_SUGGESTION = 'Đóng gói thông thoáng, tránh va đập trong vận chuyển';

export async function getPriceAndPackagingAdvisory(cropName: string) {
  const recentBatches = await prisma.harvestBatch.findMany({
    where: { cropName: { contains: cropName } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { pricePerUnit: true },
  });

  const prices = recentBatches.map((b) => b.pricePerUnit);
  const priceAdvisory =
    prices.length > 0
      ? { suggestedMinPrice: Math.min(...prices), suggestedMaxPrice: Math.max(...prices), sampleSize: prices.length }
      : { suggestedMinPrice: null, suggestedMaxPrice: null, sampleSize: 0 };

  const normalizedCropName = cropName.toLowerCase();
  const matchedPackaging = PACKAGING_BY_KEYWORD.find((entry) => normalizedCropName.includes(entry.keyword));

  return {
    ...priceAdvisory,
    packagingSuggestion: matchedPackaging?.suggestion ?? DEFAULT_PACKAGING_SUGGESTION,
    isAdvisoryOnly: true,
  };
}
