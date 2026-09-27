import { Fraunces } from 'next/font/google';

export const landingDisplayFont = Fraunces({
  variable: '--font-landing-display',
  subsets: ['latin', 'vietnamese'],
  axes: ['opsz', 'SOFT'],
  style: ['normal', 'italic'],
});
