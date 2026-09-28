'use client';
import { use } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { PageFrame } from '../../../components/layout/PageFrame';
import { OrderDetailScreen } from '../detail/OrderDetailScreen';

export default function FarmerOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  return (
    <AppShell role="farmer">
      <PageFrame roomy>
        <OrderDetailScreen orderId={orderId} />
      </PageFrame>
    </AppShell>
  );
}
