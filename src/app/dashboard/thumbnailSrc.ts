import { isWikimediaCommonsPhoto, wikimediaThumbnailLoader } from '@/lib/wikimediaThumbnail';

const THUMBNAIL_WIDTH = 96;
const THUMBNAIL_QUALITY = 75;
const LOCAL_UPLOAD_PREFIX = '/uploads/';
const WIKIMEDIA_THUMBNAIL_STEP_WIDTH = 330;

export function toThumbnailSrc(photoUrl: string | null | undefined): string | null | undefined {
  if (!photoUrl) return photoUrl;
  if (photoUrl.startsWith(LOCAL_UPLOAD_PREFIX)) {
    return `/_next/image?url=${encodeURIComponent(photoUrl)}&w=${THUMBNAIL_WIDTH}&q=${THUMBNAIL_QUALITY}`;
  }
  if (isWikimediaCommonsPhoto(photoUrl)) return wikimediaThumbnailLoader({ src: photoUrl, width: WIKIMEDIA_THUMBNAIL_STEP_WIDTH });
  return photoUrl;
}
