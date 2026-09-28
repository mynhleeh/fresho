export function PickupArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 96" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="200" height="96" fill="var(--color-cream-edge)" />
      <circle cx="160" cy="24" r="14" fill="var(--color-stage-confirming)" />
      <path d="M-10 70 C 40 52, 90 58, 130 64 C 160 68, 190 58, 210 60 L 210 96 L -10 96 Z" fill="var(--color-sage-strong)" />
      <path d="M-10 82 C 50 72, 120 78, 210 74 L 210 96 L -10 96 Z" fill="var(--color-stage-handover)" />
      <g transform="translate(120 34)">
        <path d="M0 0 V46 M44 0 V46" stroke="var(--color-gold-deep)" strokeWidth="5" strokeLinecap="round" />
        <path d="M0 10 H44 M0 26 H44" stroke="var(--color-gold-deep)" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g transform="translate(60 38)">
        <circle cx="0" cy="0" r="8" fill="var(--color-gold-tint)" />
        <rect x="-10" y="9" width="20" height="26" rx="8" fill="var(--color-primary)" />
        <path d="M10 14 L 24 30" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" />
        <path d="M-5 33 L -7 54 M5 33 L 8 54" stroke="var(--color-stage-delivered)" strokeWidth="6" strokeLinecap="round" />
        <rect x="12" y="28" width="22" height="16" rx="3" fill="var(--color-accent-gold)" />
        <path d="M14 28 C 14 20, 32 20, 32 28" stroke="var(--color-gold-deep)" strokeWidth="2.4" fill="none" />
      </g>
    </svg>
  );
}

export function CarrierArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 96" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="200" height="96" fill="var(--color-cream-edge)" />
      <circle cx="40" cy="24" r="14" fill="var(--color-stage-confirming)" />
      <path d="M-10 56 C 50 44, 120 50, 210 46 L 210 96 L -10 96 Z" fill="var(--color-sage-strong)" />
      <path d="M-10 70 H210 V96 H-10 Z" fill="var(--color-text-muted)" />
      <path d="M-4 83 H204" stroke="var(--color-paper)" strokeWidth="3" strokeDasharray="14 10" />
      <g transform="translate(46 32)">
        <rect x="0" y="0" width="70" height="38" rx="5" fill="var(--color-paper)" stroke="var(--color-primary)" strokeWidth="3" />
        <path d="M14 0 V38 M28 0 V38" stroke="var(--color-sage)" strokeWidth="3" />
        <path d="M70 10 H92 L104 24 V38 H70 Z" fill="var(--color-primary)" />
        <path d="M76 15 H88 L96 24 H76 Z" fill="var(--color-sage)" />
        <circle cx="22" cy="40" r="8" fill="var(--color-ink)" />
        <circle cx="22" cy="40" r="3" fill="var(--color-border-strong)" />
        <circle cx="84" cy="40" r="8" fill="var(--color-ink)" />
        <circle cx="84" cy="40" r="3" fill="var(--color-border-strong)" />
      </g>
    </svg>
  );
}
