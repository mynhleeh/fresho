import { Fraunces } from 'next/font/google';

export const displayFont = Fraunces({
  variable: '--font-display',
  subsets: ['latin', 'vietnamese'],
  axes: ['opsz', 'SOFT'],
  style: ['normal', 'italic'],
});
