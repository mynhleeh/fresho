# Universal Taxonomy & Navigation Architecture

The **intent-based knowledge classification architecture** for AI repositories and engineering knowledge bases. This mental model enables a meta-skill to categorize AI engineering artifacts, organize workspaces, and route citations by epistemic weight.

> **Why this file exists**: The meta-skill needs to (a) classify an artifact into the right epistemic axis and directory, and (b) route citations by trust level. This is the distilled reference for the **NAVIGATE / ORGANIZE** mode.

---

## The 3 Axes — Intent-Based Taxonomy

Every engineering artifact serves one of three primary intents:

| Axis | Decision Question | Canonical Folder Example |
|---|---|---|
| **INSTRUCTIONS** | Will I feed this directly to AI to execute? | `instructions/` (or `skills/`, `.agents/`) |
| **KNOWLEDGE** | Will I read this to learn or research a domain? | `knowledge/` (or `docs/`, `reference/`) |
| **BLUEPRINTS** | Is this a design, blueprint, or mental model? | `blueprints/` (or `architectures/`, `design/`) |

### Decision Tree

```
Q1: Will I feed this directly to an AI agent to execute?
  → Yes → INSTRUCTIONS (e.g. instructions/skills/, prompts/, rules/)
  → No  → Q2

Q2: Will I read this to learn, research, or explain a domain?
  → Yes → KNOWLEDGE (e.g. knowledge/guides/, papers/, articles/)
  → No  → Q3

Q3: Is this a system design, architecture, or mental model?
  → Yes → BLUEPRINTS (e.g. blueprints/architectures/, concepts/)
  → No  → Clarify with user / inspect project conventions
```

---

## Resource Classification Table

Map artifacts to their respective axis and adapt to host workspace layout:

| Resource type | Axis | Standard Project Location Pattern |
|---|---|---|
| Skill files (`SKILL.md`) | INSTRUCTIONS | `instructions/skills/` or `.agents/skills/` |
| System prompts | INSTRUCTIONS | `instructions/prompts/` |
| Rules files (`AGENTS.md`, `.cursorrules`) | INSTRUCTIONS | `instructions/rules/` or project root |
| Automation scripts | INSTRUCTIONS | `instructions/scripts/` or `scripts/` |
| How-to guides, tutorials | KNOWLEDGE | `knowledge/guides/` or `docs/guides/` |
| Academic / technical papers | KNOWLEDGE | `knowledge/papers/` or `docs/papers/` |
| Technical articles, case studies | KNOWLEDGE | `knowledge/articles/` |
| System architecture diagrams | BLUEPRINTS | `blueprints/architectures/` |
| Mental models, frameworks | BLUEPRINTS | `blueprints/concepts/` |

---

## Dynamic Lifecycle Split (3 Tiers)

Sub-folders or tags are established to distinguish resource provenance and lifecycle state:

| Tier | Purpose | Contains |
|---|---|---|
| `active/` | Currently used, maintained | Self-created resources actively in production |
| `archive/` | Retired — historical only | Deprecated or superseded resources, preserved for history |
| `external/` | Third-party, vendored | External repositories, submodules, or cloned tools |

### MECE Boundary
- `active/` and `archive/` → **only self-created** resources.
- `external/` → **only third-party** resources.
- When an `external/` resource is no longer needed → **remove/untrack** it (do NOT move to `archive/`).

---

## Epistemic Source Hierarchy (Citation Priority)

When citing or referencing content, apply this order. **Higher tiers carry greater epistemic weight** — always prefer the highest available tier.

| Priority | Type | Epistemic Weight & Verification Signal |
|---|---|---|
| Tier 1 | Academic papers, formal technical reports | Peer-reviewed, cited, empirical, reproducible |
| Tier 2 | Official documentation, specifications | Authoritative vendor/standards documentation |
| Tier 3 | Curated practitioner guides, tutorials | Practitioner-verified workflows |
| Tier 4 | Articles, blog posts | Community knowledge and case studies |
| Tier 5 | External curated submodules / tools | Third-party curated, reference only |
| Tier 6 | Active project working files | Operational context, not ground truth evidence |
| Tier 7 | Archive / historical files | Deprecated or historical context |

---

## Trust & Citation Rules

```
ALWAYS cite source tier or evidence grade when referencing content.
PREFER peer-reviewed research and official specs over informal sources for factual claims.
PREFER authoritative guides over prompt snippets for methodology.
TREAT project operational files as operational context, NOT as universal evidence.
DO NOT reference archive files unless explicitly requested for historical evolution.
DO NOT treat unverified third-party content as authoritative without verification.
```

---

## Agent Execution Protocol (Navigation)

When operating within a project workspace:

```
Step 1: Inspect workspace structure and active guidelines to establish scope.
Step 2: Classify the request: INSTRUCT / LEARN / DESIGN → map to appropriate workspace location.
Step 3: Consult the epistemic hierarchy before citing any resource.
Step 4: Prioritize Tier 1–3 for factual/methodological claims.
Step 5: Cross-reference YAML frontmatter and schemas for semantic matching.
Step 6: Execute using the highest-tier applicable source.
```

---

## How the Meta-Skill Uses This

- **Classify** a requested artifact → decide its target category and appropriate project directory.
- **Route citations** → in EXPLAIN/CONVERT modes, cite the source tier of the reference used.
- **Organize** → in NAVIGATE/ORGANIZE mode, place a resource and decide active/archive/external split.
