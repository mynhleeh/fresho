'use client';
import { useCallback, useEffect } from 'react';

const scrollKeyOf = (listHref: string) => `list-scroll:${listHref}`;
const returnKeyOf = (listHref: string) => `list-return:${listHref}`;

function readStored(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    return;
  }
}

function currentScrollTop(): number {
  const content = document.querySelector('main');
  return Math.max(content?.scrollTop ?? 0, window.scrollY);
}

function scrollContentTo(top: number) {
  const content = document.querySelector('main');
  if (content) content.scrollTop = top;
  window.scrollTo({ top });
}

function removeStored(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    return;
  }
}

export function readReturnUrl(listHref: string): string | null {
  return readStored(returnKeyOf(listHref));
}

export function useRestoredScroll(listHref: string, contentReady: boolean) {
  useEffect(() => {
    if (!contentReady) return;
    const stored = readStored(scrollKeyOf(listHref));
    if (stored === null) return;
    const top = Number(stored);
    if (Number.isFinite(top)) scrollContentTo(top);
    removeStored(scrollKeyOf(listHref));
  }, [listHref, contentReady]);

  return useCallback(() => {
    writeStored(scrollKeyOf(listHref), String(currentScrollTop()));
    writeStored(returnKeyOf(listHref), `${window.location.pathname}${window.location.search}`);
  }, [listHref]);
}
