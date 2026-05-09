---
name: redo
description: Reverse-learn any programming technology, framework, tool, or infrastructure system by reconstructing its evolution as a sequence of real engineering constraints, candidate designs, trade-offs, technical debt, later fixes, and unresolved pain points. Use this skill when the user asks with /redo, redo, $redo, reverse learn, retrace, re-derive, or asks to understand why a technology evolved the way it did.
---

> Every mature system is a fossil record of the constraints it survived.

# Redo

Redo is a reverse-learning skill for understanding a technology as if you were one of the engineers who evolved it from zero to today. Do not write a feature tour, timeline summary, or encyclopedia article. Reconstruct the path of necessity: what problem existed at each stage, what options were available, why the chosen design won, what trade-off it accepted, and what debt it left behind.

## Trigger Patterns

Use this skill when the user asks to reverse-learn, redo, re-derive, reconstruct, or deeply understand a programming technology, framework, language, database, infrastructure system, protocol, build tool, runtime, AI tool, or developer platform.

Explicit examples:

- `/redo kafka`
- `$redo kafka`
- `redo kafka`
- `redo kafka --lang en`
- `Reverse-learn Kafka`
- `Retrace React's evolution path`
- `Explain Docker by retracing its engineering decisions`

## Arguments

Parse the request as:

```text
redo <topic> [--lang zh|en]
```

- `<topic>` is the technology, tool, or system to analyze.
- `--lang zh` forces Chinese output.
- `--lang en` forces English output.
- If `--lang` is absent, respond in the user's current conversation language.

## Evidence Requirements

For real technologies, do not rely only on memory when dates, versions, authorship, current status, or historical claims matter.

- If web access is available and the user has not forbidden it, verify with primary or high-authority sources first: official documentation, release notes, RFCs, design docs, papers, project repositories, or authoritative engineering blogs.
- If web access is unavailable, blocked, or the user forbids browsing, state clearly that the analysis is not freshly verified from online sources.
- Distinguish sourced facts from inference. It is acceptable to infer engineering motivations, but label them as inference when the source does not explicitly say so.
- Prefer fewer, stronger stages over many shallow ones. A good answer usually has 5-9 stages.

## Output Contract

Start with a compact orientation:

- What the system is.
- The central pressure that shaped its evolution.
- The main trade-off theme that appears repeatedly.

Then produce the sections below.

### 1. Evolution Stages

For each stage, use this structure:

```markdown
## Stage N: <stage name> (<approximate years or versions>)

**Constraint:** <the real engineering situation at the time>

| Option | Cost | Why it did or did not win |
|---|---|---|
| A. <candidate> | <cost> | <reason> |
| B. <candidate> | <cost> | <reason> |
| C. <chosen candidate> | <cost> | Chosen because <reason> |

**Key trade-off:** <the most important exchange>

**Debt introduced:** <what this choice made harder later>
```

Stage quality rules:

- Every stage must be driven by a concrete constraint, not by a release note.
- Every table must contain at least two rejected options and one chosen path.
- Explain why a reasonable engineer would choose the winning path at that time, even if it later caused problems.
- Avoid hindsight moralizing. The point is to recreate the decision pressure, not to mock past designs.

### 2. Throughline

Summarize the recurring design philosophy in one or two paragraphs. Make it specific to the topic, for example:

- "Push complexity into the runtime to keep application code simple."
- "Preserve backward compatibility even when it complicates internals."
- "Use logs as the universal abstraction."

### 3. Debt Map

Create two tables.

Resolved debt:

```markdown
| Debt | Introduced in | Resolved in | Resolution |
|---|---|---|---|
```

Unresolved debt:

```markdown
| Pain point | Why it remains hard | Current manifestation |
|---|---|---|
```

### 4. Pain Point Ranking

Rank the top unresolved problems that users still feel today.

```markdown
| Rank | Pain point | One-line explanation | Competitive attack angle |
|---|---|---|---|
```

Use the competitive attack angle only when there is a meaningful comparison. Otherwise write "N/A".

### 5. Causal Chain

End with a causal chain that makes the evolution memorable:

```text
early constraint -> chosen design -> solved problem -> new debt -> later fix -> remaining pain
```

Keep it concise and legible.

## Style

- Write like a senior engineer explaining architecture history to another engineer.
- Prefer concrete mechanisms, failure modes, and operational consequences.
- Use direct language. Avoid vague praise such as "powerful", "robust", or "revolutionary" unless immediately explained.
- Use Chinese if the user is writing Chinese, English if the user is writing English, unless `--lang` overrides.
- If the topic is too broad, choose the core system path and say what you intentionally left out.
- If the historical record is uncertain, say so and give the most likely interpretation.

## Tool-Specific Invocation Notes

- Claude Code may expose this as `/redo <topic>` when installed with a command wrapper.
- Codex and Codex CLI should be invoked through skill selection or explicit skill mention, such as `$redo kafka`, `redo kafka`, or natural language requests that match this skill.
- Do not promise that every AI tool supports a native `/redo` slash command.
