import { calculateDepositAmount, DEPOSIT_PERCENT } from '@/lib/order/depositAmount';

export type ChatbotAudience = 'general' | 'farmer' | 'buyer' | 'both';

export type ChatbotFaqEntry = {
  id: string;
  audience: ChatbotAudience;
  question: string;
  answer: string;
  keywords: string[];
};

const EXAMPLE_GOODS_AMOUNT = 800 * 12_000;
const EXAMPLE_DEPOSIT = calculateDepositAmount(EXAMPLE_GOODS_AMOUNT);
const EXAMPLE_RECEIVED_GOODS_AMOUNT = 780 * 12_000;
const EXAMPLE_SHIPPING_FEE = 450_000;
const EXAMPLE_FINAL_PAYMENT = EXAMPLE_RECEIVED_GOODS_AMOUNT + EXAMPLE_SHIPPING_FEE - EXAMPLE_DEPOSIT;

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export const chatbotFaqEntries: ChatbotFaqEntry[] = [
  {
    id: 'platform-difference',
    audience: 'general',
    question: 'FRESH O! khác gì so với sàn thương mại điện tử hay các nhóm mua bán nông sản trên mạng xã hội?',
    answer:
      'Sàn thương mại điện tử và mạng xã hội chủ yếu giao dịch nông sản đã thu hoạch, đóng gói sẵn. FRESH O! vận hành theo mô hình "đặt trước thu hoạch": nông dân đăng nguồn cung dự kiến trước 7–14 ngày, người mua sỉ (nhà hàng, quán ăn, bếp ăn, cửa hàng thực phẩm sạch) đặt trước một phần hoặc toàn bộ sản lượng. Khác với việc chỉ kết nối người mua và người bán, mỗi giao dịch trên FRESH O! được bảo đảm bằng xác nhận đơn, đặt cọc, đối soát theo số lượng thực nhận và đánh giá uy tín hai chiều.',
    keywords: ['khác biệt', 'khác gì', 'sàn', 'shopee', 'facebook', 'mạng xã hội', 'đặt trước thu hoạch', 'giới thiệu'],
  },
  {
    id: 'harvest-batch-posting',
    audience: 'farmer',
    question: 'Nông dân cần cung cấp những thông tin gì khi đăng một lô mùa vụ?',
    answer:
      'Khi chọn "Đăng mùa vụ", nông dân nhập: tên và phân loại nông sản, sản lượng dự kiến, giá dự kiến theo kg, ngày thu hoạch, địa điểm vườn, hình ảnh thực tế, quy cách đóng gói – bảo quản và số lượng đặt trước tối thiểu. Ví dụ: hộ Minh Phát (Châu Thành, Tiền Giang) đăng 1.200 kg dưa leo loại 1, giá 12.000 đ/kg, thu hoạch ngày 30/08/2026. Sau khi xem trước và đăng, lô hàng được công khai ở trạng thái "Đang mở đặt trước".',
    keywords: ['đăng mùa vụ', 'đăng lô', 'đăng bán', 'thông tin lô', 'sản lượng', 'ngày thu hoạch', 'nông dân đăng'],
  },
  {
    id: 'ai-price-suggestion',
    audience: 'farmer',
    question: 'AI gợi ý giá có quyết định giá bán thay cho nông dân không?',
    answer:
      'Không. AI chỉ đóng vai trò tư vấn: phân tích dữ liệu giao dịch và dữ liệu tham khảo để đề xuất khoảng giá, cách viết mô tả và quy cách đóng gói phù hợp. Nông dân luôn là người quyết định giá bán và nội dung cuối cùng. AI cũng không bao giờ tự thay đổi trạng thái của đơn hàng.',
    keywords: ['ai', 'gợi ý giá', 'đề xuất giá', 'trí tuệ nhân tạo', 'định giá', 'giá bán'],
  },
  {
    id: 'batch-search',
    audience: 'buyer',
    question: 'Người mua tìm kiếm và lựa chọn lô hàng phù hợp như thế nào?',
    answer:
      'Tại "Tìm nông sản", người mua lọc theo loại hàng, sản lượng, khoảng giá, ngày nhận, vị trí và khoảng cách, rồi sắp xếp theo ngày thu hoạch, mức giá, khoảng cách hoặc mức độ uy tín của người bán. Trang chi tiết lô hiển thị hình ảnh, sản lượng còn lại, giá, địa điểm, quy cách đóng gói và lịch sử đánh giá của nông dân. Người mua có thể đặt trước một phần hoặc toàn bộ sản lượng còn lại của lô.',
    keywords: ['tìm kiếm', 'tìm nông sản', 'lọc', 'bộ lọc', 'chọn lô', 'khoảng cách', 'người mua tìm'],
  },
  {
    id: 'confirm-before-deposit',
    audience: 'both',
    question: 'Quy trình từ lúc đặt trước đến khi đặt cọc diễn ra như thế nào?',
    answer:
      'Người mua nhập số lượng, chọn phương thức nhận hàng và gửi đơn đặt trước; đơn chuyển sang "Chờ nông dân xác nhận". Nông dân có ba lựa chọn: "Xác nhận" nếu đáp ứng được, "Trao đổi" nếu cần thống nhất thêm về đóng gói hoặc thời gian nhận, hoặc "Từ chối" nếu điều kiện thực tế không phù hợp. Chỉ sau khi nông dân xác nhận, người mua mới thanh toán tiền cọc; đơn chuyển sang "Đã đặt cọc" rồi "Chờ thu hoạch". Nguyên tắc "xác nhận trước – đặt cọc sau" giúp tiền của người mua không bị giữ cho một đơn chưa chắc chắn.',
    keywords: ['quy trình', 'đặt trước', 'xác nhận', 'trao đổi', 'từ chối', 'chờ xác nhận', 'các bước'],
  },
  {
    id: 'deposit-amount',
    audience: 'buyer',
    question: 'Mức đặt cọc là bao nhiêu và tiền cọc được quản lý ra sao?',
    answer:
      `Tiền cọc bằng ${DEPOSIT_PERCENT}% tiền hàng. Ví dụ cửa hàng An Tâm đặt 800 kg dưa leo × 12.000 đ = ${formatVnd(EXAMPLE_GOODS_AMOUNT)}, tiền cọc là ${formatVnd(EXAMPLE_DEPOSIT)}. Khoản cọc được trừ vào lần đối soát cuối cùng. Mọi thay đổi về tiền cọc và thanh toán đều được ghi thành bút toán trong sổ nhật ký chỉ-thêm, không bao giờ bị sửa đè; phần cọc dư (nếu có) được hoàn lại qua bút toán hoàn cọc riêng.`,
    keywords: ['đặt cọc', 'tiền cọc', 'cọc bao nhiêu', 'phần trăm', 'hoàn cọc', 'thanh toán trước'],
  },
  {
    id: 'shipping-fee',
    audience: 'buyer',
    question: 'Cước vận chuyển được tính và thanh toán như thế nào?',
    answer:
      'Cước vận chuyển luôn được báo riêng, tách khỏi giá nông sản, và thông thường do người mua thanh toán. Người mua chọn "Tự đến lấy" (không phát sinh cước) hoặc "Đặt vận chuyển". Cước dự kiến được tính theo khoảng cách, khối lượng, thể tích, loại xe, thời gian lấy hàng và yêu cầu bảo quản, và được hiển thị trước khi người mua xác nhận. Hàng dễ hư hỏng được ưu tiên xe lạnh hoặc xe thông gió; các đơn cùng tuyến có thể được ghép để giảm chi phí mỗi đơn.',
    keywords: ['cước', 'phí vận chuyển', 'ship', 'giao hàng', 'vận chuyển', 'tự đến lấy', 'xe lạnh'],
  },
  {
    id: 'harvest-change',
    audience: 'farmer',
    question: 'Nếu sản lượng thực tế hoặc ngày thu hoạch thay đổi thì xử lý thế nào?',
    answer:
      'Trong giai đoạn "Chờ thu hoạch", nông dân cập nhật tiến độ bằng các lựa chọn "Đúng tiến độ", "Điều chỉnh sản lượng" hoặc "Dời ngày thu hoạch". Mọi thay đổi đều được thông báo đến người mua và lưu lại trong lịch sử đơn để làm căn cứ khi phát sinh vấn đề. Khi giao nhận, tiền hàng được đối soát theo số lượng thực nhận, không theo số lượng đặt ban đầu. Việc thay đổi thường xuyên sẽ phản ánh vào đánh giá uy tín của nông dân sau giao dịch.',
    keywords: ['thay đổi sản lượng', 'dời ngày', 'thiếu hàng', 'điều chỉnh', 'chậm thu hoạch', 'tiến độ'],
  },
  {
    id: 'settlement',
    audience: 'both',
    question: 'Đối soát cuối cùng được tính như thế nào?',
    answer:
      `Thanh toán cuối = (số lượng thực nhận × giá đã thỏa thuận) + cước vận chuyển − tiền cọc đã trả. Người mua đề xuất số lượng thực nhận, và đề xuất chỉ có hiệu lực khi nông dân chấp nhận. Ví dụ: thực nhận 780 kg × 12.000 đ = ${formatVnd(EXAMPLE_RECEIVED_GOODS_AMOUNT)}, cộng cước dự kiến ${formatVnd(EXAMPLE_SHIPPING_FEE)}, trừ cọc ${formatVnd(EXAMPLE_DEPOSIT)}, người mua thanh toán ${formatVnd(EXAMPLE_FINAL_PAYMENT)}. Sau đó đơn chuyển sang "Hoàn tất" và hai bên đánh giá lẫn nhau để tích lũy điểm uy tín.`,
    keywords: ['đối soát', 'thanh toán cuối', 'phần còn lại', 'số lượng thực nhận', 'hoàn tất', 'quyết toán'],
  },
  {
    id: 'order-cancellation',
    audience: 'both',
    question: 'Có thể hủy đơn đã đặt cọc không, và tiền cọc được xử lý ra sao?',
    answer:
      'Trước khi đặt cọc, người mua có thể hủy đơn và nông dân có thể từ chối đơn. Sau khi đã đặt cọc, không bên nào được hủy đơn phương: một bên gửi đề xuất hủy kèm số tiền hoàn cọc, và đơn chỉ chuyển sang "Đã hủy" khi bên còn lại chấp nhận. Khoản hoàn cọc được ghi vào sổ nhật ký giao dịch. Nếu đơn chuyển sang trạng thái khác trong lúc chờ, đề xuất hủy tự động hết hiệu lực.',
    keywords: ['hủy đơn', 'huỷ', 'hủy cọc', 'hoàn tiền', 'không mua nữa', 'hủy đặt trước'],
  },
];
