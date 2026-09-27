import { prisma } from '@/lib/db';
import { Card } from './components/Card';
import RoleSelectClient from './RoleSelectClient';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const users = await prisma.user.findMany({ orderBy: { role: 'asc' } });

  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <span className={styles.logo}>FRESH O!</span>
        <span className={styles.tagline}>Công nghệ kết nối - Nguồn tươi chủ động.</span>
      </div>
      <Card className={styles.panel}>
        <p className={styles.panelTitle}>Chọn tài khoản demo để đăng nhập</p>
        <RoleSelectClient users={users.map((u) => ({ id: u.id, name: u.name, role: u.role }))} />
      </Card>
    </main>
  );
}
