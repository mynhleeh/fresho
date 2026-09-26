# Worked Examples — skill-forge v4.0.0 Pipeline

Five worked examples, one per MODE, rewritten through the v4.0.0 pipeline: **Working Notes (+ test plan) → Baseline (RED) → Generate → Evaluate (stranger-audit) → Green re-run → Emit**. Read the example for a MODE before your first use of that MODE. Every example shows the *visible* trace (Working Notes) and the *result* — the internal chain-of-thought itself is never shown (it stays internal).

---

## Example 1: CREATE — System Prompt

**Input** (EN): "Create a system prompt for an English tutoring chatbot for Vietnamese learners"

### Working Notes
- Request: system prompt for a tutoring chatbot; target learners = Vietnamese speakers
- Mode=CREATE · Type=System Prompt · Platform=platform-agnostic · Tier=standard
- Known: tutoring domain, learner profile. Missing: none → proceed (no CLARIFY needed)
- Acceptance: 5-slot anatomy complete · constraints countable · examples neutral · ≤ 200 lines
- Test plan: fresh-context run — does the agent answer for the learner or guide them?
- Baseline (RED): control run without artifact → agent answered the learner's question directly (rationalization: "helpful = answer")
- Audit (stranger pass): 5 slots ✓ · constraints concrete ("do not do homework" → "guide toward the answer") ✓ · no judgment-call rules ✓
- Test (GREEN): re-run with artifact → agent guided instead of answering ✓ · acceptance 4/4 · PASS (1 iteration)

### Output
```
# Role & Identity
You are EnglishPal, a friendly and patient English language tutor specializing in
helping Vietnamese learners build conversational fluency and grammar confidence.

# Core Capabilities
- Hold natural English conversations calibrated to the learner's level
- Provide gentle, specific corrections with clear explanations
- Explain grammar rules using simple language and relatable examples
- Suggest vocabulary alternatives, collocations, and idioms
- Give pronunciation tips when relevant

# Communication Style
Warm and encouraging — mistakes are learning opportunities, not failures.
Keep explanations concise; offer to expand when the learner wants more depth.
Use Vietnamese only when the learner is completely stuck.

# Constraints
- Guide learners toward the answer; do not produce it for them
- Correct at most one recurring pattern per exchange
- Use Vietnamese only as a last resort, not as the default

# Context
Embedded in an English learning mobile app used primarily by Vietnamese university
students. Users range from beginner (A1) to upper-intermediate (B2).
```

---

## Example 2: CRITIQUE — Input in French (multilingual)

**Input** (FR): `Tu es un assistant utile. Aide les utilisateurs. Ne dis pas de mauvaises choses.`

### Working Notes
- Request: critique + improve a system prompt (FR)
- Mode=CRITIQUE · Type=System Prompt · Platform=platform-agnostic · Tier=micro
- Known: text to critique. Missing: target app/users → one CLARIFY question asked, default offered; user answered "general assistant"
- Defect inventory: 3 — generic role (Specificity), no capabilities (Completeness), vague negation (Clarity)
- Root principles: "be helpful" → role must be specific; constraints must be action-based, not negations
- Baseline (RED): control run → assistant replied with no capability framing (rationalization: "generic = safe")
- Audit: fix each defect by principle, not instance · PASS (1 iteration)
- Test (GREEN): re-run with artifact → capabilities stated, constraints action-based ✓ · acceptance 3/3 · output language = FR ✓

### Output (FR)
## 🔧 Modifications Apportées
- Remplacé "assistant utile" → rôle plus spécifique, car "assistant utile" est trop générique
- Ajouté la section **Capacités** car les actions possibles n'étaient pas claires
- Remplacé "Ne dis pas de mauvaises choses" → contraintes basées sur l'action, car les négations vagues sont inefficaces
- Ajouté des instructions sur le **Style de communication** car elles étaient totalement absentes

## ✅ Version Améliorée
```
# Rôle
Vous êtes un assistant généraliste aidant les utilisateurs dans la recherche, la rédaction,
l'analyse et les questions quotidiennes.

# Capacités
- Répondre aux questions factuelles avec des informations précises
- Aider à rédiger, éditer et améliorer le contenu écrit
- Expliquer des sujets complexes de manière claire

# Style de Communication
Chaleureux et professionnel. Adaptez la profondeur technique au niveau d'expertise de l'utilisateur.

# Contraintes
- Ne donnez pas de conseils médicaux, juridiques ou financiers à la place de professionnels
- En cas de doute, reconnaissez clairement vos limites
```

## 💡 Ajouts Suggérés
- À ajouter : Informations sur l'application ou les utilisateurs cibles
- À clarifier : Y a-t-il des restrictions de sujets spécifiques ?

---

## Example 3: CONVERT — Function Schema (OpenAI → Anthropic)

**Input** (OpenAI):
```json
{
  "type": "function",
  "name": "send_email",
  "description": "Sends an email",
  "parameters": {
    "type": "object",
    "properties": {
      "to": {"type": "string"},
      "subject": {"type": "string"},
      "body": {"type": "string"}
    },
    "required": ["to", "subject", "body"],
    "additionalProperties": false
  },
  "strict": true
}
```

**Request**: Convert to Anthropic format

### Working Notes
- Mode=CONVERT · Type=Function Schema · Source=OpenAI · Target=Anthropic
- Mapping row: OpenAI → Anthropic (remove `type:"function"` wrapper, `parameters`→`input_schema`, drop `strict`)
- Loss audit: `strict` has no Anthropic equivalent → dropped with justification (schema enforces via `required`); `additionalProperties: false` → preserved inside `input_schema`
- Round-trip plan: convert back to OpenAI, diff vs original — expected diffs: wrapper + `strict` re-added, descriptions added
- Baseline (RED): naive convert without recipe → kept `parameters`/`strict` verbatim (rationalization: "valid JSON = correct format")
- Audit: mapping table row applied ✓ · loss items accounted 2/2 ✓ · PASS (1 iteration)
- Test (GREEN): re-run with recipe → Anthropic-native `input_schema`, `strict` dropped ✓ · round-trip diff shows only the 2 expected deltas ✓

### Output
## Converted Function Schema — OpenAI → Anthropic

**Changes made:**
- Removed `type: "function"` wrapper (Anthropic uses top-level `name` directly)
- Renamed `parameters` → `input_schema`
- Removed `strict` (not supported; schema handles this via `required`)
- Enhanced parameter descriptions (recommended for Anthropic for better comprehension)

**Result:**
```json
{
  "name": "send_email",
  "description": "Sends an email to a specified recipient. Use when the user explicitly requests sending an email.",
  "input_schema": {
    "type": "object",
    "properties": {
      "to": {"type": "string", "description": "Recipient email address (e.g. user@example.com)"},
      "subject": {"type": "string", "description": "Email subject line"},
      "body": {"type": "string", "description": "Full email body content, plain text or HTML"}
    },
    "required": ["to", "subject", "body"]
  }
}
```

**Notes:** Improved descriptions for all parameters — Anthropic models perform better with richer parameter descriptions. Round-trip diff verified: only expected deltas (wrapper, `strict`, descriptions).

---

## Example 4: DISTILL — Conversation into a Skill

**Input** (EN): "Turn this debugging approach I keep repeating into a skill."

**Source**: a conversation where the user repeatedly: reproduces the bug, reads the exact failing line, writes a minimal repro, fixes, then verifies with a test.

### Working Notes
- Mode=DISTILL · Classify=skill · Tier=standard
- Workflow extracted: 5 steps (reproduce → isolate → minimal repro → fix → verify)
- Transmutation: "the specific bug in the conversation" → general rule "fix must be provable" (covers the whole class of debugging requests)
- Provenance plan: source = conversation (Tier 6) · generalization move: "reproduce-then-fix generalized to any bug class" · excluded: no external content
- Baseline (RED): naive distill → copied the specific bug steps verbatim (rationalization: "specific = faithful")
- Audit: steps countable ✓ · example neutral (no real codebase names) ✓ · PASS (1 iteration)
- Test (GREEN): re-run with transmutation rule → generalized 5-step workflow ✓ · trigger test — "my api returns 500" ✓ fires; "what is a lambda" ✓ does not fire · consistency 0 ✓

### Output
`## When to Activate` fires on bug reports and debugging requests; `## Instructions` enumerates the 5 steps imperatively; `## Output Contract` requires a `✅ How to Verify` slot (the fix must be provable); `## Anti-Examples` pairs ❌ "fix blindly" with ✅ "write a repro first".

```markdown
## Provenance
- Source: user conversation, debugging workflow (Tier 6, active)
- Generalization moves: "reproduce → isolate → minimal repro → fix → verify" abstracted
  from the user's specific bug to any bug class
- Excluded: no external content (Tier 5 not consulted)
```

---

## Example 5: NAVIGATE — Classify a Resource

**Input** (EN): "Where does this AGENTS.md rule file belong?"

### Working Notes
- Mode=NAVIGATE · Type=Rules file
- Axis decision: feed to AI to execute? Yes → INSTRUCTIONS axis. Rules file → e.g. `instructions/rules/` or project root rules. Third-party? No → active
- Tier: self-created → Tier 6 (active operational)
- No ambiguity → no CLARIFY needed
- Baseline (RED): control classification → guessed `knowledge/` from the filename alone (rationalization: "rules = knowledge")
- Audit: decision tree applied ✓ · tier stated ✓ · PASS (1 iteration)
- Test (GREEN): re-run with the Q1/Q2/Q3 tree → correct placement under INSTRUCTIONS rules ✓

### Output
`instructions/rules/` (or workspace rules location such as `.agents/rules/` or project root; self-created, always-on rules file).
