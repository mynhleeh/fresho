import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { errorResponse } from '@/lib/errors';

describe('errorResponse', () => {
  it('maps a Prisma write conflict to a 409 conflict with a Vietnamese retry message', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('Transaction failed due to a write conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });

    const response = errorResponse(conflict);

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.code).toBe('conflict');
    expect(body.message).toContain('thử lại');
  });

  it('maps a unique-constraint violation to a 409 conflict', async () => {
    const duplicate = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'test' });

    const response = errorResponse(duplicate);

    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe('conflict');
  });

  it('keeps unknown errors as an opaque 500 without leaking the message', async () => {
    const response = errorResponse(new Error('secret stack detail'));

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain('secret stack detail');
  });
});
