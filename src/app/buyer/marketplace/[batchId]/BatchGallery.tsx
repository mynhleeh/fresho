import { useState } from 'react';
import styles from './BatchGallery.module.css';

export type BatchPhoto = { id: string; url: string; isCover: boolean };

export function BatchGallery({ photos, cropName }: { photos: BatchPhoto[]; cropName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = photos.length - 1;
  const activePhoto = photos[activeIndex];

  return (
    <section className={styles.gallery} aria-label={`Ảnh lô hàng ${cropName}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Ảnh lô hàng</h2>
        <span className={styles.counter}>{activeIndex + 1} / {photos.length}</span>
      </div>

      <div className={styles.viewer}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local uploads, no remote-image optimization config needed for demo scope */}
        <img key={activePhoto.id} src={activePhoto.url} alt={`${cropName} - ảnh ${activeIndex + 1}`} className={styles.photo} decoding="async" />
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowPrev}`}
          aria-label="Ảnh trước"
          onClick={() => setActiveIndex(activeIndex === 0 ? lastIndex : activeIndex - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowNext}`}
          aria-label="Ảnh sau"
          onClick={() => setActiveIndex(activeIndex === lastIndex ? 0 : activeIndex + 1)}
        >
          ›
        </button>
      </div>

      <div className={styles.thumbs} role="group" aria-label="Chọn ảnh">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            aria-pressed={index === activeIndex}
            aria-label={`Xem ảnh ${index + 1}`}
            className={`${styles.thumb} ${index === activeIndex ? styles.thumbActive : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local uploads, no remote-image optimization config needed for demo scope */}
            <img src={photo.url} alt="" className={styles.thumbImage} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </section>
  );
}
