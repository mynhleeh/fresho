#!/usr/bin/env python3
"""
export-conversation.py
======================
CLI helper for the conversation-export skill.

Usage:
    python export-conversation.py < conversation.txt
    python export-conversation.py --file conversation.txt [--out exports/]
    python export-conversation.py --stdin

Input format (plain text, one turn per block separated by blank lines):
    User: ...
    Agent: ...

    User: ...
    Agent: ...

Output:
    - <out>/conversation-export-YYYY-MM-DD.md   (Markdown Report)
    - Prints Context Prompt to stdout

Dependencies: None (standard library only)
"""

import sys
import argparse
import re
from datetime import date
from pathlib import Path


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
FILLER_PATTERNS = re.compile(
    r"^(thanks?|thank you|ok|okay|got it|sure|great|cool|sounds good|"
    r"perfect|alright|understood|noted|hi|hello|bye|goodbye)[\.\!]*$",
    re.IGNORECASE,
)

MAX_CODE_LINES = 50
CODE_BLOCK_RE = re.compile(r"```[\s\S]*?```", re.MULTILINE)


# ---------------------------------------------------------------------------
# Phase 1 — Extract
# ---------------------------------------------------------------------------
def extract_turns(raw: str) -> list[dict]:
    """Parse raw text into classified turns."""
    turns = []
    blocks = [b.strip() for b in re.split(r"\n{2,}", raw.strip()) if b.strip()]

    for block in blocks:
        if block.lower().startswith("user:"):
            role = "user"
            content = block[5:].strip()
        elif block.lower().startswith(("agent:", "assistant:", "ai:")):
            role = "agent"
            content = re.split(r"^(agent|assistant|ai):", block, maxsplit=1, flags=re.IGNORECASE)[-1].strip()
        else:
            # Unknown role — treat as agent
            role = "agent"
            content = block

        # Classify
        if FILLER_PATTERNS.match(content):
            category = "FILLER"
        elif CODE_BLOCK_RE.search(content):
            category = "CODE"
        elif any(w in content.lower() for w in ["goal:", "objective:", "i want", "i need", "i'm trying", "we should"]):
            category = "GOAL"
        elif any(w in content.lower() for w in ["decided", "we'll use", "let's use", "use ", "chosen", "agreed"]):
            category = "DECISION"
        elif any(w in content.lower() for w in ["must", "should not", "required", "constraint", "limit", "rule:"]):
            category = "CONSTRAINT"
        else:
            category = "DECISION"  # Default: treat as a decision/context item

        turns.append({"role": role, "category": category, "content": content})

    return turns


# ---------------------------------------------------------------------------
# Phase 2 — Compress
# ---------------------------------------------------------------------------
def compress_code_block(block: str) -> str:
    """Truncate long code blocks."""
    lines = block.splitlines()
    if len(lines) <= MAX_CODE_LINES:
        return block
    head = lines[:20]
    tail = lines[-10:]
    omitted = len(lines) - 30
    return "\n".join(head) + f"\n[... {omitted} lines omitted ...]\n" + "\n".join(tail)


def compress(turns: list[dict]) -> dict:
    """Compress extracted turns into structured sections."""
    goals = []
    decisions = []
    constraints = []
    artifacts = []

    seen_decisions = {}  # dedup by first 8 words

    for t in turns:
        if t["category"] == "FILLER":
            continue

        content = t["content"]

        if t["category"] == "GOAL":
            goals.append(content)

        elif t["category"] == "DECISION":
            key = " ".join(content.split()[:8])
            seen_decisions[key] = content  # keep latest version

        elif t["category"] == "CONSTRAINT":
            constraints.append(content)

        elif t["category"] == "CODE":
            # Extract code blocks
            code_blocks = CODE_BLOCK_RE.findall(content)
            for i, cb in enumerate(code_blocks):
                compressed_cb = compress_code_block(cb)
                artifacts.append(compressed_cb)
            # Non-code prose in the same turn
            prose = CODE_BLOCK_RE.sub("", content).strip()
            if prose:
                key = " ".join(prose.split()[:8])
                seen_decisions[key] = prose

    return {
        "goals": goals,
        "decisions": list(seen_decisions.values()),
        "constraints": constraints,
        "artifacts": artifacts,
    }


# ---------------------------------------------------------------------------
# Phase 3 — Emit
# ---------------------------------------------------------------------------
def build_context_prompt(data: dict, title: str, session_date: str) -> str:
    lines = [f"[CONTEXT HANDOFF]", f"Session: {title} — {session_date}", ""]

    lines.append("## GOAL")
    if data["goals"]:
        for g in data["goals"][-3:]:  # max 3 goals
            lines.append(f"- {g.splitlines()[0]}")
    else:
        lines.append("- [Not explicitly stated]")

    lines.append("")
    lines.append("## CONTEXT")
    if data["constraints"]:
        for c in data["constraints"][:5]:
            lines.append(f"- {c.splitlines()[0]}")
    else:
        lines.append("- [No explicit constraints recorded]")

    lines.append("")
    lines.append("## DECISIONS")
    if data["decisions"]:
        for d in data["decisions"]:
            lines.append(f"- {d.splitlines()[0]}")
    else:
        lines.append("- None.")

    lines.append("")
    lines.append("## ARTIFACTS")
    if data["artifacts"]:
        for i, a in enumerate(data["artifacts"], 1):
            first_line = a.splitlines()[0].strip("`").strip()
            lines.append(f"- artifact-{i}: {first_line or '[code block]'}")
    else:
        lines.append("- None.")

    lines.append("")
    lines.append("## OPEN ITEMS")
    lines.append("- [Review and fill in manually after export]")

    return "\n".join(lines)


def build_markdown_report(
    data: dict,
    turns: list[dict],
    title: str,
    session_date: str,
    compression_pct: int,
) -> str:
    lines = [
        f"# Conversation Export: {title}",
        "",
        f"**Date**: {session_date}  ",
        f"**Session Length**: {len(turns)} turns  ",
        f"**Compression Ratio**: ~{compression_pct}% of original  ",
        "",
        "---",
        "",
        "## Summary",
        f"This session covered {len(data['decisions'])} decisions and produced "
        f"{len(data['artifacts'])} code/data artifacts. "
        f"See sections below for details.",
        "",
        "## Goal",
    ]
    if data["goals"]:
        for g in data["goals"][-3:]:
            lines.append(f"- {g.splitlines()[0]}")
    else:
        lines.append("- [Not explicitly stated]")

    lines += [
        "",
        "## Key Decisions",
        "| # | Decision |",
        "|---|---|",
    ]
    for i, d in enumerate(data["decisions"], 1):
        lines.append(f"| {i} | {d.splitlines()[0]} |")

    lines += [
        "",
        "## Artifacts Produced",
        "| # | Type | Preview |",
        "|---|---|---|",
    ]
    for i, a in enumerate(data["artifacts"], 1):
        first = a.splitlines()[0].strip("`").strip() or "[code block]"
        lines.append(f"| {i} | code | `{first[:60]}` |")

    lines += [
        "",
        "## Constraints & Requirements",
    ]
    if data["constraints"]:
        for c in data["constraints"]:
            lines.append(f"- {c.splitlines()[0]}")
    else:
        lines.append("- None.")

    lines += [
        "",
        "## Open Items / Next Steps",
        "- [Fill in manually after reviewing the session]",
        "",
        "## Raw Extraction Log",
        "<details>",
        "<summary>Click to expand</summary>",
        "",
    ]
    for i, t in enumerate(turns, 1):
        lines.append(f"- Turn {i} [{t['role'].upper()} / {t['category']}]: {t['content'][:80]}...")
    lines += ["", "</details>"]

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Export and compress a conversation.")
    parser.add_argument("--file", "-f", help="Input file (plain text). Defaults to stdin.")
    parser.add_argument("--out", "-o", default=".", help="Output directory for the .md file.")
    parser.add_argument("--title", "-t", default="Exported Session", help="Short session title.")
    args = parser.parse_args()

    # Read input
    if args.file:
        raw = Path(args.file).read_text(encoding="utf-8")
    else:
        print("Reading from stdin (Ctrl+D to finish)...", file=sys.stderr)
        raw = sys.stdin.read()

    session_date = date.today().isoformat()
    title = args.title

    # Phase 1 — Extract
    turns = extract_turns(raw)
    raw_token_approx = len(raw.split()) * 133 // 100

    # Phase 2 — Compress
    data = compress(turns)

    # Phase 3 — Emit
    context_prompt = build_context_prompt(data, title, session_date)
    compressed_token_approx = len(context_prompt.split()) * 133 // 100
    compression_pct = (
        round(compressed_token_approx / raw_token_approx * 100) if raw_token_approx > 0 else 0
    )

    markdown_report = build_markdown_report(data, turns, title, session_date, compression_pct)

    # Write Markdown Report
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    md_path = out_dir / f"conversation-export-{session_date}.md"
    md_path.write_text(markdown_report, encoding="utf-8")
    print(f"✅ Markdown Report saved to: {md_path}", file=sys.stderr)

    # Print Context Prompt to stdout
    print("=" * 60)
    print("ARTIFACT 1 — CONTEXT PROMPT (paste into new session)")
    print("=" * 60)
    print(context_prompt)
    print("=" * 60)
    print(f"Compression ratio: ~{compression_pct}%")
    print(f"Turns processed: {len(turns)}")


if __name__ == "__main__":
    main()
