# 04. Workspace Cleanup After AI Task Execution

## 1. Rule

When an AI agent processes a task and this generates extra files not part of the final deliverable — demo scripts, throwaway test files, `tmp`/scratch files, exploratory snippets, sample data used only to verify behavior — the agent MUST clean these up before considering the task done:

- Delete files created purely to validate/demo the change once validation is complete.
- Remove temporary directories (e.g. `tmp/`, `scratch/`, ad hoc `demo/` folders) created during the task.
- Leave the working tree containing only the files actually needed for the feature/fix.

## 2. What Counts as Cleanup-Required vs Keep

| Keep | Clean up |
|---|---|
| Source files implementing the feature/fix | One-off scripts used to manually trigger/verify a route |
| Tests that belong in the permanent suite (per `01-coding-standards.rule.md` §4 risk-based testing) | Scratch `.js`/`.ts`/`.md` files used to reason through a problem |
| Migration files that are part of the change | Duplicate/backup copies (`file.old.ts`, `file_v2.ts`) left while iterating |
| Seed data required for local dev (per stack conventions) | Sample/demo data files only used to eyeball output |

## 3. When to Do It

Before reporting a task complete, run `git status` and review untracked/modified files. Any file that only served the agent's own process of solving the task — not the actual deliverable — must be deleted in the same turn, not left for a future cleanup pass.

## 4. Exceptions

- Never delete files the user explicitly asked to keep.
- Never delete pre-existing files unrelated to the current task, even if they look unused — verify with the user first (see `.claude/rules/02-security-and-data.rule.md` §6 on not bulk-modifying data/files without confirmation).
