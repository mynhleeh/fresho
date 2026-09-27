'use client';

import { Button } from './components/Button';
import styles from './RoleSelectClient.module.css';

export default function RoleSelectClient({ users }: { users: { id: string; name: string; role: string }[] }) {
  const roleToPath: Record<string, string> = {
    farmer: '/farmer/batches',
    buyer: '/buyer/marketplace',
    admin: '/admin/orders',
    logistics: '/logistics/deliveries',
  };

  async function select(userId: string, role: string) {
    await fetch('/api/auth/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    // eslint-disable-next-line react-hooks/immutability -- idiomatic full-page redirect after login, not a component-state mutation
    window.location.href = roleToPath[role] ?? '/';
  }

  return (
    <ul className={styles.list}>
      {users.map((u) => (
        <li key={u.id} className={styles.row}>
          <span className={styles.identity}>
            <span className={styles.name}>{u.name}</span>
            <span className={styles.role}>{u.role}</span>
          </span>
          <Button type="button" onClick={() => select(u.id, u.role)}>
            Đăng nhập
          </Button>
        </li>
      ))}
    </ul>
  );
}
