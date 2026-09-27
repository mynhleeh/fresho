import Link from 'next/link';
import { SignatureFlourish } from './LandingArt';
import styles from './landing.module.css';

const settlementLines = [
  { label: 'Tiền hàng thực nhận', detail: '600 kg × 18.000 ₫', amount: '10.800.000 ₫' },
  { label: 'Cước vận chuyển', detail: 'Báo giá riêng', amount: '+ 450.000 ₫' },
  { label: 'Đã đặt cọc', detail: 'Trừ vào đối soát', amount: '− 3.240.000 ₫' },
];

const transparencyPoints = [
  { keyword: 'Tách bạch', body: 'Cước vận chuyển luôn được báo giá riêng, không gộp vào giá nông sản.' },
  { keyword: 'Có dấu vết', body: 'Mọi thay đổi về tiền cọc và thanh toán được ghi thành nhật ký, không sửa âm thầm.' },
  { keyword: 'Hai chiều', body: 'Sau mỗi đơn, nông dân và người mua đánh giá nhau để tích lũy điểm uy tín.' },
];

export function TransparencySection() {
  return (
    <section id="minh-bach" className={styles.section}>
      <div className={styles.transparencyGrid}>
        <div className={styles.transparencyText} data-reveal>
          <span className={styles.eyebrow}>Minh bạch</span>
          <h2 className={styles.sectionHeading}>Mỗi đồng đều <em>có chỗ</em> của nó.</h2>
          <dl className={styles.pointList}>
            {transparencyPoints.map((point) => (
              <div key={point.keyword} className={styles.point}>
                <dt className={styles.pointKeyword}>{point.keyword}</dt>
                <dd className={styles.pointBody}>{point.body}</dd>
              </div>
            ))}
          </dl>
        </div>
        <SettlementReceipt />
      </div>
    </section>
  );
}

function SettlementReceipt() {
  return (
    <figure className={styles.receipt} data-reveal>
      <figcaption className={styles.receiptHeader}>
        <span className={styles.receiptTitle}>Phiếu đối soát</span>
        <span className={styles.receiptTag}>Ví dụ minh họa</span>
      </figcaption>
      <dl className={styles.receiptLines}>
        {settlementLines.map((line) => (
          <div key={line.label} className={styles.receiptLine}>
            <dt>
              <span className={styles.receiptLabel}>{line.label}</span>
              <span className={styles.receiptDetail}>{line.detail}</span>
            </dt>
            <dd className={styles.receiptAmount}>{line.amount}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.receiptTotal}>
        <span>Thanh toán cuối</span>
        <span className={styles.receiptTotalAmount}>8.010.000 ₫</span>
      </div>
    </figure>
  );
}

export function ClosingSection() {
  return (
    <section className={styles.closing}>
      <div className={styles.closingInner} data-reveal>
        <h2 className={styles.closingHeading}>
          Mùa sau, <em>chốt đơn trước</em> khi hái.
        </h2>
        <SignatureFlourish />
        <p className={styles.closingBody}>Đăng ký với vai trò nông dân hoặc người mua để bắt đầu.</p>
        <Link href="/login" className={styles.ctaPrimaryLight}>Tạo tài khoản</Link>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerBrand}>FRESH<span className={styles.wordmarkAccent}>O!</span></span>
      <span className={styles.footerTagline}>Công nghệ kết nối · Nguồn tươi chủ động</span>
    </footer>
  );
}
