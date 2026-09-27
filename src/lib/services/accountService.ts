import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

const MIN_PASSWORD_LENGTH = 6;
const BCRYPT_SALT_ROUNDS = 10;

export type AccountProfile = {
  id: string;
  name: string;
  phone: string;
  address: string;
  role: string;
  avatarUrl: string | null;
};

function toAccountProfile(user: {
  id: string;
  name: string;
  phone: string;
  address: string;
  role: string;
  avatarUrl: string | null;
}): AccountProfile {
  return { id: user.id, name: user.name, phone: user.phone, address: user.address, role: user.role, avatarUrl: user.avatarUrl };
}

export async function getAccount(userId: string): Promise<AccountProfile> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError('not_found', 'account not found', 404);
  return toAccountProfile(user);
}

export async function updateAccountProfile(
  userId: string,
  input: { name: string; phone: string },
): Promise<AccountProfile> {
  if (!input.name?.trim()) throw new ApiError('invalid_input', 'invalid_input: name is required', 400);
  if (!input.phone?.trim()) throw new ApiError('invalid_input', 'invalid_input: phone is required', 400);

  const existingWithPhone = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existingWithPhone && existingWithPhone.id !== userId) {
    throw new ApiError('phone_already_registered', 'phone_already_registered', 409);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name.trim(), phone: input.phone.trim() },
  });
  return toAccountProfile(user);
}

// TODO(business-confirm): password change is gated only by the current password (no OTP/email
// re-verification), consistent with the mock-auth scope in 01-coding-standards.rule.md §1.
export async function changeAccountPassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
): Promise<void> {
  if (!input.currentPassword) throw new ApiError('invalid_input', 'invalid_input: current password is required', 400);
  if (!input.newPassword || input.newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError('invalid_input', `invalid_input: password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError('not_found', 'account not found', 404);

  const currentPasswordMatches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!currentPasswordMatches) throw new ApiError('invalid_credentials', 'current password is incorrect', 401);

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function updateAccountAvatar(userId: string, avatarUrl: string): Promise<AccountProfile> {
  const user = await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
  return toAccountProfile(user);
}
