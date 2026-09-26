# Compression Format — Extended Reference

> Read this file when you need the full compression schema, extended examples, or edge-case handling beyond what `SKILL.md` covers.

---

## Compression Schema (Extended)

The Context Prompt uses a **header-indexed bullet structure**. Each section has a strict line budget:

| Section | Max Lines | Format |
|---|---|---|
| `[CONTEXT HANDOFF]` header | 2 | Label + session title + date |
| `## GOAL` | 3 lines max | Verb-object bullets ("Build X", "Fix Y", "Understand Z") |
| `## CONTEXT` | 5 lines max | Noun-phrase bullets (facts, not sentences) |
| `## DECISIONS` | Unlimited | One decision per line, verb-first ("Use Python 3.12", "Store config in `.env`") |
| `## ARTIFACTS` | Unlimited | `filename.ext — one-line description` |
| `## OPEN ITEMS` | Unlimited | Action-item bullets, or literal `None.` |

If any section exceeds its budget:
1. Combine two related bullets into one.
2. If still over budget, keep only the most recent/final version of each concept.

---

## Compression Algorithm (Step by Step)

```
Input: Raw conversation turns (classified in Phase 1)
Output: Compressed Context Prompt ≤ 30% of raw token count

Step 1 — Strip FILLER turns entirely (no partial retention).
Step 2 — For each DECISION turn:
    a. Extract the conclusion sentence only.
    b. Drop all reasoning prose.
    c. Write as verb-first bullet.
Step 3 — For each GOAL turn:
    a. Keep only the user's stated objective, not the discussion around it.
    b. If the goal changed during the session, keep only the final version.
Step 4 — For each CODE/DATA turn:
    a. Preserve the artifact verbatim.
    b. If > 50 lines: truncate to first 20 + last 10 lines with [... N lines omitted ...] marker.
    c. List the artifact name in ## ARTIFACTS.
Step 5 — For each CONSTRAINT turn:
    a. Extract the rule verbatim (one line each).
    b. Group under ## CONTEXT.
Step 6 — Count tokens. If > 30% of raw:
    a. Retry Step 2 (drop all reasoning) and Step 3 (final goal only).
    b. Accept result after one retry. Note "Compression limit reached."
```

---

## Token Counting (Approximation)

When exact tokenization is unavailable, use this approximation:

```
Tokens ≈ words × 1.33
```

Example: 1000-word conversation ≈ 1330 tokens. Target compressed prompt ≤ 399 tokens.

If a tokenizer is available (e.g., `tiktoken` in Python), use it instead.

---

## Extended Compression Examples

### Example A — Short Conversation (5 turns)

**Raw** (~80 tokens):
```
User: How do I center a div in CSS?
Agent: Use flexbox: `display:flex; justify-content:center; align-items:center;`
User: What about for an absolute-positioned element?
Agent: Use `top:50%; left:50%; transform:translate(-50%,-50%);`
User: Thanks!
```

**Compressed Context Prompt** (~25 tokens):
```
[CONTEXT HANDOFF]
Session: CSS Centering Techniques — 2026-09-24

## GOAL
- Learn how to center elements in CSS

## DECISIONS
- Flexbox method: `display:flex; justify-content:center; align-items:center;`
- Absolute position method: `top:50%; left:50%; transform:translate(-50%,-50%);`

## OPEN ITEMS
None.
```

**Compression ratio**: ~31% → retry Step 2 not needed (acceptable margin).

---

### Example B — Long Technical Session (60+ turns)

**Strategy**:
1. Group all DECISION turns chronologically; keep only the final version of any overridden decision.
2. All CODE turns: preserve verbatim, list in `## ARTIFACTS`.
3. GOAL turns: keep only the final-state goal if it evolved.
4. Apply `[... N lines omitted ...]` to code blocks > 50 lines.

---

## Markdown Report — Extended Sections

For sessions with audit or compliance requirements, add these optional sections to the Markdown Report:

```markdown
## Model / Agent Used
{Name and version of the AI model, if known}

## Session Duration
{Estimated wall-clock time, if trackable}

## Conversation Source
{Platform: CLI / Web / IDE / API — and the session ID or URL if available}

## Change Log (if applicable)
| Turn # | Change | Reason |
|---|---|---|
| 12 | Switched from Node.js to Python | Performance requirement emerged |
```

---

## Edge Cases

| Case | Rule |
|---|---|
| Conversation is in a non-English language | Preserve original language in all artifacts; do not translate |
| Conversation contains sensitive data (passwords, PII) | Replace with `[REDACTED]` in both artifacts; note in Summary |
| Multiple users in conversation | Tag bullets as `[User A]` / `[User B]` in DECISIONS |
| Conversation contains images | List image references as `image-{N}.png — [description inferred from context]` in ARTIFACTS |
| No decisions were made | Write `None.` in `## DECISIONS`; do not omit the section |
