import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

type ActorRole = 'farmer' | 'buyer' | 'admin' | 'logistics';

// admin/logistics accounts are provisioned out-of-band (seed/ops), never via public self-signup,
// per 02-security-and-data.rule.md §5 role-based access control.
const SELF_SIGNUP_ROLES = ['farmer', 'buyer'] as const;

// TODO(business-confirm): "account confirmation on login" is implemented as demo password
// matching (bcrypt-hashed), not real OTP/email verification, per 01-coding-standards.rule.md §1 mock-auth scope.
const MIN_PASSWORD_LENGTH = 6;
const BCRYPT_SALT_ROUNDS = 10;

export type SignupInput = { name: string; phone: string; address: string; role: ActorRole; password: string };
export type LoginInput = { phone: string; password: string };

function assertValidSignupInput(input: SignupInput) {
  if (!input.name?.trim()) throw new ApiError('invalid_input', 'Cần nhập họ tên.', 400);
  if (!input.phone?.trim()) throw new ApiError('invalid_input', 'Cần nhập số điện thoại.', 400);
  if (!input.address?.trim()) throw new ApiError('invalid_input', 'Cần nhập địa chỉ.', 400);
  if (!SELF_SIGNUP_ROLES.includes(input.role as (typeof SELF_SIGNUP_ROLES)[number])) {
    throw new ApiError('invalid_input', 'Vai trò phải là nông dân hoặc người mua.', 400);
  }
  if (!input.password || input.password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError('invalid_input', `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`, 400);
  }
}

export async function signup(input: SignupInput) {
  assertValidSignupInput(input);

  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) throw new ApiError('phone_already_registered', 'Số điện thoại này đã được đăng ký.', 409);

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  return prisma.user.create({
    data: { name: input.name, phone: input.phone, address: input.address, role: input.role, passwordHash },
  });
}

export async function login(input: LoginInput) {
  if (!input.phone?.trim()) throw new ApiError('invalid_input', 'Cần nhập số điện thoại.', 400);
  if (!input.password) throw new ApiError('invalid_input', 'Cần nhập mật khẩu.', 400);

  const user = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (!user) throw new ApiError('invalid_credentials', 'Số điện thoại hoặc mật khẩu chưa đúng.', 401);

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) throw new ApiError('invalid_credentials', 'Số điện thoại hoặc mật khẩu chưa đúng.', 401);

  return user;
}
