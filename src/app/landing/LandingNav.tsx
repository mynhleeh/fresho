'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthContext';
import styles from './landing.module.css';

const SCROLLED_THRESHOLD_PX = 12;

const sectionLinks = [
  { href: '#doi-tuong', label: 'Dành cho ai' },
  { href: '#cach-hoat-dong', label: 'Cách hoạt động' },
  { href: '#minh-bach', label: 'Minh bạch' },
];

export function LandingNav() {
  const { user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function syncScrolledState() {
      setScrolled(window.scrollY > SCROLLED_THRESHOLD_PX);
    }
    syncScrolledState();
    window.addEventListener('scroll', syncScrolledState, { passive: true });
    return () => window.removeEventListener('scroll', syncScrolledState);
  }, []);

  return (
    <header className={styles.nav} data-scrolled={scrolled || undefined}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.wordmark} aria-label="FRESH O! trang chủ">
          FRESH<span className={styles.wordmarkAccent}>O!</span>
        </Link>
        <nav className={styles.navLinks} aria-label="Mục trên trang">
          {sectionLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>{link.label}</a>
          ))}
        </nav>
        {!isLoading && (
          <Link href={user ? '/dashboard' : '/login'} className={styles.navCta}>
            {user ? 'Vào ứng dụng' : 'Đăng nhập'}
          </Link>
        )}
      </div>
    </header>
  );
}
