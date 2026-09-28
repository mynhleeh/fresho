'use client';
import { useEffect, useState } from 'react';

function readStored<Value>(storageKey: string, fallback: Value): Value {
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    return stored === null ? fallback : (JSON.parse(stored) as Value);
  } catch {
    return fallback;
  }
}

export function useSessionState<Value>(storageKey: string, fallback: Value) {
  const [value, setValue] = useState<Value>(() => readStored(storageKey, fallback));

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      return;
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}
