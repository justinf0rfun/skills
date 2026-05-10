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
- Prefer primary sources over secondary commentary. Good sources include official docs, release notes, KIPs/RFCs/PEPs/design proposals, original papers, maintainers' posts, and authoritative engineering retrospectives.
- Research relevant papers separately when the topic has an academic or foundational design lineage. Papers often explain why the original abstraction was plausible, what constraints the designers optimized for, and which trade-offs were known from the beginning. Do not only search release notes and blog posts.
- Avoid source dumping. Cite the key sources used, and when useful, say which stages they support.

## Output Contract

Start with a compact orientation:

- What the system is.
- The central pressure that shaped its evolution.
- The one-sentence trade-off theme that appears repeatedly. Make this sharp and reusable, not academic.

Then produce the sections below.

### 1. Evolution Stages

Choose stages by engineering decision pressure, not by release chronology. For mature infrastructure, databases, runtimes, frameworks, languages, and major tools, a good answer usually has 7-9 stages. Do not compress a major "debt repayment" stage into the debt map if it changed how users operate the system.

For mature systems, check whether the stage list covers these arcs where relevant:

- Prototype or original abstraction.
- Reliability and replication/fault tolerance.
- Coordination, metadata, scheduling, ownership, or state management.
- Semantics/correctness guarantees.
- Ecosystem or higher-level abstraction.
- Scale, cloud-native, elasticity, or operations.
- Cost/storage/performance pressure.
- Current unresolved frontier.

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

**Debt introduced:** D<N> - <what this choice made harder later>
```

Stage quality rules:

- Every stage must be driven by a concrete constraint, not by a release note.
- Every table must contain at least two rejected options and one chosen path.
- Keep table cells tight: one cost, one reason, one decision. Avoid long essay cells.
- The chosen option must say why it was rational under the constraints of that stage, even if it later caused problems.
- The rejected options must be plausible choices real engineers would have considered.
- The debt line must create a traceable debt ID such as D1, D2, D3. Reuse these IDs in the debt map.
- Avoid hindsight moralizing. The point is to recreate the decision pressure, not to mock past designs.

### 2. Throughline

Summarize the recurring design philosophy in one or two paragraphs plus a compact table. Make it specific to the topic, for example:

- "Push complexity into the runtime to keep application code simple."
- "Preserve backward compatibility even when it complicates internals."
- "Use logs as the universal abstraction."

Then add:

```markdown
| Repeated choice | What it avoided | What it made harder | Outcome |
|---|---|---|---|
```

The throughline should produce a sentence the reader can repeat in a design review.

### 3. Debt Map

Create two tables. Use the debt IDs introduced in the stages.

Resolved debt:

```markdown
| Debt ID | Debt | Introduced in | Resolved in | Resolution |
|---|---|---|---|---|
```

Unresolved debt:

```markdown
| Debt ID | Pain point | Why it remains hard | Current manifestation |
|---|---|---|---|
```

Debt map quality rules:

- The map must explain "introduced in stage X, resolved in stage Y" where applicable.
- Do not list only abstract categories like "operational complexity". Name the concrete failure mode users feel.
- Include important unresolved operational pain even if it came from an omitted or secondary stage, but label it clearly.

### 4. Pain Point Ranking

Rank the top unresolved problems that users still feel today.

```markdown
| Rank | Pain point | One-line explanation | Competitive attack angle |
|---|---|---|---|
```

Use the competitive attack angle only when there is a meaningful comparison. Otherwise write "N/A".

Ranking quality rules:

- Prefer production symptoms over abstract labels: "rebalance storms", "cold-read latency", "schema migration pain", "dependency hell", "slow compile times", "state restore time", "version skew".
- The one-line explanation should describe what users observe during failure or scale, not just why the architecture is complex.
- Competitive attack angles should be concrete. Name a class of alternative system or a known competitor only when the comparison is fair.

### 5. Causal Chain

End with a causal chain that makes the evolution memorable. For complex systems, use an ASCII story map rather than a flat paragraph:

```text
early constraint -> chosen design -> solved problem, but introduced D<N>
     |
     v
next constraint -> next design -> repaid D<N>, but introduced D<M>
```

Keep it concise and legible. The best chain should let the reader retell the system's history from memory.

Use arrows and vertical continuation when it improves readability:

```text
2011 original constraint -> 2012 design -> solved X, but introduced D1
     |
     v
2014 next constraint -> next design -> repaid D1, but introduced D2
```

After the chain, add a bold one-sentence version:

```markdown
**One-sentence version:** <the system's repeated pattern and unresolved tension today>
```

This sentence should be conversational, sharp, and technically accurate.

### 6. Sources

If online verification was used, end with a short source list. Prefer 6-10 high-signal sources over a long bibliography. When possible, group sources by what they support:

```markdown
- Foundational papers: <source>
- Stage 2 replication: <source>
- Stage 5 correctness semantics: <source>
- Current pain points: <source>
```

Do not let sources replace reasoning. The main output should remain the decision tree and debt map.

## Style

- Write like a senior engineer explaining architecture history to another engineer.
- Keep the language conversational but precise: sound like a senior engineer explaining the decision in a design review, not like a paper abstract or a marketing article.
- Prefer memorable engineering phrasing over neutral summaries, but never sacrifice technical accuracy for punchlines.
- Prefer concrete mechanisms, failure modes, and operational consequences.
- Make the answer feel like a decision tree and a debt map, not a neutral research report.
- Use direct language. Avoid vague praise such as "powerful", "robust", or "revolutionary" unless immediately explained.
- Use Chinese if the user is writing Chinese, English if the user is writing English, unless `--lang` overrides.
- If the topic is too broad, choose the core system path and say what you intentionally left out.
- If the historical record is uncertain, say so and give the most likely interpretation.

## Quality Gate

Before finalizing, check the answer against these questions:

- Could a reader infer the system's evolution from stage 1 to today by following only the trade-offs?
- Did you include major debt repayment stages, not just feature releases?
- Does every stage have plausible rejected alternatives and a rational chosen path?
- Are the pain points concrete production symptoms rather than broad categories?
- Does every resolved or unresolved debt connect back to a stage or debt ID?
- Is the throughline sharp enough to quote in one sentence?
- Are sources high-signal and tied to the claims they support?

## Tool-Specific Invocation Notes

- Claude Code may expose this as `/redo <topic>` when installed with a command wrapper.
- Codex and Codex CLI should be invoked through skill selection or explicit skill mention, such as `$redo kafka`, `redo kafka`, or natural language requests that match this skill.
- Do not promise that every AI tool supports a native `/redo` slash command.
