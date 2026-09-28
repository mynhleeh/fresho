'use client';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { readAccountErrorMessage } from './accountErrors';
import type { AccountProfile as Account } from '@/lib/services/accountService';
import styles from './page.module.css';

type ProfileDetailsSectionProps = {
  account: Account;
  onSaved: (account: Account) => void;
};

export function ProfileDetailsSection({ account, onSaved }: ProfileDetailsSectionProps) {
  const [name, setName] = useState(account.name);
  const [phone, setPhone] = useState(account.phone);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const hasChanges = name.trim() !== account.name || phone.trim() !== account.phone;
  const canSave = hasChanges && name.trim() !== '' && phone.trim() !== '' && !saving;

  function discardChanges() {
    setName(account.name);
    setPhone(account.phone);
    setErrorMessage(null);
  }

  async function saveProfile() {
    setSaving(true);
    setErrorMessage(null);
    setSavedNotice(false);
    const response = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
    });
    setSaving(false);
    if (!response.ok) {
      setErrorMessage(await readAccountErrorMessage(response));
      return;
    }
    const savedAccount: Account = await response.json();
    setName(savedAccount.name);
    setPhone(savedAccount.phone);
    setSavedNotice(true);
    onSaved(savedAccount);
  }

  return (
    <section className={styles.card} aria-labelledby="profile-details-title">
      <header className={styles.cardHeader}>
        <h2 id="profile-details-title" className={styles.cardTitle}>Thông tin cá nhân</h2>
        <p className={styles.cardDescription}>Tên và số điện thoại được hiển thị cho đối tác khi giao dịch.</p>
      </header>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Họ và tên</span>
          <input className={styles.input} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Số điện thoại</span>
          <input className={styles.input} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.fieldLabel}>Địa chỉ</span>
          <input className={`${styles.input} ${styles.inputReadonly}`} value={account.address} readOnly />
          <span className={styles.fieldHint}>Địa chỉ được xác minh khi đăng ký. Liên hệ quản trị viên nếu cần thay đổi.</span>
        </label>
      </div>
      <footer className={styles.cardFooter}>
        <ProfileSaveStatus hasChanges={hasChanges} errorMessage={errorMessage} savedNotice={savedNotice} />
        <div className={styles.footerActions}>
          <Button type="button" variant="outline" className={styles.secondaryButton} disabled={!hasChanges || saving} onClick={discardChanges}>
            Hoàn tác
          </Button>
          <Button type="button" disabled={!canSave} onClick={saveProfile}>
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </footer>
    </section>
  );
}

function ProfileSaveStatus({ hasChanges, errorMessage, savedNotice }: { hasChanges: boolean; errorMessage: string | null; savedNotice: boolean }) {
  if (errorMessage) return <span role="alert" className={styles.statusError}>{errorMessage}</span>;
  if (hasChanges) return <span className={styles.statusPending}>Bạn có thay đổi chưa lưu</span>;
  if (savedNotice) return <span role="status" className={styles.statusSuccess}>Đã lưu thông tin</span>;
  return <span />;
}
