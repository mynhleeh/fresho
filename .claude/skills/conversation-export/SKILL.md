---
name: conversation-export
description: >
  Export and compress an entire conversation into two reusable artifacts: (1) a
  compressed system/context prompt and (2) a structured Markdown report — works
  in any environment (CLI, agent chat, IDE, notebook). Trigger when the user asks
  to "export", "compress", "save", "capture", "summarize for reuse", "package",
  or "hand off" a conversation, session, or thread. Also trigger when the user
  wants to resume a conversation in a new context, transfer context to another
  model, or create a reusable prompt from a session. Do NOT trigger for simple
  one-question answers or one-shot summaries with no reuse intent.
version: 1.0.0
tags:
  - conversation
  - export
  - compression
  - prompt-engineering
  - context-handoff
  - cli
  - agent
---

# Conversation Export & Compress

> Export and compress any conversation into a **context prompt** (for pasting into a new session) and a **Markdown report** (for archiving, sharing, or reviewing). Always produces **both** artifacts. Never skips either.

---

## When to Activate

**Trigger keywords**: `export conversation`, `compress session`, `save context`, `hand off`, `capture this session`, `package conversation`, `resume in new context`, `export to prompt`, `tóm tắt để dùng lại`, `xuất cuộc trò chuyện`, `nén hội thoại`.

**Activate when**:
- User wants to reuse the conversation in a new model/session/tool.
- User wants to archive or document a completed conversation.
- User wants to transfer context across environments (CLI → web UI, one agent → another).
- User says "save this" / "export this" / "compress this" for any conversation.

**Do NOT activate** for:
- One-sentence summaries with no reuse intent ("what did we talk about?").
- Simple Q&A lookups with no persistent context.

---

## Overview

This skill runs a **3-phase pipeline** on the current conversation:

1. **EXTRACT** — Identify all meaningful turns (decisions, code, data, constraints, goals).
2. **COMPRESS** — Remove filler, deduplicate, and encode the session into a dense, reusable context block.
3. **EMIT** — Output exactly two artifacts: a **Context Prompt** (plain text, copy-pasteable) and a **Markdown Report** (structured, archivable).

Both artifacts are mandatory. The pipeline must complete all 3 phases even if the conversation is short.

---

## Instructions

### Phase 1 — EXTRACT (Mandatory)

Scan the conversation from the first turn to the last. For each turn, classify it into one of five categories:

| Category | Include? | Compression Weight |
|---|---|---|
| **GOAL** — user's stated objective | Always | High (verbatim) |
| **DECISION** — agreed approach or answer | Always | High (condensed) |
| **CODE / DATA** — concrete artifact produced | Always | High (verbatim or compressed) |
| **CONSTRAINT** — rules, limits, requirements | Always | High (verbatim) |
| **FILLER** — greetings, clarifications, small talk | Omit | None |

**Output of Phase 1**: A numbered extraction list (internal — not shown to user). Do not skip this phase even under time pressure.

### Phase 2 — COMPRESS

Apply these 5 compression rules in order:

1. **Deduplicate**: If the same concept appears > 1 time, keep only the final/best version.
2. **Condense decisions**: Replace multi-paragraph discussion with a 1–2 sentence conclusion statement.
3. **Preserve code/data verbatim**: Never paraphrase or shorten code blocks, config snippets, or structured data.
4. **Flatten to bullet points**: Convert prose decisions and goals into flat bullet points for fast parsing.
5. **Header-index**: Group bullets under semantic headers (GOAL, CONTEXT, DECISIONS, ARTIFACTS, OPEN ITEMS).

**Compression ratio target**: The compressed Context Prompt must be ≤ 30% of the raw conversation token count. If it exceeds 30%, repeat rules 1–2 once more (max 1 retry).

### Phase 3 — EMIT (Both Artifacts Required)

**STOP**: Do not emit only one artifact. Both are required in every execution, regardless of session length.

Emit in this exact order:

1. **ARTIFACT 1: Context Prompt** — a self-contained block the user can paste at the top of any new conversation.
2. **ARTIFACT 2: Markdown Report** — a structured `.md` file for archiving and review.

See **Output Contract** for exact format.

---

## Output Contract

Emit exactly two labeled code blocks, in this order. No other prose between them.

````
## Artifact 1 — Context Prompt

```text
[CONTEXT HANDOFF]
Session: {short title of the conversation}
Date: {YYYY-MM-DD}

## GOAL
{1–3 bullet points — what the user was trying to achieve}

## CONTEXT
{2–5 bullet points — key background facts, constraints, environment}

## DECISIONS
{bullet list of all agreed conclusions — one per line, verb-first}

## ARTIFACTS
{list of code/data/files produced — filename + 1-line description each}

## OPEN ITEMS
{bullet list of unresolved questions or next steps, or "None."}
```

## Artifact 2 — Markdown Report

```markdown
# Conversation Export: {short title}

**Date**: {YYYY-MM-DD}  
**Environment**: {CLI / Agent Chat / IDE / Other — infer from context or write "Unknown"}  
**Session Length**: {N turns}  
**Compression Ratio**: {X% of original}

---

## Summary
{2–4 sentence narrative of what happened in the session}

## Goal
{Restate the user's main objective}

## Key Decisions
| # | Decision | Rationale |
|---|---|---|
| 1 | {decision} | {why} |
| 2 | ... | ... |

## Artifacts Produced
| Artifact | Type | Description |
|---|---|---|
| {name} | {code/file/prompt/data} | {1-line description} |

## Constraints & Requirements
- {constraint 1}
- {constraint 2}

## Open Items / Next Steps
- {item 1}
- {item 2, or "None"}

## Raw Extraction Log
<details>
<summary>Click to expand extraction log</summary>

{The numbered EXTRACT list from Phase 1, formatted as a bullet list}

</details>
```
````

---

## Anti-Examples

| ❌ Avoid | ✅ Prefer | Why |
|---|---|---|
| Emit only a summary paragraph | Always emit both labeled code blocks | One artifact loses reusability |
| Skip Phase 1 extraction and go straight to writing | Always run the 3-phase pipeline | Skipping extraction causes missed decisions |
| Shorten code blocks to save space | Keep code/data verbatim always | Paraphrased code is unusable |
| Omit "OPEN ITEMS" when nothing is unresolved | Write "None." explicitly | Omission looks like a mistake, not a clean slate |
| Write "here is your summary:" as preamble | Emit artifacts immediately after a one-line confirmation | Preamble wastes tokens and breaks copy-paste flow |

---

## Rationalization Table (Discipline Enforcement)

This skill must run even under pressure. The following rationalizations are **pre-rejected**:

| Anticipated Rationalization | Explicit Negation |
|---|---|
| "The conversation is short, no need to compress" | Run all 3 phases regardless of session length. |
| "The user only asked for a summary, not a file" | Always emit both artifacts. "Summary" = trigger for this skill. |
| "The code block is too long, I'll paraphrase it" | Never paraphrase code/data. Preserve verbatim or omit with a `[TRUNCATED — see original]` note. |
| "I'll skip Phase 1, it's obvious what happened" | Phase 1 is mandatory. Its output is the audit log for Phase 2. |
| "The user is in a hurry, I'll skip the Markdown report" | Both artifacts are required. Urgency is not an exception. |

**Red flags** — if you see yourself doing any of these, stop and restart Phase 1:
- Writing prose instead of bullet points in the Context Prompt.
- Emitting only one code block.
- Paraphrasing a code snippet.
- Skipping the `## Raw Extraction Log` section.

---

## Environment Adapters

The same pipeline applies in all environments. Adapt only the delivery method, not the artifacts:

| Environment | How to deliver Artifact 2 (Markdown Report) |
|---|---|
| **CLI / terminal** | Write to `conversation-export-{YYYY-MM-DD}.md` in the current directory using `write_to_file` or `echo` redirect |
| **Agent chat (web/desktop)** | Emit inside a fenced `markdown` code block in the response |
| **IDE (Cursor, VS Code, etc.)** | Create a new file in the workspace root using the editor's file-creation tool |
| **Notebook (Jupyter, Colab)** | Emit as a Markdown cell or write to `/content/export.md` |
| **No write access** | Emit both artifacts as code blocks in the response; note that saving requires manual copy-paste |

---

## Common Issues

| Issue | Fix |
|---|---|
| Conversation too long to fit in context | Run Phase 1 on the visible window only; note in `## Summary` that the session was truncated at turn N |
| No tools available to write files | Emit both artifacts as code blocks; add a note: "Copy Artifact 2 and save as `.md`" |
| User only provides a partial transcript | Process what is available; mark unknown fields as `[UNKNOWN]`, not as omitted |
| Compression ratio > 30% after retry | Accept the result; note "Compression limit reached" in the Context Prompt header |

---

## References

- `references/compression-format.md` — Read when you need the full compression schema, extended examples, or edge-case rules.
- `references/environment-adapters.md` — Read when the delivery environment is ambiguous or unusual.
