'use client';
import { useState, type FormEvent } from 'react';
import { Button } from '../components/Button';
import { readAccountErrorMessage } from './accountErrors';
import styles from './page.module.css';

const MIN_PASSWORD_LENGTH = 6;

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const meetsMinLength = newPassword.length >= MIN_PASSWORD_LENGTH;
  const confirmationMismatch = confirmNewPassword !== '' && confirmNewPassword !== newPassword;
  const canSubmit = currentPassword !== '' && meetsMinLength && confirmNewPassword === newPassword && !saving;

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSavedNotice(false);
    const response = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);
    if (!response.ok) {
      setErrorMessage(await readAccountErrorMessage(response));
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setSavedNotice(true);
  }

  return (
    <form className={styles.card} aria-labelledby="password-title" onSubmit={changePassword}>
      <header className={styles.cardHeader}>
        <h2 id="password-title" className={styles.cardTitle}>Bảo mật</h2>
        <p className={styles.cardDescription}>Đổi mật khẩu đăng nhập của bạn.</p>
      </header>
      <div className={styles.fieldStack}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Mật khẩu hiện tại</span>
          <input className={styles.input} type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Mật khẩu mới</span>
          <input className={styles.input} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <span className={meetsMinLength ? styles.fieldHintMet : styles.fieldHint}>Tối thiểu {MIN_PASSWORD_LENGTH} ký tự</span>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Xác nhận mật khẩu mới</span>
          <input
            className={styles.input}
            type="password"
            autoComplete="new-password"
            aria-invalid={confirmationMismatch}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          {confirmationMismatch && <span className={styles.fieldError}>Mật khẩu xác nhận không khớp</span>}
        </label>
      </div>
      <footer className={styles.cardFooter}>
        {errorMessage && <span role="alert" className={styles.statusError}>{errorMessage}</span>}
        {!errorMessage && savedNotice && <span role="status" className={styles.statusSuccess}>Đã cập nhật mật khẩu</span>}
        {!errorMessage && !savedNotice && <span />}
        <Button type="submit" variant="outline" disabled={!canSubmit}>
          {saving ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}
        </Button>
      </footer>
    </form>
  );
}
