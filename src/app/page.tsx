import Link from 'next/link';
import { Card } from './components/Card';
import { SiteHeader } from './components/header/SiteHeader';
import { HarvestIllustration } from './components/HarvestIllustration';
import {
  HarvestBatchIcon,
  BuyerStoreIcon,
  DepositIcon,
  TrustScoreIcon,
} from './components/icons';
import buttonStyles from './components/Button.module.css';
import styles from './page.module.css';

const valueProps = [
  {
    Icon: HarvestBatchIcon,
    title: 'Đầu ra ổn định cho nông dân',
    body: 'Đăng lô hàng thu hoạch 7-14 ngày trước khi thu, nhận đặt trước từ người mua sỉ trước khi thu hoạch, giảm rủi ro tồn hàng.',
  },
  {
    Icon: BuyerStoreIcon,
    title: 'Nguồn hàng tươi cho người mua',
    body: 'Nhà hàng, bếp ăn, cửa hàng thực phẩm đặt trước lô hàng theo giá và ngày giao rõ ràng, không qua trung gian.',
  },
  {
    Icon: DepositIcon,
    title: 'Minh bạch cọc & cước vận chuyển',
    body: 'Đặt cọc và cước vận chuyển được báo giá tách bạch, mọi thay đổi số tiền đều được ghi log, không sửa âm thầm.',
  },
  {
    Icon: TrustScoreIcon,
    title: 'Uy tín tích lũy theo thời gian',
    body: 'Mỗi đơn hoàn tất đều được đánh giá hai chiều, tích lũy thành điểm uy tín cho cả nông dân và người mua.',
  },
];

const steps = [
  {
    label: 'harvest_batch',
    title: 'Đăng hoặc tìm lô hàng',
    body: 'Nông dân đăng lô hàng sắp thu hoạch; người mua tìm và đặt trước một phần hoặc toàn bộ lô hàng.',
  },
  {
    label: 'pre_order + deposit',
    title: 'Xác nhận & đặt cọc',
    body: 'Nông dân xác nhận đặt trước, người mua thanh toán cọc để giữ chỗ cho lô hàng.',
  },
  {
    label: 'handover',
    title: 'Thu hoạch & bàn giao',
    body: 'Nông dân cập nhật tiến độ thu hoạch, sau đó bàn giao hàng qua tự lấy hoặc đơn vị vận chuyển.',
  },
  {
    label: 'settlement',
    title: 'Đối soát & đánh giá',
    body: 'Người mua xác nhận nhận hàng, hai bên đối soát thanh toán cuối và đánh giá lẫn nhau.',
  },
];

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.brand}>
            <span className={styles.logo}>FRESH O!</span>
            <span className={styles.tagline}>Công nghệ kết nối - Nguồn tươi chủ động.</span>
          </div>
          <p className={styles.pitch}>
            Nền tảng đặt trước thu hoạch, kết nối trực tiếp nông dân với người mua sỉ: nhà hàng, bếp
            ăn, cửa hàng thực phẩm.
          </p>
          <div className={styles.heroActions}>
            <Link href="/login" className={`${buttonStyles.button} ${buttonStyles.primary}`}>
              Bắt đầu
            </Link>
            <a href="#how-it-works" className={`${buttonStyles.button} ${buttonStyles.outline}`}>
              Xem cách hoạt động
            </a>
          </div>
        </div>
        <HarvestIllustration className={styles.heroIllustration} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vì sao chọn FRESH O!</h2>
        <div className={styles.valueGrid}>
          {valueProps.map((item) => (
            <Card key={item.title} className={styles.valueCard}>
              <span className={styles.valueIconBadge}>
                <item.Icon className={styles.valueIcon} />
              </span>
              <p className={styles.valueTitle}>{item.title}</p>
              <p className={styles.valueBody}>{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className={styles.section}>
        <h2 className={styles.sectionTitle}>Cách hoạt động</h2>
        <ol className={styles.stepsList}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <div className={styles.stepMarker}>
                <span className={styles.stepNumber}>{index + 1}</span>
                {index < steps.length - 1 && <span className={styles.stepConnector} aria-hidden="true" />}
              </div>
              <div className={styles.stepContent}>
                <span className={styles.stepLabel}>{step.label}</span>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.ctaBand}>
        <p className={styles.ctaText}>Sẵn sàng kết nối nguồn tươi cho hoạt động kinh doanh?</p>
        <Link href="/login" className={`${buttonStyles.button} ${buttonStyles.primary}`}>
          Bắt đầu ngay
        </Link>
      </section>
    </main>
  );
}
