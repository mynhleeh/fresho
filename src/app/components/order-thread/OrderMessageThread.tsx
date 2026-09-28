'use client';
import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import styles from './OrderMessageThread.module.css';

type Message = { id: string; senderId: string; body: string; createdAt: string };

export function OrderMessageThread({ preOrderId, currentUserId }: { preOrderId: string; currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');

  async function load() {
    const res = await fetch(`/api/preorders/${preOrderId}/messages`);
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-open; not the cascading-render pattern this rule targets
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reload when the panel opens, not on every render
  }, [open]);

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
              placeholder="Nhắn tin về đơn hàng này..."
            />
            <Button onClick={send}>Gửi</Button>
          </div>
        </div>
      )}
    </div>
  );
}
