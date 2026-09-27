import { loadTestEnv } from './tests/helpers/loadTestEnv';

// Must run before any test file imports '@/lib/db', so the singleton
// PrismaClient it constructs is bound to test.db, never dev.db.
loadTestEnv();
