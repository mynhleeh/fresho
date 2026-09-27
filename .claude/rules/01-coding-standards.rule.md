---
trigger: always_on
description: "Coding standards for FRESH O!: stack placeholder, naming, minimal layering, incremental scaffolding, function design, file/folder structure, risk-based testing, error handling, and lint/format gates."
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
- Names are short **and** specific: a name must be a noun (for data) or verb+noun (for functions) that states its single purpose — never a single letter or generic word (`data`, `temp`, `handle`, `item`, `utils`) except loop counters (`i`, `j`, `k`) inside a loop body of 5 lines or fewer.
- Two functions or variables that do different things MUST NOT share the same base name with only a numeric or vague suffix (`getOrder`, `getOrder2`, `getOrderNew`). If two names look similar, they must differ by the concrete thing each one is about (`getPreOrderById` vs `getPreOrdersByBuyer`), not by an arbitrary tag.

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

## 7. Incremental Generation (No Bulk Scaffolding)

- When creating a new project or feature, generate **one unit at a time** — one file, or a tightly coupled small group of files for a single feature slice (e.g. one API route + its service function) — then verify it (run, lint, or read it back) before generating the next unit.
- Never emit more than roughly 3 new files in a single pass without pausing to check the result. If a feature genuinely needs more files than that, split it into an explicit list of units first, then generate and check them one by one.
- Do not pre-generate placeholder/stub files "for later" (e.g. empty route files for endpoints not yet implemented). Create a file only when its logic is actually being written.

## 8. Function Design & Comments

- Each function does exactly one job, describable in a single sentence without the word "and" joining two unrelated actions. If a function needs "and" to describe what it does, split it.
- Keep functions short enough to read in one screen — treat ~40 lines or 2 levels of nested `if`/`for` inside the function body as the signal to extract a helper.
- Do not write comments. Make the code self-explanatory through function and variable names instead; the sole exception is a one-line comment marking a non-obvious business rule the code can't express by naming alone (e.g. `// TODO(business-confirm): ...` per `00-project-charter.rule.md` §5), and even then keep it to one line.

## 9. File & Folder Structure

- Group files by shared concern (feature, domain entity, or layer — e.g. `pre-order/`, `harvest-batch/`), never by dumping every file of a type into one catch-all folder (no single folder holding all of the project's components, all of its API routes, etc. once it exceeds ~7–8 files without any subgrouping).
- Cap nesting depth at one subfolder level below a feature root: prefer `feature/file.ts` over `feature/sub/file.ts`. If a feature is complex enough to need `feature/sub/file.ts`, that's a sign `sub` should be promoted to its own top-level feature folder instead of nested deeper.
- Before adding a new folder, check whether an existing sibling folder already represents the same grouping concern; reuse it instead of creating a near-duplicate.
