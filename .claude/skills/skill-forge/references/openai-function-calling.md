# OpenAI Function Calling & Tool Schema Reference

> Source: https://platform.openai.com/docs/guides/function-calling
> Last fetched: 2026-08-26

---

## Overview

Function calling (also called tool calling) enables OpenAI models to interface with external systems by calling functions you define. The model decides when to call a function based on the user's request.

**Flow:**
1. Send a request with tool definitions
2. Model returns a tool call (instead of a text reply)
3. Execute the function in your code
4. Send the result back to the model
5. Model returns a final text response (or more tool calls)

---

## Function Definition Schema

```json
{
  "type": "function",
  "name": "get_weather",
  "description": "Retrieves current weather for the given location.",
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
        "description": "Temperature unit system"
      }
    },
    "required": ["location"],
    "additionalProperties": false
  },
  "strict": true
}
```

### Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | Always `"function"` |
| `name` | string | Yes | Function name (e.g. `get_weather`) |
| `description` | string | Recommended | When and how to use the function |
| `parameters` | object | Yes | JSON Schema defining input args |
| `strict` | boolean | Optional | Enforce strict schema mode |

### Parameters (JSON Schema)

| Field | Description |
|---|---|
| `type` | Always `"object"` for function parameters |
| `properties` | Map of parameter name to its schema |
| `required` | Array of required parameter names |
| `additionalProperties` | Set to `false` in strict mode |

### Property Schema

```json
{
  "param_name": {
    "type": "string|number|integer|boolean|array|object",
    "description": "Clear description for the model",
    "enum": ["option1", "option2"],
    "default": "value"
  }
}
```

---

## Strict Mode

When `"strict": true`:
- All parameters must be declared in `properties`
- `additionalProperties` must be `false`
- All required fields must be listed in `required`
- Provides stronger schema adherence guarantees from the model

---

## Tool Call Response Format

The model returns a tool call in its output:

```json
{
  "type": "function_call",
  "call_id": "call_abc123",
  "name": "get_weather",
  "arguments": "{\"location\": \"Paris, France\", \"units\": \"celsius\"}"
}
```

> Note: `arguments` is a **JSON string** — parse it before use.

## Tool Call Output (sending result back)

```json
{
  "type": "function_call_output",
  "call_id": "call_abc123",
  "output": "{\"temperature\": 22, \"conditions\": \"Sunny\"}"
}
```

---

## Python Example

```python
from openai import OpenAI

client = OpenAI()

tools = [
    {
        "type": "function",
        "name": "get_weather",
        "description": "Get current weather for a location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country"
                }
            },
            "required": ["location"],
            "additionalProperties": False
        },
        "strict": True
    }
]

response = client.responses.create(
    model="gpt-4o",
    tools=tools,
    input=[{"role": "user", "content": "What's the weather in Paris?"}]
)
```

---

## Best Practices for Function Descriptions

1. **Be specific**: Explain exactly what the function does and when to invoke it
2. **Document parameters clearly**: Each parameter needs a clear, actionable description
3. **Use enums**: Constrain values when a fixed set is valid (e.g., units: celsius/fahrenheit)
4. **Describe return values**: Mention what the function returns if it helps the model
5. **Edge cases**: Note limitations or special conditions

---

## Comparison: OpenAI vs Anthropic Function Schemas

| Feature | OpenAI | Anthropic |
|---|---|---|
| Root key | `type: "function"` + `name` | `name` (direct, no wrapper) |
| Schema field | `parameters` | `input_schema` |
| Strict mode | `strict: true` | Not applicable (use `required` + no extras) |
| Additional props | `additionalProperties: false` | Allowed by default |
| Description | Top-level `description` | Top-level `description` |
