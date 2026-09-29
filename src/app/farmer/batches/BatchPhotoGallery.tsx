'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { CameraIcon } from '../../components/ui/icons';
import styles from './BatchPhotoGallery.module.css';

export type GalleryPhoto = {
  key: string;
  url: string;
  isCover: boolean;
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_GALLERY_PHOTOS = 6;
const THUMB_PIXELS = 256;
const THUMB_SIZES = '(max-width: 600px) 33vw, 200px';

function isImageFile(file: File) {
  return ALLOWED_TYPES.includes(file.type);
}

export function BatchPhotoGallery(props: {
  id: string;
  photos: GalleryPhoto[];
  onAdd: (file: File) => void;
  onRemove: (key: string) => void;
  onSetCover: (key: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { photos } = props;
  const canAddMore = photos.length < MAX_GALLERY_PHOTOS;

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remainingSlots = MAX_GALLERY_PHOTOS - photos.length;
    Array.from(files)
      .filter(isImageFile)
      .slice(0, remainingSlots)
      .forEach(props.onAdd);
  }

  return (
    <div className={styles.gallery}>
      <span className={styles.hint}>
        JPG, PNG hoặc WEBP — tối đa {MAX_GALLERY_PHOTOS} ảnh, không bắt buộc. Ảnh đầu tiên hoặc ảnh được chọn làm bìa sẽ hiển thị ở danh sách mùa vụ.
      </span>
      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <div key={photo.key} className={styles.thumb}>
            <Image
              src={photo.url}
              alt={photo.isCover ? 'Ảnh bìa mùa vụ' : `Ảnh mùa vụ ${index + 1}`}
              className={styles.thumbImage}
              width={THUMB_PIXELS}
              height={THUMB_PIXELS}
              sizes={THUMB_SIZES}
              unoptimized={!photo.url.startsWith('/')}
            />
            {photo.isCover ? (
              <span className={styles.coverBadge}>Ảnh bìa</span>
            ) : (
              <button
                type="button"
                className={styles.setCoverButton}
                onClick={() => props.onSetCover(photo.key)}
              >
                Đặt làm ảnh bìa
              </button>
            )}
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => props.onRemove(photo.key)}
              aria-label="Xoá ảnh"
            >
              ×
            </button>
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            className={styles.addTile}
            onClick={() => inputRef.current?.click()}
          >
            <CameraIcon className={styles.addIcon} />
            <span>Thêm ảnh</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        id={props.id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className={styles.hiddenInput}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
