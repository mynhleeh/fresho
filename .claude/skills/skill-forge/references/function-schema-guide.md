# Function & Tool Schema Guide

A reference for writing high-quality function and tool definitions across AI platforms.

---

## Overview

Function and tool schemas allow AI models to call external functions. Each platform uses a similar structure based on JSON Schema, with minor differences in field names and wrapper formats.

---

## Platform Comparison Matrix

| Feature | OpenAI | Anthropic | MCP | Gemini |
|---|---|---|---|---|
| **Root wrapper** | `type: "function"` + `name` | `name` (direct) | `name` (direct) | `name` (direct) |
| **Schema field** | `parameters` | `input_schema` | `inputSchema` | `parameters` |
| **Strict mode** | `strict: true` | Use `required` arrays | Not applicable | Not applicable |
| **Additional properties** | `additionalProperties: false` | Allowed by default | Recommended `false` | Allowed |
| **Description location** | Top-level `description` | Top-level `description` | Top-level `description` | Top-level `description` |
| **Required field** | In `parameters.required` | In `input_schema.required` | In `inputSchema.required` | In `parameters.required` |
| **Output schema** | Not native | Not native | `outputSchema` (optional) | Not native |
| **Protocol** | REST API | REST API | JSON-RPC 2.0 | REST API |

---

## OpenAI Function Schema

```json
{
  "type": "function",
  "name": "get_weather",
  "description": "Retrieves current weather for the given location. Use when the user asks about weather conditions.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City and country, e.g. 'Paris, France'"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature unit system",
        "default": "celsius"
      }
    },
    "required": ["location"],
    "additionalProperties": false
  },
  "strict": true
}
```

---

## Anthropic Tool Schema

```json
{
  "name": "get_weather",
  "description": "Retrieves current weather for the given location. Use when the user asks about weather conditions.",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City and country, e.g. 'Paris, France'"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature unit system"
      }
    },
    "required": ["location"]
  }
}
```

---

## MCP Tool Schema

```json
{
  "name": "get_weather",
  "title": "Weather Information Provider",
  "description": "Retrieves current weather for the given location.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City and country, e.g. 'Paris, France'"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature unit system"
      }
    },
    "required": ["location"],
    "additionalProperties": false
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "temperature": {"type": "number"},
      "conditions": {"type": "string"},
      "humidity": {"type": "number"}
    }
  }
}
```

---

## Gemini Function Schema

```json
{
  "name": "get_weather",
  "description": "Retrieves current weather for the given location.",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "location": {
        "type": "STRING",
        "description": "City and country"
      },
      "units": {
        "type": "STRING",
        "enum": ["celsius", "fahrenheit"]
      }
    },
    "required": ["location"]
  }
}
```

> **Note**: Gemini uses UPPERCASE type names (`STRING`, `OBJECT`, `ARRAY`, `INTEGER`, `BOOLEAN`, `NUMBER`).

---

## Platform-Agnostic Schema (Recommended Default)

Use this format when the target platform is unknown — it can be converted to any platform with minimal changes:

```json
{
  "name": "tool_name",
  "description": "Clear description of what this tool does and when to call it.",
  "parameters": {
    "type": "object",
    "properties": {
      "param_name": {
        "type": "string|number|integer|boolean|array|object",
        "description": "Clear description of this parameter and its expected format",
        "enum": ["optional", "allowed", "values"],
        "default": "optional_default"
      }
    },
    "required": ["required_param_names"],
    "additionalProperties": false
  }
}
```

---

## JSON Schema Type Reference

| Type | Description | Example value |
|---|---|---|
| `string` | Text value | `"Paris, France"` |
| `number` | Decimal number | `3.14` |
| `integer` | Whole number | `42` |
| `boolean` | True / false | `true` |
| `array` | Ordered list of items | `["item1", "item2"]` |
| `object` | Key-value map | `{"key": "value"}` |
| `null` | Null value | `null` |

---

## Advanced Schema Features

### Array with typed items
```json
{
  "tags": {
    "type": "array",
    "items": {"type": "string"},
    "description": "List of string tags"
  }
}
```

### Nested object
```json
{
  "address": {
    "type": "object",
    "properties": {
      "street": {"type": "string"},
      "city": {"type": "string"},
      "country": {"type": "string"}
    },
    "required": ["city", "country"]
  }
}
```

### oneOf / anyOf
```json
{
  "value": {
    "oneOf": [
      {"type": "string"},
      {"type": "number"}
    ],
    "description": "Can be a string or a number"
  }
}
```

---

## Writing Quality Descriptions

### For the tool itself:
- Explain **what it does** (the capability)
- Explain **when to call it** (the trigger condition)
- Mention any **important limitations**

```
✅ "Retrieves current weather data for a location. Use when the user asks about
   weather conditions, temperature, or forecasts. Returns real-time data."

❌ "Gets weather."
```

### For each parameter:
- Explain **what value to provide**
- Include **format** if non-obvious
- Note **value constraints** (min/max, allowed values, examples)

```
✅ "City and country in the format 'City, Country', e.g. 'Tokyo, Japan'.
   Required for disambiguation when multiple cities share a name."

❌ "The location."
```

---

## Common Tool Pattern Examples

### Database Query
```json
{
  "name": "query_database",
  "description": "Execute a read-only SQL query. Only SELECT queries are permitted.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "SQL SELECT query. Must not contain INSERT, UPDATE, DELETE, or DROP."
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of rows to return (1–1000)",
        "default": 100
      }
    },
    "required": ["query"],
    "additionalProperties": false
  }
}
```

### Knowledge Base Search
```json
{
  "name": "search_documents",
  "description": "Search the knowledge base for relevant documents. Use when the user asks questions that may require specific internal information.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language search query"
      },
      "top_k": {
        "type": "integer",
        "description": "Number of results to return (1–20)",
        "default": 5
      },
      "filter_category": {
        "type": "string",
        "description": "Optional: filter results by category",
        "enum": ["policy", "technical", "legal", "general"]
      }
    },
    "required": ["query"],
    "additionalProperties": false
  }
}
```

---

## Checklist for Quality Tool Definitions

Run as a **stranger-review** — separate re-read after writing; each item PASS/FAIL with evidence; re-check failed items after fixes (max 2 iterations).

- [ ] `name` follows naming conventions (snake_case or camelCase; no spaces)
- [ ] `name` is **action-prefixed** (verb first, e.g. `get_weather`, `query_database`, `send_email`)
- [ ] `description` clearly explains WHAT and WHEN
- [ ] All parameters have meaningful descriptions
- [ ] All required parameters are listed in `required`
- [ ] Enums used where values are constrained
- [ ] Default values specified where sensible
- [ ] `additionalProperties: false` for strict schemas
- [ ] `outputSchema` defined for MCP tools where the return shape matters
- [ ] Errors are **actionable and descriptive** (what happened + how to fix), not generic
- [ ] No sensitive data (passwords, keys) in descriptions
- [ ] Tested that the model invokes the tool as expected

---

## MCP Tool Conventions (from anthropics)

MCP tools follow a stricter, more structured pattern than plain function schemas. Distilled and applied here.

### Naming
- **Action-prefixed**: verbs first (`search_documents`, `create_contact`, `send_email`), so models can infer intent at a glance. Avoid noun-only names.

### Implied via Zod/Pydantic in generated MCP servers
When emitting an MCP server tool (Python/TypeScript), the schema is usually derived from a validated model. Two common flavors:

```python
from pydantic import BaseModel, Field

class Contact(BaseModel):
    name: str = Field(..., description="Full name", min_length=1, max_length=100)
    email: str = Field(..., description="Valid email address")
```

```typescript
// Zod equivalent
const SearchSchema = z.object({
  query: z.string().describe("Natural language search query"),
});
```

### `outputSchema`
MCP tools can declare an **output schema** separate from the input schema, so the model knows the shape of the return value before calling:

```json
{
  "name": "get_weather",
  "inputSchema": { "type": "object", "properties": { "location": {"type": "string"} }, "required": ["location"] },
  "outputSchema": {
    "type": "object",
    "properties": {
      "temperature": {"type": "number"},
      "conditions": {"type": "string"}
    }
  }
}
```

### Actionable errors
MCP tool errors should be descriptive and include a fix hint:

```
❌ "Error: something went wrong."
✅ "Error: Contact not found for email 'foo@bar.com'. Check the email, or create a new contact first."
```

---

## `Prompt.txt` + `Tools.json` Pairing

A common MCP/agent convention is to pair a **prompt** (the descriptive instructions for the agent) with a **tool registry** (the machine-readable tool definitions). When the target is a shared agent resource (not a single function call), emit both:

| File | Purpose | Example content |
|---|---|---|
| `Prompt.txt` | Human/agent-facing description of the workflow | Natural-language guidance on when/what to do |
| `Tools.json` | Machine-readable tool definitions | JSON Schema array of the server's tools |

> **Rule**: When you emit a packaged agent resource, keep `Prompt.txt` and `Tools.json` in sync — the tools listed in the prompt must be the same set defined in the JSON. This mirrors the single-source → multi-format sync rule from `rules-guide.md`.
