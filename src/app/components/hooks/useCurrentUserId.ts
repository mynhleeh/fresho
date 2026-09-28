'use client';
import { useEffect, useState } from 'react';

export function useCurrentUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => setUserId(user?.id ?? null))
      .catch(() => setUserId(null));
  }, []);

  return userId;
}
