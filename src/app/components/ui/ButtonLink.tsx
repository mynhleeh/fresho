import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';

export function ButtonLink({
  variant = 'primary',
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant }) {
  return <Link className={`${styles.button} ${styles[variant]} ${className ?? ''}`} {...rest} />;
}
