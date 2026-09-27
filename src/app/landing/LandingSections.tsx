import type { CSSProperties, ReactNode } from 'react';
import { GrowthStagesArt, ProduceCrateArt } from './LandingArt';
import styles from './landing.module.css';

const produceNames = ['Cà chua Đà Lạt', 'Bơ 034', 'Cải bẹ xanh', 'Gạo ST25', 'Xoài cát Hòa Lộc', 'Dưa lưới', 'Khoai lang mật', 'Bắp cải tím', 'Thanh long ruột đỏ', 'Hành lá'];

export function ProduceMarquee() {
  const marqueeItems = [...produceNames, ...produceNames];
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        {marqueeItems.map((produceName, index) => (
          <span key={`${produceName}-${index}`} className={styles.marqueeItem}>{produceName}</span>
        ))}
      </div>
    </div>
  );
}

const farmerPoints = ['Đăng lô hàng 7–14 ngày trước khi thu hoạch', 'Chốt đầu ra và nhận cọc trước khi hái', 'Cập nhật tiến độ mùa vụ cho người mua theo dõi'];
const buyerPoints = ['Tìm lô hàng theo loại nông sản, vùng trồng, ngày thu', 'Đặt trước một phần hoặc cả lô với giá rõ ràng', 'Tự lấy hàng hoặc chọn đơn vị vận chuyển'];

export function AudienceSection() {
  return (
    <section id="doi-tuong" className={styles.section}>
      <div className={styles.sectionIntro} data-reveal>
        <span className={styles.eyebrow}>Dành cho ai</span>
        <h2 className={styles.sectionHeading}>Hai phía, <em>một lịch mùa vụ</em> chung.</h2>
      </div>
      <div className={styles.audienceGrid}>
        <AudiencePanel tone="field" role="Nông dân" title="Bán trước khi thu hoạch" points={farmerPoints} art={<GrowthStagesArt />} />
        <AudiencePanel tone="market" role="Người mua sỉ" title="Nguồn tươi đúng hẹn" points={buyerPoints} art={<ProduceCrateArt />} />
      </div>
    </section>
  );
}

type AudiencePanelProps = { tone: 'field' | 'market'; role: string; title: string; points: string[]; art: ReactNode };

function AudiencePanel({ tone, role, title, points, art }: AudiencePanelProps) {
  return (
    <article className={`${styles.audiencePanel} ${tone === 'field' ? styles.audienceField : styles.audienceMarket}`} data-reveal>
      <span className={styles.audienceRole}>{role}</span>
      <h3 className={styles.audienceTitle}>{title}</h3>
      <ul className={styles.audienceList}>
        {points.map((point) => <li key={point}>{point}</li>)}
      </ul>
      <div className={styles.audienceArt}>{art}</div>
    </article>
  );
}

const processSteps = [
  { title: 'Đăng & tìm lô hàng', body: 'Nông dân đăng lô sắp thu hoạch. Người mua lọc theo nông sản, vùng trồng và ngày thu.' },
  { title: 'Xác nhận & đặt cọc', body: 'Nông dân xác nhận hoặc trao đổi thêm về quy cách. Người mua đặt cọc để giữ chỗ.' },
  { title: 'Thu hoạch & bàn giao', body: 'Tiến độ mùa vụ được cập nhật; hàng được bàn giao qua tự lấy hoặc đơn vị vận chuyển.' },
  { title: 'Đối soát & đánh giá', body: 'Người mua xác nhận nhận hàng, hai bên đối soát thanh toán cuối và đánh giá lẫn nhau.' },
];

export function ProcessSection() {
  return (
    <section id="cach-hoat-dong" className={styles.processSection}>
      <div className={styles.sectionIntro} data-reveal>
        <span className={styles.eyebrowOnDark}>Cách hoạt động</span>
        <h2 className={styles.sectionHeadingOnDark}>Từ luống rau tới bếp ăn, <em>bốn bước</em>.</h2>
      </div>
      <ol className={styles.processList} data-reveal>
        <span className={styles.processRail} aria-hidden="true" />
        {processSteps.map((step, index) => (
          <li key={step.title} className={styles.processStep} style={{ '--step-index': index } as CSSProperties}>
            <span className={styles.processNumber}>{String(index + 1).padStart(2, '0')}</span>
            <h3 className={styles.processTitle}>{step.title}</h3>
            <p className={styles.processBody}>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
