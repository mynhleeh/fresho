export type DemoAccount = {
  name: string;
  phone: string;
  address: string;
  role: 'farmer' | 'buyer' | 'admin' | 'logistics';
  trustScore: number;
};

// Demo-only accounts, seeded once into the real users table for local dev.
// Each account's demo password is "demo" + the phone's last 3 digits (see prisma/seed.ts).
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { name: 'Nguyen Van A', phone: '0901234567', address: 'Da Lat, Lam Dong', role: 'farmer', trustScore: 80 },
  { name: 'Tran Thi B', phone: '0902345678', address: 'Ha Noi', role: 'buyer', trustScore: 75 },
  { name: 'Admin Fresh O', phone: '0903456789', address: 'HCMC', role: 'admin', trustScore: 100 },
  { name: 'Logistics Partner C', phone: '0904567890', address: 'HCMC', role: 'logistics', trustScore: 90 },
];

export type DemoHarvestBatch = {
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
};

// Diverse harvest_batch demo rows exercising every farmer batch-card state
// (photo vs. placeholder, sold-out, awaiting_harvest, ready_for_handover, non-kg unit).
export const DEMO_HARVEST_BATCHES: DemoHarvestBatch[] = [
  { cropName: 'Xoài cát Hòa Lộc', quantityTotal: 500, quantityAvailable: 500, unit: 'kg', pricePerUnit: 35000, harvestDateOffsetDays: 10, status: 'open', photoUrl: '/uploads/batches/seed-mango.jpg', location: 'Cai Lay, Tien Giang', qualityStandard: 'VietGAP' },
  { cropName: 'Dưa leo loại 1', quantityTotal: 800, quantityAvailable: 800, unit: 'kg', pricePerUnit: 9000, harvestDateOffsetDays: 7, status: 'open', photoUrl: null, location: 'Cu Chi, HCMC' },
  { cropName: 'Cà chua bi', quantityTotal: 300, quantityAvailable: 300, unit: 'kg', pricePerUnit: 22000, harvestDateOffsetDays: 2, status: 'open', photoUrl: null, location: 'Da Lat, Lam Dong' },
  { cropName: 'Rau muống', quantityTotal: 400, quantityAvailable: 0, unit: 'kg', pricePerUnit: 8000, harvestDateOffsetDays: 5, status: 'open', photoUrl: null, location: 'Hoc Mon, HCMC' },
  { cropName: 'Lúa ST25', quantityTotal: 2000, quantityAvailable: 1200, unit: 'kg', pricePerUnit: 15000, harvestDateOffsetDays: 3, status: 'awaiting_harvest', photoUrl: null, location: 'Soc Trang' },
  { cropName: 'Bưởi da xanh', quantityTotal: 600, quantityAvailable: 200, unit: 'kg', pricePerUnit: 28000, harvestDateOffsetDays: 1, status: 'ready_for_handover', photoUrl: null, location: 'Ben Tre' },
  { cropName: 'Ổi Đài Loan', quantityTotal: 50, quantityAvailable: 50, unit: 'thùng', pricePerUnit: 180000, harvestDateOffsetDays: 8, status: 'open', photoUrl: null, location: 'Long An' },
  { cropName: 'Khoai lang tím', quantityTotal: 1000, quantityAvailable: 950, unit: 'kg', pricePerUnit: 6000, harvestDateOffsetDays: 12, status: 'open', photoUrl: null, location: 'Vinh Long', minOrderQuantity: 50 },
];
