---
name: academic-research-synthesizer
description: "Synthesizes academic literature, builds structured empirical evidence matrices, critiques methodology rigor, and verifies scholarly claims. Trigger when the user wants to conduct a literature review, synthesize academic papers, extract empirical evidence, analyze research methodologies, or write scholarly state-of-the-art sections. Do NOT trigger for casual web summaries, informal blog posts, or pure flashcard creation."
version: 1.0.0
tags:
  - academic
  - literature-review
  - empirical-matrix
  - research-synthesis
  - methodology-critique
  - scientific
  - citation-grounding
license: MIT
compatibility: "Any agent"
---

# Academic Research Synthesizer

A rigorous scholarly literature synthesis and empirical critique engine. Built on systematic literature review and causal identification principles, this skill translates raw scientific papers and academic corpuses into structured evidence matrices, methodological critiques, and publication-ready literature syntheses.

---

## When to Activate

Activate when the user asks to:
- Conduct an exhaustive or scoping literature review across multiple papers.
- Build a comparative evidence matrix (datasets, models, metrics, findings).
- Critique research methodology, internal/external validity, or causal identification strategies.
- Synthesize the state of the art (SOTA) for a grant proposal or journal paper.
- Trace academic consensus, contradictions, or open research gaps.

**Trigger keywords**: `literature review`, `synthesize papers`, `tổng quan nghiên cứu`, `empirical matrix`, `bảng tổng hợp bằng chứng`, `research methodology audit`, `học thuật`, `academic survey`.

> **Do NOT trigger** for:
> - Casual blog post summaries or news overviews.
> - Generating study flashcards or rote memory aids from a single paper (use dedicated flashcard or study tools).
> - General software architecture reviews or code diff auditing (use dedicated architecture audit tools).

---

## Core Academic Principles

1. **Epistemic Honesty & Anti-Hallucination**: Every factual claim must be attributed to an explicit paper (Author, Year, Title, or DOI). Never extrapolate empirical numbers (p-values, F1-scores, sample sizes) that are not directly present in the source text.
2. **Methodology Before Conclusions**: Evaluate *how* the authors arrived at their conclusions before quoting the conclusions. Highlight potential identification failures, confounding variables, or dataset leakage.
3. **Synthesis Over Summarization**: Never write a linear list of paper summaries ("Paper A did X. Paper B did Y."). Always group by theme, methodology school, or empirical contradiction.
4. **Falsifiability & Limitation Surfacing**: Explicitly document what conditions would invalidate the paper's findings and where the empirical bounds break down.

---

## Synthesis Pipeline

```
1. INGEST & TRIAGE   ──► 2. EXTRACT MATRIX   ──► 3. RIGOR AUDIT   ──► 4. SYNTHESIZE THEMES   ──► 5. GAP IDENTIFICATION
(Corpus Classification)   (Structured Data)       (Threats to Validity)   (Thematic Grouping)     (Future Directions)
```

### Phase 1: Ingestion & Triage
- Classify paper types: Theoretical, Empirical / Experimental, Survey / Meta-analysis, or Benchmark.
- Record sample size ($N$), data provenance, baseline models, and evaluation protocol.

### Phase 2: Evidence Matrix Extraction
Extract data into a standardized comparison schema:
- Research Question / Hypothesis
- Data & Environment / Benchmark
- Identification Strategy / Architecture
- Core Metric & Effect Size
- Primary Limitations

### Phase 3: Methodological Rigor Audit
Examine threats to validity:
- **Internal Validity**: Selection bias, data snooping, omitted variable bias, hyperparameter tuning bias.
- **External Validity**: Domain shift, synthetic benchmark vs real-world gap.
- **Reproducibility**: Open code, open weights, deterministic seeds.

### Phase 4: Thematic Synthesis
Synthesize the state of the field along conceptual axes:
- Where the field agrees (consensus findings).
- Where findings conflict (divergent results and why they diverge).
- Structural trade-offs (e.g., accuracy vs compute cost, bias vs variance).

---

## Output Contract

Every literature review report must follow this format:

```markdown
# 📚 Scholarly Literature Synthesis: [Topic Title]

## 1. Executive Summary & Synthesis Map
- **Scope of Review**: [Number of papers reviewed, temporal range]
- **Dominant Methodological Paradigm**: [e.g., Transformer-based scaling / Quasi-experimental causal inference]
- **Core Academic Consensus**: [2-3 sentences summarising undisputed facts]

## 2. Structured Evidence Matrix
| Study (Author, Year) | Paradigm / Architecture | Dataset / Sample ($N$) | Primary Metric / Effect Size | Identification Strategy / Protocol | Reported Limitation |
|---|---|---|---|---|---|
| [Citation 1] | [...] | [...] | [...] | [...] | [...] |
| [Citation 2] | [...] | [...] | [...] | [...] | [...] |

## 3. Thematic Analysis & Methodological Divergence
### Theme A: [Thematic Area 1]
[Synthesized narrative comparing studies, highlighting why results agree or differ]

### Theme B: [Thematic Area 2]
[Synthesized narrative]

## 4. Threats to Validity & Critical Appraisal
- **Identification & Confounding Risks**: [Specific concerns across reviewed papers]
- **Benchmark Leakage / Overfitting**: [Observations regarding evaluation reliability]

## 5. Unresolved Gaps & Open Research Vectors
- **Gap 1**: [Concrete unanswered question with theoretical rationale]
- **Gap 2**: [Methodological blind spot]

## 6. Bibliographic References
- [1] Author(s), "Title", *Venue/Journal*, Year. [DOI/URL]
```

---

## Anti-Examples

| ❌ Avoid | ✅ Prefer | Why |
|---|---|---|
| Listing papers as disjointed bullet points | Grouping findings by theme, conflicting evidence, or methodology | Creates true scientific synthesis rather than an annotated bibliography |
| Quoting percentage gains without baseline numbers | Quoting exact metric pairs (e.g., "improved from 74.2% to 78.5% on GSM8K") | Prevents misleading performance claims |
| Treating unverified preprint claims as consensus facts | Explicitly flagging preprints vs peer-reviewed publications | Maintains established academic evidence hierarchy (peer-reviewed > preprints) |
| Inventing citations or generalizing beyond the text | Explicitly noting "Source document does not report metric for benchmark X" | Eliminates hallucination in academic synthesis |

---

## Provenance
- Distilled from systematic literature review methodologies, scientific critical thinking frameworks, and empirical paper analysis standards.
- Formatted following universal agent skill conventions.
