'use client';
import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import styles from './OrderMessageThread.module.css';

type Message = { id: string; senderId: string; body: string; createdAt: string };

type Props = { preOrderId: string; currentUserId: string; initiallyOpen?: boolean; pollMs?: number };

export function OrderMessageThread({ preOrderId, currentUserId, initiallyOpen = false, pollMs }: Props) {
  const [open, setOpen] = useState(initiallyOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');

  async function load() {
    const res = await fetch(`/api/preorders/${preOrderId}/messages`).catch(() => null);
    if (res?.ok) setMessages(await res.json());
  }

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-open; not the cascading-render pattern this rule targets
    load();
    if (!pollMs) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, pollMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reload when the panel opens or the interval changes, not on every render
  }, [open, pollMs]);

  async function send() {
    if (!draft.trim()) return;
    await fetch(`/api/preorders/${preOrderId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: draft }),
    });
    setDraft('');
    load();
  }

  return (
    <div className={styles.thread}>
      <Button variant="outline" onClick={() => setOpen((v) => !v)}>
        {open ? 'Ẩn trao đổi' : 'Trao đổi'}
      </Button>
      {open && (
        <div className={styles.panel}>
          <div className={styles.messages}>
            {messages.length === 0 && <div className={styles.empty}>Chưa có tin nhắn nào.</div>}
            {messages.map((m) => (
              <div key={m.id} className={m.senderId === currentUserId ? styles.mine : styles.theirs}>
                {m.body}
              </div>
            ))}
          </div>
          <div className={styles.composer}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nhắn tin…"
            />
            <Button onClick={send}>Gửi</Button>
          </div>
        </div>
      )}
    </div>
  );
}
