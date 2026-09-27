'use client';
import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS } from '../auth/roleLabels';
import { ROLE_NAV_LINKS, type AppRole } from '../components/roleNav';
import styles from './page.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const role = (user?.role ?? 'farmer') as AppRole;
  const quickLinks = ROLE_NAV_LINKS[role] ?? [];

  return (
    <AppShell role={role}>
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Xin chào, {user?.name ?? 'bạn'}</h1>
          <p className={styles.subheading}>
            Bạn đang đăng nhập với vai trò {ROLE_LABELS[role] ?? role}.
          </p>
        </div>

        <div className={styles.quickLinks}>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.quickLink}>
              {link.label}
            </Link>
          ))}
          <Link href="/account" className={styles.quickLink}>
            Quản lý tài khoản
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
