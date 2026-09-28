import type { ReactNode } from 'react';
import styles from './DetailBlock.module.css';

type Tone = 'plain' | 'tint' | 'kraft';

type Props = {
  title: string;
  eyebrow?: string;
  tone?: Tone;
  children: ReactNode;
};

export function DetailBlock({ title, eyebrow, tone = 'plain', children }: Props) {
  return (
    <section className={tone === 'plain' ? styles.block : `${styles.block} ${styles[tone]}`}>
      <header className={styles.head}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
      </header>
      {children}
    </section>
  );
}
