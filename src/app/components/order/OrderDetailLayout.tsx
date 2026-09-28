'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { readReturnUrl } from '../hooks/useRestoredScroll';
import styles from './OrderDetailLayout.module.css';

type Props = {
  listHref: string;
  listLabel: string;
  title: string;
  summary: ReactNode;
  mobileActions?: ReactNode;
  children: ReactNode;
};

export function OrderDetailLayout({ listHref, listLabel, title, summary, mobileActions, children }: Props) {
  const router = useRouter();
  const goBackToList = (event: MouseEvent<HTMLAnchorElement>) => {
    const returnUrl = readReturnUrl(listHref);
    if (!returnUrl) return;
    event.preventDefault();
    router.push(returnUrl);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn">
        <Link href={listHref} className={styles.back} onClick={goBackToList}>← {listLabel}</Link>
        <span className={styles.crumb} aria-current="page">{title}</span>
      </nav>
      <div className={styles.grid}>
        <aside className={styles.summary}>{summary}</aside>
        <div className={styles.main}>{children}</div>
      </div>
      {mobileActions && <div className={styles.actionBar}>{mobileActions}</div>}
    </div>
  );
}
