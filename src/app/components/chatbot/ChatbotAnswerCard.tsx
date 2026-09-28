import type { ChatbotAnswer } from '@/lib/chatbot/chatbotFaq';
import { chatbotAdvisoryDisclaimer } from '@/lib/chatbot/chatbotFaq';
import { findMarketPriceQuote, MARKET_SNAPSHOT_DATE, type MarketPriceQuote } from '@/lib/chatbot/marketPriceSnapshot';
import styles from './ChatbotWidget.module.css';

const TREND_LABEL = { up: 'Đang tăng', down: 'Đang giảm', stable: 'Đi ngang' } as const;

function formatThousands(amount: number): string {
  return `${(amount / 1000).toLocaleString('vi-VN')}k`;
}

function toPercentOfScale(amount: number, scaleMin: number, scaleMax: number): number {
  return ((amount - scaleMin) / (scaleMax - scaleMin)) * 100;
}

function PriceRangeChart({ quote }: { quote: MarketPriceQuote }) {
  const scaleMin = quote.farmGateLow * 0.85;
  const scaleMax = quote.wholesaleHigh * 1.05;
  const bands = [
    { label: 'Tại vườn', low: quote.farmGateLow, high: quote.farmGateHigh, className: styles.priceBandFarm },
    { label: 'Chợ đầu mối', low: quote.wholesaleLow, high: quote.wholesaleHigh, className: styles.priceBandWholesale },
  ];
  const changeSign = quote.weeklyChangePercent > 0 ? '+' : '';

  return (
    <figure className={styles.priceChart}>
      <figcaption className={styles.priceChartHeader}>
        <span className={styles.priceChartTitle}>{quote.productName} · {quote.region}</span>
        <span className={styles.trendChip} data-trend={quote.trend}>
          {TREND_LABEL[quote.trend]} {changeSign}{quote.weeklyChangePercent}%/tuần
        </span>
      </figcaption>
      {bands.map((band) => (
        <div key={band.label} className={styles.priceRow}>
          <span className={styles.priceRowLabel}>{band.label}</span>
          <div className={styles.priceTrack}>
            <span
              className={`${styles.priceBand} ${band.className}`}
              style={{
                left: `${toPercentOfScale(band.low, scaleMin, scaleMax)}%`,
                width: `${toPercentOfScale(band.high, scaleMin, scaleMax) - toPercentOfScale(band.low, scaleMin, scaleMax)}%`,
              }}
            />
          </div>
          <span className={styles.priceRowValue}>{formatThousands(band.low)}–{formatThousands(band.high)} đ/kg</span>
        </div>
      ))}
      <span className={styles.priceChartNote}>Giá tham khảo ngày {MARKET_SNAPSHOT_DATE}</span>
    </figure>
  );
}

export function ChatbotAnswerCard({ answer }: { answer: ChatbotAnswer }) {
  const quote = answer.priceProductId ? findMarketPriceQuote(answer.priceProductId) : undefined;

  return (
    <article className={styles.answerCard}>
      <p className={styles.verdict}>{answer.verdict}</p>
      <p className={styles.answerSummary}>{answer.summary}</p>
      {quote && <PriceRangeChart quote={quote} />}
      {answer.sections.map((section) => (
        <section key={section.title} className={styles.answerSection}>
          <h4 className={styles.answerSectionTitle}>{section.title}</h4>
          <ul className={styles.answerPoints}>
            {section.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className={styles.disclaimer}>{chatbotAdvisoryDisclaimer}</p>
    </article>
  );
}
