import type { ReactNode } from 'react';
import styles from './PageFrame.module.css';

export function PageFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`${styles.frame} ${wide ? styles.wide : ''}`}>{children}</div>;
}
