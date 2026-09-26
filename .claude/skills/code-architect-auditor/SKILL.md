---
name: code-architect-auditor
description: "Audits software architecture, reviews proposed code changes, enforces surgical refactoring, and verifies test-driven implementation. Trigger when the user asks to review code, audit architecture, check diffs, find architectural flaws, or refactor a codebase cleanly. Do NOT trigger for ordinary single-function syntax bugs or generic code generation without auditing intent."
version: 1.0.0
tags:
  - architecture
  - code-review
  - audit
  - refactoring
  - surgical-changes
  - test-driven
  - quality-gate
license: MIT
compatibility: "Any agent"
---

# Code Architect & Auditor

A rigorous architectural review and code audit engine. Distilled from the Karpathy 4-Principles and enterprise agentic review workflows, this skill enforces surgical modifications, clean dependency boundaries, and verified test-driven changes.

---

## When to Activate

Activate when the user asks to:
- Review or audit an existing codebase, PR, or architecture design.
- Identify architectural smells, circular dependencies, or over-engineering.
- Plan or execute surgical refactoring without breaking existing contracts.
- Audit a git diff or implementation plan for regressions, security flaws, or spec compliance.

**Trigger keywords**: `review code`, `audit architecture`, `kiểm tra kiến trúc`, `audit diff`, `refactor clean`, `surgical change`, `đánh giá code`, `architecture review`.

> **Do NOT trigger** for:
> - Simple syntax errors or quick CLI fixes (use standard coding tools or interactive debugging/mentoring tools).
> - Generating new skills, prompts, or meta-artifacts (use dedicated prompt/skill authoring tools).

---

## The 4 Architectural Laws

Every audit and refactoring plan must strictly satisfy these four non-negotiable laws:

1. **Think Before Coding (Dependency Mapping)**: Never suggest code changes without first identifying all upstream callers and downstream dependents.
2. **Simplicity First (Anti-Overengineering)**: Reject unnecessary abstractions, premature factory patterns, or superfluous generic layers. Prefer the most direct, readable implementation.
3. **Surgical Changes (Bounded Diffs)**: Modify only what directly serves the objective. Never reformat, rename, or touch unrelated code in the same change pass.
4. **Evidence Before Assertions (Verification Gate)**: Every claim that code is "correct" or "fixed" must be backed by a concrete test execution or mechanical proof.

---

## Audit Workflow Pipeline

```
1. MAP           ──► 2. DIAGNOSE      ──► 3. RED-TEST       ──► 4. SURGICAL FIX  ──► 5. VERIFY
(Callers/Callees)     (Smells & Risks)    (Failing Testcase)    (Minimal Diff)       (Green Proof)
```

### Step 1: Structural & Contextual Mapping
- Trace the entry point, public APIs, and data flow.
- Scan for active project-level architecture guidelines, coding rules, or linter configs in the workspace (e.g., `.cursorrules`, `.editorconfig`, architecture decision records, or style guides) to align audit standards with project conventions.
- Record any shared state, global variables, or hidden I/O dependencies.

### Step 2: Diagnostic & Smell Detection
Audit the code against the **Defect Taxonomy**:
- **Coupling Flaws**: Tight coupling between unrelated domain modules.
- **Leaky Abstractions**: Internal implementation details exposed across boundaries.
- **Fragile State**: Mutable state shared across concurrent operations or unhandled failure states.
- **Unverified Assumptions**: Missing input validation at public boundaries.

### Step 3: Red-Test Definition (Baseline)
- Formulate or locate the exact test case that currently fails or reveals the architectural defect.
- If no test exists, specify the minimal reproducible test harness.

### Step 4: Surgical Implementation / Recommendation
- Provide targeted diffs or actionable code snippets.
- Use explicit before/after comparisons (`❌ Avoid` vs `✅ Prefer`).
- Keep diffs localized and minimal.

### Step 5: Verification & Quality Gate
Run or specify the exact verification command:
- Confirm that existing test suites pass without regression.
- Verify that the specific defect is eliminated.

---

## Output Contract

Every audit report must be emitted in this exact structured format:

```markdown
# 🏛️ Architecture & Code Audit Report

## 1. Executive Summary
- **Target Component**: [file or subsystem path]
- **Audit Verdict**: [PASS / PASS WITH CONCERNS / REFACTOR REQUIRED]
- **Primary Risk Factor**: [High / Medium / Low] — [One-line risk statement]

## 2. Dependency & Impact Map
- **Upstream Callers**: [List of modules calling this component]
- **Downstream Callees**: [List of dependencies consumed]
- **Blast Radius**: [Contained / Multi-component / System-wide]

## 3. Findings & Code Smells
| # | Location | Severity | Category | Specific Finding & Impact |
|---|---|---|---|---|
| 1 | `path/to/file:line` | [Critical/Major/Minor] | [Coupling/Complexity/Safety] | [Description] |

## 4. Surgical Remediation Plan
### Finding [N]: [Title]
- **Root Cause**: [Explanation]
- **Before (Defect)**:
```[lang]
// Current flawed code
```
- **After (Surgical Fix)**:
```[lang]
// Clean, minimal corrected code
```

## 5. Verification Gate
- **Test Command**: `[Exact test or verification command]`
- **Success Criteria**: `[Exact expected assertion or behavior]`
```

---

## Anti-Examples

| ❌ Anti-Pattern | ✅ Preferred Pattern | Why |
|---|---|---|
| Mass refactoring touching 20 files at once | Isolating changes to 1-2 files per step with verified boundaries | Prevents accidental regression and makes diffs auditable |
| Adding generic interfaces for single implementations | Using concrete classes/functions until 2+ distinct implementations exist | Eliminates premature abstraction and code bloat |
| Reformatting whitespace across an entire file during a bug fix | Touching strictly the lines containing the bug | Keeps git blame clean and avoids merge conflicts |
| Claiming code works without running or providing tests | Providing the exact runnable test verifying the fix | Enforces the iron law of evidence over assertions |

---

## Provenance
- Distilled from systematic debugging methodologies, verification-before-completion quality gates, and Karpathy software architecture principles.
- Formatted following universal agent skill conventions.
