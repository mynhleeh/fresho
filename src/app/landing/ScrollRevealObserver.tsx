'use client';
import { useEffect } from 'react';

const REVEAL_ROOT_SELECTOR = '[data-reveal-root]';
const REVEAL_TARGET_SELECTOR = '[data-reveal]';

export function ScrollRevealObserver() {
  useEffect(() => {
    const revealRoot = document.querySelector(REVEAL_ROOT_SELECTOR);
    if (!revealRoot) return;

    const observer = new IntersectionObserver(markVisibleTargets, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealRoot.querySelectorAll(REVEAL_TARGET_SELECTOR).forEach((target) => observer.observe(target));
    revealRoot.setAttribute('data-reveal-ready', '');

    function markVisibleTargets(entries: IntersectionObserverEntry[]) {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-revealed', '');
        observer.unobserve(entry.target);
      }
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
