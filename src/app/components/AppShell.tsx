'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

type Role = 'farmer' | 'buyer' | 'admin' | 'logistics';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  farmer: [
    { href: '/farmer/batches', label: 'Mùa vụ', icon: '\u{1F331}' },
    { href: '/farmer/orders', label: 'Đơn hàng', icon: '\u{1F4CB}' },
  ],
  buyer: [
    { href: '/buyer/marketplace', label: 'Tìm nông sản', icon: '\u{1F50D}' },
    { href: '/buyer/orders', label: 'Đơn hàng', icon: '\u{1F4CB}' },
  ],
  admin: [
    { href: '/admin/orders', label: 'Đơn hàng', icon: '\u{1F4CB}' },
    { href: '/admin/disputes', label: 'Khiếu nại', icon: '\u{26A0}\u{FE0F}' },
  ],
  logistics: [{ href: '/logistics/deliveries', label: 'Vận chuyển', icon: '\u{1F69A}' }],
};

const PRIMARY_ACTION: Record<Role, { href: string; label: string } | null> = {
  farmer: { href: '/farmer/batches', label: 'Đăng mùa vụ' },
  buyer: { href: '/buyer/marketplace', label: 'Tìm nông sản' },
  admin: null,
  logistics: null,
};

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role];
  const primaryAction = PRIMARY_ACTION[role];

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <Link href="/" className={styles.logo} aria-label="FRESH O!">
          <span className={styles.logoLeaf}>🍃</span>
        </Link>
        {primaryAction && (
          <Link href={primaryAction.href} className={styles.primaryAction} title={primaryAction.label}>
            +
          </Link>
        )}
        <div className={styles.navItems}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
        <Link href="/" className={styles.exitLink} title="Đổi tài khoản">
          ⚙️
        </Link>
      </nav>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
