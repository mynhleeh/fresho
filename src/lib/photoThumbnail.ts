import { isWikimediaCommonsPhoto, wikimediaThumbnailLoader } from '@/lib/wikimediaThumbnail';

const LOCAL_UPLOAD_PREFIX = '/uploads/';
const THUMBNAIL_QUALITY = 75;

export function toPhotoThumbnailSrc(photoUrl: string, width: number): string {
  if (photoUrl.startsWith(LOCAL_UPLOAD_PREFIX)) {
    return `/_next/image?url=${encodeURIComponent(photoUrl)}&w=${width}&q=${THUMBNAIL_QUALITY}`;
  }
  if (isWikimediaCommonsPhoto(photoUrl)) return wikimediaThumbnailLoader({ src: photoUrl, width });
  return photoUrl;
}
