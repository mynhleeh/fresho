export type CropShape = 'round' | 'long' | 'ear' | 'leaf';
export type CropArtSpec = { shape: CropShape; fill: string; shade: string };

const CROP_RULES: { keywords: string[]; spec: CropArtSpec }[] = [
  { keywords: ['ca chua'], spec: { shape: 'round', fill: '#d9532b', shade: '#b03d1c' } },
  { keywords: ['vai', 'chom chom'], spec: { shape: 'round', fill: '#c8402f', shade: '#9e2f22' } },
  { keywords: ['buoi'], spec: { shape: 'round', fill: '#8fb84a', shade: '#6c9433' } },
  { keywords: ['cam', 'quyt', 'chanh'], spec: { shape: 'round', fill: '#e8892b', shade: '#c26a14' } },
  { keywords: ['xoai', 'mit'], spec: { shape: 'round', fill: '#e3b04b', shade: '#c9922f' } },
  { keywords: ['dua hau'], spec: { shape: 'round', fill: '#3f8a3a', shade: '#2f6b2a' } },
  { keywords: ['dua leo'], spec: { shape: 'long', fill: '#5aa04a', shade: '#3f7d34' } },
  { keywords: ['chuoi'], spec: { shape: 'long', fill: '#e3c04b', shade: '#c9a12f' } },
  { keywords: ['lua', 'gao', 'ngo'], spec: { shape: 'ear', fill: '#e3b04b', shade: '#b98a2a' } },
  { keywords: ['rau', 'cai', 'xa lach', 'muong'], spec: { shape: 'leaf', fill: '#5aa04a', shade: '#3f7d34' } },
];

const DEFAULT_SPEC: CropArtSpec = { shape: 'round', fill: '#6aa84f', shade: '#4c8b3a' };

function normalizeCropName(cropName: string): string {
  return ` ${cropName.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase()} `;
}

export function deriveCropArt(cropName: string): CropArtSpec {
  const normalized = normalizeCropName(cropName);
  const rule = CROP_RULES.find(({ keywords }) => keywords.some((keyword) => normalized.includes(` ${keyword} `)));
  return rule ? rule.spec : DEFAULT_SPEC;
}
