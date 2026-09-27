import fs from 'fs';
import path from 'path';

/**
 * Minimal .env parser (no extra dependency) that loads `.env.test` into
 * process.env, so the test process (and the Prisma Client it constructs)
 * always talks to the dedicated SQLite test database, never `dev.db`.
 */
export function loadTestEnv() {
  const envPath = path.resolve(__dirname, '../../.env.test');
  const contents = fs.readFileSync(envPath, 'utf-8');

  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
