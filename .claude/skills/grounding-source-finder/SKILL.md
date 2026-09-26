---
name: grounding-source-finder
description: "Finds authoritative external documents (books, peer-reviewed papers, recognized standards, highly-regarded community references) to ground a decision when no internal knowledge source (docs/academic, docs/domain, docs/reference, .ops-memory) covers it. Generalizes the user's specific problem into the broader problem class before searching, so it accepts any credible source that resolves the class, not only sources naming the exact term. Trigger when the agent needs a citation before proceeding, when the user asks 'find me a source for X', 'tìm tài liệu về X', 'need a reference for this decision', or when a design/business-rule decision has no grounding under the internal knowledge tiers. Do NOT trigger for searching the repository's own internal files (use the existing internal resolution cascade) or for general web search unrelated to grounding a pending decision."
version: 1.0.0
tags:
  - research
  - grounding
  - citation
  - source-finding
  - academic-search
  - literature-review
  - reference-vetting
license: MIT
compatibility: "Any agent with web search"
---

# Grounding Source Finder

Finds and vets external authoritative documents on behalf of the user whenever a decision lacks grounding in the workspace's own knowledge tiers. Never invents a citation and never fabricates a source; every result returned is a real, checkable link.

---

## When to Activate

Activate when:
- A pending design decision, business rule, or architectural choice has no coverage in `docs/academic/`, `docs/domain/`, `docs/reference/`, or `.ops-memory/` (the workspace's internal knowledge tiers), and the agent would otherwise have to guess or ask the user to manually go find something.
- The user explicitly asks to find a book, paper, standard, or reference for a stated problem.
- The user says a decision needs a citation, a source, "cơ sở tri thức", or "tài liệu tham khảo" before it can be finalized.

**Trigger keywords**: `find a source`, `find me a reference`, `need a citation`, `tìm tài liệu`, `tìm nguồn`, `cơ sở tri thức`, `reference for this decision`, `is there a paper on`, `tài liệu tham khảo cho`.

> **Do NOT trigger** for:
> - Looking inside the repository's own tracked files (`docs/`, `.ops-memory/`) — that is plain file search, not external sourcing.
> - Open-ended web browsing with no decision to ground.

---

## Core Principle: Generalize Before Searching

A document about problem X rarely exists in isolation; most real documents that solve X also cover Y and Z. Searching for the literal narrow phrase the user typed under-returns results and over-filters credible sources that would in fact resolve the decision.

Before issuing any search query, restate the user's concrete problem as the general problem class it belongs to. Only the general class needs to be resolved by the source; the source does not need to mention the user's specific term.

| Concrete ask | General problem class to search |
|---|---|
| "Tìm tài liệu về cách tính lãi kép cho ví tiết kiệm" | Compound interest accrual models in personal finance systems |
| "Cần nguồn cho việc chia lớp Wallet thành Cash/Bank/Ewallet" | Class hierarchy design for polymorphic account/instrument types in OOAD |
| "Tài liệu nào nói về cách xử lý nợ trả góp" | Amortized debt/installment repayment modeling |

State the generalized problem class back to the user in one line before searching (Working Notes), so a wrong generalization is caught immediately rather than silently narrowing the search.

---

## Instructions

1. **Restate and generalize.** Convert the concrete question into its general problem class (table above). If the class is ambiguous between two readings, ask one clarifying question instead of guessing.
2. **Check internal tiers first.** Confirm the answer is genuinely absent from `docs/academic/`, `docs/domain/`, `docs/reference/`, and `.ops-memory/` in the active project. If it is already covered internally, report that instead of searching externally.
3. **Search using the Credibility Filter** (`references/credibility-filter.md`) — run searches across at least two of: academic search engines (Google Scholar, Semantic Scholar, arXiv), publisher/standards catalogs (IEEE, ACM, ISO, official language/framework docs), and community-vetted technical references (O'Reilly, Manning, highly-starred canonical repos, Stack Overflow's linked canonical sources). Never treat an unranked blog post or an AI-generated summary page as sufficient on its own.
4. **Rank candidates** using the scoring table in `references/credibility-filter.md`: recency, source tier, peer-review/editorial status, and community endorsement signal (citation count, stars, official adoption).
5. **Verify each link resolves** before presenting it — do not include a URL that was not actually checked in this session.
6. **Present the candidate list** (Output Contract below) and stop. Do not silently write the source into `docs/reference/` or treat it as ground truth — that promotion is the user's decision.
7. **On user confirmation**, register the chosen source: if the target project defines a registration path (e.g., `docs/reference/`), place the citation there in the format that path already uses; otherwise ask where to file it.

---

## Output Contract

Emit a single block:

```
## Working Notes
- Concrete question: [...]
- Generalized problem class: [...]
- Internal tiers checked: [paths checked] → not covered
- Search surfaces used: [list]

## Candidate Sources
| # | Title | Author/Publisher | Year | Tier | Link | Why it resolves the problem class |
|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... |

## Recommendation
[Which candidate is strongest and why, in one line]

## Next Step
Awaiting confirmation before registering into [target path].
```

---

## Anti-Examples

| ❌ Avoid | ✅ Prefer | Why |
|---|---|---|
| Searching only the literal phrase the user typed | Generalizing to the problem class first | Real documents rarely match a narrow phrase exactly |
| Citing a source without opening/verifying the link | Verifying every link resolves before listing it | Prevents hallucinated or dead citations |
| Auto-writing the result into `docs/reference/` | Presenting candidates and waiting for confirmation | Promotion to ground truth is the user's call (ask, don't invent) |
| Accepting any blog post as sufficient | Applying the credibility tier filter | Ungated sources corrupt the grounding hierarchy |

---

## Common Issues

- **No credible source exists for the exact class.** Report this explicitly rather than stretching a loosely related paper to fit; ask the user whether to broaden the class further or proceed without external grounding (flagged as an assumption).
- **Too many equally strong candidates.** Present up to 5, ranked, and let the user pick rather than arbitrarily choosing one.
- **Paywalled source.** Note the paywall in the table and prefer an open-access equivalent (preprint, official standard summary) when one exists at comparable credibility.

---

## References

| File | Contents | Read when |
|---|---|---|
| `references/credibility-filter.md` | Source-tier ladder, scoring rubric, recency weighting, per-domain search surfaces | Every search, before ranking candidates |
