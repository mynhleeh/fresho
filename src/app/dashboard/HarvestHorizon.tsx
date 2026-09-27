import type { CSSProperties } from 'react';
import type { HorizonDay } from '@/lib/dashboardSummary';
import styles from './page.module.css';

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MAX_AGENDA_DAYS = 5;

type HarvestHorizonProps = { days: HorizonDay[]; laterCount: number; entryNoun: string };

function daysAwayLabel(offset: number): string {
  if (offset === 0) return 'Hôm nay';
  if (offset === 1) return 'Ngày mai';
  return `Còn ${offset} ngày`;
}

export function HarvestHorizon({ days, laterCount, entryNoun }: HarvestHorizonProps) {
  const busiestDayCount = Math.max(1, ...days.map((day) => day.entries.length));
  const agendaDays = days.map((day, offset) => ({ day, offset })).filter(({ day }) => day.entries.length > 0);
  const entryCount = agendaDays.reduce((sum, { day }) => sum + day.entries.length, 0);

  return (
    <section className={styles.panel} aria-labelledby="horizon-title">
      <header className={styles.panelHeader}>
        <div>
          <h2 id="horizon-title" className={styles.panelTitle}>Lịch thu hoạch 14 ngày tới</h2>
          <p className={styles.panelNote}>
            {entryCount > 0 ? `${entryCount} ${entryNoun} đến ngày thu hoạch` : `Chưa có ${entryNoun} nào thu hoạch trong 14 ngày tới`}
            {laterCount > 0 && ` · thêm ${laterCount} sau đó`}
          </p>
        </div>
      </header>
      <ol className={styles.densityStrip} aria-hidden="true">
        {days.map((day) => (
          <li
            key={day.dateKey}
            className={day.isToday ? `${styles.densityCell} ${styles.densityToday}` : styles.densityCell}
            style={{ '--density': day.entries.length / busiestDayCount } as CSSProperties}
          >
            <span className={styles.densityWeekday}>{WEEKDAY_LABELS[day.date.getDay()]}</span>
            <span className={styles.densityBar} />
            <span className={styles.densityDate}>{day.date.getDate()}</span>
          </li>
        ))}
      </ol>
      {agendaDays.length > 0 && (
        <ul className={styles.agendaList}>
          {agendaDays.slice(0, MAX_AGENDA_DAYS).map(({ day, offset }) => (
            <li key={day.dateKey} className={styles.agendaDay}>
              <div className={styles.agendaDate}>
                <span className={styles.agendaDateNumber}>{day.date.getDate()}</span>
                <span className={styles.agendaDateMeta}>{WEEKDAY_LABELS[day.date.getDay()]} · Th{day.date.getMonth() + 1}</span>
              </div>
              <ul className={styles.agendaEntries}>
                {day.entries.map((entry) => (
                  <li key={entry.id} className={styles.agendaEntry}>
                    <span className={styles.agendaCrop}>{entry.cropName}</span>
                    <span className={styles.agendaDetail}>{entry.detail}</span>
                  </li>
                ))}
              </ul>
              <span className={offset <= 2 ? `${styles.agendaCountdown} ${styles.agendaSoon}` : styles.agendaCountdown}>{daysAwayLabel(offset)}</span>
            </li>
          ))}
        </ul>
      )}
      {agendaDays.length > MAX_AGENDA_DAYS && (
        <p className={styles.panelNote}>và {agendaDays.length - MAX_AGENDA_DAYS} ngày thu hoạch khác trong 14 ngày tới</p>
      )}
    </section>
  );
}
