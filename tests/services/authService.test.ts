import { describe, it, expect, beforeEach } from 'vitest';
import { signup, login } from '@/lib/services/authService';
import { cleanupDb } from '../helpers/cleanup';

describe('signup', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('rejects signup with a phone number that is already registered', async () => {
    await signup({ name: 'Nguyen Van A', phone: '0900000001', address: 'Da Lat', role: 'farmer', password: 'secret123' });

    await expect(
      signup({ name: 'Nguyen Van B', phone: '0900000001', address: 'Ha Noi', role: 'buyer', password: 'secret123' }),
    ).rejects.toMatchObject({ code: 'phone_already_registered' });
  });

  it('stores the exact role chosen at signup and returns it on login', async () => {
    await signup({ name: 'Tran Thi B', phone: '0900000002', address: 'Ha Noi', role: 'buyer', password: 'secret123' });

    const user = await login({ phone: '0900000002', password: 'secret123' });

    expect(user.role).toBe('buyer');
  });

  it('rejects signup with a password shorter than the minimum length', async () => {
    await expect(
      signup({ name: 'Le Van C', phone: '0900000003', address: 'Hue', role: 'farmer', password: '123' }),
    ).rejects.toMatchObject({ code: 'invalid_input' });
  });

  it('rejects public self-signup with the admin role', async () => {
    await expect(
      signup({ name: 'Le Van F', phone: '0900000006', address: 'Hue', role: 'admin', password: 'secret123' }),
    ).rejects.toMatchObject({ code: 'invalid_input' });
  });

  it('rejects public self-signup with the logistics role', async () => {
    await expect(
      signup({ name: 'Le Van G', phone: '0900000007', address: 'Hue', role: 'logistics', password: 'secret123' }),
    ).rejects.toMatchObject({ code: 'invalid_input' });
  });
});

describe('login', () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it('rejects login with an incorrect password', async () => {
    await signup({ name: 'Pham Van D', phone: '0900000004', address: 'Da Nang', role: 'buyer', password: 'correct-password' });

    await expect(
      login({ phone: '0900000004', password: 'wrong-password' }),
    ).rejects.toMatchObject({ code: 'invalid_credentials' });
  });

  it('logs in successfully with the correct password', async () => {
    await signup({ name: 'Pham Van E', phone: '0900000005', address: 'Da Nang', role: 'farmer', password: 'correct-password' });

    const user = await login({ phone: '0900000005', password: 'correct-password' });

    expect(user.phone).toBe('0900000005');
  });
});
