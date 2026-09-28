import { calculateDepositAmount, DEPOSIT_PERCENT } from '@/lib/order/depositAmount';
import { MARKET_SNAPSHOT_DATE } from './marketPriceSnapshot';

export type ChatbotRole = 'farmer' | 'buyer';

export type ChatbotAnswerSection = {
  title: string;
  points: string[];
};

export type ChatbotAnswer = {
  verdict: string;
  summary: string;
  sections: ChatbotAnswerSection[];
  priceProductId?: string;
};

export type ChatbotFaqEntry = {
  id: string;
  role: ChatbotRole;
  question: string;
  keywords: string[];
  answer: ChatbotAnswer;
};

export const chatbotAdvisoryDisclaimer =
  `Nhận định dựa trên giá tham khảo ngày ${MARKET_SNAPSHOT_DATE} và dự báo tại thời điểm hỏi, không phải cam kết giá. Quyết định cuối cùng về giá, số lượng và thời điểm giao dịch luôn thuộc về bạn.`;

const BATCH_QUANTITY_KG = 1_200;
const ORDER_QUANTITY_KG = 800;
const PREVIOUS_PRICE = 12_000;
const SUGGESTED_PRICE = 12_500;
const SHIPPING_FEE_ESTIMATE = 500_000;
const WHOLESALE_LOW = 14_000;
const WHOLESALE_HIGH = 17_000;

const orderGoodsAmount = ORDER_QUANTITY_KG * SUGGESTED_PRICE;
const orderDeposit = calculateDepositAmount(orderGoodsAmount);
const landedCostPerKg = Math.round((orderGoodsAmount + SHIPPING_FEE_ESTIMATE) / ORDER_QUANTITY_KG);
const savingLow = (WHOLESALE_LOW - landedCostPerKg) * ORDER_QUANTITY_KG;
const savingHigh = (WHOLESALE_HIGH - landedCostPerKg) * ORDER_QUANTITY_KG;
const extraRevenue = (SUGGESTED_PRICE - PREVIOUS_PRICE) * BATCH_QUANTITY_KG;

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export const chatbotFaqEntries: ChatbotFaqEntry[] = [
  {
    id: 'farmer-posting-timing',
    role: 'farmer',
    question: 'Tôi có 1.200 kg dưa leo dự kiến thu hoạch ngày 10/10. Nên đăng lô lên FRESH O! vào lúc nào?',
    keywords: ['khi nao dang', 'dang luc nao', 'thoi diem dang', 'dang som', 'bao lau truoc', 'dang lo'],
    answer: {
      verdict: 'Nên đăng ngay trong tuần này (28/09 – 30/09).',
      summary:
        'Lô thu hoạch ngày 10/10 đang ở đúng "cửa sổ vàng" 10–12 ngày trước thu hoạch. Đây là lúc người mua sỉ chốt kế hoạch nhập hàng cho tuần 2 của tháng 10, nên lô đăng sớm sẽ xuất hiện đầu tiên khi họ tìm nguồn.',
      sections: [
        {
          title: 'Phân tích',
          points: [
            'Nhà hàng, bếp ăn tập thể thường lên kế hoạch nguyên liệu trước 7–10 ngày; đăng sau ngày 03/10 sẽ bỏ lỡ nhóm khách lập kế hoạch sớm, là nhóm đặt số lượng lớn nhất.',
            'Giá dưa leo tại vườn đang tăng khoảng 8% so với tuần trước do mưa kéo dài, nên người mua có xu hướng muốn chốt giá sớm. Đây là thời điểm thuận lợi cho bên bán.',
            'Đầu tháng 10 là cao điểm mùa mưa ở Đồng bằng sông Cửu Long, nguồn cung rau quả dễ biến động. Lô có ngày thu hoạch rõ ràng sẽ được ưu tiên hơn các nguồn "có hàng thì bán".',
          ],
        },
        {
          title: 'Khuyến nghị',
          points: [
            'Đăng kèm ít nhất 3–5 ảnh thực tế chụp trong 2 ngày gần nhất: toàn cảnh giàn dưa, cận cảnh trái và ảnh mẫu đóng thùng.',
            'Đặt số lượng đặt trước tối thiểu 100 kg để tiếp cận cả quán ăn nhỏ (nhập 50–100 kg) lẫn nhà hàng, bếp ăn (nhập 300–800 kg).',
            'Ghi rõ quy cách: dưa loại 1 dài 18–22 cm, không cong vẹo, đóng thùng nhựa 20 kg có lỗ thông gió.',
            'Giữ lại khoảng 10% sản lượng (khoảng 120 kg) chưa mở bán để dự phòng hao hụt do mưa.',
          ],
        },
        {
          title: 'Rủi ro cần theo dõi',
          points: [
            'Nếu mưa lớn làm dưa lớn nhanh, ngày thu hoạch thực tế có thể sớm hơn 1–2 ngày. Khi đó hãy cập nhật ngay bằng "Dời ngày thu hoạch" để người mua kịp điều chỉnh.',
          ],
        },
      ],
      priceProductId: 'cucumber',
    },
  },
  {
    id: 'farmer-price-setting',
    role: 'farmer',
    question: 'Giá dưa leo hiện tại thế nào? Tôi nên đặt giá bao nhiêu để vừa có lời vừa dễ bán?',
    keywords: ['gia', 'gia bao nhieu', 'bao nhieu', 'dat gia', 'dinh gia', 'gia hop ly', 'goi y gia', 'ban gia', 'hien tai', 'gia thi truong'],
    answer: {
      verdict: `Nên đặt ${formatVnd(SUGGESTED_PRICE)}/kg, cao hơn 500 đ so với mức 12.000 đ dự kiến ban đầu.`,
      summary:
        `Giá dưa leo loại 1 tại vườn khu vực Tiền Giang – Long An đang ở mức 10.500 – 13.000 đ/kg và có xu hướng tăng. Mức ${formatVnd(SUGGESTED_PRICE)}/kg nằm ở nửa trên của khoảng giá nhưng vẫn thấp hơn giá chợ đầu mối (${formatVnd(WHOLESALE_LOW)} – ${formatVnd(WHOLESALE_HIGH)}/kg), nên người mua vẫn thấy có lợi rõ ràng khi đặt trước.`,
      sections: [
        {
          title: 'Phân tích giá',
          points: [
            'Mưa kéo dài từ giữa tháng 9 khiến nhiều vườn bị úng, sản lượng toàn vùng giảm, đẩy giá tại vườn tăng khoảng 8% trong tuần qua.',
            'Chênh lệch giữa giá tại vườn và giá chợ đầu mối đang là 3.000 – 4.000 đ/kg. Người mua đặt trực tiếp trên FRESH O! vẫn tiết kiệm được đáng kể dù anh/chị tăng giá nhẹ.',
            'Dự báo giá có thể tăng tiếp 5–10% vào giữa tháng 10 nếu mưa bão tiếp diễn, sau đó giảm dần khi các vườn xuống giống sau mưa bắt đầu cho thu hoạch.',
          ],
        },
        {
          title: 'Khuyến nghị',
          points: [
            `Đặt ${formatVnd(SUGGESTED_PRICE)}/kg: với 1.200 kg, doanh thu dự kiến tăng thêm khoảng ${formatVnd(extraRevenue)} so với mức 12.000 đ/kg.`,
            'Nếu lô có chứng nhận VietGAP và được phân loại đồng đều, có thể định giá 13.000 – 13.500 đ/kg.',
            'Không nên đặt quá 13.500 đ/kg: khi đó giá cộng cước sẽ tiệm cận giá chợ đầu mối, người mua mất động lực đặt trước.',
          ],
        },
        {
          title: 'Kịch bản điều chỉnh',
          points: [
            'Nếu còn 5 ngày trước thu hoạch mà lô chưa được đặt quá 50%, nên giảm 500 đ/kg để tránh tồn hàng.',
            'Nếu lô được đặt hết trên 80% trong 3 ngày đầu, đó là tín hiệu có thể tăng giá 300 – 500 đ/kg cho các vụ tiếp theo.',
          ],
        },
      ],
      priceProductId: 'cucumber',
    },
  },
  {
    id: 'farmer-weather-harvest',
    role: 'farmer',
    question: 'Thời tiết mấy ngày tới có ổn để thu hoạch không? Có nên thu sớm hơn dự kiến?',
    keywords: ['thoi tiet', 'troi mua', 'mua lon', 'mua bao', 'con bao', 'nang', 'du bao', 'thu som', 'ap thap', 'thu hoach duoc khong'],
    answer: {
      verdict: 'Giữ ngày thu hoạch 10/10, nhưng chuẩn bị sẵn phương án thu sớm 1 ngày.',
      summary:
        'Dự báo tham khảo cho Châu Thành, Tiền Giang: đầu tháng 10 vẫn là cao điểm mùa mưa, mưa rào chủ yếu vào chiều tối. Khoảng 09 – 11/10 trời ít mưa hơn, là thời điểm thuận lợi để thu hoạch, nhưng cần theo dõi áp thấp trên Biển Đông trong tuần tới.',
      sections: [
        {
          title: 'Ảnh hưởng đến dưa leo',
          points: [
            'Độ ẩm cao và mưa liên tục khiến trái lớn nhanh, dễ quá lứa (vỏ vàng, ruột xốp), làm giảm tỷ lệ đạt loại 1.',
            'Thu hoạch khi trái còn ướt làm tăng nguy cơ dập úng trong 24 giờ vận chuyển, đặc biệt khi đóng thùng kín.',
            'Mưa lớn kéo dài có thể làm sản lượng thực tế giảm 5–15% so với dự kiến.',
          ],
        },
        {
          title: 'Khuyến nghị',
          points: [
            'Thu hoạch vào sáng sớm (5h – 8h) khi trời khô, để trái ráo ít nhất 1–2 giờ trong bóng râm trước khi đóng thùng.',
            'Nếu dự báo có mưa lớn ngày 10/10, hãy chủ động thu sớm ngày 09/10 và dùng "Dời ngày thu hoạch" trên đơn để người mua được thông báo trước ít nhất 48 giờ.',
            'Nếu sản lượng giảm, cập nhật "Điều chỉnh sản lượng" ngay khi ước tính được. Báo sớm luôn tốt hơn giao thiếu mà không thông báo.',
          ],
        },
        {
          title: 'Lưu ý',
          points: [
            'Theo dõi thêm bản tin của Đài Khí tượng Thủy văn khu vực Nam Bộ. Đây chỉ là dự báo tham khảo và có thể thay đổi trong vài ngày.',
          ],
        },
      ],
    },
  },
  {
    id: 'farmer-demand-forecast',
    role: 'farmer',
    question: 'Vụ tới tôi nên trồng loại rau quả nào để dễ có đầu ra và được giá?',
    keywords: ['trong gi', 'vu sau', 'vu toi', 'nhu cau', 'du bao nhu cau', 'dau ra', 'nen trong'],
    answer: {
      verdict: 'Giữ dưa leo làm cây chủ lực và trồng xen rau ăn lá ngắn ngày để kịp nhu cầu cuối năm.',
      summary:
        'Từ tháng 10 đến tháng 12, nhu cầu nhập rau quả của người mua sỉ tăng do bếp ăn trường học hoạt động ổn định và nhà hàng vào mùa tiệc cuối năm. Sau đó 6–8 tuần trước Tết Nguyên đán, nhu cầu củ quả tăng mạnh.',
      sections: [
        {
          title: 'Nhóm sản phẩm có nhu cầu tăng',
          points: [
            'Rau ăn lá (cải ngọt, cải xanh): giá tại vườn đang tăng khoảng 12%/tuần do mưa, và nguồn cung thường thiếu kéo dài đến giữa tháng 11. Chu kỳ 25–30 ngày giúp quay vòng vốn nhanh.',
            'Dưa leo, cà chua: nhu cầu ổn định quanh năm từ quán ăn và bếp ăn tập thể, giá tốt nhất vào mùa mưa.',
            'Củ quả (cà rốt, củ cải, su hào): nên xuống giống từ đầu tháng 11 để thu hoạch vào đợt cao điểm trước Tết.',
          ],
        },
        {
          title: 'Nhóm nên thận trọng',
          points: [
            'Bí xanh đang giảm giá khoảng 4%/tuần do nhiều vùng cùng thu hoạch; nếu trồng nên giảm diện tích hoặc dời lịch thu hoạch sang tháng 12.',
          ],
        },
        {
          title: 'Khuyến nghị cơ cấu',
          points: [
            'Giữ khoảng 60–70% diện tích cho dưa leo, là cây anh/chị đã có kinh nghiệm và có tệp người mua quen trên nền tảng.',
            'Dành 20–30% diện tích cho rau ăn lá ngắn ngày để tận dụng giá cao mùa mưa và tăng dòng tiền.',
            'Tham khảo thêm cán bộ khuyến nông địa phương về giống chịu mưa và lịch thời vụ phù hợp với chân đất của vườn.',
          ],
        },
      ],
      priceProductId: 'bok-choy',
    },
  },
  {
    id: 'farmer-accept-order',
    role: 'farmer',
    question: 'Có người mua đặt 800 kg trong lô 1.200 kg của tôi. Tôi có nên xác nhận đơn này không?',
    keywords: ['co nen nhan', 'xac nhan don', 'nhan don', 'nguoi mua nay', 'don lon', 'tu choi', 'nen xac nhan'],
    answer: {
      verdict: 'Nên xác nhận nếu anh/chị chắc chắn giao đủ 800 kg vào ngày hẹn.',
      summary:
        'Đơn này chiếm 67% sản lượng, đến từ người mua có lịch sử tốt, và được chốt ở mức giá đang thuận lợi cho bên bán. Xác nhận sớm giúp anh/chị chủ động nhân công, bao bì và phương tiện.',
      sections: [
        {
          title: 'Đánh giá người mua',
          points: [
            'Cửa hàng thực phẩm An Tâm có điểm uy tín 4,7/5 sau 22 đơn hoàn tất, thanh toán đúng hạn 100%, chưa có tranh chấp nào.',
            'Người mua đặt định kỳ 2 lần/tháng; nếu giao tốt, khả năng cao họ sẽ tiếp tục đặt các vụ sau.',
          ],
        },
        {
          title: 'Đánh giá rủi ro sản lượng',
          points: [
            'Do mưa, sản lượng thực tế có thể giảm 5–15%, tức còn khoảng 1.020 – 1.140 kg. Trong trường hợp xấu nhất vẫn đủ giao 800 kg.',
            'Vì vậy chỉ nên mở bán tiếp khoảng 280 kg cho người mua khác, giữ khoảng 120 kg làm dự phòng thay vì bán hết 400 kg còn lại.',
          ],
        },
        {
          title: 'Khuyến nghị',
          points: [
            `Sau khi anh/chị xác nhận, người mua mới thanh toán tiền cọc ${DEPOSIT_PERCENT}%, tương đương ${formatVnd(orderDeposit)}.`,
            'Nếu còn băn khoăn về giờ lấy hàng hoặc quy cách thùng, hãy chọn "Trao đổi" để thống nhất trước rồi mới xác nhận.',
            'Chỉ nên từ chối nếu đã có dấu hiệu mất mùa rõ rệt; từ chối sau khi đã hứa hẹn sẽ ảnh hưởng đến điểm uy tín.',
          ],
        },
      ],
    },
  },
  {
    id: 'buyer-should-buy',
    role: 'buyer',
    question: 'Tôi cần 800 kg dưa leo cho ngày 10–11/10. Có nên đặt trước lô của hộ Minh Phát không?',
    keywords: ['co nen mua', 'nen dat', 'mua duoc khong', 'lo nay', 'dat truoc lo', 'minh phat', 'nen mua'],
    answer: {
      verdict: 'Nên đặt ngay. Đây là lựa chọn tốt về giá, độ tin cậy và thời điểm.',
      summary:
        `Lô dưa leo loại 1 của hộ Minh Phát (Châu Thành, Tiền Giang) đáp ứng đủ 800 kg, thu hoạch đúng ngày 10/10, giá ${formatVnd(SUGGESTED_PRICE)}/kg. Tính cả cước, giá về đến kho khoảng ${formatVnd(landedCostPerKg)}/kg, thấp hơn giá chợ đầu mối hiện tại (${formatVnd(WHOLESALE_LOW)} – ${formatVnd(WHOLESALE_HIGH)}/kg).`,
      sections: [
        {
          title: 'Phân tích chi phí',
          points: [
            `Tiền hàng: 800 kg × ${formatVnd(SUGGESTED_PRICE)} = ${formatVnd(orderGoodsAmount)}. Cước vận chuyển dự kiến khoảng ${formatVnd(SHIPPING_FEE_ESTIMATE)}.`,
            `So với nhập từ chợ đầu mối, đơn này giúp tiết kiệm khoảng ${formatVnd(savingLow)} – ${formatVnd(savingHigh)}.`,
            `Tiền cọc ${DEPOSIT_PERCENT}%, tương đương ${formatVnd(orderDeposit)}, chỉ thanh toán sau khi nông dân xác nhận và được trừ vào lần đối soát cuối.`,
          ],
        },
        {
          title: 'Độ tin cậy nguồn hàng',
          points: [
            'Nông dân có điểm uy tín 4,8/5 sau 36 đơn, tỷ lệ giao đúng hẹn 94%, chỉ 2 lần dời ngày thu hoạch trong 6 tháng qua.',
            'Ảnh vườn được cập nhật 2 ngày trước; giàn dưa đồng đều, chưa thấy dấu hiệu úng rễ.',
          ],
        },
        {
          title: 'Vì sao nên đặt ngay',
          points: [
            'Giá dưa leo đang tăng khoảng 8%/tuần. Chốt giá bây giờ giúp tránh đợt tăng dự kiến 5–10% vào giữa tháng 10.',
            'Lô chỉ còn khoảng 1.080 kg mở bán; các lô cùng khu vực đang được đặt nhanh do nguồn cung giảm vì mưa.',
          ],
        },
        {
          title: 'Rủi ro cần lưu ý',
          points: [
            'Mưa có thể làm sản lượng giảm nhẹ. Nếu cần chắc chắn đủ 800 kg cho nhu cầu cố định, hãy đặt thêm 50–80 kg từ một lô dự phòng gần đó.',
          ],
        },
      ],
      priceProductId: 'cucumber',
    },
  },
  {
    id: 'buyer-best-price-timing',
    role: 'buyer',
    question: 'Giá dưa leo sắp tới sẽ tăng hay giảm? Thời điểm nào đặt mua thì được giá tốt nhất?',
    keywords: ['gia tot', 'khi nao re', 'thoi diem mua', 'gia thap nhat', 'mua luc nao', 'bien dong gia', 'tang hay giam', 'gia sap toi'],
    answer: {
      verdict: 'Nên chốt đơn cho nửa đầu tháng 10 ngay bây giờ; nhu cầu từ cuối tháng 11 có thể chờ giá giảm.',
      summary:
        'Giá dưa leo đang ở pha tăng do mưa kéo dài làm giảm nguồn cung. Theo chu kỳ mùa vụ các năm trước, giá thường đạt đỉnh vào giữa tháng 10 đến đầu tháng 11, sau đó giảm 10–20% khi các vườn xuống giống sau mưa bắt đầu cho thu hoạch.',
      sections: [
        {
          title: 'Dự báo xu hướng giá',
          points: [
            'Từ nay đến 15/10: tiếp tục tăng khoảng 5–10%, giá tại vườn có thể lên 13.500 – 14.000 đ/kg nếu có áp thấp hoặc bão.',
            'Từ cuối tháng 10 đến tháng 11: đi ngang ở mức cao, biến động theo thời tiết.',
            'Từ cuối tháng 11 đến đầu tháng 12: dự kiến giảm về 10.000 – 11.500 đ/kg khi nguồn cung phục hồi, trước đợt tăng giá trước Tết.',
          ],
        },
        {
          title: 'Chiến lược mua',
          points: [
            'Với nhu cầu trong 2–3 tuần tới: đặt trước ngay để khóa giá hiện tại, không nên chờ.',
            'Với nhu cầu nhập đều hằng tuần: chia thành các đơn đặt trước từ 2–3 vườn khác nhau, lệch ngày thu hoạch 3–4 ngày, để vừa ổn định giá vừa giảm rủi ro thiếu hàng.',
            'Ưu tiên lô có sản lượng lớn (từ 1 tấn trở lên) vì nông dân ít phải điều chỉnh giá theo biến động ngắn hạn.',
            'Tránh chốt đơn sát các dịp lễ, và 2–3 tuần trước Tết khi giá thường tăng 15–25%.',
          ],
        },
      ],
      priceProductId: 'cucumber',
    },
  },
  {
    id: 'buyer-weather-risk',
    role: 'buyer',
    question: 'Thời tiết mưa bão có ảnh hưởng đến đơn tôi đã đặt cọc không? Tôi nên chuẩn bị gì?',
    keywords: ['thoi tiet xau', 'mua bao', 'con bao', 'troi mua', 'anh huong', 'anh huong don', 'thieu hang', 'giao tre', 'rui ro', 'thoi tiet', 'chuan bi'],
    answer: {
      verdict: 'Có thể ảnh hưởng, nhưng tiền của anh/chị được bảo vệ. Nên chuẩn bị thêm một nguồn dự phòng nhỏ.',
      summary:
        'Đầu tháng 10 là cao điểm mùa mưa ở Nam Bộ, nguy cơ sản lượng giảm hoặc lệch ngày giao 1–2 ngày là có thật. Cơ chế đặt trước và đối soát trên FRESH O! giúp anh/chị chỉ trả tiền cho đúng lượng hàng thực nhận.',
      sections: [
        {
          title: 'Những gì có thể xảy ra',
          points: [
            'Sản lượng giảm 5–15% do úng hoặc trái quá lứa; nông dân sẽ cập nhật "Điều chỉnh sản lượng" và anh/chị nhận thông báo ngay.',
            'Ngày thu hoạch lệch 1–2 ngày để tránh mưa lớn; thay đổi được báo qua đơn hàng kèm lý do.',
            'Thời gian vận chuyển kéo dài hơn khi mưa ngập đường, ảnh hưởng đến độ tươi nếu xe không thông gió.',
          ],
        },
        {
          title: 'Anh/chị được bảo vệ thế nào',
          points: [
            'Tiền hàng được đối soát theo số lượng thực nhận, không theo số lượng đặt ban đầu.',
            'Phần tiền cọc dư sau đối soát được hoàn lại và ghi nhận trong sổ giao dịch, không bị sửa đè.',
            'Nếu hàng không đúng mô tả hoặc giao trễ, dùng "Báo vấn đề" để lưu bằng chứng và được hỗ trợ xử lý.',
          ],
        },
        {
          title: 'Khuyến nghị chuẩn bị',
          points: [
            'Với nhu cầu cố định (suất ăn hằng ngày), đặt thêm khoảng 10% từ một lô thứ hai ở khu vực khác, hoặc lô có ngày thu hoạch lệch 1–2 ngày.',
            'Chọn khung nhận hàng buổi sáng và yêu cầu xe có thùng thông gió khi đặt vận chuyển.',
            'Kiểm tra số lượng và chất lượng ngay khi nhận, chụp ảnh lưu lại trước khi xác nhận.',
          ],
        },
      ],
    },
  },
  {
    id: 'buyer-shipping-choice',
    role: 'buyer',
    question: 'Với 800 kg dưa leo, tôi nên tự đến lấy hay đặt vận chuyển? Chi phí khoảng bao nhiêu?',
    keywords: ['van chuyen', 'tu lay', 'ship', 'cuoc', 'xe tai', 'giao hang', 'loai xe', 'chi phi van chuyen'],
    answer: {
      verdict: 'Nên đặt vận chuyển bằng xe tải 1–1,25 tấn có thùng thông gió, trừ khi cửa hàng cách vườn dưới 30 km.',
      summary:
        'Với quãng đường Châu Thành → TP.HCM khoảng 70 km, cước xe tải nhỏ tham khảo 400.000 – 550.000 đ/chuyến, tức khoảng 500 – 700 đ/kg. Mức này chỉ chiếm khoảng 4–5% giá trị đơn hàng.',
      sections: [
        {
          title: 'So sánh hai phương án',
          points: [
            'Tự đến lấy: không phát sinh cước trên nền tảng, nhưng cần xe riêng, tài xế và 3–4 giờ đi về. Phù hợp khi dưới 30 km hoặc đã có xe chạy tuyến sẵn.',
            'Đặt vận chuyển: cước được báo riêng và hiển thị trước khi xác nhận, có loại xe phù hợp hàng tươi và lưu vết bàn giao (thời gian, số lượng, ảnh).',
          ],
        },
        {
          title: 'Lựa chọn phương tiện',
          points: [
            'Dưa leo cần thông gió tốt, tránh nhiệt; xe thùng mui bạt hở hoặc thùng có lỗ thông gió là đủ cho quãng dưới 150 km, chưa cần xe lạnh.',
            'Với quãng trên 150 km hoặc giao vào buổi trưa nắng, nên chọn xe lạnh (cước cao hơn khoảng 30–40%) để giữ độ tươi.',
          ],
        },
        {
          title: 'Mẹo tối ưu chi phí',
          points: [
            'Chọn khung lấy hàng 6h – 8h sáng để tránh nắng và kẹt xe vào thành phố.',
            'Bật tùy chọn ghép đơn cùng tuyến nếu có; cước có thể giảm 15–25% khi xe đi cùng đơn khác về TP.HCM.',
            'Gộp nhiều lô cùng khu vực Tiền Giang vào một chuyến nếu anh/chị đặt nhiều loại rau quả.',
          ],
        },
      ],
    },
  },
  {
    id: 'buyer-farmer-trust',
    role: 'buyer',
    question: 'Làm sao biết nông dân và lô hàng này có đáng tin cậy không?',
    keywords: ['uy tin', 'tin cay', 'dang tin', 'danh gia', 'chat luong', 'nong dan nay', 'lua dao', 'kiem tra'],
    answer: {
      verdict: 'Đánh giá qua 4 nhóm tiêu chí, và luôn bắt đầu bằng đơn nhỏ với nông dân mới.',
      summary:
        'Điểm uy tín trên FRESH O! được tích lũy từ đánh giá hai chiều sau mỗi đơn hoàn tất, nên phản ánh khá sát cách một nông dân giữ cam kết. Tuy vậy, nên kết hợp thêm các tín hiệu khác trước khi đặt đơn lớn.',
      sections: [
        {
          title: 'Bốn nhóm tiêu chí',
          points: [
            'Uy tín: ưu tiên nông dân từ 4,5/5 trở lên với ít nhất 10 đơn hoàn tất.',
            'Độ đúng hẹn: tỷ lệ giao đúng ngày trên 90%, và ít lần dời ngày thu hoạch trong 3 tháng gần nhất.',
            'Minh bạch nguồn gốc: ảnh vườn cập nhật gần đây, địa điểm rõ ràng, có chứng nhận VietGAP/GlobalGAP là điểm cộng lớn.',
            'Phản hồi thực tế: đọc nhận xét của người mua trước về độ đồng đều, quy cách đóng gói và việc giao đủ số lượng.',
          ],
        },
        {
          title: 'Với nông dân mới',
          points: [
            'Đặt đơn thử khoảng 50–100 kg trước khi đặt đơn lớn.',
            'Dùng "Nhắn tin" để hỏi thêm về quy trình canh tác và xin ảnh thực tế trong ngày.',
          ],
        },
        {
          title: 'Lưu ý',
          points: [
            'Phân tích hình ảnh của hệ thống chỉ hỗ trợ đánh giá sơ bộ bề ngoài, không thay thế việc kiểm tra khi nhận hàng. Nếu hàng không đúng mô tả, dùng "Báo vấn đề" trước khi xác nhận đã nhận.',
          ],
        },
      ],
    },
  },
];
