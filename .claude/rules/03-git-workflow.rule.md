---
trigger: always_on
description: "Git workflow for FRESH O! covering branch naming, commit convention, PR requirements, multi-contributor/multi-agent conflict handling, and the merge gate on main."
---

# 03. Git Workflow

## 1. Branch Naming

`feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`. Keep the description short and specific enough that two contributors won't accidentally pick the same branch name for different work.

## 2. Commit Convention

Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`. This keeps history scannable when multiple humans and AI agents are committing in parallel.

## 3. Pull Request Requirements

Every PR states: what changed, why, and which part of the order lifecycle or actor scope it touches (reference `00-project-charter.rule.md` where relevant). Since there is no separate requirements document, the PR description is the record of any business-logic decision made while implementing.

## 4. Multi-Contributor / Multi-Agent Rules

- Never force-push a shared branch.
- Rebase your own feature branch on `main` before opening a PR; merge (not rebase) at PR merge time.
- When resolving a conflict, read both sides fully before picking a resolution — do not blindly accept "ours" or "theirs", since the other side may be a different contributor's or a different agent's in-progress work.

## 5. Merge Gate

`main` requires at least one review and a passing lint/test run before merge, even under the demo timeline. Do not bypass this to save time; a broken `main` costs more time than the gate does.
