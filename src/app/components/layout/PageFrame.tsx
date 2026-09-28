import type { ReactNode } from 'react';
import styles from './PageFrame.module.css';

export function PageFrame({ children, wide = false, roomy = false }: { children: ReactNode; wide?: boolean; roomy?: boolean }) {
  const width = wide ? styles.wide : roomy ? styles.roomy : '';
  return <div className={`${styles.frame} ${width}`}>{children}</div>;
}
