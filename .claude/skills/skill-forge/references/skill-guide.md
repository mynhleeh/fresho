# Skill Guide — Creating Skills (AGY-flavored)

A guide for creating skills, written for the Antigravity (AGY) agent system. **Platform note:** the workflow and structure generalize to other platforms (Claude, OpenAI, Gemini, Cursor); only AGY-specific packaging details (loading, tooling) are AGY-only. Cross-check platform specifics against `references/system-prompt-guide.md` and the platform matrix.

---

## What Is a Skill?

A skill is a **cheatsheet / instruction set** stored as a directory, loaded on-demand by an AGY agent when relevant. Skills enable agents to perform complex workflows in a structured, repeatable way.

---

## Directory Structure

```
skills/
└── skill-name/
    ├── SKILL.md          ← REQUIRED: Main instruction file
    ├── scripts/          ← Optional: Helper scripts
    ├── examples/         ← Optional: Reference implementations
    ├── assets/           ← Optional: Additional files and templates
    └── references/       ← Optional: External documentation
```

---

## SKILL.md Format

```markdown
---
name: skill-name
description: One-sentence description of what this skill does
version: 1.0.0
---

# Skill Name

## Overview
[What this skill does and when to use it]

## When to Activate
[Specific triggers or conditions for using this skill]

## Prerequisites
[What needs to be set up or known before using]

## Instructions
[Step-by-step workflow instructions]

## Examples
[Usage examples with inputs and outputs]

## Common Issues
[Known problems and solutions]

## References
[Links to related resources]
```

---

## YAML Frontmatter Fields

The house frontmatter contract defines an **8-field core** (see `house-frontmatter-contract.md`): the six below plus `metadata` and `allowed-tools`.

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Kebab-case skill name (matches folder name) |
| `description` | Yes | **Trigger-optimized**: what it does AND when to trigger. "Pushy", includes near-miss negatives. |
| `version` | No | Semantic version (e.g., `1.0.0`) |
| `tags` | No | Array of keywords for categorization |
| `license` | No | License / attribution — only for redistributable external content |
| `compatibility` | No | Required tools, dependencies, platforms |
| `metadata` | No | Arbitrary string map (e.g., `author`) |
| `allowed-tools` | No | Space-separated pre-approved tools |

### The Trigger-Optimized `description` (from Anthropic)

The `description` is the **primary triggering mechanism** — it's what the agent sees when deciding whether to consult the skill. Write it to combat *undertriggering*: be a little "pushy."

```
❌ "How to build a simple fast dashboard to display internal data."
✅ "How to build a simple fast dashboard to display internal data.
   Make sure to use this skill whenever the user mentions dashboards,
   data visualization, internal metrics, or wants to display any kind
   of company data, even if they don't explicitly ask for a 'dashboard.'"
```

**Key rule**: All "when to use" info goes in `description`, NOT in the body. The body holds *how*. The description holds *when* + *what*.

---

## Writing Effective Instructions

### 1. Clear Activation Criteria
```markdown
## When to Activate
- User asks to "create a prompt" or "write a system prompt"
- User wants to improve an existing prompt
- User needs to define a function or tool schema
- Keywords: "prompt", "system prompt", "tool definition", "function calling"
```

### 2. Step-by-Step Workflow
```markdown
## Instructions

### Step 1: Identify Output Type
Determine what the user needs:
- System prompt → go to System Prompt workflow
- User prompt → go to User Prompt workflow
- Function schema → go to Function Schema workflow

### Step 2: Gather Requirements
Ask for (or infer from context):
- Target platform (Claude / OpenAI / Gemini / platform-agnostic)
- Use case and domain
- Tone and style preferences
- Any constraints
```

### 3. Concrete Examples
```markdown
## Examples

### Example 1: Customer Support Bot System Prompt
**Input**: "Create a system prompt for a customer support bot for an e-commerce site"
**Process**: 
- Output type: system prompt
- Platform: not specified → use platform-agnostic
- Domain: e-commerce customer support
**Output**: [full system prompt here]
```

---

## Skill Sizing Guidelines

| Size | Description | Approx. SKILL.md length |
|---|---|---|
| **Micro** | Single, focused task | 50–100 lines |
| **Standard** | 2–5 related workflows | 100–300 lines |
| **Complex** | Multi-domain with heavy references | 300+ lines + sub-files |

> See `domain-engine-tiers.md` for the house tier system (micro / standard / deep engine), which refines this sizing into an explicit decision tree.

---

## Progressive Disclosure (3-Level Loading System)

Skills use a three-level loading system with bounded context per level:

| Level | Content | When in context | Size |
|---|---|---|---|
| 1. **Metadata** | `name` + `description` | Always | ~100 words |
| 2. **SKILL.md body** | Instructions, workflow | Whenever the skill triggers | <500 lines ideal |
| 3. **Bundled resources** | `references/`, `scripts/`, `assets/` | As needed | Unlimited; scripts run without loading |

### Key patterns
- **Keep SKILL.md under 500 lines.** If approaching the limit, add another layer of hierarchy with clear pointers about where the agent should go next.
- **Reference files clearly from SKILL.md** with guidance on *when* to read them.
- **For large reference files (>300 lines)**, include a table of contents.

### Domain organization (variants)
When a skill supports multiple domains/frameworks, organize by variant so the agent reads only the relevant file:

```
cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

---

## The Skill Creation Workflow (Anthropic skill-creator)

A mature, verified meta-workflow for authoring a skill. Use it when **CREATE** mode builds a skill:

1. **Capture Intent** — Extract the workflow from conversation history: tools used, step sequence, user corrections, input/output formats. Confirm before proceeding.
2. **Interview & Research** — Ask about edge cases, IO formats, example files, success criteria, dependencies. If MCPs/subagents are available, research in parallel.
3. **Design & run the failing test (RED — Iron Law)** — Before writing anything: design a pressure scenario (3+ combined pressures: time / sunk cost / authority / economic / exhaustion / social / pragmatic) that would make an agent skip the skill's key rules. Run it WITHOUT the artifact in a fresh context; record the rationalizations verbatim. These rationalizations ARE the spec the skill must defeat. See `references/behavioral-testing.md`.
4. **Write the SKILL.md** — Fill `name`, trigger-optimized `description`, `compatibility`, then the body — explicitly targeting each recorded rationalization (prohibition + rationalization table + red flags where the baseline skipped rules).
5. **Validate + GREEN re-run** — Quick-validate the frontmatter (ensure `name` + `description` present, only allowed keys). Then re-run the STAGE 3 scenario WITH the artifact: the agent must comply. A NEW rationalization → REFACTOR: explicit negation, add to rationalization table, update description with the violation symptom; re-run. Max 2 iterations.
6. **Optimize the description (optional)** — Generate trigger-eval queries (mix of should-trigger and should-not-trigger / near-misses), review, run the optimization loop, apply the best description.
7. **Package & Present** — Package the skill and present the file.

> **Behavioral testing is mandatory, not optional.** Structural validation proves the skill is *well-formed*; the RED-GREEN run proves it *works under pressure*. Full procedure, pressure types, Match-the-Form table, and micro-test wording: `references/behavioral-testing.md`.

---

## The Skill Execution Loop

From the `skill-creator` reference pattern:

```
1. Read SKILL.md instructions in full
2. Identify which workflow to follow
3. Gather required inputs (ask if missing)
4. Execute workflow steps
5. Output result in the user's language
6. Offer to iterate or improve
```

---

## Naming Conventions

- **Folder name**: `kebab-case` (e.g., `skill-forge`, `code-reviewer`)
- **Main file**: Always `SKILL.md` — uppercase, always `.md`
- **Script files**: `kebab-case.py`, `kebab-case.sh`
- **Example files**: Descriptive names inside `examples/`

---

## Skill vs Rules vs Hooks

| Type | Location | Purpose | When Loaded |
|---|---|---|---|
| **Skill** | `skills/skill-name/SKILL.md` | Workflow instructions | On-demand when relevant |
| **Rules** | `rules/*.md` or `GEMINI.md` | Always-on guidelines | Every session |
| **Hook** | `hooks.json` | Automated triggers | On specified events |

---

## Multilingual Skills

To support multiple languages, add a language policy to the skill instructions:

```markdown
## Language Policy
Respond in the same language the user writes in.
All internal processing follows these English instructions,
but all user-facing output should match the user's language.
```

---

## Checklist Before Publishing

- [ ] YAML frontmatter is complete (`name`, `description`)
- [ ] `description` is specific enough for discovery
- [ ] Clear "When to Activate" section with keywords
- [ ] Step-by-step instructions (not vague goals)
- [ ] At least 2 concrete examples with inputs and outputs
- [ ] Tested with 5+ diverse inputs
- [ ] Referenced external files exist (no broken paths)
- [ ] Consistent naming conventions throughout
- [ ] Language policy defined if multilingual support needed
