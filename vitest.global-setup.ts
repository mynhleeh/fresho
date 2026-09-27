import { execSync } from 'child_process';
import path from 'path';
import { loadTestEnv } from './tests/helpers/loadTestEnv';

// Runs once before the whole suite (in the main process): pushes the current
// Prisma schema onto test.db so it always has an up-to-date, isolated
// schema before any test touches it. dev.db is never referenced here.
export default function globalSetup() {
  loadTestEnv();

  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: path.resolve(__dirname),
    env: process.env,
    stdio: 'inherit',
  });
}
