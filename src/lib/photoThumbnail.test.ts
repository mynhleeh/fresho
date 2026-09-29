import { describe, expect, it } from 'vitest';
import { toPhotoThumbnailSrc } from './photoThumbnail';

describe('toPhotoThumbnailSrc', () => {
  it('routes local uploads through the image optimizer at the requested width', () => {
    expect(toPhotoThumbnailSrc('/uploads/batch/a.jpg', 96)).toBe('/_next/image?url=%2Fuploads%2Fbatch%2Fa.jpg&w=96&q=75');
  });

  it('snaps a Wikimedia Commons photo to a thumbnail step', () => {
    const original = 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Tomato.jpg';
    expect(toPhotoThumbnailSrc(original, 96)).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tomato.jpg/330px-Tomato.jpg');
  });

  it('leaves an existing Wikimedia thumbnail untouched', () => {
    const thumbnail = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tomato.jpg/330px-Tomato.jpg';
    expect(toPhotoThumbnailSrc(thumbnail, 96)).toBe(thumbnail);
  });

  it('leaves any other URL untouched', () => {
    expect(toPhotoThumbnailSrc('https://example.com/x.jpg', 96)).toBe('https://example.com/x.jpg');
  });
});
