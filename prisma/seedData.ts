export type DemoAccount = {
  farmerKey?: string;
  buyerKey?: string;
  name: string;
  phone: string;
  address: string;
  role: 'farmer' | 'buyer' | 'admin' | 'logistics';
  trustScore: number;
};

// Demo-only accounts, seeded once into the real users table for local dev.
// Each account's demo password is "demo" + the phone's last 3 digits (see prisma/seed.ts).
// `farmerKey`/`buyerKey` let DEMO_HARVEST_BATCHES/DEMO_PRE_ORDERS reference an account
// without depending on array order.
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { farmerKey: 'farmer-a', name: 'Nguyen Van A', phone: '0901234567', address: 'Da Lat, Lam Dong', role: 'farmer', trustScore: 80 },
  { buyerKey: 'buyer-a', name: 'Tran Thi B', phone: '0902345678', address: 'Ha Noi', role: 'buyer', trustScore: 75 },
  { name: 'Admin Fresh O', phone: '0903456789', address: 'HCMC', role: 'admin', trustScore: 100 },
  { name: 'Logistics Partner C', phone: '0904567890', address: 'HCMC', role: 'logistics', trustScore: 90 },
  // Additional local-dev-only farmers for a richer marketplace demo (see farmer-c..farmer-l batches below).
  { farmerKey: 'farmer-c', name: 'Le Van Cuong', phone: '0911111101', address: 'Da Lat, Lam Dong', role: 'farmer', trustScore: 88 },
  { farmerKey: 'farmer-d', name: 'Pham Thi Dung', phone: '0911111102', address: 'Chau Thanh, Tien Giang', role: 'farmer', trustScore: 72 },
  { farmerKey: 'farmer-e', name: 'Hoang Van E', phone: '0911111103', address: 'Cho Lach, Ben Tre', role: 'farmer', trustScore: 65 },
  { farmerKey: 'farmer-f', name: 'Vo Thi Hoa', phone: '0911111104', address: 'My Xuyen, Soc Trang', role: 'farmer', trustScore: 91 },
  { farmerKey: 'farmer-g', name: 'Dang Van Giang', phone: '0911111105', address: 'Can Duoc, Long An', role: 'farmer', trustScore: 58 },
  { farmerKey: 'farmer-h', name: 'Bui Thi Hanh', phone: '0911111106', address: 'Binh Minh, Vinh Long', role: 'farmer', trustScore: 77 },
  { farmerKey: 'farmer-i', name: 'Ngo Van Hai', phone: '0911111107', address: 'Ninh Kieu, Can Tho', role: 'farmer', trustScore: 83 },
  { farmerKey: 'farmer-j', name: 'Truong Thi Kim', phone: '0911111108', address: 'Buon Ma Thuot, Dak Lak', role: 'farmer', trustScore: 95 },
  { farmerKey: 'farmer-k', name: 'Ly Van Khoa', phone: '0911111109', address: 'Chau Doc, An Giang', role: 'farmer', trustScore: 69 },
  { farmerKey: 'farmer-l', name: 'Phan Thi Lan', phone: '0911111110', address: 'Vi Thanh, Hau Giang', role: 'farmer', trustScore: 74 },
  // Additional local-dev-only buyers for a richer pre_order demo (see DEMO_PRE_ORDERS below).
  { buyerKey: 'buyer-b', name: 'Nguyen Thi Mai', phone: '0921111101', address: 'Quan 1, HCMC', role: 'buyer', trustScore: 82 },
  { buyerKey: 'buyer-c', name: 'Tran Van Nam', phone: '0921111102', address: 'Cau Giay, Ha Noi', role: 'buyer', trustScore: 70 },
  { buyerKey: 'buyer-d', name: 'Le Thi Oanh', phone: '0921111103', address: 'Hai Chau, Da Nang', role: 'buyer', trustScore: 91 },
  { buyerKey: 'buyer-e', name: 'Pham Van Phong', phone: '0921111104', address: 'Ninh Kieu, Can Tho', role: 'buyer', trustScore: 64 },
  { buyerKey: 'buyer-f', name: 'Hoang Thi Quyen', phone: '0921111105', address: 'Thu Duc, HCMC', role: 'buyer', trustScore: 78 },
  { buyerKey: 'buyer-g', name: 'Vo Van Son', phone: '0921111106', address: 'Ba Dinh, Ha Noi', role: 'buyer', trustScore: 85 },
  { buyerKey: 'buyer-h', name: 'Dang Thi Thu', phone: '0921111107', address: 'Nha Trang, Khanh Hoa', role: 'buyer', trustScore: 60 },
  { buyerKey: 'buyer-i', name: 'Bui Van Tai', phone: '0921111108', address: 'Bien Hoa, Dong Nai', role: 'buyer', trustScore: 93 },
  { buyerKey: 'buyer-j', name: 'Ngo Thi Uyen', phone: '0921111109', address: 'Long Xuyen, An Giang', role: 'buyer', trustScore: 71 },
];

export type DemoHarvestBatch = {
  batchKey: string;
  farmerKey: string;
  cropName: string;
  quantityTotal: number;
  quantityAvailable: number;
  unit: string;
  pricePerUnit: number;
  harvestDateOffsetDays: number;
  status: string;
  photoUrl: string | null;
  location: string;
  qualityStandard?: string;
  minOrderQuantity?: number;
  preOrderStatus?: string;
  description?: string;
};

type CropTemplate = {
  cropName: string;
  unit: string;
  basePrice: number;
  photoUrl: string;
  qualityStandard?: string;
};

// Demo-only stock photos from Wikimedia Commons (freely licensed, stable URLs), reused
// across multiple farmers/batches on purpose to mimic several sellers of the same crop.
// Local dev/demo use only — see 02-security-and-data.rule.md §6.
const CROP_CATALOG: CropTemplate[] = [
  { cropName: 'Xoài cát Hòa Lộc', unit: 'kg', basePrice: 35000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Mango_fruit_Nam_Dok_Mai.jpg', qualityStandard: 'VietGAP' },
  { cropName: 'Dưa leo loại 1', unit: 'kg', basePrice: 9000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Harvested_vegetables%28Cucumbers%29.jpg' },
  { cropName: 'Cà chua bi', unit: 'kg', basePrice: 22000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Yellow_cherry_tomatoes.jpg' },
  { cropName: 'Lúa ST25', unit: 'kg', basePrice: 15000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Road_and_paddy_fields_in_Sa_Pa%2C_Vietnam%2C_20240126_1202_3586.jpg' },
  { cropName: 'Bưởi da xanh', unit: 'kg', basePrice: 28000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Pomelo_fruit.jpg', qualityStandard: 'VietGAP' },
  { cropName: 'Ổi Đài Loan', unit: 'kg', basePrice: 12000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Goiaba_vermelha.jpg' },
  { cropName: 'Khoai lang tím', unit: 'kg', basePrice: 6000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Sweet_Potato_Harvest.jpg' },
  { cropName: 'Sầu riêng Ri6', unit: 'kg', basePrice: 85000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Durian_Fruit_in_Yunnan.jpg', qualityStandard: 'GlobalGAP' },
  { cropName: 'Thanh long ruột đỏ', unit: 'kg', basePrice: 18000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Pitaya_%28dragon_fruit%29_in_West_Bengal%2C_India.jpg' },
  { cropName: 'Cà phê nhân xô', unit: 'kg', basePrice: 65000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Coffee_cherries_on_bush_at_Fairview_Estate%2C_Kiambu%2C_KE.jpg' },
  { cropName: 'Nhãn tiêu da bò', unit: 'kg', basePrice: 24000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Longan_fruit_flesh_%26_skin.jpg' },
  { cropName: 'Chôm chôm Java', unit: 'kg', basePrice: 19000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Rambutans_with_seed.jpg' },
  { cropName: 'Mít Thái', unit: 'kg', basePrice: 16000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Jackfruit_Flesh.jpg' },
  { cropName: 'Chuối già Nam Mỹ', unit: 'kg', basePrice: 8000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Bunch_of_bananas_on_sale.jpg' },
  { cropName: 'Dưa hấu không hạt', unit: 'kg', basePrice: 11000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Watermelon_yellow_2024_G1.jpg' },
  { cropName: 'Vải thiều', unit: 'kg', basePrice: 30000, photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Lychee_fruits_and_seed.jpg' },
];

const NEW_FARMER_PROFILES: { farmerKey: string; location: string }[] = [
  { farmerKey: 'farmer-c', location: 'Da Lat, Lam Dong' },
  { farmerKey: 'farmer-d', location: 'Chau Thanh, Tien Giang' },
  { farmerKey: 'farmer-e', location: 'Cho Lach, Ben Tre' },
  { farmerKey: 'farmer-f', location: 'My Xuyen, Soc Trang' },
  { farmerKey: 'farmer-g', location: 'Can Duoc, Long An' },
  { farmerKey: 'farmer-h', location: 'Binh Minh, Vinh Long' },
  { farmerKey: 'farmer-i', location: 'Ninh Kieu, Can Tho' },
  { farmerKey: 'farmer-j', location: 'Buon Ma Thuot, Dak Lak' },
  { farmerKey: 'farmer-k', location: 'Chau Doc, An Giang' },
  { farmerKey: 'farmer-l', location: 'Vi Thanh, Hau Giang' },
];

// Cycles through every valid harvest_batch status (orderStatus.ts) instead of defaulting to 'open'.
const BATCH_STATUS_CYCLE = ['open', 'open', 'awaiting_harvest', 'open', 'ready_for_handover', 'open', 'closed', 'open', 'awaiting_harvest', 'open'];

// Builds 10 harvest_batch rows per additional farmer, cycling the shared crop catalog with an
// offset per farmer so crops intentionally repeat across sellers (simulating a real marketplace)
// while quantities, prices, and statuses still vary.
function generateAdditionalFarmerBatches(): DemoHarvestBatch[] {
  const batches: DemoHarvestBatch[] = [];

  NEW_FARMER_PROFILES.forEach((farmer, farmerIndex) => {
    for (let slot = 0; slot < 10; slot += 1) {
      const crop = CROP_CATALOG[(farmerIndex * 3 + slot) % CROP_CATALOG.length];
      const status = BATCH_STATUS_CYCLE[slot];
      const priceVariance = 1 + ((farmerIndex + slot) % 5) * 0.04;
      const quantityTotal = 200 + ((farmerIndex * 7 + slot * 11) % 9) * 100;
      const quantityAvailable = status === 'closed' ? 0 : Math.round(quantityTotal * (1 - (slot % 4) * 0.15));

      const batch: DemoHarvestBatch = {
        batchKey: `${farmer.farmerKey}-slot${slot}`,
        farmerKey: farmer.farmerKey,
        cropName: crop.cropName,
        quantityTotal,
        quantityAvailable,
        unit: crop.unit,
        pricePerUnit: Math.round((crop.basePrice * priceVariance) / 500) * 500,
        harvestDateOffsetDays: 3 + ((farmerIndex + slot) % 12),
        status,
        photoUrl: slot % 5 === 4 ? null : crop.photoUrl,
        location: farmer.location,
        qualityStandard: crop.qualityStandard,
        minOrderQuantity: slot % 3 === 0 ? 20 : 1,
      };

      // awaiting_harvest/ready_for_handover batches must carry a pre_order in that same
      // state (00-project-charter.rule.md §4 — a batch can't reach those states without one).
      if (status === 'awaiting_harvest') batch.preOrderStatus = 'awaiting_harvest';
      if (status === 'ready_for_handover') batch.preOrderStatus = 'ready_for_handover';
      if (slot === 0) batch.preOrderStatus = 'deposited';

      batches.push(batch);
    }
  });

  return batches;
}

// Diverse harvest_batch demo rows exercising every farmer batch-card state
// (photo vs. placeholder, sold-out, awaiting_harvest, ready_for_handover, non-kg unit),
// plus 100 generated rows (10 farmers x 10 batches) from generateAdditionalFarmerBatches().
export const DEMO_HARVEST_BATCHES: DemoHarvestBatch[] = [
  { batchKey: 'farmer-a-mango', farmerKey: 'farmer-a', cropName: 'Xoài cát Hòa Lộc', quantityTotal: 500, quantityAvailable: 500, unit: 'kg', pricePerUnit: 35000, harvestDateOffsetDays: 10, status: 'open', photoUrl: '/uploads/batches/seed-mango.jpg', location: 'Cai Lay, Tien Giang', qualityStandard: 'VietGAP', description: 'Xoài cát Hòa Lộc chín tự nhiên, không dùng thuốc thúc chín. Đóng gói theo thùng xốp 10kg kèm lớp lót giấy chống dập. Có thể hái theo yêu cầu ngày cận giao.' },
  { batchKey: 'farmer-a-cucumber', farmerKey: 'farmer-a', cropName: 'Dưa leo loại 1', quantityTotal: 800, quantityAvailable: 800, unit: 'kg', pricePerUnit: 9000, harvestDateOffsetDays: 7, status: 'open', photoUrl: null, location: 'Cu Chi, HCMC' },
  { batchKey: 'farmer-a-tomato', farmerKey: 'farmer-a', cropName: 'Cà chua bi', quantityTotal: 300, quantityAvailable: 300, unit: 'kg', pricePerUnit: 22000, harvestDateOffsetDays: 2, status: 'open', photoUrl: null, location: 'Da Lat, Lam Dong' },
  { batchKey: 'farmer-a-water-spinach', farmerKey: 'farmer-a', cropName: 'Rau muống', quantityTotal: 400, quantityAvailable: 0, unit: 'kg', pricePerUnit: 8000, harvestDateOffsetDays: 5, status: 'open', photoUrl: null, location: 'Hoc Mon, HCMC', preOrderStatus: 'deposited' },
  { batchKey: 'farmer-a-rice', farmerKey: 'farmer-a', cropName: 'Lúa ST25', quantityTotal: 2000, quantityAvailable: 1200, unit: 'kg', pricePerUnit: 15000, harvestDateOffsetDays: 3, status: 'awaiting_harvest', photoUrl: null, location: 'Soc Trang', preOrderStatus: 'awaiting_harvest' },
  { batchKey: 'farmer-a-pomelo', farmerKey: 'farmer-a', cropName: 'Bưởi da xanh', quantityTotal: 600, quantityAvailable: 200, unit: 'kg', pricePerUnit: 28000, harvestDateOffsetDays: 1, status: 'ready_for_handover', photoUrl: null, location: 'Ben Tre', preOrderStatus: 'ready_for_handover' },
  { batchKey: 'farmer-a-guava', farmerKey: 'farmer-a', cropName: 'Ổi Đài Loan', quantityTotal: 50, quantityAvailable: 50, unit: 'thùng', pricePerUnit: 180000, harvestDateOffsetDays: 8, status: 'open', photoUrl: null, location: 'Long An' },
  { batchKey: 'farmer-a-sweet-potato', farmerKey: 'farmer-a', cropName: 'Khoai lang tím', quantityTotal: 1000, quantityAvailable: 950, unit: 'kg', pricePerUnit: 6000, harvestDateOffsetDays: 12, status: 'open', photoUrl: null, location: 'Vinh Long', minOrderQuantity: 50 },
  ...generateAdditionalFarmerBatches(),
];

export type DemoPreOrderTargetStatus =
  | 'pending_confirmation' | 'negotiating' | 'deposited' | 'awaiting_harvest'
  | 'ready_for_handover' | 'in_transit' | 'delivered' | 'settled' | 'rejected' | 'cancelled';

export type DemoPreOrder = {
  buyerKey: string;
  batchKey: string;
  quantity: number;
  targetStatus: DemoPreOrderTargetStatus;
};

// 20 demo pre_order rows spread across all 10 demo buyers and 10 valid pre_order end
// states (00-project-charter.rule.md §4), each pinned to a distinct, still-`open`
// harvest_batch so advancing one order's batch-level status never drags another
// order (on the same batch) forward with it. Actual creation/transitions happen in
// prisma/seed.ts via createPreOrder()/advanceDemoPreOrder() — this is declarative data only.
export const DEMO_PRE_ORDERS: DemoPreOrder[] = [
  { buyerKey: 'buyer-a', batchKey: 'farmer-a-cucumber', quantity: 20, targetStatus: 'pending_confirmation' },
  { buyerKey: 'buyer-b', batchKey: 'farmer-c-slot1', quantity: 10, targetStatus: 'pending_confirmation' },
  { buyerKey: 'buyer-c', batchKey: 'farmer-a-tomato', quantity: 15, targetStatus: 'negotiating' },
  { buyerKey: 'buyer-d', batchKey: 'farmer-c-slot3', quantity: 20, targetStatus: 'negotiating' },
  { buyerKey: 'buyer-e', batchKey: 'farmer-a-guava', quantity: 5, targetStatus: 'deposited' },
  { buyerKey: 'buyer-f', batchKey: 'farmer-c-slot5', quantity: 10, targetStatus: 'deposited' },
  { buyerKey: 'buyer-g', batchKey: 'farmer-a-sweet-potato', quantity: 50, targetStatus: 'awaiting_harvest' },
  { buyerKey: 'buyer-h', batchKey: 'farmer-c-slot7', quantity: 10, targetStatus: 'awaiting_harvest' },
  { buyerKey: 'buyer-i', batchKey: 'farmer-a-mango', quantity: 25, targetStatus: 'ready_for_handover' },
  { buyerKey: 'buyer-j', batchKey: 'farmer-c-slot9', quantity: 20, targetStatus: 'ready_for_handover' },
  { buyerKey: 'buyer-a', batchKey: 'farmer-d-slot1', quantity: 10, targetStatus: 'in_transit' },
  { buyerKey: 'buyer-b', batchKey: 'farmer-d-slot3', quantity: 20, targetStatus: 'in_transit' },
  { buyerKey: 'buyer-c', batchKey: 'farmer-d-slot5', quantity: 10, targetStatus: 'delivered' },
  { buyerKey: 'buyer-d', batchKey: 'farmer-d-slot7', quantity: 10, targetStatus: 'delivered' },
  { buyerKey: 'buyer-e', batchKey: 'farmer-d-slot9', quantity: 20, targetStatus: 'settled' },
  { buyerKey: 'buyer-f', batchKey: 'farmer-e-slot1', quantity: 10, targetStatus: 'settled' },
  { buyerKey: 'buyer-g', batchKey: 'farmer-e-slot3', quantity: 20, targetStatus: 'rejected' },
  { buyerKey: 'buyer-h', batchKey: 'farmer-e-slot5', quantity: 10, targetStatus: 'rejected' },
  { buyerKey: 'buyer-i', batchKey: 'farmer-e-slot7', quantity: 10, targetStatus: 'cancelled' },
  { buyerKey: 'buyer-j', batchKey: 'farmer-e-slot9', quantity: 20, targetStatus: 'cancelled' },
];
