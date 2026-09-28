'use client';
import { useEffect } from 'react';

export function useCloseWhenMissing(openId: string | null, isPresent: boolean, onMissing: () => void) {
  useEffect(() => {
    if (openId !== null && !isPresent) onMissing();
  }, [openId, isPresent, onMissing]);
}
