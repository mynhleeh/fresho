'use client';
import { useId, useState, type ReactNode } from 'react';
import { toPhotoThumbnailSrc } from '@/lib/photoThumbnail';

const ART_THUMBNAIL_WIDTH = 384;

type CropKind = 'fruit' | 'tomato' | 'long' | 'grain' | 'root' | 'leafy';

const KIND_KEYWORDS: [CropKind, string[]][] = [
  ['tomato', ['ca chua', 'ot ', 'thanh long']],
  ['long', ['dua leo', 'chuoi', 'dau', 'khoai tay']],
  ['grain', ['lua', 'gao', 'ca phe', 'ngo', 'tieu']],
  ['root', ['khoai', 'cu ', 'gung', 'nghe', 'hanh']],
  ['fruit', ['xoai', 'buoi', 'oi ', 'cam ', 'sau rieng', 'mit ', 'chom chom', 'nhan ', 'vai ', 'dua hau', 'quyt']],
];

function normalizeCropName(cropName: string): string {
  return `${cropName.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd')} `;
}

function cropKindOf(cropName: string): CropKind {
  const name = normalizeCropName(cropName);
  const match = KIND_KEYWORDS.find(([, keywords]) => keywords.some((keyword) => name.includes(keyword)));
  return match ? match[0] : 'leafy';
}

const LEAF = <path d="M60 46 C 52 30, 66 22, 78 30 C 76 42, 68 48, 60 46 Z" fill="var(--color-leaf-bright)" />;

function Fruit() {
  return (
    <g>
      <ellipse cx="58" cy="72" rx="26" ry="24" fill="var(--color-warning)" />
      <ellipse cx="50" cy="64" rx="8" ry="6" fill="var(--color-gold-soft)" opacity="0.7" />
      <path d="M58 48 C 58 40, 60 36, 62 32" stroke="var(--color-leaf-dark)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {LEAF}
    </g>
  );
}

function Tomato() {
  return (
    <g>
      <circle cx="46" cy="76" r="18" fill="var(--color-danger)" />
      <circle cx="76" cy="70" r="16" fill="var(--color-danger)" />
      <circle cx="62" cy="88" r="15" fill="var(--color-danger)" />
      <path d="M40 60 l6 6 l6 -6 M70 56 l6 6 l6 -6" stroke="var(--color-leaf-deep)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Long() {
  return (
    <g>
      <rect x="30" y="58" width="64" height="20" rx="10" fill="var(--color-leaf-mid)" transform="rotate(-24 62 68)" />
      <rect x="34" y="76" width="60" height="18" rx="9" fill="var(--color-leaf-bright)" transform="rotate(-8 64 85)" />
    </g>
  );
}

function Grain() {
  return (
    <g stroke="var(--color-accent-gold)" strokeWidth="3" strokeLinecap="round" fill="none">
      <path d="M40 100 C 40 80, 44 60, 42 36" />
      <path d="M62 100 C 62 78, 66 56, 64 28" />
      <path d="M84 100 C 84 82, 88 62, 86 40" />
      <path d="M42 50 l-8 -6 M42 62 l8 -6 M64 42 l-8 -6 M64 54 l8 -6 M86 54 l-8 -6 M86 66 l8 -6" />
    </g>
  );
}

function Root() {
  return (
    <g>
      <ellipse cx="60" cy="80" rx="34" ry="16" fill="var(--color-leaf-deep)" transform="rotate(-14 60 80)" />
      <ellipse cx="52" cy="76" rx="12" ry="4" fill="var(--color-mint-strong)" opacity="0.6" transform="rotate(-14 52 76)" />
      <path d="M86 60 C 92 48, 100 46, 104 50" stroke="var(--color-leaf-bright)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Leafy() {
  return (
    <g>
      <path d="M60 100 C 60 80, 56 62, 60 42" stroke="var(--color-leaf-dark)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 78 C 40 74, 30 60, 34 50 C 52 50, 60 62, 60 78 Z" fill="var(--color-leaf-bright)" />
      <path d="M60 64 C 80 60, 90 46, 86 36 C 68 36, 60 48, 60 64 Z" fill="var(--color-leaf-mid)" />
    </g>
  );
}

const PRODUCE: Record<CropKind, () => ReactNode> = {
  fruit: Fruit, tomato: Tomato, long: Long, grain: Grain, root: Root, leafy: Leafy,
};

const BLOB_PATH = 'M60 6 C 96 6, 114 34, 112 66 C 110 98, 78 116, 48 112 C 16 108, 4 78, 10 48 C 16 22, 34 6, 60 6 Z';

function PhotoBlob({ photoUrl, className, onError }: { photoUrl: string; className?: string; onError: () => void }) {
  const clipId = useId();
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const thumbnailSrc = toPhotoThumbnailSrc(photoUrl, ART_THUMBNAIL_WIDTH);
  const src = thumbnailFailed ? photoUrl : thumbnailSrc;
  const handleError = () => (src === photoUrl ? onError() : setThumbnailFailed(true));
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}><path d={BLOB_PATH} /></clipPath>
      </defs>
      <path d={BLOB_PATH} fill="var(--color-mint-strong)" />
      <image href={src} width="120" height="120" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`} onError={handleError} />
    </svg>
  );
}

export function CropArt({ cropName, photoUrl, className }: { cropName: string; photoUrl?: string | null; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (photoUrl && photoUrl !== failedUrl) {
    return <PhotoBlob key={photoUrl} photoUrl={photoUrl} className={className} onError={() => setFailedUrl(photoUrl)} />;
  }
  const Produce = PRODUCE[cropKindOf(cropName)];
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
      <path d={BLOB_PATH} fill="var(--color-mint-strong)" />
      <path d="M8 96 C 40 84, 80 84, 114 96 V120 H8 Z" fill="var(--color-sage)" opacity="0.7" />
      <Produce />
    </svg>
  );
}
