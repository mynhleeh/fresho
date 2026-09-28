import { Button } from '../../../components/ui/Button';
import { ACTION_LABEL, IN_TRANSIT_WAIT_TEXT, PRIMARY_KIND, WAIT_TEXT, secondaryKindsOf, type ActionKind } from '../data/orderActionCopy';
import { actionOf, type FarmerPreOrder } from '../data/orderTypes';
import styles from './orderActionButtons.module.css';

type Props = {
  order: FarmerPreOrder;
  busy: boolean;
  onAct: (order: FarmerPreOrder, kind: ActionKind) => void;
};

export function OrderActionButtons({ order, busy, onAct }: Props) {
  const action = actionOf(order);
  const primaryKind = PRIMARY_KIND[action];
  const waitText = WAIT_TEXT[action] ?? (order.status === 'in_transit' && action === 'none' ? IN_TRANSIT_WAIT_TEXT : undefined);
  const secondaryKinds = secondaryKindsOf(order);
  if (!primaryKind && !waitText && secondaryKinds.length === 0) return null;

  return (
    <div className={styles.actions}>
      {waitText && <p className={styles.wait}>{waitText}</p>}
      {primaryKind && (
        <Button className={styles.primary} disabled={busy} onClick={() => onAct(order, primaryKind)}>
          {ACTION_LABEL[primaryKind]}
        </Button>
      )}
      {secondaryKinds.length > 0 && (
        <div className={styles.secondary}>
          {secondaryKinds.map((kind) => (
            <Button key={kind} variant={kind === 'reject' ? 'danger' : 'outline'} disabled={busy} onClick={() => onAct(order, kind)}>
              {ACTION_LABEL[kind]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
