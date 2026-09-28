'use client';
import { useEffect } from 'react';

export function useScrollToHash() {
  useEffect(() => {
    if (!window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, []);
}
