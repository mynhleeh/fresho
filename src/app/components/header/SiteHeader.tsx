'use client';

import Link from 'next/link';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_LABELS } from '../../auth/roleLabels';
import { Button } from '../ui/Button';
import buttonStyles from '../ui/Button.module.css';
import { ROLE_NAV_LINKS, type AppRole } from '../layout/roleNav';
import styles from './SiteHeader.module.css';

function isAppRole(role: string): role is AppRole {
  return role in ROLE_NAV_LINKS;
}

export function SiteHeader() {
  const { user, isLoading, logout } = useAuth();
  const navLinks = user && isAppRole(user.role) ? ROLE_NAV_LINKS[user.role] : [];

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>FRESH O!</Link>
      {navLinks.length > 0 && (
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
      <div className={styles.actions}>
        {isLoading ? null : user ? (
          <>
            <span className={styles.identity}>
              <span className={styles.name}>{user.name}</span>
              <span className={styles.role}>{ROLE_LABELS[user.role] ?? user.role}</span>
            </span>
            <Button type="button" variant="outline" onClick={logout}>Đăng xuất</Button>
          </>
        ) : (
          <Link href="/login" className={`${buttonStyles.button} ${buttonStyles.primary}`}>
            Đăng nhập / Đăng ký
          </Link>
        )}
      </div>
    </header>
  );
}
