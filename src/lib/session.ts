import { prisma } from '@/lib/db';

const COOKIE_NAME = 'fresho_session';

export function setSessionCookie(userId: string): string {
  return `${COOKIE_NAME}=${userId}; Path=/; HttpOnly; SameSite=Lax`;
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

export async function getCurrentUser(request: Request) {
  const userId = parseCookie(request.headers.get('cookie'), COOKIE_NAME);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return { id: user.id, role: user.role };
}
