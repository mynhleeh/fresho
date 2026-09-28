import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      {backHref && (
        <Link href={backHref} className={styles.back}>
          <span aria-hidden="true">←</span> {backLabel ?? 'Quay lại'}
        </Link>
      )}
      <div className={styles.row}>
        <div className={styles.text}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
