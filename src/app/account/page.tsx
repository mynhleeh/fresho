'use client';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { CameraIcon } from '../components/icons';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS } from '../auth/roleLabels';
import type { AppRole } from '../components/roleNav';
import type { AccountProfile } from '@/lib/services/accountService';
import { readAccountErrorMessage } from './accountErrors';
import { ProfileDetailsSection } from './ProfileDetailsSection';
import { PasswordSection } from './PasswordSection';
import styles from './page.module.css';

export default function AccountSettings() {
  const { user } = useAuth();
  const role = (user?.role ?? 'farmer') as AppRole;
  const [account, setAccount] = useState<AccountProfile | null>(null);

  async function loadAccount() {
    const response = await fetch('/api/account');
    if (response.ok) setAccount(await response.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { loadAccount(); }, []);

  return (
    <AppShell role={role}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <span className={styles.eyebrow}>Tài khoản</span>
          <h1 className={styles.heading}>Hồ sơ cá nhân</h1>
          <p className={styles.subheading}>Quản lý thông tin hiển thị với đối tác và bảo mật đăng nhập của bạn.</p>
        </header>
        {account ? (
          <>
            <AccountIdentityCard account={account} onAvatarChanged={setAccount} />
            <div className={styles.sectionGrid}>
              <ProfileDetailsSection key={account.id} account={account} onSaved={setAccount} />
              <PasswordSection />
            </div>
          </>
        ) : (
          <div className={styles.loadingCard} aria-busy="true">Đang tải thông tin tài khoản…</div>
        )}
      </div>
    </AppShell>
  );
}

function AccountIdentityCard({ account, onAvatarChanged }: { account: AccountProfile; onAvatarChanged: (account: AccountProfile) => void }) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadAvatar(file: File) {
    setUploading(true);
    setUploadError(null);
    const body = new FormData();
    body.set('avatar', file);
    const response = await fetch('/api/account/avatar', { method: 'POST', body });
    setUploading(false);
    if (!response.ok) {
      setUploadError(await readAccountErrorMessage(response));
      return;
    }
    onAvatarChanged(await response.json());
  }

  return (
    <section className={styles.identityCard} aria-label="Thông tin tài khoản">
      <div className={styles.avatarFrame}>
        {account.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- small user-uploaded avatar, not worth next/image config here
          <img src={account.avatarUrl} alt={`Ảnh đại diện của ${account.name}`} className={styles.avatar} />
        ) : (
          <span className={styles.avatarInitials} aria-hidden="true">{initialsOf(account.name)}</span>
        )}
        <button
          type="button"
          className={styles.avatarButton}
          aria-label="Đổi ảnh đại diện"
          disabled={uploading}
          onClick={() => avatarInputRef.current?.click()}
        >
          <CameraIcon className={styles.avatarButtonIcon} />
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) uploadAvatar(file);
          }}
        />
      </div>
      <div className={styles.identityText}>
        <div className={styles.identityNameRow}>
          <span className={styles.identityName}>{account.name}</span>
          <span className={styles.roleBadge}>{ROLE_LABELS[account.role] ?? account.role}</span>
        </div>
        <span className={styles.identityMeta}>{account.phone}</span>
        {uploadError && <span role="alert" className={styles.statusError}>{uploadError}</span>}
        {!uploadError && <span className={styles.identityHint}>{uploading ? 'Đang tải ảnh lên…' : 'Ảnh JPG, PNG hoặc WEBP'}</span>}
      </div>
    </section>
  );
}

function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}
