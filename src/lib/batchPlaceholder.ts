export type PlaceholderIconName = 'vegetable' | 'fruit' | 'grain' | 'leaf' | 'basket';

const ICONS: PlaceholderIconName[] = ['vegetable', 'fruit', 'grain', 'leaf', 'basket'];
const COLOR_TOKENS = ['--color-accent-1', '--color-accent-2', '--color-accent-3', '--color-accent-4', '--color-accent-5'];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function deriveBatchPlaceholder(batchId: string): { icon: PlaceholderIconName; colorToken: string } {
  const hash = hashString(batchId);
  return {
    icon: ICONS[hash % ICONS.length],
    colorToken: COLOR_TOKENS[Math.floor(hash / ICONS.length) % COLOR_TOKENS.length],
  };
}
