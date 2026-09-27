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
