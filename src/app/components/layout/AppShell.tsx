'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';
import {
  ClipboardOrdersIcon,
  HarvestBatchIcon,
  HomeIcon,
  LeafIcon,
  LogisticsTruckIcon,
  PlusIcon,
  SearchIcon,
  SettingsGearIcon,
  UserCircleIcon,
  WarningIcon,
} from '../ui/icons';
import { ROLE_NAV_LINKS, type AppRole } from './roleNav';
import { useCreateBatchPanel } from '../../farmer/batches/CreateBatchPanelContext';
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

const HOME_NAV_ITEM: NavItem = { href: '/dashboard', label: 'Trang chủ', Icon: HomeIcon };
const ACCOUNT_NAV_ITEM: NavItem = { href: '/account', label: 'Tài khoản', Icon: UserCircleIcon };

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemsForRole(role: Role): NavItem[] {
  const roleItems = ROLE_NAV_LINKS[role].map((link) => ({
    ...link,
    Icon: NAV_ICON_BY_HREF[link.href],
  }));
  return [HOME_NAV_ITEM, ...roleItems, ACCOUNT_NAV_ITEM];
}

type PrimaryAction =
  | { kind: 'create-batch'; label: string }
  | { kind: 'link'; href: string; label: string };

const PRIMARY_ACTION: Record<Role, PrimaryAction | null> = {
  farmer: { kind: 'create-batch', label: 'Đăng mùa vụ' },
  buyer: { kind: 'link', href: '/buyer/marketplace', label: 'Tìm nông sản' },
  admin: null,
  logistics: null,
};

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const navItems = navItemsForRole(role);
  const primaryAction = PRIMARY_ACTION[role];
  const createBatchPanel = useCreateBatchPanel();

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar} aria-label="Điều hướng chính">
        <Link href="/" className={styles.logo} aria-label="FRESH O!">
          <LeafIcon className={styles.logoLeaf} />
        </Link>
        {primaryAction?.kind === 'create-batch' && (
          <button
            type="button"
            className={styles.primaryAction}
            title={primaryAction.label}
            aria-label={primaryAction.label}
            onClick={createBatchPanel.open}
          >
            <PlusIcon className={styles.primaryActionIcon} />
          </button>
        )}
        {primaryAction?.kind === 'link' && (
          <Link href={primaryAction.href} className={styles.primaryAction} title={primaryAction.label} aria-label={primaryAction.label}>
            <PlusIcon className={styles.primaryActionIcon} />
          </Link>
        )}
        <div className={styles.navItems}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isNavItemActive(pathname, item.href) ? styles.navItemActive : ''}`}
              aria-current={isNavItemActive(pathname, item.href) ? 'page' : undefined}
            >
              <item.Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
        <Link href="/" className={styles.exitLink} title="Đổi tài khoản" aria-label="Đổi tài khoản">
          <SettingsGearIcon className={styles.exitIcon} />
        </Link>
      </nav>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
