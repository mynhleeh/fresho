# FRESH O!

Pre-harvest booking marketplace connecting farmers and bulk buyers. See
`.claude/rules/00-project-charter.rule.md` for the domain model and order
lifecycle.

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Tests run against a separate SQLite database (`.env.test`, `DATABASE_URL="file:./test.db"`)
so `npx vitest run` never touches your seeded `dev.db`. No manual setup is needed for it —
`vitest.global-setup.ts` pushes the Prisma schema onto `test.db` automatically before the
suite runs.

Visit http://localhost:3000, pick a seeded user (farmer/buyer/admin/logistics)
to log in.

## Tests

```bash
npx vitest run
```
