import { buildTimeline } from '@/lib/order/orderWorkflow';
import { preOrderStatusInfo } from '@/lib/order/orderStatus';
import styles from './JourneyPath.module.css';

type Point = { x: number; y: number };

const STOPS: Point[] = [
  { x: 26, y: 68 }, { x: 78, y: 42 }, { x: 132, y: 64 }, { x: 186, y: 36 },
  { x: 240, y: 60 }, { x: 292, y: 38 }, { x: 334, y: 56 },
];

function curveThrough(points: Point[]): string {
  const at = (i: number) => points[Math.min(Math.max(i, 0), points.length - 1)];
  const segments = points.slice(0, -1).map((from, i) => {
    const before = at(i - 1);
    const to = at(i + 1);
    const after = at(i + 2);
    const c1 = `${from.x + (to.x - before.x) / 6} ${from.y + (to.y - before.y) / 6}`;
    const c2 = `${to.x - (after.x - from.x) / 6} ${to.y - (after.y - from.y) / 6}`;
    return `C ${c1}, ${c2}, ${to.x} ${to.y}`;
  });
  return `M ${points[0].x} ${points[0].y} ${segments.join(' ')}`;
}

const ROAD_PATH = curveThrough(STOPS);

function Farm({ at }: { at: Point }) {
  return (
    <g transform={`translate(${at.x} ${at.y})`} className={styles.glyph}>
      <path d="M0 -6 C -1 -14, 0 -20, 0 -24" stroke="var(--color-leaf-deep)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M0 -14 C -10 -18, -14 -12, -14 -8 C -6 -8, -2 -10, 0 -14 Z" fill="var(--color-leaf-bright)" />
      <path d="M0 -20 C 8 -26, 15 -22, 15 -17 C 8 -16, 3 -16, 0 -20 Z" fill="var(--color-leaf-mid)" />
    </g>
  );
}

function Kitchen({ at }: { at: Point }) {
  return (
    <g transform={`translate(${at.x} ${at.y})`} className={styles.glyph}>
      <rect x="-11" y="-16" width="22" height="14" rx="2" fill="var(--color-paper)" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M-14 -15 L0 -26 L14 -15 Z" fill="var(--color-primary)" />
      <rect x="-3" y="-11" width="6" height="9" rx="1" fill="var(--color-gold-tint)" />
    </g>
  );
}

type StopState = 'done' | 'current' | 'upcoming';

function Stop({ at, state }: { at: Point; state: StopState }) {
  if (state === 'current') {
    return (
      <g>
        <circle cx={at.x} cy={at.y} r="15" className={styles.pulse} />
        <circle cx={at.x} cy={at.y} r="9" fill="var(--color-accent-gold)" stroke="var(--color-soil)" strokeWidth="2.5" />
      </g>
    );
  }
  const done = state === 'done';
  return (
    <circle
      cx={at.x} cy={at.y} r={done ? 7 : 5.5}
      className={done ? styles.done : styles.upcoming}
    />
  );
}

export function JourneyPath({ status, label }: { status: string; label?: string }) {
  const steps = buildTimeline(status);
  const stopped = status === 'rejected' || status === 'cancelled';
  const reached = steps.filter((step) => step.state !== 'upcoming').length;
  const walked = STOPS.slice(0, Math.max(reached, 1));
  const currentLabel = label ?? preOrderStatusInfo(status).label;

  return (
    <figure className={styles.wrap} data-stopped={stopped || undefined}>
      <svg viewBox="0 0 360 96" className={styles.svg} role="img" aria-label={stopped ? `${currentLabel}, đơn không tiếp tục` : `${currentLabel}, chặng ${reached} trên ${steps.length}`}>
        <path d="M0 88 C 90 78, 270 78, 360 88 V96 H0 Z" fill="var(--color-sage)" opacity="0.55" />
        <path d={ROAD_PATH} className={styles.road} pathLength={1} />
        {walked.length > 1 && !stopped && <path d={curveThrough(walked)} className={styles.walked} pathLength={1} />}
        <Farm at={STOPS[0]} />
        <Kitchen at={STOPS[STOPS.length - 1]} />
        {steps.map((step, index) => <Stop key={step.status} at={STOPS[index]} state={stopped ? 'upcoming' : step.state} />)}
      </svg>
      <figcaption className={styles.caption}>
        <span className={styles.label}>{currentLabel}</span>
        {!stopped && <span className={styles.count}>{reached}/{steps.length}</span>}
      </figcaption>
    </figure>
  );
}
