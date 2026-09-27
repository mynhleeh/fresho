'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/Button';
import { useAuth } from '../auth/AuthContext';
import styles from './page.module.css';

export function SessionSection() {
  const { logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logoutAndLeave() {
    setLoggingOut(true);
    await logout();
    router.replace('/login');
  }

  return (
    <section className={`${styles.card} ${styles.sessionCard}`} aria-labelledby="session-title">
      <div className={styles.sessionText}>
        <h2 id="session-title" className={styles.cardTitle}>Đăng xuất</h2>
        <p className={styles.cardDescription}>Thoát khỏi tài khoản trên thiết bị này. Bạn cần đăng nhập lại để tiếp tục sử dụng.</p>
      </div>
      <Button type="button" variant="danger" className={styles.sessionButton} disabled={loggingOut} onClick={logoutAndLeave}>
        {loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </Button>
    </section>
  );
}
