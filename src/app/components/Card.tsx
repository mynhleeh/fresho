import type { ComponentPropsWithoutRef } from 'react';
import styles from './Card.module.css';

export function Card({ children, className, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={`${styles.card} ${className ?? ''}`} {...rest}>
      {children}
    </div>
  );
}
