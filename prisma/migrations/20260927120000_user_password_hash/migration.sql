-- Demo/local-only: existing seeded rows get an empty placeholder hash;
-- run `npm run setup` / prisma seed again to get real demo password hashes.
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT NOT NULL DEFAULT '';
