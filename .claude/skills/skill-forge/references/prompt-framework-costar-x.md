# Prompt Framework: COSTAR-X

The **house prompt framework**, distilled from proven production prompt architectures (`system-architecture`, `function-anatomist`, `tool-teacher`). It is the canonical structure for authoring reusable, variable-isolated prompts that produce reliable, self-verifying output.

> **Why this file exists**: Production prompts require a consistent, rigorous scaffold across diverse domains. This reference extracts that shared scaffold into a reusable recipe so GENERATED prompts match it. Use it for the **CREATE** and **CONVERT** modes when the target artifact type is a *user prompt*.

---

## The COSTAR-X Acronym

| Letter | Section | Purpose |
|---|---|---|
| **C** | **Context & Objective** | Why this prompt exists; its single mission |
| **O** | **Objective** | The one measurable outcome |
| **S** | **Scenario / Style** | Domain, audience, tone, language |
| **T** | **Task** | What to do, in imperative steps |
| **A** | **Action** | Enforceable no-speculation / quality rules |
| **R** | **Result** | The exact output format / contract |
| **-X** | **Meta-Instruction** | Chain-of-Verification + startup confirmation |

---

## The Canonical Template

```markdown
# {Domain} — {Governing Architecture} ... (a short job-title, e.g. "System Architect")

## Context & Objective
You are {ROLE} for {DOMAIN}. Your governing framework is {FRAMEWORK}.
{One sentence on why the user needs you; the overarching mission.}

## Data Input (Variable Isolation)
This section defines the inputs that the user MUST provide. Use angle-bracket
variable tags. The prompt stays reusable because the variable VALUES change per use,
never the structure.

<user_task>: {What the user wants to accomplish}
<tech_stack>: {Languages, frameworks, tools involved}
<target_language>: {Output language for the response}
[other variables as needed]

## Instructions — COSTAR Framework
### Step 1: {Analyze / Clarify the Variables}
Interpret <user_task> against <tech_stack>. If any required variable is missing,
list what is needed before proceeding.

### Step 2: {Core Framework Logic}
[Domain-specific reasoning steps — the heart of the prompt. Imperative, ordered.]

### Step 3: {Apply the COSTAR-X Meta-Instruction}
Before writing any output, complete the mandatory verification block.

## Format & Constraints
- Output in {target_language}.
- Use {format} — e.g., Markdown, single fenced block.
- Cite the highest-tier source (see taxonomy-navigation.md).
- No speculation: if uncertain, say so or omit. Do NOT fabricate.

## Meta-Instruction (Chain of Verification) — MANDATORY
Before producing any final output, you MUST execute the verification block below.

<thinking>
1. Variable isolation: Did I apply all variables correctly? Restate them.
2. Chain of verification: Is every claim supportable? What's its source tier?
3. Error-checking: What could be wrong with my current reasoning?
4. Final answer synthesis: Is the output complete, correct, and in format?
</thinking>

XÁC NHẬN KHỞI ĐỘNG
```

---

## Core Principles

### 1. Variable Isolation via `<variable>` tags
The prompt is a **template**, not a one-off. Inputs live in `<variable>` tags so the same prompt can be reused across many `user_task` values without editing the structure. Missing variables are requested, not guessed.

### 2. The Mandatory `<thinking>` Block
Before ANY output, the model must reason inside `<thinking>`. This is the **chain of verification** — it forces explicit self-checking rather than a single-pass answer. It is non-negotiable in the house framework.

### 3. The "XÁC NHẬN KHỞI ĐỘNG" Startup Line
A literal confirmation marker (`XÁC NHẬN KHỞI ĐỘNG` = "startup confirmed") that the model prints once it has read and accepted the prompt. It signals the prompt has been understood and is ready to receive real input — an orienting anchor for both user and model.

> **Language note:** the marker is intentionally a **literal string** in Vietnamese, not translated — it is a fixed token, not prose. The house language policy ("internal processing: English") governs instructions; fixed literal markers are exempt.

### 4. Zero-Speculation Constraint
A hard rule that the model must not invent facts. Cite sources; if uncertain, state the uncertainty or omit. This prevents hallucination and keeps output verifiable.

---

## When to Use Which Sections

| Target artifact | Sections required |
|---|---|
| **Micro prompt** (single task) | C + O + T + R + -X, minimal A |
| **Standard prompt** | Full COSTAR-X, numbered steps |
| **Deep / critical prompt** | Full COSTAR-X + explicit `## Data Input` inventory |

---

## How the Meta-Skill Uses This

- **CREATE prompt** → emit a prompt that follows this COSTAR-X template, injecting domain logic into the Instructions section.
- **CONVERT prompt** → restructure a source prompt (e.g. from OpenAI) into this COSTAR-X shape, mapping the equivalent sections.
- **EXPLAIN prompt** → analyze an existing prompt and categorize its sections against C-O-S-T-A-R-X to show structure.

Use it together with `user-prompt-guide.md` (how to write *good* prompt text) — this file provides the *scaffold*, that file provides the *content quality*.
