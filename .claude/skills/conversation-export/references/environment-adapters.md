# Environment Adapters — Extended Reference

> Read this file when the delivery environment is ambiguous or unusual, or when you need platform-specific file-writing recipes.

---

## Environment Detection

If the environment is not stated by the user, infer it from context clues:

| Clue | Likely Environment |
|---|---|
| User mentions a shell command, `$`, `>`, or terminal output | CLI |
| User is in a conversation with an AI assistant (web/desktop app) | Agent Chat |
| User mentions a file path like `/workspace/`, `.py`, `.ipynb` | IDE or Notebook |
| No clues available | Default: Agent Chat (emit code blocks) |

---

## CLI Environment

**Artifact 1 (Context Prompt)**: Print to stdout inside a `---` fence for easy copy.

**Artifact 2 (Markdown Report)**: Write to disk.

### Shell Script Pattern

```bash
#!/usr/bin/env bash
# Usage: pipe this script's output to a file
# e.g. agent-export | tee conversation-export-$(date +%F).md

OUTPUT_FILE="conversation-export-$(date +%F).md"
cat > "$OUTPUT_FILE" << 'EOF'
{MARKDOWN REPORT CONTENT}
EOF

echo "✅ Exported to $OUTPUT_FILE"
echo ""
echo "=== CONTEXT PROMPT (copy below) ==="
cat << 'EOF'
{CONTEXT PROMPT CONTENT}
EOF
```

### Python Pattern (for agents with `run_command`)

```python
from datetime import date

filename = f"conversation-export-{date.today()}.md"
report_content = """
{MARKDOWN REPORT CONTENT}
""".strip()

with open(filename, "w", encoding="utf-8") as f:
    f.write(report_content)

print(f"✅ Markdown Report saved to: {filename}")
print()
print("=== CONTEXT PROMPT ===")
print("""
{CONTEXT PROMPT CONTENT}
""".strip())
```

---

## Agent Chat Environment (Web / Desktop)

No file system access is guaranteed. Emit both artifacts as labeled fenced code blocks in the response.

**Delivery format**:

````
## Artifact 1 — Context Prompt
```text
{CONTEXT PROMPT CONTENT}
```

## Artifact 2 — Markdown Report
```markdown
{MARKDOWN REPORT CONTENT}
```
````

Add a one-line footer: `> 💾 To save Artifact 2, copy the markdown block and paste into a new .md file.`

---

## IDE Environment (Cursor, VS Code, JetBrains, etc.)

Use the agent's file-creation tool to write directly to the workspace.

**Suggested filename**: `docs/exports/conversation-{YYYY-MM-DD}.md` (create directory if missing).

**Fallback**: If no file-creation tool is available, emit as a code block and add: `> Save this file as docs/exports/conversation-{date}.md in your workspace.`

---

## Notebook Environment (Jupyter, Google Colab, Marimo)

**Artifact 1**: Print as a Markdown cell using `IPython.display.Markdown`.
**Artifact 2**: Write to `/content/conversation-export-{date}.md` (Colab) or `./export.md` (local Jupyter).

```python
from IPython.display import Markdown, display
display(Markdown("""
{CONTEXT PROMPT CONTENT}
"""))

with open("conversation-export.md", "w") as f:
    f.write("""
{MARKDOWN REPORT CONTENT}
""".strip())
```

---

## API / Programmatic Environment

Return both artifacts as a structured JSON object:

```json
{
  "context_prompt": "{CONTEXT PROMPT CONTENT}",
  "markdown_report": "{MARKDOWN REPORT CONTENT}",
  "metadata": {
    "session_title": "...",
    "date": "YYYY-MM-DD",
    "compression_ratio_pct": 22,
    "turn_count": 14
  }
}
```

---

## No-Write-Access Fallback (Universal)

When no file system or output mechanism is available:
1. Emit both artifacts as labeled code blocks.
2. Add this footer:

```
---
> **How to save**: 
> - **Artifact 1**: Paste into the system/context prompt of your next session.
> - **Artifact 2**: Copy the markdown block → create a new file → paste → save as `conversation-export-{date}.md`.
```
