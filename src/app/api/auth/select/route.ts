import { prisma } from '@/lib/db';
import { setSessionCookie } from '@/lib/session';
import { ApiError, errorResponse } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError('user_not_found', 'No such user', 404);

    return Response.json(
      { id: user.id, name: user.name, role: user.role },
      { headers: { 'Set-Cookie': setSessionCookie(user.id) } },
    );
  } catch (err) {
    return errorResponse(err);
  }
}
