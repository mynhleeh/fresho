import { Card } from '../components/ui/Card';
import AuthFormClient from './AuthFormClient';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <span className={styles.logo}>FRESH O!</span>
        <span className={styles.tagline}>Công nghệ kết nối - Nguồn tươi chủ động.</span>
      </div>
      <Card className={styles.panel}>
        <p className={styles.panelTitle}>Đăng nhập hoặc tạo tài khoản demo</p>
        <AuthFormClient />
      </Card>
    </main>
  );
}
