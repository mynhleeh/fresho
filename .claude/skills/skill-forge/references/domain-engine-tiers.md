# Domain Engine Tiers

A framework for deciding **how deep** a generated artifact should be. A meta-skill must pick the right "intensity tier" before writing — the depth of the requested capability dictates the structure of the output.

> **Why this file exists**: The repo spans micro-skills (simple lookup) to deep multi-phase engines (doc-drill, flashcard generator). A single-skill template can't fit all; this tier system tells a meta-skill how much structure to emit. Distilled from `doc-drill` (deep, lazy-loaded references) and the vocabulary skills (micro/standard).

> **Model-strength note (Principle 1 of `SKILL.md`):** tier choice is independent of model strength. A micro artifact still needs countable, mechanical rules — tier decides *how deep*, weak-model-first decides *how precise each rule is*.

---

## The Three Tiers

| Tier | Description | SKILL.md length | References? | Example |
|---|---|---|---|---|
| **Micro** | Single, focused task; one-pass | 50–100 lines | Usually none | `vocab-lookup` (word → card) |
| **Standard** | 2–5 related workflows | 100–300 lines | Optional, 1–2 files | `document-vocab-extractor` (multi-phase but linear) |
| **Deep Engine** | Multi-domain, adaptive, multi-phase, stateful | 300+ lines core | `references/` with several files | `doc-drill` (adaptive quiz), `deep-flashcard-generator` |

---

## Decision Tree — Choosing a Tier

```
How many distinct phases / workflows does the task need?
  1, simple, stateless  → MICRO
  2–5, related, linear  → STANDARD
  Adaptive / stateful / multi-domain → DEEP ENGINE
```

### Ask these to classify:
1. **How many phases?** One pass (micro) vs. several (standard) vs. a loop that reads state (deep).
2. **Does it adapt based on prior output?** Then it's a deep engine (like doc-drill's difficulty band) — it needs an adaptive loop.
3. **How many domain variants?** Many variants (AWS/GCP/Azure) → deep, with split references.
4. **Is a fixed output contract enough?** Yes → micro/standard; no → deep.

---

## MICRO Tier — Single Task

- Structure: `Overview` → `Instructions` (1 pass) → `Output Contract` → `Examples`.
- No `references/` needed; keep it self-contained and under 100 lines.
- Output is deterministic and short.

```markdown
---
name: vocab-lookup
description: "Looks up an English word and outputs a Vietnamese meaning card. Trigger when the user provides a word to translate."
---

## Instructions
1. Detect the word and its POS from context.
2. Output the card in the fixed format.

## Output Contract
Emit a single card block: meaning, pronunciation, POS, example, synonyms.
```

---

## STANDARD Tier — Multi-Workflow

- Structure: extends micro with a `## When to Activate` section, numbered phases (PHASE 1–4), and optional `references/`.
- Handles 2–5 related workflows with a decision point between them.

```markdown
## When to Activate
- User asks to extract vocabulary from a document.
- Keywords: "vocab", "extract words", "flashcard set".

## Instructions
### Phase 1: Process the document
...
### Phase 2: Apply filtering criteria
...
```

---

## Behavioral Testing by Tier

Test *form* scales with the artifact's risk, not its size:

| Tier | Minimum behavioral test |
|---|---|
| **Micro** | Fresh-context run verifying the exact output contract (e.g., card format) — green-pass retrieval is enough |
| **Standard** | Fresh-context run per workflow branch + 1 pressure scenario if any rule is likely skipped |
| **Deep Engine** | Full pressure scenario per critical rule (3+ combined pressures), rationalization table + red flags; verify the adaptive loop (e.g., difficulty band) actually re-enters |

Full procedure, pressure types, and the RED-GREEN-REFACTOR loop: `behavioral-testing.md`.

---

## DEEP ENGINE Tier — Adaptive, Multi-Phase, Stateful

- Structure: `## Overview` → core loop → `Quick Reference` table pointing to `references/` → iterative phases → session commands → anti-example table → rules.
- Key capabilities:
  - **Lazy-loaded `references/`** — the SKILL.md stays lean; each reference is loaded only when its phase is active.
  - **Stateful / adaptive loop** — e.g., adaptive difficulty (retrieval band), misconception detection, format escalation.
  - **Multiple phases that repeat** — round generation, evaluation, regeneration.

```markdown
## Overview
Adaptive, document-grounded quiz engine.

## Quick Reference (Lazy-Loaded)
| Phase | Reference | When |
|---|---|---|
| Round generation | `references/round-protocol.md` | When generating a new round |
| Difficulty band | `references/adaptive-difficulty.md` | When accuracy drifts out of band |

## Core Loop
1. Phase: analyze document → knowledge map
2. Phase: generate round (load round-protocol.md)
3. Phase: evaluate (load adaptive-difficulty.md)
4. Phase: regenerate if accuracy out of band
```

### Lazy-Load Rule (from doc-drill)
> Reference files are loaded **only when their phase is entered**, not all at once. Each reference carries a "when to read this" note so the agent knows whether to open it.

---

## How the Meta-Skill Uses This

The **tier** determines the emitted skeleton:
- **Micro** → compact, self-contained, no references.
- **Standard** → numbered phases + optional references.
- **Deep** → core loop + lazy-loaded `references/` + adaptive logic.

The meta-skill classifies the request, picks the tier, then generates a skill that matches. Emit the tier decision explicitly so the user understands the scope chosen.
