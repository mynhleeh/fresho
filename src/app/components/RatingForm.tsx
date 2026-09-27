'use client';
import { useState } from 'react';
import { Button } from './Button';
import styles from './RatingForm.module.css';

export function RatingForm({ preOrderId, alreadyRated, onSubmitted }: { preOrderId: string; alreadyRated: boolean; onSubmitted: () => void }) {
  const [qualityScore, setQualityScore] = useState(5);
  const [timelinessScore, setTimelinessScore] = useState(5);
  const [commitmentScore, setCommitmentScore] = useState(5);
  const [submitted, setSubmitted] = useState(alreadyRated);

  async function submit() {
    const res = await fetch(`/api/preorders/${preOrderId}/rating`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qualityScore, timelinessScore, commitmentScore }),
    });
    if (res.ok) {
      setSubmitted(true);
      onSubmitted();
    }
  }

  if (submitted) {
    return <div className={styles.done}>Đã đánh giá giao dịch này.</div>;
  }

  return (
    <div className={styles.form}>
      <span className={styles.title}>Đánh giá giao dịch</span>
      <label>
        Chất lượng
        <select value={qualityScore} onChange={(e) => setQualityScore(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label>
        Đúng hẹn
        <select value={timelinessScore} onChange={(e) => setTimelinessScore(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label>
        Tuân thủ cam kết
        <select value={commitmentScore} onChange={(e) => setCommitmentScore(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <Button onClick={submit}>Gửi đánh giá</Button>
    </div>
  );
}
