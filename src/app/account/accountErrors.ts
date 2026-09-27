const ACCOUNT_ERROR_MESSAGES: Record<string, string> = {
  invalid_input: 'Vui lòng kiểm tra lại thông tin đã nhập',
  phone_already_registered: 'Số điện thoại này đã được đăng ký cho tài khoản khác',
  invalid_credentials: 'Mật khẩu hiện tại không đúng',
  unauthorized: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
};

export async function readAccountErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return ACCOUNT_ERROR_MESSAGES[body.code] ?? 'Đã xảy ra lỗi, vui lòng thử lại';
}
