# 05. Subagent Usage — Parallelization & Cross-Check

## 1. When to Use Subagents

Subagents are optional tooling for two situations — not a mandatory gate on every turn
(this stays consistent with `00-project-charter.rule.md` §6, which explicitly excludes
a mandatory multi-step verification gate):

- **Independent parallel work**: when a task splits into pieces with no data dependency
  between them (e.g. reviewing 3 unrelated API routes, auditing UI across farmer/buyer/admin
  screens, running lint + domain-QA + UI review at once), dispatch them as parallel subagent
  calls instead of doing them serially.
- **Pre-completion cross-check**: before marking as done any change that touches order status,
  pricing/settlement math, buyer-batch matching, or role-based access control (the same
  risk classes named in `01-coding-standards.rule.md` §4), run an independent review pass
  (e.g. `domain-qa-fresh-o`, `code-reviewer`) against the change before reporting completion.

## 2. What This Does NOT Change

- Does not add a required gate before every code-modifying turn (charter §6 still applies).
- Does not replace `01-coding-standards.rule.md` §4 risk-based testing — subagent cross-check
  is a review step, not a substitute for the mandatory unit tests it requires.
- Does not authorize a subagent to bypass `02-security-and-data.rule.md` (e.g. no subagent
  may bulk-modify or delete real data during a "verification" pass).

## 3. How to Dispatch

- State in one line which task(s) run in parallel and why they're independent, before
  launching them.
- Give each subagent only the context it needs for its slice — not the entire conversation.
- A cross-check subagent must be independent of the one that wrote the code (a fresh
  reviewer, not the implementer re-reading its own output) — mirrors the stranger-review
  principle already used by `/code-review` and `/verification-before-completion`.

## 4. Reporting

When a task used subagents, summarize in the final response: which parts ran in parallel,
and what the cross-check found (pass, or issues fixed). Do not silently drop a subagent's
findings.
