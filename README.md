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

## Quick Setup & Sync

Just want the current working tree installed, migrated, and running? Run:

```bash
npm run setup
```

This single command (`scripts/setup.mjs`) does not touch git at all — it only looks at
the files on disk:
- hashes `package.json`/`package-lock.json` and runs `npm install` only if they changed
  (or `node_modules` is missing) since the last `npm run setup`;
- hashes everything under `prisma/` and runs `npx prisma migrate dev` only if it changed;
- copies `.env.example` to `.env` if no `.env` exists yet;
- starts `npx next dev`.

It tracks the last-seen file hashes in `.cache/setup-state.json` (gitignored) to decide
what changed between runs.

Tests run against a separate SQLite database (`.env.test`, `DATABASE_URL="file:./test.db"`)
so `npx vitest run` never touches your seeded `dev.db`. No manual setup is needed for it —
`vitest.global-setup.ts` pushes the Prisma schema onto `test.db` automatically before the
suite runs.

Visit http://localhost:3000/login and log in with one of the seeded demo
accounts below (phone + password — this is demo-scope password auth with a
bcrypt-hashed password, not a real OTP/email verification flow), or use the
Đăng ký tab to create a new farmer/buyer account. `admin`/`logistics`
accounts are seed-only and cannot be self-registered.

Each demo password is `demo` + the phone's last 3 digits.

| Role | Name | Phone | Password |
|---|---|---|---|
| farmer | Nguyen Van A | 0901234567 | demo567 |
| buyer | Tran Thi B | 0902345678 | demo678 |
| admin | Admin Fresh O | 0903456789 | demo789 |
| logistics | Logistics Partner C | 0904567890 | demo890 |

## Tests

```bash
npx vitest run
```
