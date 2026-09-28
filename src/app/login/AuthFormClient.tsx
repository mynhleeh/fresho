'use client';

import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS } from '../auth/roleLabels';
import styles from './AuthFormClient.module.css';

// admin/logistics accounts are provisioned out-of-band (seed/ops), not via public self-signup —
// mirrors the SELF_SIGNUP_ROLES restriction in src/lib/services/authService.ts.
const SELF_SIGNUP_ROLES = ['farmer', 'buyer'] as const;

const ROLE_REDIRECT: Record<string, string> = {
  farmer: '/farmer/batches',
  buyer: '/buyer/marketplace',
  admin: '/admin/orders',
  logistics: '/logistics/deliveries',
};

export default function AuthFormClient() {
  const { login: setSessionUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('farmer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp. Hãy nhập lại cho giống mật khẩu ở ô trên.');
      return;
    }

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = mode === 'login' ? { phone, password } : { name, phone, address, role, password };

    setSubmitting(true);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);

    if (!res || !res.ok) {
      setSubmitting(false);
      setError(res ? await readApiErrorMessage(res) : 'Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.');
      return;
    }

    const user = await res.json();
    setSessionUser(user);
    window.location.href = ROLE_REDIRECT[user.role] ?? '/';
  }

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Chọn đăng nhập hoặc đăng ký">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
          onClick={() => setMode('login')}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
          onClick={() => setMode('signup')}
        >
          Đăng ký
        </button>
      </div>

      <form className={styles.form} onSubmit={submit}>
        {mode === 'signup' && (
          <label>
            Họ tên
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label>
          Số điện thoại
          <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Mật khẩu
          <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {mode === 'signup' && (
          <>
            <label>
              Xác nhận mật khẩu
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
            <label>
              Địa chỉ
              <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <label>
              Vai trò
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {SELF_SIGNUP_ROLES.map((value) => (
                  <option key={value} value={value}>{ROLE_LABELS[value]}</option>
                ))}
              </select>
            </label>
          </>
        )}
        {error && <span role="alert" className={styles.error}>{error}</span>}
        <Button type="submit" loading={submitting}>
          {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </Button>
      </form>
    </div>
  );
}
