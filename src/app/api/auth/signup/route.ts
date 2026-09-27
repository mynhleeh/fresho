import { signup } from '@/lib/services/authService';
import { setSessionCookie } from '@/lib/session';
import { errorResponse } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const { name, phone, address, role, password } = await request.json();
    const user = await signup({ name, phone, address, role, password });

    return Response.json(
      { id: user.id, name: user.name, role: user.role },
      { headers: { 'Set-Cookie': setSessionCookie(user.id) } },
    );
  } catch (err) {
    return errorResponse(err);
  }
}
