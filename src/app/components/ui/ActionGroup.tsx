import { Children, type CSSProperties, type ReactNode } from 'react';
import styles from './ActionGroup.module.css';

const MAX_SECONDARY_COLUMNS = 3;
const WRAPPED_SECONDARY_COLUMNS = 2;
const STACK_ON_MOBILE_FROM = 2;

function secondaryColumnCount(secondaryTotal: number): number {
  return secondaryTotal <= MAX_SECONDARY_COLUMNS ? secondaryTotal : WRAPPED_SECONDARY_COLUMNS;
}

export function ActionGroup({ children, stacked = false }: { children: ReactNode; stacked?: boolean }) {
  const actions = Children.toArray(children);
  if (actions.length === 0) return null;

  if (actions.length <= 2) {
    const layout = stacked || actions.length === 1 ? styles.stacked : styles.pair;
    return <div className={`${styles.group} ${layout}`}>{actions}</div>;
  }

  const [primary, ...secondary] = actions;
  const columns = { '--secondary-columns': secondaryColumnCount(secondary.length) } as CSSProperties;
  const stackOnMobile = secondary.length >= STACK_ON_MOBILE_FROM;
  return (
    <div className={`${styles.group} ${styles.stacked}`}>
      {primary}
      <div className={`${styles.secondary} ${stackOnMobile ? styles.crowded : ''}`} style={columns}>{secondary}</div>
    </div>
  );
}
