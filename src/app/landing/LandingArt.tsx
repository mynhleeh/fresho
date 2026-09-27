import styles from './landing.module.css';

export function GrowthStagesArt() {
  return (
    <svg viewBox="0 0 360 180" className={styles.panelArt} role="img" aria-label="Cây trồng lớn dần từ hạt giống tới lúc thu hoạch">
      <path d="M10 150 C 120 138, 240 138, 350 150" stroke="#8fb472" strokeWidth="2.5" fill="none" />
      <path d="M0 150 h360 v30 h-360 Z" fill="#cfe0b4" />
      <g transform="translate(52 150)">
        <ellipse cx="0" cy="-5" rx="9" ry="6" fill="#8a6a3c" />
        <path d="M0 -10 C 1 -16, 4 -18, 7 -18" stroke="#4c8b3a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(150 150)">
        <path d="M0 0 C -1 -18, 1 -34, 0 -48" stroke="#2f6b2a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0 -26 C -18 -34, -28 -26, -30 -16 C -16 -14, -6 -18, 0 -26 Z" fill="#4c8b3a" />
        <path d="M0 -38 C 16 -50, 30 -46, 32 -34 C 18 -30, 8 -32, 0 -38 Z" fill="#6aa84f" />
      </g>
      <g transform="translate(270 150)">
        <path d="M0 0 C -2 -30, 2 -62, 0 -96" stroke="#2f6b2a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M0 -40 C -26 -50, -40 -38, -42 -24 C -22 -22, -8 -28, 0 -40 Z" fill="#4c8b3a" />
        <path d="M0 -66 C 24 -80, 42 -72, 44 -56 C 24 -52, 10 -56, 0 -66 Z" fill="#6aa84f" />
        <circle cx="-20" cy="-60" r="11" fill="#d9532b" />
        <circle cx="20" cy="-30" r="12" fill="#e0643a" />
        <circle cx="-4" cy="-98" r="9" fill="#d9532b" />
        <path d="M-20 -71 l0 -4 M20 -42 l0 -4 M-4 -107 l0 -4" stroke="#2f6b2a" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <g className={styles.artLabels}>
        <text x="52" y="172" textAnchor="middle">Đăng lô</text>
        <text x="150" y="172" textAnchor="middle">Nhận đặt trước</text>
        <text x="270" y="172" textAnchor="middle">Thu hoạch</text>
      </g>
    </svg>
  );
}

export function ProduceCrateArt() {
  return (
    <svg viewBox="0 0 360 180" className={styles.panelArt} role="img" aria-label="Thùng nông sản tươi xếp sẵn chờ giao cho người mua">
      <path d="M0 156 h360 v24 h-360 Z" fill="#e7dcc0" />
      <g transform="translate(70 76)">
        <circle cx="18" cy="6" r="15" fill="#e0643a" />
        <circle cx="46" cy="2" r="16" fill="#d9532b" />
        <circle cx="74" cy="8" r="14" fill="#e0643a" />
        <circle cx="100" cy="4" r="15" fill="#d9532b" />
        <rect x="0" y="10" width="120" height="70" rx="6" fill="#c89a5b" />
        <path d="M0 33 h120 M0 56 h120" stroke="#a87b42" strokeWidth="3" />
        <path d="M14 10 v70 M106 10 v70" stroke="#a87b42" strokeWidth="3" />
      </g>
      <g transform="translate(200 96)">
        <path d="M10 -6 C 6 -24, 20 -30, 26 -12 M40 -8 C 38 -28, 54 -30, 56 -10 M72 -6 C 72 -24, 86 -26, 86 -8" stroke="#4c8b3a" strokeWidth="9" fill="none" strokeLinecap="round" />
        <rect x="0" y="0" width="98" height="60" rx="6" fill="#b88a4d" />
        <path d="M0 20 h98 M0 40 h98" stroke="#97693a" strokeWidth="3" />
      </g>
      <g transform="translate(252 40)">
        <rect x="0" y="0" width="74" height="44" rx="8" fill="#fffdf6" stroke="#1b5e20" strokeWidth="2.5" />
        <path d="M12 16 h50 M12 28 h32" stroke="#1b5e20" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function SignatureFlourish() {
  return (
    <svg viewBox="0 0 220 24" className={styles.flourish} aria-hidden="true">
      <path d="M4 16 C 40 4, 80 4, 110 12 S 180 22, 216 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
