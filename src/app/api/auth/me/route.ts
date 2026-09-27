import { getCurrentUser } from '@/lib/session';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return Response.json(null, { status: 401 });
  return Response.json(user);
}
