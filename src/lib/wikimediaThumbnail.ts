const WIKIMEDIA_COMMONS_PREFIX = 'https://upload.wikimedia.org/wikipedia/commons/';
const THUMBNAIL_STEPS = [330, 500];
const RESIZABLE_FILE = /\.(jpe?g|png)$/i;

export function isWikimediaCommonsPhoto(photoUrl: string): boolean {
  return photoUrl.startsWith(WIKIMEDIA_COMMONS_PREFIX) && !photoUrl.includes('/thumb/') && RESIZABLE_FILE.test(photoUrl);
}

function pickThumbnailStep(requestedWidth: number): number {
  return THUMBNAIL_STEPS.find((step) => step >= requestedWidth) ?? THUMBNAIL_STEPS[THUMBNAIL_STEPS.length - 1];
}

export function wikimediaThumbnailLoader({ src, width }: { src: string; width: number }): string {
  const filePath = src.slice(WIKIMEDIA_COMMONS_PREFIX.length);
  const fileName = filePath.slice(filePath.lastIndexOf('/') + 1);
  return `${WIKIMEDIA_COMMONS_PREFIX}thumb/${filePath}/${pickThumbnailStep(width)}px-${fileName}`;
}
