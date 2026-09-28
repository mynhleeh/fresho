import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';

export function Button({
  variant = 'primary',
  loading = false,
  className,
  type = 'button',
  onClick,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  const ignoreClickWhileLoading = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) event.preventDefault();
    else onClick?.(event);
  };

  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className ?? ''}`}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={ignoreClickWhileLoading}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
