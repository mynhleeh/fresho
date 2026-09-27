'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/AppShell';
import { Card } from '../../../components/Card';
import { HarvestBatchForm } from '../HarvestBatchForm';
import styles from './page.module.css';

export default function NewHarvestBatch() {
  const router = useRouter();

  return (
    <AppShell role="farmer">
      <div className={styles.page}>
        <h1 className={styles.heading}>Đăng mùa vụ mới</h1>
        <Card>
          <HarvestBatchForm mode="create" onSaved={() => router.push('/farmer/batches')} />
        </Card>
      </div>
    </AppShell>
  );
}
