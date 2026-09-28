import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { CrateArt, LeafSprigArt, SeasonRouteArt } from './LandingArt';
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

const seasonMilestones = [
  { label: 'Đăng lô', note: '7–14 ngày trước thu hoạch' },
  { label: 'Đặt cọc', note: 'trước khi hái' },
  { label: 'Thu hoạch', note: 'đúng ngày hẹn' },
];

const leadTimeSegments = Array.from({ length: 14 }, (_, index) => index + 1);

export function AudienceSection() {
  return (
    <section id="doi-tuong" className={styles.audienceBand}>
      <div className={styles.audienceInner}>
        <div className={styles.sectionIntro} data-reveal>
          <span className={styles.eyebrow}>Dành cho ai</span>
          <h2 className={styles.sectionHeading}>Hai phía, <em>một lịch mùa vụ</em> chung.</h2>
        </div>
        <div className={styles.audienceGrid}>
          <SeasonRouteArt />
          <AudiencePanel
            tone="field"
            role="Nông dân"
            title="Bán trước khi thu hoạch"
            points={farmerPoints}
            badge="Đăng trước 7–14 ngày"
            photo={{ src: '/landing/farmer.jpg', alt: 'Luống đậu xanh mướt trải dài trên đồng dưới nắng chiều', position: '50% 62%' }}
            sticker={<LeafSprigArt />}
            meter={<LeadTimeStat />}
          />
          <AudiencePanel
            tone="market"
            role="Người mua sỉ"
            title="Nguồn tươi đúng hẹn"
            points={buyerPoints}
            badge="Đặt trước, giá chốt sớm"
            photo={{ src: '/landing/buyer.jpg', alt: 'Sạp trái cây và rau tươi xếp trong thùng và sọt nhựa', position: '30% 58%' }}
            sticker={<CrateArt />}
            meter={<ShareStat />}
          />
        </div>
        <SeasonMilestones />
      </div>
    </section>
  );
}

function LeadTimeStat() {
  return (
    <div className={styles.statTile}>
      <div className={styles.statValue}><strong>7–14</strong><span>ngày</span></div>
      <div className={styles.statBody}>
        <div className={styles.leadMeter} aria-hidden="true">
          {leadTimeSegments.map((day) => <span key={day} className={day >= 7 ? styles.leadOn : styles.leadOff} style={{ '--tick-index': day } as CSSProperties} />)}
        </div>
        <span className={styles.statLabel}>đăng lô trước ngày thu hoạch</span>
      </div>
    </div>
  );
}

function ShareStat() {
  return (
    <div className={styles.statTile}>
      <div className={styles.statValue}><strong>1 phần</strong><span>hoặc cả lô</span></div>
      <div className={styles.statBody}>
        <div className={styles.shareMeter} aria-hidden="true"><span className={styles.shareFill} /></div>
        <span className={styles.statLabel}>đặt theo đúng nhu cầu bếp</span>
      </div>
    </div>
  );
}

function SeasonMilestones() {
  return (
    <ol className={styles.milestones} data-reveal aria-label="Mốc trong một mùa vụ">
      {seasonMilestones.map((milestone) => (
        <li key={milestone.label} className={styles.milestone}>
          <span className={styles.milestoneDot} aria-hidden="true" />
          <strong>{milestone.label}</strong>
          <span>{milestone.note}</span>
        </li>
      ))}
    </ol>
  );
}

type AudiencePhotoProps = { src: string; alt: string; position: string };

function AudiencePhoto({ src, alt, position }: AudiencePhotoProps) {
  return <Image src={src} alt={alt} fill sizes="(max-width: 720px) 88vw, (max-width: 1240px) 44vw, 520px" className={styles.panelPhoto} style={{ objectPosition: position }} />;
}

type AudiencePanelProps = {
  tone: 'field' | 'market';
  role: string;
  title: string;
  points: string[];
  badge: string;
  photo: AudiencePhotoProps;
  sticker: ReactNode;
  meter: ReactNode;
};

function AudiencePanel({ tone, role, title, points, badge, photo, sticker, meter }: AudiencePanelProps) {
  return (
    <article className={`${styles.audiencePanel} ${tone === 'field' ? styles.audienceField : styles.audienceMarket}`} data-reveal>
      <div className={styles.audienceMedia}>
        <div className={styles.audienceFrame}><AudiencePhoto {...photo} /></div>
        <span className={styles.audienceBadge}>{badge}</span>
        {sticker}
      </div>
      <div className={styles.audienceBody}>
        <span className={styles.audienceRole}>{role}</span>
        <h3 className={styles.audienceTitle}>{title}</h3>
        {meter}
        <ul className={styles.audienceList}>
          {points.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </div>
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
