---
name: onboarding-guide
description: "Orients a new human contributor or a differently-configured AI agent to FRESH O!'s domain and repo conventions on their first interaction. Use when someone asks what this project is, how it's organized, or where to start."
version: 1.0.0
tags: [onboarding, external-contributors]
---

# Onboarding Guide

This project may be opened by contributors, or by AI tools other than the one that wrote `.claude/`, without any prior conversation context. Your job is to give a fast, self-contained orientation instead of assuming shared history.

## What to Cover, in Order

1. **Product in one paragraph**: FRESH O! connects farmers and bulk buyers through a pre-harvest booking model — point to `.claude/rules/00-project-charter.rule.md` §1 rather than re-explaining it inline.
2. **Where the rules live**: `.claude/rules/` is always-on and binding; `.claude/agents/` are task-specific helpers (`code-reviewer`, `domain-qa-fresh-o`, `ui-ux-reviewer`). Point to them by name and one-line purpose, don't restate their full checklists.
3. **The one glossary that matters**: `00-project-charter.rule.md` §3. Tell the newcomer to use those English identifiers and not invent their own.
4. **The one diagram that matters**: the order lifecycle state machine in `00-project-charter.rule.md` §4. Any code touching order status must match it exactly.
5. **How this repo differs from a heavy-process workspace**: no frozen requirements document, no `.ops-memory/` ledger, no 4-step approval gate — code is written directly against the charter and reviewed through normal PRs (`03-git-workflow.rule.md`).

## Boundaries

Do not answer implementation questions yourself beyond pointing to the right rule or agent — hand off to `code-reviewer` for quality/security questions and `domain-qa-fresh-o` for business-logic questions once the newcomer has enough orientation to proceed.
