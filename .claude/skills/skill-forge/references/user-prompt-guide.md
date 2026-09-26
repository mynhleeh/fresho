# User Prompt Guide

How the **user** should phrase a request so a meta-skill can route, classify, and execute correctly. This is the *input* contract — the complement to `prompt-framework-costar-x.md`, which defines the *agent-side* scaffold. This file is the missing bridge: the repo had guides for authoring skills/prompts/schemas, but no guide for the user writing the request.

> **Why this file exists**: A meta-skill like skill-forge routes every request through a decision pipeline (what → what type → what tier → what recipe). If the user's input is ambiguous in any of these dimensions, the meta-skill must guess. This guide teaches the user to provide all four signals up front.

---

## The Four Signals a Meta-Skill Needs

Every request is routed by four dimensions. A well-formed request supplies all four; a poor one omits them and forces guesses.

| Signal | Question it answers | Examples |
|---|---|---|
| **Need** | What outcome do you want? | "create a skill", "critique this prompt", "convert this schema" |
| **Artifact type** | What should be produced? | skill / user prompt / function schema / rules file |
| **Intensity tier** | How deep should it be? | micro / standard / deep engine |
| **Domain + context** | What's the subject, stack, language? | "English vocab flashcards", "REST API in TypeScript", "Tiếng Việt output" |

### Routing rule
> If a signal is missing or ambiguous, the meta-skill **asks at the CLARIFY gate** (max 3 questions, one batch, each with a default option). If a default is genuinely confident, it states the default + one-line reason in the Working Notes block and proceeds — it never silently guesses (Principle 3: ask, don't invent).

---

## Well-Formed User Prompt Anatomy

```
[NEED] [ARTIFACT TYPE] for/about [DOMAIN]. [OUTCOME]
[Tier + context variables if applicable]
```

### Example (complete)
> "**CREATE** a **skill** for English **vocabulary flashcards**. Generate **standard** tier. Input document → output Anki deck. Output in **Vietnamese**."

Each signal present → the meta-skill needs zero guessing.

### Example (ambiguous ❌)
> "Make me a thing for words."

No need, no artifact type, no tier, no domain. The meta-skill can only guess or ask follow-ups.

---

## Deciding on Each Signal

### 1. Need — pick the verb
- **CREATE** · **CRITIQUE** · **CONVERT** · **EXPLAIN** · **DISTILL** · **NAVIGATE/ORGANIZE**
- Choose one; don't mix. "Create and also critique" forces the meta-skill to split — fine, but state it as two steps.

### 2. Artifact type — pick from the 4
| Type | When to choose |
|---|---|
| **skill** | A reusable capability with a `SKILL.md` |
| **user prompt** | One-off or reusable prompt text |
| **function schema** | JSON schema for tool/model calls |
| **rules file** | `AGENTS.md` / `.cursorrules` / `.mdc` |

### 3. Intensity tier — see `domain-engine-tiers.md`
- **micro** — single task, deterministic.
- **standard** — 2–5 workflows.
- **deep engine** — adaptive, stateful, multi-phase.

### 4. Domain + context — include the variable values
The more context, the less the meta-skill must ask. Especially important:
- Target language (drives `house-language-policy`).
- Tech stack / framework (drives function-schema & routing).
- Audience / tone (drives system prompt style).

---

## Language Policy from the User's Side

The request can be in **any language** (the user asks in their language). The meta-skill:
- Reads the request in the user's language.
- Outputs **user-facing content in the user's language**.
- Keeps **internal reference files in English**.

So a user writing in Vietnamese gets a skill whose *instructions* are Vietnamese but whose `references/` files (if any) stay English — see `house-language-policy.md`.

---

## Common Anti-Patterns (❌ / ✅)

| ❌ Avoid | ✅ Prefer | Why |
|---|---|---|
| "Make something" | "Create a skill for X" | Specifies need |
| "Improve this" | "Critique this prompt for clarity" | Specifies need + artifact |
| "Make it good" | "Deep engine, adaptive difficulty" | Specifies tier |
| No language given | "Output in Vietnamese" | Removes ambiguity |
| Giant single blob | One clear sentence per signal | Easy to parse |
| "And also do the other thing" | Two separate requests | Unambiguous routing |

---

## When Not to Over-Specify

- **If you're unsure of the tier**, let the meta-skill recommend it (it has the decision tree).
- **If you're unsure of the artifact type**, describe the *outcome* and let it classify.
- **Never invent variables you don't have** — a meta-skill can't fabricate a codebase, a document, or a stack you didn't provide.

---

## How the Meta-Skill Uses This

- **Route** the request by mapping the four signals.
- **Ask at the CLARIFY gate** when any signal is missing or ambiguous — max 3 questions, one batch, each with a default option. Never guess.
- **Infer defaults** for tier/language only when genuinely confident, and state the chosen defaults + reason in the Working Notes block so the user can correct them.
