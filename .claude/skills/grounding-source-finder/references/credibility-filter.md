# Credibility Filter

Reference for STEP 3 and STEP 4 of `grounding-source-finder`. Defines the source-tier ladder, the scoring rubric, recency weighting, and the per-domain search surfaces to query before ranking candidates.

---

## Source-Tier Ladder

Rank every candidate by the highest tier it genuinely qualifies for. A source claiming a tier it does not meet (e.g., a blog post citing itself as a "standard") is scored at its actual tier, not its claimed one.

| Tier | Definition | Examples |
|---|---|---|
| 1 | Peer-reviewed academic paper or published book from a recognized academic/technical publisher | Papers indexed in Google Scholar / Semantic Scholar / arXiv with citations; O'Reilly, Manning, Addison-Wesley, MIT Press books |
| 2 | Official standard or specification body | ISO, IEEE, ACM, W3C, RFC, official language/framework documentation (e.g., docs.python.org, developer.mozilla.org) |
| 3 | Community-vetted technical reference with editorial or maintenance oversight | Highly-starred canonical open-source repos (with maintainers, not a random fork), well-maintained technical wikis backed by a working group |
| 4 | Established technical publication or vetted long-form article | Martin Fowler's site, ThoughtWorks Technology Radar, established engineering blogs from companies operating the pattern in production, conference talks (recorded, from a named speaker at a recognized venue) |
| 5 | Unranked blog post, forum answer, or AI-generated summary | Personal blogs with no citations, unlinked Stack Overflow answers, SEO content farms, LLM-generated explainer pages |

Tier 5 is never sufficient alone. A Tier 5 source may only support a Tier 1 to 4 source, never stand as the sole citation for a decision.

---

## Scoring Rubric

Score each candidate 0 to 3 on each axis. A candidate scoring 0 on any axis is disqualified regardless of total.

| Axis | 0 (disqualifying) | 1 | 2 | 3 |
|---|---|---|---|---|
| Source tier | Tier 5 alone | Tier 4 | Tier 2 to 3 | Tier 1 |
| Recency | Superseded by a newer edition/standard that contradicts it | 10+ years old, still cited as current practice | 3 to 10 years old | Published or last revised within 3 years |
| Editorial/peer status | No review process, no named accountable author | Named author, no formal review | Editorial review (published book, maintained doc) | Formal peer review or standards-body ratification |
| Community endorsement | Zero external validation signal | Some citations/stars, no independent confirmation | Multiple independent citations, moderate star count, or cited by a Tier 1 to 2 source | High citation count, widely adopted in production, or explicitly referenced by a standards body |

Total score drives the ranking in the Candidate Sources table (STEP 4). Present the top-scoring candidates first; never present a disqualified (0-axis) candidate unless explicitly asked for a same-tier comparison.

---

## Recency Weighting by Domain

Recency weight is domain-dependent; apply the multiplier before final ranking.

| Domain class | Recency multiplier | Rationale |
|---|---|---|
| Security, cryptography, fast-moving frameworks/APIs | High (age > 3 years drops one full score band) | Guidance and threat models change fast; a 5-year-old crypto recommendation may already be broken |
| Software architecture patterns, algorithms, mathematics | Low (age rarely penalizes below 10 years) | Foundational patterns and proofs do not expire |
| Domain-specific business rules (finance, legal, tax) | High if jurisdiction/regulation-bound; low if pure accounting theory | Regulatory content ages; double-entry bookkeeping theory does not |
| UX/design patterns | Medium (age > 5 years warrants a cross-check against current practice) | Patterns evolve with platform conventions |

---

## Per-Domain Search Surfaces

Query at least two surfaces from the applicable row before ranking. Never rely on a single search engine's first-page results.

| Domain | Primary surfaces |
|---|---|
| Computer science / software engineering | Google Scholar, Semantic Scholar, arXiv (cs.SE, cs.PL), ACM Digital Library, IEEE Xplore |
| Standards / protocols | Official standards body site (ISO, IEEE, W3C, IETF RFC index), official framework/language docs |
| Business domain (finance, accounting, requirements engineering) | Google Scholar, SSRN, official regulatory body publications, recognized textbook publishers (Pearson, Wiley) |
| General technical practice | Publisher catalogs (O'Reilly, Manning), Martin Fowler's site, ThoughtWorks Radar, well-maintained canonical GitHub repos (filter by stars, active maintenance, and named maintainers, not raw star count alone) |

---

## Verification Requirement

Every link presented in the Candidate Sources table (STEP 5 of `grounding-source-finder`) must have been opened and its content confirmed to actually address the generalized problem class in this session. Do not list a link found only in search-result snippets without opening it. If a link cannot be verified (paywall block, dead link, region lock), note this in the table rather than omitting the source silently.
