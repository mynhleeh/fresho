const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function HarvestBatchIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 10h16l-1.5 9a1.5 1.5 0 0 1-1.48 1.25H6.98A1.5 1.5 0 0 1 5.5 19L4 10Z" />
      <path d="M2.5 10h19" />
      <path d="M12 3c-1.8 0-3 1.3-3 3 1.8 0 3-1.3 3-3Z" />
      <path d="M12 3c1.8 0 3 1.3 3 3-1.8 0-3-1.3-3-3Z" />
      <path d="M12 6v4" />
    </svg>
  );
}

export function BuyerStoreIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 9.5 5.2 4h13.6l1.2 5.5" />
      <path d="M3.5 9.5h17L20 20H4L3.5 9.5Z" />
      <path d="M9 20v-5a3 3 0 0 1 6 0v5" />
    </svg>
  );
}

export function DepositIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

export function TrustScoreIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 3.5l2.47 5.15 5.53.57-4.1 3.9 1.1 5.63L12 15.9l-5 2.85 1.1-5.63-4.1-3.9 5.53-.57L12 3.5Z" />
    </svg>
  );
}

export function HandoverTruckIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M2.5 7h11v9h-11z" />
      <path d="M13.5 10.5h4l3 3v2.5h-7z" />
      <circle cx="6.5" cy="18" r="1.6" />
      <circle cx="16.5" cy="18" r="1.6" />
    </svg>
  );
}

export function LeafIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M20 4c-9 0-16 5-16 14 9 0 14-5 16-14Z" />
      <path d="M6 18C10 12 14 8 20 4" />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function SettingsGearIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.55 1.55M7.85 16.15 6.3 17.7M17.7 17.7l-1.55-1.55M7.85 7.85 6.3 6.3" />
    </svg>
  );
}

export function ClipboardOrdersIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5 15 15" />
    </svg>
  );
}

export function WarningIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 3.5 21 19.5H3L12 3.5Z" />
      <path d="M12 10v4" />
      <path d="M12 16.7v.1" />
    </svg>
  );
}

export function LogisticsTruckIcon({ className }: { className?: string }) {
  return <HandoverTruckIcon className={className} />;
}

export function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 3.5 13.4 9l5.6 1.4-5.6 1.4L12 17.3 10.6 11.8 5 10.4 10.6 9 12 3.5Z" />
      <path d="M19 15.5 19.6 17.8 22 18.4 19.6 19 19 21.3 18.4 19 16 18.4 18.4 17.8 19 15.5Z" />
    </svg>
  );
}

export function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
