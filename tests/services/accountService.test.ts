import bcrypt from 'bcryptjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { changeAccountPassword, updateAccountProfile } from '@/lib/services/accountService';
import { cleanupDb } from '../helpers/cleanup';

async function seedUser(overrides: { phone?: string; password?: string } = {}) {
  const password = overrides.password ?? 'oldpass1';
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: 'A', phone: overrides.phone ?? '111', address: 'X', role: 'farmer', passwordHash },
  });
  return { user, password };
}

describe('changeAccountPassword', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('updates the password hash when the current password is correct', async () => {
    const { user } = await seedUser();

    await changeAccountPassword(user.id, { currentPassword: 'oldpass1', newPassword: 'newpass1' });

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(await bcrypt.compare('newpass1', updated!.passwordHash)).toBe(true);
    expect(await bcrypt.compare('oldpass1', updated!.passwordHash)).toBe(false);
  });

  it('rejects the change when the current password is wrong', async () => {
    const { user } = await seedUser();

    await expect(
      changeAccountPassword(user.id, { currentPassword: 'wrongpass', newPassword: 'newpass1' }),
    ).rejects.toThrow('current password is incorrect');

    const unchanged = await prisma.user.findUnique({ where: { id: user.id } });
    expect(await bcrypt.compare('oldpass1', unchanged!.passwordHash)).toBe(true);
  });

  it('rejects a new password shorter than the minimum length', async () => {
    const { user } = await seedUser();

    await expect(
      changeAccountPassword(user.id, { currentPassword: 'oldpass1', newPassword: '123' }),
    ).rejects.toThrow('password must be at least');
  });
});

describe('updateAccountProfile', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('updates only the calling user\'s own record', async () => {
    const { user: a } = await seedUser({ phone: '111' });
    const { user: b } = await seedUser({ phone: '222' });

    await updateAccountProfile(a.id, { name: 'A2', phone: '333' });

    const updatedA = await prisma.user.findUnique({ where: { id: a.id } });
    const untouchedB = await prisma.user.findUnique({ where: { id: b.id } });
    expect(updatedA?.name).toBe('A2');
    expect(updatedA?.phone).toBe('333');
    expect(untouchedB?.phone).toBe('222');
  });

  it('rejects reusing a phone number already registered to another account', async () => {
    const { user: a } = await seedUser({ phone: '111' });
    await seedUser({ phone: '222' });

    await expect(updateAccountProfile(a.id, { name: 'A', phone: '222' })).rejects.toThrow(
      'phone_already_registered',
    );
  });
});
