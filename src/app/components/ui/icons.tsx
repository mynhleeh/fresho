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

export function VegetableIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 3 11 8h2l-1-5Z" />
      <path d="M8 6c-2 0-3 2-3 5 0 4 2 7 4 7s3-3 4-7c-1 0-2-2-2-5-2 0-2 2-3 5Z" />
      <path d="M12 6c2 0 3 2 3 5 0 4-2 7-4 7s-3-3-4-7c1 0 2-2 2-5 2 0 2 2 3 5Z" />
      <path d="M7 18h10" />
    </svg>
  );
}

export function FruitIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="10" r="6" />
      <path d="M12 4c0-1 1-2 2-2" />
      <path d="M8.5 5 7 3.5" />
      <path d="M15.5 5 17 3.5" />
      <path d="M6 18h12" />
    </svg>
  );
}

export function GrainIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M8 3c0 1.5-1 2.5-1 4s1 2.5 1 4-1 2.5-1 4 1 2.5 1 4" />
      <path d="M12 3c0 1.5-1 2.5-1 4s1 2.5 1 4-1 2.5-1 4 1 2.5 1 4" />
      <path d="M16 3c0 1.5-1 2.5-1 4s1 2.5 1 4-1 2.5-1 4 1 2.5 1 4" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function BasketIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6 10h12l-1 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.5L6 10Z" />
      <path d="M6 10h12" />
      <path d="M9 6c0-1 1-2 3-2s3 1 3 2" />
      <path d="M9 10v8" />
      <path d="M15 10v8" />
    </svg>
  );
}

export function HomeIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10" />
      <path d="M10 20.5V15h4v5.5" />
    </svg>
  );
}

export function UserCircleIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="9.5" r="3" />
      <path d="M6 18.5c1.2-2.6 3.5-4 6-4s4.8 1.4 6 4" />
    </svg>
  );
}

export function CameraIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.3 2.4 2.4 4.6-5" />
    </svg>
  );
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function CrossCircleIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  );
}

export function InfoCircleIcon({ className }: { className?: string }) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 8v.1" />
    </svg>
  );
}
