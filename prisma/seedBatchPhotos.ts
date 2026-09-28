const PHOTOS_PER_CROP = 3;

const PHOTO_SLUG_BY_CROP: Record<string, string> = {
  'Xoài cát Hòa Lộc': 'mango',
  'Dưa leo loại 1': 'cucumber',
  'Cà chua bi': 'cherry-tomato',
  'Lúa ST25': 'rice',
  'Bưởi da xanh': 'pomelo',
  'Ổi Đài Loan': 'guava',
  'Khoai lang tím': 'purple-sweet-potato',
  'Sầu riêng Ri6': 'durian',
  'Thanh long ruột đỏ': 'dragon-fruit',
  'Cà phê nhân xô': 'coffee',
  'Nhãn tiêu da bò': 'longan',
  'Chôm chôm Java': 'rambutan',
  'Mít Thái': 'jackfruit',
  'Chuối già Nam Mỹ': 'banana',
  'Dưa hấu không hạt': 'watermelon',
  'Vải thiều': 'lychee',
  'Rau muống': 'water-spinach',
};

export type SeedBatchPhotoRow = { batchId: string; url: string; position: number; isCover: boolean };

export function seedPhotoUrlsForCrop(cropName: string): string[] {
  const slug = PHOTO_SLUG_BY_CROP[cropName];
  if (!slug) throw new Error(`No seed photos mapped for cropName "${cropName}"`);
  return Array.from({ length: PHOTOS_PER_CROP }, (_, index) => `/seed/batches/${slug}-${index + 1}.jpg`);
}

export function buildSeedBatchPhotoRows(batchId: string, photoUrls: string[]): SeedBatchPhotoRow[] {
  return photoUrls.map((url, position) => ({ batchId, url, position, isCover: position === 0 }));
}
