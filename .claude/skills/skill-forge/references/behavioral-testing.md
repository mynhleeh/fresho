# Behavioral Testing — RED-GREEN-REFACTOR for Artifacts

Reference for `SKILL.md` v4.0.0. Read this file at **BASELINE TEST (RED)** and **GREEN TEST / REFACTOR** stages. It converts skill-authoring into Test-Driven Development: you observe an agent fail *without* the artifact, write the artifact that addresses exactly those failures, and refactor until the agent complies under pressure.

> **Why this file exists**: The v3.0.0 pipeline verified only the *shape* of output (self-audit, counts). It never verified *behavior* — whether an agent actually complies under pressure. This file closes that gap by importing empirical behavioral testing methods (RED-GREEN-REFACTOR, pressure scenarios, rationalization capture) and generalizing them from skills to every artifact type.

---

## The Iron Law (same as TDD)

```
NO ARTIFACT WITHOUT A FAILING TEST FIRST
```

Applies to **new artifacts AND edits to existing artifacts**. If you wrote the artifact before running the baseline, delete it and start over.

**No exceptions:**
- Not for "simple additions" or "just adding a section"
- Not for "documentation updates"
- Don't keep untested changes "as reference"
- Don't "adapt" the artifact while running tests
- Delete means delete

**Why**: If you didn't watch an agent fail without the artifact, you don't know whether the artifact teaches the right thing. A skill that "looks clear" to you may be clear to nobody else.

---

## TDD Mapping (generalized to all artifact types)

| TDD Concept | Artifact Creation |
|---|---|
| **Test case** | Pressure scenario or fresh-context run (varies by type — see below) |
| **Production code** | The artifact (SKILL.md / prompt / schema / rules file) |
| **Test fails (RED)** | Agent violates the rule without the artifact (baseline) |
| **Test passes (GREEN)** | Agent complies with the artifact present |
| **Refactor** | Close loopholes while maintaining compliance |
| **Write test first** | Run the baseline scenario BEFORE authoring |
| **Watch it fail** | Document exact rationalizations the agent uses (verbatim) |
| **Minimal code** | Write the artifact addressing those specific violations |
| **Watch it pass** | Verify the agent now complies |
| **Refactor cycle** | Find new rationalizations → plug → re-verify |

---

## Test Form by Artifact Type

The Iron Law applies to every artifact, but the **test form varies**. A pressure scenario only makes sense when the artifact has a rule to violate.

| Artifact type | RED test form | GREEN success signal |
|---|---|---|
| **Skill (discipline)** | Pressure scenario (3+ combined pressures) via subagent or fresh-context run | Agent follows the rule under maximum pressure |
| **Skill (technique/pattern)** | Application scenario on a new case + 1 edge case | Agent applies the technique correctly to the new scenario |
| **Skill (reference)** | Retrieval scenario: "find and use X from this skill" | Agent finds and correctly applies the reference |
| **System/user prompt** | Fresh-context run: realistic task + tempting failure, WITH vs WITHOUT the prompt (control) | Output shape matches the recipe; no negotiation of "don't X" |
| **Function/tool schema** | Test payloads: valid input accepted, invalid rejected; round-trip conversion diff | All payloads pass; conversion round-trip shows only expected deltas |
| **Rules file** | Compliance scenario: a situation that tempts violation | Agent complies; cites the rule |

> **Micro-test wording first** (cheap) before full scenarios (expensive): see "Micro-Test Wording" below. Full pressure scenarios are the final gate for discipline artifacts only.

---

## RED: Baseline (Watch It Fail)

**Goal**: Run the test WITHOUT the artifact, watch the agent fail, and document exactly how it fails.

### Procedure
1. Create the pressure scenario (see design rules below).
2. Run it WITHOUT the artifact (fresh context, realistic framing).
3. Document choices and rationalizations **word-for-word** — verbatim, not paraphrased.
4. Identify patterns: which excuses appear repeatedly?
5. Note effective pressures: which scenarios trigger violations?

### Pressure Scenario Design Rules

| Rule | ❌ Bad | ✅ Good |
|---|---|---|
| Concrete options | "What would you do?" | "Choose A, B, or C." |
| Real constraints | "There's a deadline" | "It's 6pm, dinner at 6:30pm. Code review tomorrow 9am." |
| Real file paths | "a project" | "`/tmp/payment-system`" |
| Make agent act | "What should you do?" | "What do you do? Act." |
| No easy outs | "I'd ask my human partner" | Force the choice; no deferral option |

### Pressure Types (combine 3+)

| Pressure | Example |
|---|---|
| **Time** | Emergency, deadline, deploy window closing |
| **Sunk cost** | Hours of work already done; "waste" to delete |
| **Authority** | Senior says skip it; manager overrides |
| **Economic** | Job, promotion, $/min lost |
| **Exhaustion** | End of day; already tired; want to go home |
| **Social** | Looking dogmatic; seeming inflexible |
| **Pragmatic** | "Being pragmatic vs dogmatic" |

**A good scenario**: 3+ pressures + explicit A/B/C choice + "Be honest."

---

## GREEN: Write the Minimal Artifact

1. Address the **specific baseline failures** you documented — no content for hypothetical cases.
2. Run the same scenario WITH the artifact. The agent should now comply.
3. If the agent still fails: the artifact is unclear or incomplete. Revise and re-test.

**Match the form to the failure** (before writing, classify the baseline failure):

| Baseline failure | Right form | Wrong form |
|---|---|---|
| Skips/violates a rule under pressure (knows better, does it anyway) | Prohibition + rationalization table + red flags | Soft guidance ("prefer…", "consider…") |
| Complies, but output has the wrong shape | Positive recipe or contract: state what the output IS — parts, in order | Prohibition list ("don't restate", "never narrate") |
| Omits a required element from something already produced | Structural: REQUIRED field or slot in a template | Prose reminders near the template |
| Behavior should depend on a condition | Conditional keyed to an observable predicate ("if the brief exists, reference it") | Unconditional rule + exemption clauses |

**Three empirical warnings** (from wording tests; never assume, micro-test your own case):
- **Prohibitions backfire on shaping problems.** Under a competing incentive, agents negotiate with "don't X". The prohibition arm produced *more* unwanted content than the recipe arm — and trended worse than no guidance at all. A recipe leaves nothing to negotiate.
- **No nuance clauses.** "Don't X unless it matters" reopens the negotiation. Express a real exception as its own conditional on an observable predicate.
- **Exemption clauses don't scope.** "This limit doesn't apply to code blocks" still suppresses code blocks. Restructure so the rule can't reach the exempt part.

---

## REFACTOR: Close Loopholes (Stay Green)

The agent violated the rule despite the artifact? That's a regression — refactor.

### 1. Capture new rationalizations verbatim
"This case is different because…", "I'm following the spirit not the letter", "The PURPOSE is X, and I'm achieving X differently", "I already manually tested it".

### 2. Close every loophole explicitly
Don't just state the rule — forbid specific workarounds:

```
❌ Write code before test? Delete it.
✅ Write code before test? Delete it. Start over.

   **No exceptions:**
   - Don't keep it as "reference"
   - Don't "adapt" it while running tests
   - Don't look at it
   - Delete means delete
```

### 3. Address "Spirit vs Letter" arguments
Add the foundational blocker early:

```
**Violating the letter of the rules is violating the spirit of the rules.**
```

This cuts off the entire "I'm following the spirit" rationalization class.

### 4. Build a rationalization table
Every excuse captured during testing goes in a table. Each row is a future agent's likely rationalization + the reality:

| Excuse | Reality |
|---|---|
| "Too simple to test" | Simple code breaks. The test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Tests after achieve the same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |

### 5. Create a red-flags list (self-check)

```
## Red Flags — STOP and Start Over
- Code before test
- "I already manually tested it"
- "It's about spirit not ritual"
- "This is different because…"
```

### 6. Update the description with violation symptoms
For discipline artifacts, add symptoms of *about to violate* to the description so the agent self-triggers before the violation:

```yaml
description: Use when implementing any feature or bugfix, before writing implementation code
```

### 7. Re-verify
Re-run the same scenarios with the updated artifact. If the agent finds a NEW rationalization → continue the cycle (max 2 iterations; over the cap, emit with residual defects flagged).

---

## Micro-Test Wording Before Full Scenarios

Full pressure runs are the final gate, but they are slow and expensive per iteration. Verify the wording first:

1. **One fresh-context sample per call.** System prompt = the realistic context the guidance will live in (the full artifact, not the guidance in isolation); user message = a task that tempts the failure.
2. **Always include a no-guidance control.** If the control doesn't exhibit the failure, there is nothing to fix — stop, don't author the guidance.
3. **5+ reps per variant.** Single samples lie.
4. **Manually read every flagged match.** Template echoes and quoted counter-examples masquerade as hits; automated counts alone overstate both failure and success.
5. **Variance is a metric.** When guidance lands, reps converge on the same shape. Five different interpretations across five reps means the wording isn't binding — tighten the form before adding words.

Micro-tests verify wording; they do not replace pressure scenarios for discipline artifacts.

---

## Persuasion Principles (for discipline artifacts)

LLMs respond to the same persuasion principles as humans. Research foundation: Meincke et al. (2025), N=28,000 AI conversations — persuasion techniques more than doubled compliance (33% → 72%, p < .001). Use these to *ensure critical practices are followed*, not to manipulate.

| Principle | How to apply | Example |
|---|---|---|
| **Authority** | Imperative language: "YOU MUST", "No exceptions" | "Write code before test? Delete it. Start over. No exceptions." |
| **Commitment** | Require announcements; force explicit A/B/C choices; use todos for checklists | "When you use the skill, announce: 'I'm using [Skill Name]'" |
| **Scarcity** | Time-bound requirements: "Before proceeding", "Immediately after X" | "After completing, IMMEDIATELY request review before proceeding." |
| **Social proof** | Universal patterns: "Every time", "X without Y = failure" | "Checklists without todo tracking = steps get skipped. Every time." |
| **Unity** | Shared identity: "we're colleagues", "our codebase" | "We're colleagues. I need your honest technical judgment." |
| Reciprocity / Liking | **Do NOT use** — feel manipulative, conflict with honest feedback | — |

---

## Meta-Testing (when GREEN isn't working)

After the agent chooses the wrong option, ask:

```
your human partner: You read the artifact and chose Option C anyway.
How could it have been written differently to make Option A the only acceptable answer?
```

The answer reveals the exact wording gap — fix it, re-test.

---

## Countable Audit for the Testing Stage

Run in the EVALUATE/GREEN re-check. Each item PASS/FAIL with evidence.

- [ ] Baseline run happened BEFORE authoring (Iron Law) — timestamp/order in Working Notes
- [ ] Rationalizations captured verbatim — at least 2 quotes on file
- [ ] Guidance form matches the baseline failure type (Match the Form table)
- [ ] Discipline artifact has a rationalization table + red flags
- [ ] Description includes violation symptoms (if discipline)
- [ ] Micro-test had a no-guidance control (where applicable)
- [ ] Iteration count recorded (1 or 2); residuals flagged if over cap

---

## Provenance

- **Source**: Behavioral testing methodologies adapted from Test-Driven Development (TDD) for AI instructions and prompt engineering.
- **Generalization moves**: skills-only testing → all 4 artifact types (test-form table); "watch it fail" → mandatory pre-authoring stage in the pipeline; rationalization capture → countable Working Notes item; persuasion → distilled to 5 applicable principles.
- **Excluded**: superpowers TDD prerequisite chain (`test-driven-development` skill dependency), raw persuasion research data (cite only), `graphviz-conventions.dot` + `render-graphs.js` tooling (repo does not use graphviz), and all verbatim example scenarios (rephrased per house style).
- **Epistemic status**: the empirical claims (prohibition backfire, nuance-clause degradation, persuasion effect sizes) are reported from the source's testing; treat them as Tier-5 evidence until independently reproduced.
