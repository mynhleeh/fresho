'use client';
import { useRef, useState } from 'react';
import { CameraIcon } from '../../components/icons';
import styles from './PhotoUploadField.module.css';

function isImageFile(file: File) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

export function PhotoUploadField(props: {
  id: string;
  existingPhotoUrl: string | null;
  onSelect: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const displayedPhotoUrl = preview ?? props.existingPhotoUrl;

  function chooseFile(file: File | null) {
    if (file && !isImageFile(file)) return;
    setPreview(file ? URL.createObjectURL(file) : null);
    props.onSelect(file);
  }

  function clearPhoto() {
    chooseFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div
      className={isDraggingOver ? styles.dropzoneActive : styles.dropzone}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        chooseFile(e.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        ref={inputRef}
        id={props.id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.hiddenInput}
        onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
      />
      {displayedPhotoUrl ? (
        <div className={styles.previewWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local uploads/blob previews, no remote-image optimization config needed for demo scope */}
          <img src={displayedPhotoUrl} alt="Ảnh mùa vụ đã chọn" className={styles.previewImage} />
          <button
            type="button"
            className={styles.clearButton}
            onClick={(e) => {
              e.stopPropagation();
              clearPhoto();
            }}
          >
            Xoá ảnh
          </button>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <CameraIcon className={styles.emptyIcon} />
          <span className={styles.emptyText}>Kéo thả ảnh vào đây hoặc bấm để chọn</span>
          <span className={styles.emptyHint}>JPG, PNG hoặc WEBP — không bắt buộc</span>
        </div>
      )}
    </div>
  );
}
