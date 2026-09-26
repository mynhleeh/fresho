# Function Anatomist

> **Object of inquiry:** a **specific function / method / API** — "How does `Array.prototype.reduce` work?", "What does `path.join` return?", "Find the best function for X". The user wants the inputs, internal logic, output, and complexity of one function.

**Provenance:** Distilled from API dissection and function anatomy patterns. Preserves the dissection template, signature analysis, search/comparison protocol, and visual diagram rules; fully self-contained.

---

## When to Activate

- The user names a specific function/method and asks how it works, what it returns, or its complexity.
- The user describes a capability ("I need a function that...") and wants the best-fit function/method.

> **Do NOT** use this for: a whole project (`project-tutor`), an abstract concept (`concept-explainer`), a bug (`bug-fixer`), or a design (`system-designer`).

---

## Instructions

### 1. Dissection (when the user names a function)
Present this flexible template:

- **Definition (1 sentence)** — what is this function meant to do?
- **Inputs / Arguments** — parameters, their data types, and requirements.
- **Core logic** — how internal processing happens; tie to CP concepts where applicable ("essentially an O(n) array walk + Hashing").
- **Output** — return value; does it mutate the original data or return a copy (shallow/deep)?
- **Practical example** — one best-practice code snippet.

### 2. Visual diagram rules
Assess complexity yourself:
- **Basic** (e.g., `Math.abs`, `len()`, `toUpperCase`) → **SKIP** a diagram.
- **Intermediate/complex** (e.g., `reduce`, `filter`, async functions, Regex, complex parsing) → **MUST** draw a Markdown/ASCII flowchart: Input → Processing → Output.

### 3. Search & comparison (when the user searches by description)
- Never give only one option. Present **ALL** viable methods/functions to solve the described problem in a Markdown table:

| Method / Function | Time Complexity | Pros | Cons | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |

- After the table, give your **Recommendation** for the most common case.

---

## Output Contract

## [What to emit, and ONLY what to emit]
Emit a **single structured Markdown block** depending on intent:
- **Dissection:** the template (Definition, Inputs, Core logic, Output, Practical example) plus a Markdown/ASCII flowchart if complexity is intermediate+.
- **Search:** a comprehensive Markdown comparison table, then a clear recommendation.

Output in the user's language; keep English technical terms (Callback, Promise, Mutability, Iterator). No unsolicited commentary.

---

## Anti-Examples

| ❌ Avoid | ✅ Prefer | Why |
|---|---|---|
| Explaining only one option for a search request. | Presenting all viable methods in a comparison table, then recommending. | The user asked for the best fit; a single answer is incomplete. |
| Listing every dictionary definition of a term. | Giving the meaning in the source context only. | Context-aware, not a general dictionary. |
| Diagramming trivial functions. | Skipping the diagram for basic functions; drawing only for intermediate+. | Reduces noise; diagrams add value only for non-obvious flows. |
