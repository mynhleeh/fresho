'use client';
import { useEffect, useRef, useState } from 'react';

const COUNT_UP_MS = 700;

export function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = shownRef.current;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const progress = reduceMotion ? 1 : Math.min(1, (now - start) / COUNT_UP_MS);
      shownRef.current = Math.round(from + (target - from) * progress);
      setValue(shownRef.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}
