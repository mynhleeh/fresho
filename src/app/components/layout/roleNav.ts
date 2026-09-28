export type AppRole = 'farmer' | 'buyer' | 'admin' | 'logistics';

export type RoleNavLink = { href: string; label: string };

export const ROLE_NAV_LINKS: Record<AppRole, RoleNavLink[]> = {
  farmer: [
    { href: '/farmer/batches', label: 'Mùa vụ' },
    { href: '/farmer/orders', label: 'Đơn hàng' },
  ],
  buyer: [
    { href: '/buyer/marketplace', label: 'Tìm nông sản' },
    { href: '/buyer/orders', label: 'Đơn hàng' },
  ],
  admin: [
    { href: '/admin/orders', label: 'Đơn hàng' },
    { href: '/admin/disputes', label: 'Khiếu nại' },
  ],
  logistics: [{ href: '/logistics/deliveries', label: 'Vận chuyển' }],
};
