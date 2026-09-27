import type { HorizonDay } from '@/lib/dashboardSummary';
import styles from './page.module.css';

const MAX_VISIBLE_ENTRIES_PER_DAY = 3;
const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

type HarvestHorizonProps = { days: HorizonDay[]; laterCount: number; entryNoun: string };

function monthLabelFor(day: HorizonDay, index: number, days: HorizonDay[]): string | null {
  const isFirstOfMonthInWindow = index === 0 || day.date.getMonth() !== days[index - 1].date.getMonth();
  return isFirstOfMonthInWindow ? `Tháng ${day.date.getMonth() + 1}` : null;
}

export function HarvestHorizon({ days, laterCount, entryNoun }: HarvestHorizonProps) {
  const entryCount = days.reduce((sum, day) => sum + day.entries.length, 0);

  return (
    <section className={styles.horizonCard} aria-labelledby="horizon-title">
      <header className={styles.horizonHeader}>
        <div>
          <h2 id="horizon-title" className={styles.panelTitle}>Lịch thu hoạch 14 ngày tới</h2>
          <p className={styles.panelNote}>
            {entryCount > 0 ? `${entryCount} ${entryNoun} đến ngày thu hoạch` : `Chưa có ${entryNoun} nào thu hoạch trong 14 ngày tới`}
            {laterCount > 0 && ` · thêm ${laterCount} sau đó`}
          </p>
        </div>
      </header>
      <ol className={styles.horizonStrip}>
        {days.map((day, index) => (
          <HorizonColumn key={day.dateKey} day={day} monthLabel={monthLabelFor(day, index, days)} />
        ))}
      </ol>
    </section>
  );
}

function HorizonColumn({ day, monthLabel }: { day: HorizonDay; monthLabel: string | null }) {
  const visibleEntries = day.entries.slice(0, MAX_VISIBLE_ENTRIES_PER_DAY);
  const hiddenCount = day.entries.length - visibleEntries.length;
  const columnClassName = [styles.horizonDay, day.isToday && styles.horizonToday, day.isWeekend && styles.horizonWeekend].filter(Boolean).join(' ');

  return (
    <li className={columnClassName} aria-label={day.date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}>
      <span className={styles.horizonMonth} aria-hidden="true">{monthLabel ?? ' '}</span>
      <span className={styles.horizonWeekday}>{day.isToday ? 'Hôm nay' : WEEKDAY_LABELS[day.date.getDay()]}</span>
      <span className={styles.horizonDate}>{day.date.getDate()}</span>
      <span className={styles.horizonStem} aria-hidden="true" />
      <div className={styles.horizonEntries}>
        {visibleEntries.map((entry) => (
          <span key={entry.id} className={styles.horizonEntry} title={`${entry.cropName} · ${entry.detail}`}>
            <span className={styles.horizonEntryCrop}>{entry.cropName}</span>
            <span className={styles.horizonEntryDetail}>{entry.detail}</span>
          </span>
        ))}
        {hiddenCount > 0 && <span className={styles.horizonMore}>+{hiddenCount} nữa</span>}
      </div>
    </li>
  );
}
