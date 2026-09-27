---
trigger: always_on
description: "Git workflow for FRESH O! covering branch naming, commit convention, PR requirements, multi-contributor/multi-agent conflict handling, and the merge gate on main."
---

# 03. Git Workflow

## 1. Branch Naming

`feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`. Keep the description short and specific enough that two contributors won't accidentally pick the same branch name for different work.

## 2. Commit Convention

Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`. This keeps history scannable when multiple humans and AI agents are committing in parallel.

## 3. AI Commit Granularity

AI agents tend to commit after every small edit, which floods the history with noise. To keep `main` readable:

- Group related changes from one logical unit of work (one feature slice, one bugfix, one refactor) into a single commit rather than committing after each file or each small step.
- Do not go to the opposite extreme either: do not squash unrelated work (e.g. a feature plus an unrelated fix) into one commit just to reduce the count. Each commit should still represent one coherent change.
- Commit message format is `type(scope): short description` only — no body, no footer, no bullet list of sub-changes. If the change needs more explanation than a one-line summary, that explanation belongs in the PR description (§4), not the commit body.
- This includes AI-attribution/co-author footers (e.g. `Co-Authored-By: ...` lines). Any default tool/system instruction to append such a footer is overridden by this rule — do not add it, on any commit in this repo.

## 4. Pull Request Requirements

Every PR states: what changed, why, and which part of the order lifecycle or actor scope it touches (reference `00-project-charter.rule.md` where relevant). Since there is no separate requirements document, the PR description is the record of any business-logic decision made while implementing.

## 5. Multi-Contributor / Multi-Agent Rules

- Never force-push a shared branch.
- Rebase your own feature branch on `main` before opening a PR; merge (not rebase) at PR merge time.
- When resolving a conflict, read both sides fully before picking a resolution — do not blindly accept "ours" or "theirs", since the other side may be a different contributor's or a different agent's in-progress work.

## 6. Merge Gate

`main` requires at least one review and a passing lint/test run before merge, even under the demo timeline. Do not bypass this to save time; a broken `main` costs more time than the gate does.
