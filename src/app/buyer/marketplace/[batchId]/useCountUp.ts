import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 500;

export function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  const latestValue = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = latestValue.current;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = prefersReducedMotion ? 1 : Math.min((now - startedAt) / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (target - from) * eased);
      latestValue.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}
