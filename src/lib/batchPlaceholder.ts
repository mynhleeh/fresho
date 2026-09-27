export type PlaceholderIconName = 'vegetable' | 'fruit' | 'grain' | 'leaf' | 'basket';

const ICONS: PlaceholderIconName[] = ['vegetable', 'fruit', 'grain', 'leaf', 'basket'];

type HueBand = { min: number; max: number };

// Hue bands chosen to match the existing accent palette in tokens.css
// (green ~124°, brown/orange ~27°, brick red ~0°, gold/olive ~43°, blue ~209°)
// so generated placeholders stay on-theme with the produce/harvest look.
const HUE_BANDS: HueBand[] = [
  { min: 0, max: 15 },
  { min: 20, max: 45 },
  { min: 45, max: 60 },
  { min: 95, max: 140 },
  { min: 200, max: 225 },
];

const SATURATION_RANGE = { min: 55, max: 65 };
const LIGHTNESS_RANGE = { min: 40, max: 45 };

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function rangeFromHash(hash: number, range: { min: number; max: number }): number {
  return range.min + (hash % (range.max - range.min + 1));
}

export function deriveBatchPlaceholder(batchId: string): { icon: PlaceholderIconName; backgroundColor: string } {
  const band = HUE_BANDS[hashString(`${batchId}:band`) % HUE_BANDS.length];
  const hue = rangeFromHash(hashString(`${batchId}:hue`), band);
  const saturation = rangeFromHash(hashString(`${batchId}:saturation`), SATURATION_RANGE);
  const lightness = rangeFromHash(hashString(`${batchId}:lightness`), LIGHTNESS_RANGE);

  return {
    icon: ICONS[hashString(`${batchId}:icon`) % ICONS.length],
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
  };
}
