# House Language Policy

The **standard bilingual behavior** for every artifact this repo produces or distills. It governs both the *behavior of a generated skill* and the *language of the meta-skill's own output*.

> **Why this file exists**: Every active study skill (doc-drill, deep-flashcard-generator, vocabulary skills) follows the same pattern — **English internal instructions, user-language output**. This file makes that a reusable, enforced contract.

---

## The Core Rule

```
Internal processing (instructions, logic, technical terms): ENGLISH.
User-facing output (messages, artifacts, explanations):  THE USER'S LANGUAGE.
```

The language the user writes in determines the artifact's output language.

---

## Language Buckets

| User writes in | Skill responds / outputs in | Technical terms |
|---|---|---|
| English | English | Preserve original |
| Vietnamese | Vietnamese | Preserve English terms (e.g., Callback, Promise, Mutability) |
| Japanese | Japanese | Preserve English terms |
| French | French | Preserve English terms |
| Any other | That language | Preserve original terms |

**Key convention**: Technical jargon and domain terms stay in English even when the surrounding prose is in the user's language. This is a deliberate trade-off for precision.

---

## Where to Apply the Policy

1. **Generated skill's own output** — every skill a meta-skill produces must include a `Language Policy` section (see template below).
2. **The meta-skill's output** — when the meta-skill responds to a user, it matches the user's language.
3. **Reference files** — remain in English (they are internal instructions).
4. **Frontmatter `description`** — generally English or the repo's working language (frontmatter is discovery metadata; keep it consistent).

---

## Language Policy Template (for Generated Skills)

Every generated, multilingual skill should include this section verbatim:

```markdown
## Language Policy

- Respond in the same language the user writes in.
- All internal processing follows these English instructions.
- All user-facing output should match the user's language.
- Preserve English technical terms even when the surrounding text is in the user's language.
- If the language is unclear, ask one question (default option: English). Never guess the user's language.
```

---

## Artifact Language vs. Output Language

Two distinct decisions — do not conflate them:

| Decision | Question | Default |
|---|---|---|
| **Artifact language** | What language should the *generated prompt/skill/schema* be written in? | English, unless the user specifies |
| **Output language** | What language should the *meta-skill's reply* (chat, explanation, critique) be in? | The user's language |

**Ask if unclear**: *"Should the generated artifact itself be in English, or in [user's language]?"*

---

## Anti-Patterns

| ❌ Avoid | ✅ Prefer |
|---|---|
| Mixing languages within one instruction body | Keep instructions one language; output another |
| Translating technical terms (loses precision) | Preserve English technical terms |
| Inferring language from content instead of user | Match the user's writing language |
| Forcing English output for a Vietnamese user | Output in Vietnamese, keep English terms |
