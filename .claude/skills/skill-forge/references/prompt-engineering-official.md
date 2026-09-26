# Prompt Engineering Best Practices (Anthropic Official)

> Source: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices
> Last fetched: 2026-08-26
> **Platform note:** this guide is **Claude-specific** (e.g., adaptive thinking 4.6+, `<thinking>` tags, XML conventions). When generating for other platforms, translate the *principles*, not the syntax — cross-check against `references/system-prompt-guide.md` and the platform matrix.

---

## General Principles (applies to all Claude models)

### 1. Be Clear and Direct
Think of Claude as a brilliant but new employee who lacks context on your norms.

- Be specific about desired output format and constraints
- Provide sequential steps using numbered lists when order matters
- **Golden rule**: Show your prompt to a colleague — if they'd be confused, Claude will be too

### 2. Add Context to Improve Performance
Explain *why* a behavior is important, not just *what* to do. Claude performs better when it understands the motivation behind instructions.

### 3. Use Examples Effectively (Few-shot / Multishot)
Examples are one of the most reliable ways to steer output format, tone, and structure.

- **Relevant**: Mirror your actual use case
- **Diverse**: Cover edge cases, vary phrasing
- **Structured**: Wrap in `<example>` tags

```xml
<examples>
  <example>
    <input>...</input>
    <output>...</output>
  </example>
</examples>
```

### 4. Structure Prompts with XML Tags
XML tags help Claude parse complex prompts. Common tags:

| Tag | Purpose |
|---|---|
| `<instructions>` | What to do |
| `<context>` | Background information |
| `<input>` | Variable user data |
| `<examples>` / `<example>` | Sample I/O pairs |
| `<thinking>` | Reasoning block |
| `<answer>` | Final answer |

Best practices:
- Use consistent, descriptive tag names
- Nest when hierarchy is natural: `<documents><document index="1">...</document></documents>`

### 5. Give Claude a Role (Role Prompting)
```python
system="You are a helpful coding assistant specializing in Python."
```

Even a single sentence makes a measurable difference.

### 6. Long Context Prompting (20k+ tokens)
- **Put longform data at the TOP** — above query, instructions, examples (up to 30% improvement)
- **Structure with XML**: Wrap each doc in `<document><document_content>...<source>...</source></document_content></document>`
- **Ground in quotes**: Ask Claude to quote relevant parts before answering

### 7. Output Formatting Control

| ❌ Avoid | ✅ Prefer |
|---|---|
| "Do not use markdown" | "Write in flowing prose paragraphs." |
| "Don't use bullet points" | "Incorporate items naturally into sentences." |

XML format indicator:
```
Write prose sections in <smoothly_flowing_prose_paragraphs> tags.
```

---

## Tool Use Prompting

### Explicit Action Instructions
```xml
<default_to_action>
By default, implement changes rather than only suggesting them. If intent is unclear,
infer the most useful action and proceed, using tools to discover missing details.
</default_to_action>
```

For hesitant behavior:
```xml
<do_not_act_before_instructions>
Do not jump into implementation unless explicitly instructed. When ambiguous,
default to providing information and recommendations.
</do_not_act_before_instructions>
```

### Parallel Tool Calls
```xml
<use_parallel_tool_calls>
Make all independent tool calls in parallel when there are no dependencies.
Never use placeholders or guess missing parameters.
</use_parallel_tool_calls>
```

---

## Thinking / Reasoning

### Adaptive Thinking (Claude 4.6+)
Claude dynamically decides when and how much to think based on `effort` level and query complexity.

Encourage more thinking:
```
After receiving tool results, carefully reflect on their quality before proceeding.
```

Reduce thinking (reduce latency):
```
Thinking should only be used when it will meaningfully improve quality — typically
for multistep reasoning. When in doubt, respond directly.
```

### Manual Chain-of-Thought (when thinking is off)
```xml
<thinking>
[step-by-step reasoning]
</thinking>
<answer>
[final answer]
</answer>
```

---

## Agentic Systems Prompting

- Use **goal-driven instructions** rather than prescriptive step-by-step plans
- Multishot examples with `<thinking>` tags work for agentic reasoning patterns
- Prefer "think thoroughly" over rigid prescribed steps — Claude's reasoning often exceeds human prescription

---

## Common Patterns Reference

| Goal | Technique |
|---|---|
| Control output format | XML format indicator tags |
| Improve accuracy | Few-shot examples in `<examples>` tags |
| Multi-step reasoning | `<thinking>` + `<answer>` or adaptive thinking |
| Consistent persona | Role statement in system prompt |
| Reduce hallucinations | Ground in quotes, provide sources |
| Better tool use | Explicit action instructions |
| Long document tasks | Documents at top, `<document>` XML tags |
| Concise output | "Your response should be 2-3 sentences." |
