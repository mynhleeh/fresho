const MESSAGE_BY_CODE: Record<string, string> = {
  unauthorized: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  forbidden: 'Tài khoản của bạn không có quyền thực hiện thao tác này.',
  invalid_credentials: 'Số điện thoại hoặc mật khẩu chưa đúng. Vui lòng kiểm tra và thử lại.',
  phone_already_registered: 'Số điện thoại này đã được đăng ký. Hãy đăng nhập hoặc dùng số khác.',
  invalid_input: 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô đã nhập.',
  invalid_state: 'Thao tác này không còn phù hợp với trạng thái hiện tại. Hãy tải lại trang rồi thử lại.',
  invalid_transition: 'Đơn đặt trước đã đổi trạng thái. Hãy tải lại trang để xem cập nhật mới nhất.',
  invalid_status: 'Trạng thái giao hàng chưa hợp lệ. Vui lòng chọn lại.',
  batch_closed: 'Lô hàng này đã đóng đặt trước.',
  batch_not_found: 'Không tìm thấy lô hàng. Lô hàng có thể đã bị gỡ.',
  pre_order_not_found: 'Không tìm thấy đơn đặt trước.',
  delivery_not_found: 'Không tìm thấy đơn giao hàng.',
  dispute_not_found: 'Không tìm thấy khiếu nại.',
  photo_not_found: 'Không tìm thấy ảnh. Hãy tải lại trang.',
  not_found: 'Không tìm thấy dữ liệu yêu cầu.',
  insufficient_quantity: 'Lô hàng không còn đủ số lượng. Vui lòng giảm số lượng đặt.',
  below_min_order_quantity: 'Số lượng đặt thấp hơn mức tối thiểu của lô hàng.',
  too_many_photos: 'Lô hàng đã đạt số ảnh tối đa. Hãy xoá bớt ảnh trước khi thêm.',
  already_rated: 'Bạn đã đánh giá đơn này rồi.',
  conflict: 'Thao tác bị xung đột với một thao tác khác. Hãy thử lại sau ít giây.',
  internal_error: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.',
};

export const NETWORK_ERROR_MESSAGE = 'Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.';

const FALLBACK_MESSAGE = 'Có lỗi xảy ra. Vui lòng thử lại.';

export function describeApiError(code: unknown, serverMessage?: unknown): string {
  if (typeof code !== 'string') return FALLBACK_MESSAGE;
  if (MESSAGE_BY_CODE[code]) return MESSAGE_BY_CODE[code];
  return typeof serverMessage === 'string' && serverMessage.length > 0 ? serverMessage : FALLBACK_MESSAGE;
}

export async function readApiErrorMessage(res: Response | null): Promise<string> {
  if (!res) return NETWORK_ERROR_MESSAGE;
  const body = await res.json().catch(() => null);
  return describeApiError(body?.code, body?.message);
}
