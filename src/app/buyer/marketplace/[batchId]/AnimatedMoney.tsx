import type { CSSProperties } from 'react';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { useCountUp } from './useCountUp';

const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

export function AnimatedMoney({ amount, className, announce }: { amount: number; className?: string; announce?: boolean }) {
  const displayed = useCountUp(amount);
  return (
    <span className={className} style={{ position: 'relative' }}>
      <span aria-hidden="true">{formatVnd(displayed)}</span>
      <span style={VISUALLY_HIDDEN} aria-live={announce ? 'polite' : undefined} aria-atomic={announce ? true : undefined}>{formatVnd(amount)}</span>
    </span>
  );
}
