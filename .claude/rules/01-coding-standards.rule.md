---
trigger: always_on
description: "Coding standards for FRESH O!: stack placeholder, naming, minimal layering, risk-based testing, error handling, and lint/format gates."
---

# 01. Coding Standards

## 1. Stack

- Frontend web: Next.js (React), responsive/PWA — same codebase serves the "mobile app" experience via installable PWA, no separate native app in the demo timeline.
- Mobile: none separate — covered by the Next.js PWA above.
- Backend: Next.js API Routes / Route Handlers — no standalone service.
- Database: SQLite (file-based, via Prisma or `better-sqlite3`) — runs locally with zero setup, no external DB server required.
- Auth: role-selection mock (farmer/buyer/admin dropdown over seeded users) — no real credential/OTP flow for the demo.
- File storage: local filesystem under `public/uploads/`, or base64 in the database for small image sets.
- Realtime: polling (short-interval refetch) instead of a websocket/live-subscription layer.
- Access control: role check inside each API route handler (`if (role !== "farmer") ...`), not a database-level policy.
- Repo layout: single Next.js app, no monorepo split.
- Deployment for the pitch: run locally (`localhost`) on the presenting machine; no cloud hosting required unless judges need a remote link.

This stack is a deliberate demo-scope choice: no cloud dependency, no real payment/SMS/maps integration. If judges require a shareable remote link before the pitch, replace SQLite/local-auth/local-storage with Postgres/Auth/Storage on a hosted provider — do not change the Next.js/API-route layering.

## 2. Naming Convention

- All identifiers (files, variables, endpoints, tables) are in English and MUST match the domain glossary in `00-project-charter.rule.md` §3 — no ad hoc synonyms for `harvest_batch`, `pre_order`, `deposit`, `settlement`, `trust_score`, `shipping_fee`, `handover`.
- Casing follows the target language's own convention (e.g. `camelCase` for JS/TS variables, `snake_case` for SQL columns); do not mix within one layer.

## 3. Minimal Layering

Keep a thin separation: `controller/route → service → data access`. Do not introduce additional abstraction layers, design patterns, or OOA/OOD modeling ceremony beyond what the feature actually needs. Optimize for shipping working code, not for architectural elegance.

## 4. Risk-Based Testing

Unit tests are mandatory only for logic where a bug causes real financial or trust damage:

- Order state machine transitions (`00-project-charter.rule.md` §4).
- Price/settlement calculations (goods price, deposit, shipping fee, final payment).
- Buyer-batch matching filters.

UI rendering and simple CRUD wrappers do not require dedicated tests unless time allows.

## 5. Error Handling & Logging

- Every API error response includes a stable error code and message; never leak stack traces to clients.
- Every log line touching an order includes its `pre_order` id (or `harvest_batch` id) as a correlation key, since disputes must be traceable across farmer, buyer, and logistics partner.

## 6. Lint / Format / Pre-commit

- Adopt the standard linter/formatter for the confirmed stack and wire it into a pre-commit hook once the stack is set.
- Do not merge code that fails lint, even during the demo timeline.
