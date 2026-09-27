'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import styles from '../admin.module.css';

type Dispute = { id: string; reason: string; status: string; preOrder: { batch: { cropName: string } } };

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  async function load() {
    const res = await fetch('/api/disputes');
    setDisputes(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function resolve(id: string) {
    const resolutionNote = prompt('Ghi chú xử lý?') ?? '';
    await fetch(`/api/disputes/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionNote }),
    });
    load();
  }

  return (
    <AppShell role="admin">
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Khiếu nại</h1>
          <p className={styles.subheading}>Xử lý tranh chấp giữa nông dân và người mua.</p>
        </div>
        <div className={styles.list}>
          {disputes.length === 0 && <Card className={styles.empty}>Không có khiếu nại nào.</Card>}
          {disputes.map((d) => (
            <Card key={d.id} className={styles.row}>
              <div>
                <div className={styles.rowTitle}>{d.preOrder.batch.cropName}</div>
                <div className={styles.rowMeta}>{d.reason}</div>
              </div>
              <StatusBadge label={d.status === 'open' ? 'Đang mở' : 'Đã xử lý'} tone={d.status === 'open' ? 'warning' : 'success'} />
              {d.status === 'open' && <Button onClick={() => resolve(d.id)}>Xử lý</Button>}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
