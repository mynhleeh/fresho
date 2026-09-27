import { prisma } from '@/lib/db';
import RoleSelectClient from './RoleSelectClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const users = await prisma.user.findMany({ orderBy: { role: 'asc' } });

  return (
    <main style={{ padding: 24 }}>
      <h1>FRESH O!</h1>
      <p>Chon tai khoan demo de dang nhap:</p>
      <RoleSelectClient users={users.map((u) => ({ id: u.id, name: u.name, role: u.role }))} />
    </main>
  );
}
