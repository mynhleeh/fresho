---
description: "Engineering guide for Markdown syntax defense, delimiter conflict prevention when embedding LaTeX mathematics in tables, code fence hygiene, admonitions, and table formatting."
version: "3.1.0"
---

# Markdown & Syntax Engineering Guide

This guide establishes mechanical engineering standards to prevent syntax collisions when writing technical documentation in Markdown. The rules address LaTeX mathematics embedded inside tables, GitHub Flavored Markdown (GFM) admonitions, code fence formatting, unrendered escape artifacts, and structural table alignment. Every standard defines a countable verification condition.

---

## 1. Delimiter Conflict Prevention for LaTeX Math in Markdown Tables

### 1.1 Root Cause of Parsing Collisions

Standard Markdown parsers scan source characters sequentially, splitting table rows into columns on every unescaped pipe character (`|`) before inline mathematical expressions are handed off to KaTeX or MathJax rendering engines.

When an inline LaTeX formula (`$ ... $`) inside a table cell contains a bare pipe (`|`), the parser interprets it as a cell boundary. The mathematical expression is split across two separate table columns, destroying the grid structure and leaving dangling `$ ` delimiters that break downstream rendering for the entire document.

```
Parser collision example when using bare pipes:
| Metric | Math Expression | Status |
| :---: | :---: | :---: |
| K1 | $|x| < 5$ | PASS |

The Markdown parser splits this into four columns instead of three:
Column 1: K1
Column 2: $
Column 3: x
Column 4: < 5$
```

### 1.2 Mandatory Mathematical Syntax Conversions

To ensure table structures remain intact, engineers must apply the following syntax replacements for all mathematical formulas embedded in Markdown tables:

| Mathematical Notation | Collision Syntax | Standard Compliant Syntax | Technical Mechanism |
| :--- | :--- | :--- | :--- |
| Absolute Value | `$|x|$` or `$|A - B|$` | `$\lvert x \rvert$` or `$\vert x \vert$` | TeX macros `\lvert` and `\rvert` avoid bare pipes, preventing cell division. |
| Error Deviation | `$|\Delta S| = |S_{exp} - S_{act}|$` | `$\lvert \Delta S \rvert = \lvert S_{exp} - S_{act} \rvert$` | Formula remains inside a single cell while renderers display full-height vertical bars. |
| Set Builder Condition | `$\{ x \in \mathbb{R} | x > 0 \}$` | `$\{ x \in \mathbb{R} \mid x > 0 \}$` | The `\mid` command produces standard mathematical spacing without pipe characters. |
| Conditional Probability | `$P(A | B)$` | `$P(A \mid B)$` | The `\mid` command preserves conditional logic syntax cleanly. |
| Vector or Matrix Norm | `$\|v\|_2$` | `$\lVert v \rVert_2$` | TeX commands `\lVert` and `\rVert` render double-bar norms cleanly. |
| Plain Text Pipe Character | `Status: Active | Pending` | `Status: Active &#124; Pending` | The HTML entity `&#124;` renders as a vertical bar after Markdown table columns are built. |

### 1.3 Mechanical Verification Regular Expression

Automated audit rule: The count of bare pipe characters inside inline mathematical formulas within Markdown tables must equal 0.

Verification regex:
```regex
(?<=^\|.*\$[^$]*)\|(?=[^$]*\$.*\|$)
```

Verification criteria:
1. Running the regular expression across the document yields 0 matches.
2. Status: PASS when no bare pipes exist within table math cells; FAIL if any bare pipe is detected.

### 1.4 Isolating Complex Mathematics into Display Blocks

When a mathematical formulation involves matrices, piecewise definitions, or multi-line derivations, do not force the formula into a Markdown table cell. Instead, place an identifier in the table and present the complete derivation in a standalone display math block:

| Theorem Identifier | Mathematical Formulation | Applicability Domain |
| :---: | :---: | :---: |
| TH-01 | Refer to Equation (1) | Convex optimization boundaries |

Equation (1):
$$
\min_{\theta \in \Theta} \sum_{i=1}^{N} \mathcal{L}(f(x_i; \theta), y_i) + \lambda \lVert \theta \rVert_2^2
$$

---

## 2. GitHub Flavored Markdown (GFM) Admonitions

### 2.1 The Five Canonical Admonition Types

Use standard GFM blockquote syntax for callout boxes. Each alert must serve a specific operational purpose:

> [!NOTE]
> Operational context, background facts, or non-blocking implementation details.

> [!TIP]
> Practical guidance, performance optimizations, or developer efficiency suggestions.

> [!IMPORTANT]
> Critical architectural constraints or mandatory configuration parameters.

> [!WARNING]
> Potential failure modes, breaking API modifications, or data deprecation notices.

> [!CAUTION]
> High-risk operations that can cause irreversible data loss or security vulnerabilities.

### 2.2 Formatting Discipline for Admonitions

1. Zero Nesting:
Never nest an admonition blockquote inside another admonition. Nested callout boxes trigger parsing ambiguities across different Markdown engines.

2. Zero Consecutive Admonitions:
Do not place two admonition boxes consecutively without intervening explanatory text. When multiple alerts are necessary, consolidate related instructions into a single callout block.

---

## 3. Code Fence Hygiene, Escape Sequences, and In-Text Identifiers

### 3.1 Seamless Code Fence Rule

Triple backticks and language identifiers must appear without intervening spaces:

Prohibited:
````markdown
``` mermaid
flowchart LR
  A --> B
```
````

Compliant:
````markdown
```mermaid
flowchart LR
  A --> B
```
````

Countable audit rule: Matches for the regular expression `^```\s+\w+` must equal 0 across the entire file.

### 3.2 Elimination of Raw Escape Literals

Ensure that automated code generation does not leave unparsed escape literals (such as literal `\n\n` or `\t`) exposed as raw text in rendered documentation:

Prohibited:
> The service initializes listening ports.\n\nThen it establishes database connections.

Compliant:
> The service initializes listening ports.
>
> Then it establishes database connections.

Countable audit rule: Matches for literal `\\n\\n` or `\\r\\n` strings in prose text must equal 0.

### 3.3 No HTML-Entity Escaping in Markdown Headings

Table-of-contents generators derive anchor slugs directly from the raw heading text, not from an HTML-escaped copy of it. Escaping `&`, `<`, or `>` into `&amp;`, `&lt;`, `&gt;` inside a heading line changes the visible text without changing the generated slug, so a table-of-contents link built from the pre-escape heading can point to an anchor that no longer matches, or the escaped variant renders literally in some parsers instead of resolving to the character.

Prohibited:
```markdown
## Domain Invariants &amp; Business Rules
```

Compliant:
```markdown
## Domain Invariants & Business Rules
```

Countable audit rule: Matches for `&amp;`, `&lt;`, or `&gt;` on lines matching `^#{1,6}\s` must equal 0.

### 3.4 Mandatory Backtick Spans for Code Identifiers

All technical entities appearing in prose must be enclosed in single backtick spans:
- Software packages and libraries (`pydantic`, `tokio`, `libuv`)
- Function signatures and methods (`process_payment()`, `handle_connection()`)
- Configuration keys and environment variables (`DATABASE_URL`, `max_connections`)
- HTTP status codes and error types (`200 OK`, `404 Not Found`, `ECONNRESET`)
- File system paths and extensions (`/etc/systemd/system/`, `schema.sql`)

---

## 4. Markdown Table Alignment and Formatting Engineering

### 4.1 Explicit Alignment Delimiters

Every Markdown table must specify explicit column alignment indicators in its delimiter row:
- Left-aligned (text, descriptions, names): `:---`
- Center-aligned (identifiers, status badges, dates, types): `:---:`
- Right-aligned (numerical values, latencies, memory sizes, currencies): `---:`

Compliant table structure:
```markdown
| Identifier | Service Name | Request Latency (P99) | Status |
| :---: | :--- | ---: | :---: |
| SRV-01 | Authentication Proxy | 12 ms | ACTIVE |
| SRV-02 | Payment Gateway | 145 ms | ACTIVE |
| SRV-03 | Reporting Worker | 2,400 ms | DEGRADED |
```

### 4.2 Column Header Minimalism

When a table is nested under a clear contextual section heading, do not repeat the category name across every column header:

Prohibited:
`| Business Rule ID | Business Rule Name | Business Rule Description | Business Rule Impact |`

Compliant:
`| UID | Name | Invariant Logic | System Impact |`
