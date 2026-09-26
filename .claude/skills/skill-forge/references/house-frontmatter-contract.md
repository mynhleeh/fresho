# House Frontmatter Contract

The **authoritative YAML frontmatter schema** for every skill this repo produces or distills. It unifies the formats used across `skill-guide.md`, the 4 active study skills, and the `anthropics/spec` standard, so every generated artifact is structurally consistent and discoverable.

> **Why this file exists**: The repo's skills used inconsistent field sets (`skill-forge` used `name`/`description`/`tags`; `doc-drill` added `version`; others dropped fields). This contract is the single source of truth a meta-skill must generate against.

---

## The Canonical Schema

```yaml
---
name: skill-name
description: "What it does AND when to trigger. Include trigger keywords and near-miss negatives."
version: 1.0.0
tags:
  - category1
  - category2
license: MIT                    # optional — only for redistributable external content
compatibility: "Product 1.x"    # optional — environment requirements
metadata:                        # optional — arbitrary string map, use unique keys
  author: "author-or-org"
allowed-tools: "read_file,write_file"   # optional — space-separated pre-approved tools
---
```

---

## Field Reference

| Field | Required | Constraint | Purpose |
|---|---|---|---|
| `name` | **Yes** | Kebab-case; max 64 chars; lowercase alphanumerics + hyphens; no leading/trailing/consecutive hyphens; **must match parent directory name**; **cannot contain XML tags**; **cannot contain reserved words: "anthropic", "claude"** | Identity; used by the launcher to route to the skill |
| `description` | **Yes** | Max 1024 chars; state **what it does AND when to use it**; include trigger keywords; **cannot contain XML tags** | The activation/discovery signal |
| `version` | No | Semantic version (e.g., `1.0.0`) | Change tracking |
| `tags` | No | Array of keywords | Categorization / semantic search |
| `license` | No | License name or reference | Only for redistributable content |
| `compatibility` | No | Max 500 chars; environment requirements (product, system pkgs, network) | Deployment fitness |
| `metadata` | No | String → string map; unique key names | Arbitrary structured info (e.g., `author`) |
| `allowed-tools` | No | Space-separated pre-approved tools | Experimental: restrict tool access |

---

## The `description` Field — Trigger-Optimized (Critical)

The `description` is the **primary triggering mechanism**, not a summary. It controls whether the agent loads the skill at all.

### Anatomy of a High-Trigger `description`

```
[What it does, 1 sentence] + [WHEN to trigger, explicit] + [near-miss negatives / SKIP conditions]
```

### Writing Rules
1. **Two parts required**: *what it does* **and** *when to use it*.
2. **"Pushy" is good** — agents tend to *undertrigger* skills, so make the trigger explicit and slightly assertive.
3. **Include near-miss negatives** — tell the agent when to *skip* (e.g., "Do NOT trigger when the primary deliverable is a Word document").
4. **Put all "when to use" info in `description`**, not the body. The body is for *how*, `description` is for *when*.
5. **No workflow summary (SDO).** Never list the skill's internal steps ("generates, critiques, converts, explains, distills, and navigates"). A summary lets agents follow the description and skip the body. Describe a *behavior* instead (evidence pattern: "code review between tasks → 1 review per pair").
6. **Discipline skills: include violation symptoms.** For skills that enforce rules under pressure, add the expected violation as a near-miss negative ("Do NOT trigger when the agent is expected to answer directly rather than guide") so the description fails safe. See `behavioral-testing.md`.

### Example: Low vs High Trigger

```
❌ "Creates flashcards."                          # states only WHAT, no trigger

✅ "Reads any attached document and generates Anki-ready flashcards, source-grounded.
    Trigger whenever the user references a document and wants study cards.
    Do NOT trigger when the user wants a summary, translation, or quiz rather than flashcards."
```

---

## `## When to Activate` — Body Section

Resolve the conflict between `description`-embedded triggers and a body `## When to Activate`:

- **Always** include trigger keywords in `description` (this is what the launcher reads).
- **Add** a `## When to Activate` section in the body **only** when the skill is complex enough (standard or deep tier) to need fuller activation logic, edge-case handling, and explicit keyword lists.

```markdown
## When to Activate

- User asks to create/write/improve a [artifact type]
- Keywords: "prompt", "system prompt", "skill", "function schema", "rules file"
- DO NOT activate for: [near-miss scenarios]
```

---

## Frontmatter Validation Checklist

Run as a **stranger-review** — separate re-read after writing; each item PASS/FAIL with evidence, then re-check failed items (max 2 iterations).

- [ ] `name` is kebab-case and **exactly matches** the parent directory name
- [ ] `name` ≤ 64 chars; no `_`, spaces, uppercase, XML tags, or reserved words ("anthropic", "claude")
- [ ] `description` ≤ 1024 chars; no XML tags
- [ ] `description` contains both **what** it does and **when** to trigger
- [ ] `description` includes at least one near-miss negative (SKIP condition)
- [ ] `description` contains **0 workflow-summary verbs** ("generates", "critiques", "converts", "distills"…) — behavior, not steps (SDO rule)
- [ ] `version` uses semver (if present)
- [ ] `tags` array uses kebab-case or lowercase single words
- [ ] No empty/blank required fields
- [ ] (External/redistributable skills) `license` present

---

## Generated-Skill Template

A meta-skill should emit this skeleton, filling every placeholder:

```markdown
---
name: {kebab-name}
description: "{action} for {domain}. Trigger when {trigger}. Do NOT trigger when {skip}."
version: 1.0.0
tags: [{tag1}, {tag2}]
---

# {Display Name}

## When to Activate
[Full trigger logic + keyword list]

## Overview
[What this skill does and its scope]

## Instructions
[Step-by-step workflow, imperative voice]

## Output Contract
[Exact output format — a single block, no other prose]

## Examples
[Concrete input → output pairs]

## References
[Relative paths to reference files, with "when to read this"]
```
