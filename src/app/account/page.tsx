'use client';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { UserCircleIcon } from '../components/icons';
import { useAuth } from '../auth/AuthContext';
import type { AppRole } from '../components/roleNav';
import styles from './page.module.css';

type Account = { id: string; name: string; phone: string; address: string; role: string; avatarUrl: string | null };

export default function AccountSettings() {
  const { user } = useAuth();
  const role = (user?.role ?? 'farmer') as AppRole;

  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch('/api/account');
    if (!res.ok) return;
    const data: Account = await res.json();
    setAccount(data);
    setName(data.name);
    setPhone(data.phone);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function saveProfile() {
    setProfileError(null);
    setProfileSaved(false);
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });
    if (!res.ok) {
      const error = await res.json();
      setProfileError(error.message ?? 'Đã xảy ra lỗi');
      return;
    }
    setAccount(await res.json());
    setProfileSaved(true);
  }

  async function changePassword() {
    setPasswordError(null);
    setPasswordSaved(false);
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Mật khẩu mới xác nhận không khớp');
      return;
    }
    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const error = await res.json();
      setPasswordError(error.message ?? 'Đã xảy ra lỗi');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordSaved(true);
  }

  async function uploadAvatar(file: File) {
    const body = new FormData();
    body.set('avatar', file);
    const res = await fetch('/api/account/avatar', { method: 'POST', body });
    if (!res.ok) {
      const error = await res.json();
      alert(error.message ?? error.code);
      return;
    }
    setAccount(await res.json());
  }

  return (
    <AppShell role={role}>
      <div className={styles.page}>
        <h1 className={styles.heading}>Quản lý tài khoản</h1>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Ảnh đại diện</span>
          <div className={styles.avatarRow}>
            {account?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- small user-uploaded avatar, not worth next/image config here
              <img src={account.avatarUrl} alt={`Ảnh đại diện của ${account.name}`} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <UserCircleIcon className={styles.avatar} />
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
            <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
              Đổi ảnh đại diện
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Thông tin cá nhân</span>
          <div className={styles.form}>
            <label>
              Họ tên
              <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Số điện thoại
              <input autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            {profileError && <span className={styles.error}>{profileError}</span>}
            {profileSaved && <span className={styles.success}>Đã lưu thông tin</span>}
            <Button type="button" onClick={saveProfile}>Lưu thay đổi</Button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Đổi mật khẩu</span>
          <div className={styles.form}>
            <label>
              Mật khẩu hiện tại
              <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </label>
            <label>
              Mật khẩu mới
              <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            <label>
              Xác nhận mật khẩu mới
              <input type="password" autoComplete="new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </label>
            {passwordError && <span className={styles.error}>{passwordError}</span>}
            {passwordSaved && <span className={styles.success}>Đã đổi mật khẩu</span>}
            <Button type="button" onClick={changePassword}>Đổi mật khẩu</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
