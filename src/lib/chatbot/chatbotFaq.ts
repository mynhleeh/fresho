import { calculateDepositAmount, DEPOSIT_PERCENT } from '@/lib/order/depositAmount';

export type ChatbotRole = 'farmer' | 'buyer';

export type ChatbotFaqEntry = {
  id: string;
  role: ChatbotRole;
  question: string;
  answer: string;
  keywords: string[];
};

export const chatbotAdvisoryDisclaimer =
  'Thông tin trên chỉ mang tính tham khảo dựa trên dữ liệu thị trường và dự báo tại thời điểm hỏi. Quyết định cuối cùng về giá, số lượng và thời điểm giao dịch luôn thuộc về bạn.';

const EXAMPLE_GOODS_AMOUNT = 800 * 12_000;
const EXAMPLE_DEPOSIT = calculateDepositAmount(EXAMPLE_GOODS_AMOUNT);

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export const chatbotFaqEntries: ChatbotFaqEntry[] = [
  {
    id: 'farmer-posting-timing',
    role: 'farmer',
    question: 'Tôi có 1.200 kg dưa leo dự kiến thu hoạch ngày 30/08. Nên đăng lô lên FRESH O! vào lúc nào?',
    answer:
      'Nên đăng ngay trong khoảng 18–20/08, tức 10–12 ngày trước thu hoạch. Với rau quả ngắn ngày như dưa leo, người mua sỉ thường chốt kế hoạch nhập hàng trước 7–10 ngày, nên đăng sớm giúp lô hiện ra đúng lúc họ đang tìm nguồn. Đăng muộn hơn 7 ngày trước thu hoạch sẽ làm giảm đáng kể khả năng bán hết sản lượng qua đặt trước. Mẹo: đăng kèm ít nhất 3 ảnh thực tế của giàn dưa và đặt số lượng đặt trước tối thiểu khoảng 100 kg để thu hút cả quán ăn nhỏ lẫn nhà hàng.',
    keywords: ['khi nào đăng', 'đăng lúc nào', 'thời điểm đăng', 'đăng sớm', 'bao lâu trước thu hoạch'],
  },
  {
    id: 'farmer-price-setting',
    role: 'farmer',
    question: 'Tôi nên đặt giá dưa leo loại 1 bao nhiêu để vừa có lời vừa dễ bán?',
    answer:
      'Khoảng giá tham khảo cho dưa leo loại 1 khu vực Tiền Giang cuối tháng 8 là 11.500 – 13.000 đ/kg. Mức 12.000 đ/kg anh/chị dự kiến nằm giữa khoảng này, đủ cạnh tranh để chốt đơn nhanh. Có thể định giá ở mức cao của khoảng (12.500 – 13.000 đ/kg) nếu lô có chứng nhận VietGAP, được phân loại đồng đều và đóng gói sẵn theo thùng. Nếu còn dưới 5 ngày trước thu hoạch mà lô chưa được đặt quá 50%, nên cân nhắc giảm 500 đ/kg để tránh tồn hàng.',
    keywords: ['giá bao nhiêu', 'đặt giá', 'định giá', 'giá hợp lý', 'gợi ý giá', 'bán giá'],
  },
  {
    id: 'farmer-weather-harvest',
    role: 'farmer',
    question: 'Tuần tới thời tiết có ổn để thu hoạch không? Có nên thu sớm hơn dự kiến?',
    answer:
      'Dự báo tham khảo cho Châu Thành, Tiền Giang: 27–29/08 có mưa rào vào chiều tối, độ ẩm cao; 30–31/08 trời ít mây, thuận lợi cho thu hoạch. Mưa kéo dài khiến dưa leo lớn nhanh, dễ quá lứa và dập úng khi vận chuyển. Khuyến nghị: giữ ngày thu hoạch 30/08, thu vào sáng sớm khi trời khô, để ráo trước khi đóng thùng. Nếu mưa kéo dài sang 30/08, hãy dùng "Dời ngày thu hoạch" hoặc "Điều chỉnh sản lượng" trên đơn để người mua được báo trước, thay vì giao trễ mà không thông báo.',
    keywords: ['thời tiết', 'mưa', 'nắng', 'dự báo', 'thu sớm', 'thu hoạch được không'],
  },
  {
    id: 'farmer-demand-forecast',
    role: 'farmer',
    question: 'Vụ tới tôi nên trồng loại rau quả nào để dễ có đầu ra?',
    answer:
      'Theo xu hướng nhu cầu của người mua sỉ trên nền tảng, từ tháng 9 đến tháng 11 nhu cầu tăng rõ ở nhóm bếp ăn tập thể (trường học vào năm học mới) và nhà hàng: rau ăn lá (cải ngọt, cải xanh), dưa leo, cà chua và bí xanh. Trước Tết Nguyên đán 6–8 tuần, nhu cầu củ quả (cà rốt, củ cải, su hào) tăng mạnh. Gợi ý: giữ dưa leo làm cây chủ lực vì đã có người mua quen, và trồng xen 20–30% diện tích rau ăn lá ngắn ngày để quay vòng nhanh. Nên tham khảo thêm cán bộ khuyến nông địa phương về giống và thời vụ phù hợp.',
    keywords: ['trồng gì', 'vụ sau', 'vụ tới', 'nhu cầu', 'dự báo nhu cầu', 'đầu ra'],
  },
  {
    id: 'farmer-accept-order',
    role: 'farmer',
    question: 'Có người mua đặt 800 kg trong lô 1.200 kg của tôi. Tôi có nên xác nhận đơn này không?',
    answer:
      'Nên xác nhận nếu anh/chị chắc chắn giao được đủ 800 kg vào ngày hẹn. Người mua này có điểm uy tín 4,7/5 sau 22 đơn hoàn tất, thanh toán đúng hạn 100%, và đơn chiếm 67% sản lượng giúp anh/chị chủ động nhân công và bao bì. Hãy giữ lại khoảng 10% sản lượng làm dự phòng hao hụt, nghĩa là chỉ nên mở bán tiếp khoảng 280 kg cho người mua khác. Nếu còn băn khoăn về quy cách đóng gói hoặc giờ nhận hàng, hãy chọn "Trao đổi" trước khi xác nhận.',
    keywords: ['có nên nhận', 'xác nhận đơn', 'nhận đơn', 'người mua này', 'đơn lớn', 'từ chối'],
  },
  {
    id: 'buyer-should-buy',
    role: 'buyer',
    question: 'Tôi cần 800 kg dưa leo cho ngày 30–31/08. Có nên đặt trước lô của hộ Minh Phát không?',
    answer:
      `Nên đặt. Lô dưa leo loại 1 của hộ Minh Phát (Châu Thành, Tiền Giang) đáp ứng đủ nhu cầu: còn 1.200 kg, thu hoạch đúng ngày 30/08, giá 12.000 đ/kg nằm trong khoảng giá thị trường 11.500 – 13.000 đ/kg. Nông dân có điểm uy tín 4,8/5 sau 36 đơn, tỷ lệ giao đúng hẹn 94%. Tổng tiền hàng dự kiến ${formatVnd(EXAMPLE_GOODS_AMOUNT)}, tiền cọc ${DEPOSIT_PERCENT}% là ${formatVnd(EXAMPLE_DEPOSIT)} và chỉ thanh toán sau khi nông dân xác nhận. Lưu ý: khu vực có mưa rào 27–29/08, nên chuẩn bị phương án cho trường hợp sản lượng giảm 5–10%.`,
    keywords: ['có nên mua', 'nên đặt', 'mua được không', 'lô này', 'đặt trước lô'],
  },
  {
    id: 'buyer-best-price-timing',
    role: 'buyer',
    question: 'Thời điểm nào đặt mua dưa leo thì được giá tốt nhất?',
    answer:
      'Giá dưa leo thường thấp nhất vào giữa vụ chính khi nhiều vườn thu hoạch cùng lúc; ở Đồng bằng sông Cửu Long thường rơi vào tháng 7–9 và tháng 12–2. Giá có xu hướng tăng 15–25% vào mùa mưa bão (tháng 10–11) và 2–3 tuần trước Tết. Để có giá tốt: đặt trước 7–10 ngày để chốt giá trước khi thị trường biến động, ưu tiên lô có sản lượng lớn vì nông dân dễ giữ giá hơn, và với nhu cầu nhập đều hằng tuần, nên chia thành nhiều đơn đặt trước từ 2–3 vườn khác nhau để vừa ổn định giá vừa giảm rủi ro thiếu hàng.',
    keywords: ['giá tốt', 'khi nào rẻ', 'thời điểm mua', 'giá thấp nhất', 'mua lúc nào', 'biến động giá'],
  },
  {
    id: 'buyer-weather-risk',
    role: 'buyer',
    question: 'Thời tiết xấu có ảnh hưởng đến đơn tôi đã đặt cọc không?',
    answer:
      'Có thể ảnh hưởng. Mưa kéo dài trước ngày thu hoạch có thể làm giảm sản lượng hoặc khiến nông dân phải dời ngày giao. Khi đó nông dân sẽ cập nhật trên đơn và anh/chị nhận thông báo ngay. Tiền hàng được đối soát theo số lượng thực nhận, nên anh/chị không phải trả cho phần hàng bị thiếu. Nếu đơn phục vụ nhu cầu cố định (ví dụ suất ăn hằng ngày), nên dự trù thêm 10% từ một lô thứ hai gần đó hoặc chọn lô có ngày thu hoạch lệch 1–2 ngày để phòng rủi ro.',
    keywords: ['thời tiết xấu', 'mưa bão', 'ảnh hưởng đơn', 'thiếu hàng', 'giao trễ', 'rủi ro'],
  },
  {
    id: 'buyer-shipping-choice',
    role: 'buyer',
    question: 'Với 800 kg dưa leo, tôi nên tự đến lấy hay đặt vận chuyển?',
    answer:
      'Nếu cửa hàng cách vườn dưới 30 km và có sẵn xe, tự đến lấy là phương án rẻ nhất vì không phát sinh cước. Với quãng đường xa hơn, ví dụ Châu Thành → TP.HCM khoảng 70 km, nên đặt vận chuyển bằng xe tải 1–1,25 tấn có thùng thông gió, cước tham khảo 400.000 – 550.000 đ, tương đương khoảng 500 – 700 đ/kg. Nên chọn khung lấy hàng buổi sáng sớm để dưa leo không bị nóng, và bật tùy chọn ghép đơn cùng tuyến nếu có để giảm cước. Cước luôn được báo riêng và hiển thị trước khi anh/chị xác nhận.',
    keywords: ['vận chuyển', 'tự lấy', 'ship', 'cước', 'xe tải', 'giao hàng', 'loại xe'],
  },
  {
    id: 'buyer-farmer-trust',
    role: 'buyer',
    question: 'Làm sao biết nông dân và lô hàng này có đáng tin cậy không?',
    answer:
      'Hãy xem 4 yếu tố: (1) điểm uy tín và số đơn đã hoàn tất, nên ưu tiên từ 4,5/5 với ít nhất 10 đơn; (2) tỷ lệ giao đúng hẹn và số lần dời ngày thu hoạch gần đây; (3) ảnh thực tế của vườn và chứng nhận VietGAP/GlobalGAP nếu có; (4) nhận xét của người mua trước về chất lượng và quy cách đóng gói. Với nông dân mới chưa có lịch sử, nên đặt một đơn nhỏ trước để kiểm chứng. Phân tích hình ảnh chỉ hỗ trợ đánh giá sơ bộ bề ngoài; anh/chị vẫn nên kiểm tra hàng khi nhận và dùng "Báo vấn đề" nếu hàng không đúng mô tả.',
    keywords: ['uy tín', 'tin cậy', 'đáng tin', 'đánh giá', 'chất lượng', 'nông dân này', 'lừa đảo'],
  },
];
