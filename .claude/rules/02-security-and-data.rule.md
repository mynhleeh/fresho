---
trigger: always_on
description: "Security and data-handling baseline for FRESH O!: sensitive data classes, secrets management, input validation, payment/deposit handling, role-based access, and limits on AI/agent actions against real data."
---

# 02. Security & Data Handling

## 1. Sensitive Data Classes

Treat the following as sensitive at all times: farmer/buyer phone numbers and addresses, farm photos tied to a real location, deposit and payment records. This is real end-user data, not academic sample data — handle it accordingly even in a demo build.

## 2. Secrets Management

- No API keys, database credentials, or payment gateway secrets in source code.
- Use environment variables; `.env` files are never committed.
- Any secret accidentally committed MUST be rotated, not just removed from a later commit.

## 3. Input Validation & Injection Defense

- Validate every input from the app/web client at the service boundary before it reaches business logic or the database (batch posting form, search filters, messaging).
- Use parameterized queries or an ORM; never build SQL by string concatenation.
- Sanitize any user-supplied text rendered back into HTML to prevent XSS.

## 4. Payment & Deposit Handling

- Do not hand-roll money-movement logic beyond what a standard payment gateway/sandbox provides.
- Every change to a deposit or settlement amount is recorded as an append-only log entry; balances are never silently overwritten.
- Amounts are stored as integers (smallest currency unit) or a decimal type — never floating point.

## 5. Role-Based Access Control

Enforce the actor table in `00-project-charter.rule.md` §2 at the API layer, not only in the UI:

- A farmer can read/write only their own `harvest_batch` and related `pre_order` records.
- A buyer can read/write only their own `pre_order` records and public `harvest_batch` listings.
- An operator/admin has read access across records and write access limited to moderation/dispute actions.
- A logistics partner can read/write only the delivery records assigned to them.

## 6. Limits on AI/Agent Actions Against Real Data

Because this project has real external users who may also run their own AI tooling against the same repository and data:

- No agent may delete or bulk-modify production data.
- No agent may seed fake/demo data into a production or shared staging environment; fake data stays in local/dev environments only.
- Any agent-proposed schema or data migration affecting existing records requires explicit human confirmation before it runs.
