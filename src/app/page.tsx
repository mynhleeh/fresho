import Link from 'next/link';
import { landingDisplayFont } from './landing/fonts';
import { LandingNav } from './landing/LandingNav';
import { HeroScene } from './landing/HeroScene';
import { AudienceSection, ProcessSection, ProduceMarquee } from './landing/LandingSections';
import { ClosingSection, LandingFooter, TransparencySection } from './landing/ClosingSections';
import { ScrollRevealObserver } from './landing/ScrollRevealObserver';
import styles from './landing/landing.module.css';

export default function LandingPage() {
  return (
    <div className={`${styles.page} ${landingDisplayFont.variable}`} data-reveal-root>
      <LandingNav />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={`${styles.eyebrow} ${styles.enter}`}>Nền tảng đặt trước thu hoạch</span>
            <h1 className={`${styles.heroHeading} ${styles.enter} ${styles.enterDelay1}`}>
              Đặt trước mùa vụ.<br /><em>Nhận nguồn tươi</em> đúng hẹn.
            </h1>
            <p className={`${styles.heroPitch} ${styles.enter} ${styles.enterDelay2}`}>
              FRESH O! kết nối trực tiếp nông dân với nhà hàng, bếp ăn và cửa hàng thực phẩm — chốt đơn
              từ 7–14 ngày trước khi thu hoạch, với đặt cọc và cước vận chuyển rõ ràng.
            </p>
            <div className={`${styles.heroActions} ${styles.enter} ${styles.enterDelay3}`}>
              <Link href="/login" className={styles.ctaPrimary}>Bắt đầu ngay</Link>
              <a href="#cach-hoat-dong" className={styles.ctaGhost}>Xem cách hoạt động</a>
            </div>
          </div>
          <HeroScene />
        </section>
        <ProduceMarquee />
        <AudienceSection />
        <ProcessSection />
        <TransparencySection />
        <ClosingSection />
      </main>
      <LandingFooter />
      <ScrollRevealObserver />
    </div>
  );
}
