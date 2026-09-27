'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';
import {
  ClipboardOrdersIcon,
  HarvestBatchIcon,
  LeafIcon,
  LogisticsTruckIcon,
  PlusIcon,
  SearchIcon,
  SettingsGearIcon,
  WarningIcon,
} from './icons';
import { ROLE_NAV_LINKS, type AppRole } from './roleNav';
import styles from './AppShell.module.css';

type Role = AppRole;

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

const NAV_ICON_BY_HREF: Record<string, ComponentType<{ className?: string }>> = {
  '/farmer/batches': HarvestBatchIcon,
  '/farmer/orders': ClipboardOrdersIcon,
  '/buyer/marketplace': SearchIcon,
  '/buyer/orders': ClipboardOrdersIcon,
  '/admin/orders': ClipboardOrdersIcon,
  '/admin/disputes': WarningIcon,
  '/logistics/deliveries': LogisticsTruckIcon,
};

function navItemsForRole(role: Role): NavItem[] {
  return ROLE_NAV_LINKS[role].map((link) => ({
    ...link,
    Icon: NAV_ICON_BY_HREF[link.href],
  }));
}

const PRIMARY_ACTION: Record<Role, { href: string; label: string } | null> = {
  farmer: { href: '/farmer/batches/new', label: 'Đăng mùa vụ' },
  buyer: { href: '/buyer/marketplace', label: 'Tìm nông sản' },
  admin: null,
  logistics: null,
};

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const navItems = navItemsForRole(role);
  const primaryAction = PRIMARY_ACTION[role];

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <Link href="/" className={styles.logo} aria-label="FRESH O!">
          <LeafIcon className={styles.logoLeaf} />
        </Link>
        {primaryAction && (
          <Link href={primaryAction.href} className={styles.primaryAction} title={primaryAction.label}>
            <PlusIcon className={styles.primaryActionIcon} />
          </Link>
        )}
        <div className={styles.navItems}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.navItemActive : ''}`}
            >
              <item.Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
        <Link href="/" className={styles.exitLink} title="Đổi tài khoản">
          <SettingsGearIcon className={styles.exitIcon} />
        </Link>
      </nav>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
