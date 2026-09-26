# Prompt Patterns Guide

A reference of common prompt engineering patterns, organized by use case.

---

## 1. Role Prompting

Assign a specific role to focus the model's behavior, tone, and expertise.

```
You are an expert Python developer with 10+ years of experience in data engineering.
You write clean, well-documented code and always consider edge cases.
```

**When to use:** When you need a consistent persona, domain expertise, or specific communication style.

**Variants:**
- Single role: `"You are a senior security engineer"`
- Domain expert: `"You are a cardiologist specializing in preventive medicine"`
- Audience-aware: `"You are a teacher explaining concepts to a 10-year-old"`

---

## 2. Chain-of-Thought (CoT)

Ask the model to reason step by step before giving its final answer.

```
Think through this step by step before giving your answer.
First, analyze the problem. Then consider approaches. Finally, choose the best one.
```

**With XML tags** (recommended for Claude):
```xml
<thinking>
[Reasoning area — model works through the problem here]
</thinking>
<answer>
[Final answer here]
</answer>
```

**Zero-shot CoT**: Add "Think step by step" at the end of the user prompt.
**Few-shot CoT**: Provide examples that include reasoning walkthroughs.

---

## 3. Few-Shot Examples

Provide examples to steer output format, tone, and structure.

```xml
<examples>
  <example>
    <input>Customer says: "Your product broke after 2 days!"</input>
    <output>I'm sorry to hear that. Let me help you resolve this immediately.
    Could you please provide your order number so I can look into this?</output>
  </example>
  <example>
    <input>Customer says: "I love this, works great!"</input>
    <output>Thank you for the kind feedback! We're glad it's working well for you.
    Would you like to share a review to help others?</output>
  </example>
</examples>
```

**Best practices:**
- 2–5 examples is usually enough
- Cover edge cases and diverse inputs
- Ensure examples are representative of desired behavior

---

## 4. Structured Output

Instruct the model to respond in a specific format.

### JSON Output
```
Respond with a JSON object with the following structure:
{
  "summary": "one sentence summary",
  "sentiment": "positive|negative|neutral",
  "action_items": ["item1", "item2"],
  "confidence": 0.0-1.0
}

Do not include any text outside the JSON object.
```

### XML Output
```
Respond in this exact XML format:
<analysis>
  <summary>...</summary>
  <sentiment>positive|negative|neutral</sentiment>
  <confidence>0.0-1.0</confidence>
</analysis>
```

### Markdown Output
```
Format your response as:
## Summary
[one paragraph]

## Key Points
- Point 1
- Point 2

## Recommendation
[one paragraph]
```

---

## 5. Constraint-Based Prompting

Set explicit limits on length, format, or scope.

```
Your response must:
- Be exactly 3 sentences
- Use only simple vocabulary (8th grade reading level)
- Not include technical jargon
- End with a question to engage the reader
```

---

## 6. Persona + Audience Targeting

Combine role and target audience to calibrate response style.

```
You are a financial advisor explaining risk to a client with no finance background.
Avoid jargon. Use analogies. Be reassuring but honest about risks.
```

---

## 7. Template Filling

Use the model to populate a predefined template.

```
Fill in the following template based on the product information provided:

TEMPLATE:
---
Product Name: {{name}}
Category: {{category}}
Key Benefits:
- {{benefit_1}}
- {{benefit_2}}
- {{benefit_3}}
Call to Action: {{cta}}
---

PRODUCT INFO:
{{user_input}}
```

---

## 8. Critique and Self-Improve

Ask the model to draft, critique, then revise its own output.

```
First, write a draft response to the question below.
Then, critique your draft: What's missing? What's unclear? What could be stronger?
Finally, write an improved version based on your critique.
```

---

## 9. Conditional Instructions

Guide the model through different handling for different input types.

```
When analyzing the user's request:
- If it contains code: provide a code review + specific suggestions
- If it's a question: provide a direct answer with explanation
- If it's ambiguous: list 2-3 possible interpretations and ask for clarification
- If it's off-topic: politely redirect to your area of expertise
```

---

## 10. Grounding + Citation

Require the model to answer only from provided context and cite sources.

```
Answer the question based ONLY on the provided documents below.
If the answer is not in the documents, say "I cannot find this in the provided materials."
Always cite the specific document and section you're drawing from.

<documents>
{{documents}}
</documents>

Question: {{question}}
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|---|---|---|
| "Be helpful and comprehensive" | Too vague to act on | Specify exactly what output you want |
| "Don't use bullet points" | Negative instruction | "Write in flowing prose paragraphs" |
| Over-long system prompts | Key instructions get diluted | Prioritize top 3–5 instructions |
| No examples for format | Model guesses format | Provide 1–2 concrete examples |
| Contradictory instructions | Model picks one arbitrarily | Resolve all conflicts explicitly |
