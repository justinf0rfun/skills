---
name: redo
description: Reverse-learn any programming technology, framework, tool, or infrastructure system by reconstructing its evolution as a sequence of real engineering constraints, candidate designs, trade-offs, technical debt, later fixes, and unresolved pain points. Use this skill when the user asks with /redo, redo, $redo, reverse learn, retrace, re-derive, asks to understand why a technology evolved the way it did, or asks to turn a redo artifact into a senior-engineer learning plan.
---

> Every mature system is a fossil record of the constraints it survived.

# Redo

Redo is a reverse-learning skill for understanding a technology as if you were one of the engineers who evolved it from zero to today. Do not write a feature tour, timeline summary, encyclopedia article, or interview-prep study guide. Reconstruct the path of necessity: what problem existed at each stage, what options were available, why the chosen design won, what trade-off it accepted, and what debt it left behind.

## Trigger Patterns

Use this skill when the user asks to reverse-learn, redo, re-derive, reconstruct, or deeply understand a programming technology, framework, language, database, infrastructure system, protocol, build tool, runtime, AI tool, or developer platform.

Also use this skill when the user asks to create a learning plan, study plan, or senior-engineer practice plan from a redo artifact or from a topic using redo's philosophy.

Explicit examples:

- `/redo kafka`
- `$redo kafka`
- `redo kafka`
- `redo kafka --lang en`
- `redo kafka --plan`
- `redo kafka --plan --brief`
- `redo kafka --plan --include-analysis`
- `redo plan kafka.md`
- `redo plan`
- `Reverse-learn Kafka`
- `Retrace React's evolution path`
- `Explain Docker by retracing its engineering decisions`
- `Create a learning plan from this redo artifact`

## Arguments

Parse the request as:

```text
redo <topic> [--lang zh|en]
redo <topic> --plan [--brief] [--days <number>] [--daily <duration>] [--role <role>] [--depth standard|deep] [--include-analysis] [--lang zh|en]
redo plan [<artifact-path>] [--brief] [--days <number>] [--daily <duration>] [--role <role>] [--depth standard|deep] [--lang zh|en]
```

- `<topic>` is the technology, tool, or system to analyze.
- `redo plan` creates a learning plan from an existing redo artifact. The artifact may be a file path, pasted content, or the most recent redo artifact in the conversation.
- If both an artifact path and pasted artifact content are present, prefer the pasted content because it reflects what the user wants planned now.
- If an artifact path is provided and tools can read it, read the file before planning. Do not infer artifact contents from the filename.
- If `redo plan` has no path, no pasted content, and no recent redo artifact in the conversation, ask the user for a topic, artifact path, or pasted redo artifact.
- `--plan` switches `redo <topic>` into learning-plan mode.
- `--include-analysis` with `--plan` outputs the full redo analysis before the learning plan. Without it, output only a compact redo summary plus the plan.
- `--brief` outputs a one-page-scan learning plan. It implies a 90-minute plan unless `--daily` overrides it.
- `--days <number>` sets the plan length. Default: `7`.
- `--daily <duration>` sets the daily time budget, such as `30m`, `45m`, or `90m`. Default: `45m`.
- `--role <role>` tunes emphasis for the learner's role. Default: `senior-engineer`. Common roles include `backend`, `frontend`, `infra`, `architect`, and `manager`.
- `--depth standard` is the default. `--depth deep` adds source verification and at most two source-code or hands-on verification tasks tied to a specific trade-off, debt, boundary, or failure mode.
- `--lang zh` forces Chinese output.
- `--lang en` forces English output.
- If `--lang` is absent, respond in the user's current conversation language.

The selected output language applies to the entire answer. Localize every user-facing section name, heading, table label, fixed phrase, and summary label into that language. Do not leak English template labels such as "Stage", "Debt introduced", "One-sentence version", "Transferable Pattern", "Counterexample", or "Sources" unless the user asked for English.

## Evidence Requirements

For real technologies, do not rely only on memory when dates, versions, authorship, current status, or historical claims matter.

- If web access is available and the user has not forbidden it, verify with primary or high-authority sources first: official documentation, release notes, RFCs, design docs, papers, project repositories, or authoritative engineering blogs.
- If web access is unavailable, blocked, or the user forbids browsing, state clearly that the analysis is not freshly verified from online sources.
- Distinguish sourced facts from inference. It is acceptable to infer engineering motivations, but label them as inference when the source does not explicitly say so.
- Prefer primary sources over secondary commentary. Good sources include official docs, release notes, KIPs/RFCs/PEPs/design proposals, original papers, maintainers' posts, and authoritative engineering retrospectives.
- Research relevant papers separately when the topic has an academic or foundational design lineage. Papers often explain why the original abstraction was plausible, what constraints the designers optimized for, and which trade-offs were known from the beginning. Do not only search release notes and blog posts.
- Avoid weak secondary sources when primary sources exist. Do not cite SEO summaries, generic tutorials, or casual comparison posts for core historical claims if official design docs, papers, or maintainer explanations are available.
- Avoid source dumping. Cite the key sources used, and when useful, say which stages they support.

## Output Contract

Start with a compact orientation:

- What the system is.
- The central pressure that shaped its evolution.
- The one-sentence trade-off theme that appears repeatedly. Make this sharp and reusable, not academic.

Then produce the sections below.

### 1. Evolution Stages

Choose stages by engineering decision pressure, not by release chronology. Causal order is more important than strict release order, but time should generally move forward. If a later concern appears before an earlier release, explain why the causal dependency is being presented that way.

For mature infrastructure, databases, runtimes, frameworks, languages, and major tools, a good answer usually has 7-9 stages. Do not compress a major "debt repayment" stage into the debt map if it changed how users operate the system. If you use more than 8 stages, the extra stage must earn its place by explaining a current frontier, current user-facing pain, or important debt repayment that would otherwise be invisible.

A stage can be a partial mitigation, not only a new feature. If a prior debt became painful at scale and later received a named fix, protocol change, runtime change, scheduler change, storage change, migration path, or operational redesign, make that fix its own stage. Do not hide it only in the debt map.

For mature systems, check whether the stage list covers these arcs where relevant:

- Prototype or original abstraction.
- Reliability and replication/fault tolerance.
- Coordination, metadata, scheduling, ownership, or state management.
- Semantics/correctness guarantees.
- Ecosystem or higher-level abstraction.
- Major mitigation of a previously introduced operational pain.
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
- Use clean top-level debt IDs: D1, D2, D3, and so on. If one stage introduces multiple meaningful debts, assign the next clean IDs instead of ad-hoc labels such as D2-4 or D3b.
- When a stage primarily repays earlier debt, explicitly say which debt IDs it repays and what new debt it introduces.
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

Use this structure so the section is stable:

```markdown
## Throughline

<one paragraph naming the recurring philosophy>

The cost: <one sentence naming the recurring price>

| Repeated choice | What it avoided | What it made harder | Outcome |
|---|---|---|---|

**Design-review sentence:** "<one memorable sentence>"
```

### 3. Transferable Pattern and Boundaries

After the throughline, add a section that helps the reader generalize the core design idea beyond the topic. This is not a random "similar tools" list. It should identify the reusable engineering philosophy, show where other systems apply the same idea, and show where the idea breaks down.

Use this structure:

```markdown
## Transferable Pattern

<one paragraph naming the reusable idea, such as "delegate caching to the operating system", "make the log the source of truth", or "push coordination into a control plane">

| System | How it uses the same idea | Shared constraint | Different price |
|---|---|---|---|
| <system> | <specific mechanism> | <why the same idea fits> | <what this system pays instead> |
```

Then add a boundary or counterexample table:

```markdown
## Where This Pattern Stops

| Counterexample | Why the opposite choice is rational | Boundary rule |
|---|---|---|
| <system or system class> | <mechanism-level reason> | <when not to copy the original topic's design> |
```

Generalization quality rules:

- Compare mechanisms, not product categories. "Both rely on OS page cache for immutable segment-like files" is useful; "both are data systems" is not.
- Include 3-5 sibling systems when there is a real shared principle. If fewer than 3 are defensible, use fewer and explain why.
- Include at least one counterexample or boundary class when the pattern has a meaningful opposite design. The counterexample should make the original idea clearer, not just criticize another system.
- Every sibling or counterexample must name the condition that makes the design work or fail: immutable files, append-only logs, random updates, strict transaction control, latency tail sensitivity, memory ownership, coordination scope, compatibility pressure, and so on.
- Do not imply the original topic's design is universally superior. The goal is "when to copy this idea" and "when not to copy it".
- For specific comparisons to real systems, verify with primary or high-authority sources when online verification is available.

### 4. Debt Map

Create three tables. Use the debt IDs introduced in the stages. A debt is "resolved" only when the original failure mode is structurally removed or no longer a normal user concern. If a later design reduces blast radius, frequency, or operational cost but the pain can still appear, put it under "mitigated", not "resolved".

Resolved debt:

```markdown
| Debt ID | Debt | Introduced in | Resolved in | Resolution |
|---|---|---|---|---|
```

Mitigated debt:

```markdown
| Debt ID | Debt | Introduced in | Mitigated in | What improved | What remains |
|---|---|---|---|---|---|
```

Unresolved debt:

```markdown
| Debt ID | Pain point | Why it remains hard | Current manifestation |
|---|---|---|---|
```

Debt map quality rules:

- The map must explain "introduced in stage X, resolved or mitigated in stage Y" where applicable.
- Do not list only abstract categories like "operational complexity". Name the concrete failure mode users feel.
- Include important unresolved operational pain even if it came from an omitted or secondary stage, but label it clearly.

### 5. Pain Point Ranking

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
- Do not overclaim in competitive comparisons. If an alternative avoids one pain by accepting another trade-off, state that trade-off briefly instead of implying it is strictly better.
- Phrase attack angles as trade-off-aware comparisons: "X can attack this by doing Y, but pays Z." Avoid claims like "X does not have this problem" unless a primary source or well-established mechanism supports it.
- If the comparison would be shallow or unfair, write "N/A" rather than forcing a competitor into the table.

### 6. Causal Chain

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

### 7. Sources

If online verification was used, end with a short source list. Prefer 6-10 high-signal sources over a long bibliography. Split sources into primary and secondary groups. Use secondary sources only when they add useful synthesis or operational perspective, and keep them to at most two items. Do not use a secondary source for a core mechanism when an official design doc, release note, RFC, KIP, PEP, paper, or maintainer explanation exists.

Use this format:

```markdown
Primary sources:

- Foundational papers: <source>
- Stage 2 replication: <source>
- Stage 5 correctness semantics: <source>
- Current pain points: <source>

Secondary sources (optional, max 2):

- Operational retrospective or synthesis: <source>
```

Source quality rules:

- Every major stage should be supported by at least one primary source when online verification is available.
- If an important claim is inferred from multiple sources rather than directly stated, mark it as inference in the analysis.
- Do not cite generic tutorials, SEO summaries, or casual comparison posts for mechanism, history, or version claims.

Do not let sources replace reasoning. The main output should remain the decision tree and debt map.

## Learning Plan Mode

Learning-plan mode turns a redo analysis into an execution plan for experienced engineers. It must not become an interview-prep checklist, component inventory, API reading list, or generic study schedule. The goal is engineering judgment training: constraint recognition, trade-off reasoning, debt tracing, pattern transfer, boundary recognition, and design-review explanation.

Learning-plan mode is triggered by `--plan`, `redo plan`, or a natural-language request to create a learning plan from a redo artifact.

Normal redo output must not change unless learning-plan mode is requested.

### Input Modes

Support these input paths:

- `redo <topic> --plan`: generate a compact redo summary and a learning plan.
- `redo <topic> --plan --include-analysis`: generate the full redo analysis first, then the learning plan.
- `redo plan <artifact-path>`: read the redo artifact and generate an artifact-based learning plan.
- `redo plan` with a recent redo artifact in the conversation: use that artifact.
- Pasted redo artifact: use the pasted content. If both pasted content and a file path exist, prefer pasted content.

For `redo plan <artifact-path>`, read the file when the environment can access it. If the file cannot be read, ask the user to provide the artifact path again or paste the artifact. Never guess the artifact's content from its filename.

### Evidence and Sources in Plan Mode

If planning from a topic, follow the normal redo evidence rules before producing the compact summary and plan.

If planning from an artifact:

- Prefer the artifact's Sources section as the trusted reading base.
- If a plan step needs missing sources and web access is available and not forbidden, query primary or high-authority sources.
- Do not recommend generic tutorials, SEO posts, interview-prep articles, or undifferentiated reading lists.
- If online verification is unavailable, blocked, or forbidden, state that no fresh source verification was performed.

Sources are supporting material, not the plan itself. Every source recommendation must attach to a concrete exercise or required output.

### Compact Redo Summary

For `redo <topic> --plan` without `--include-analysis`, begin with a compact summary of at most five bullets:

```markdown
## Compact Redo Summary

- Core constraint:
- Recurring trade-off:
- Most important debt:
- Transferable pattern:
- Boundary rule:
```

Do not turn this into a mini redo analysis. It is only an anchor for the learning plan.

Because the full redo artifact is not shown in this mode, do not reference hidden sections as if the learner can inspect them. Use the compact summary as the visible anchor, and make early exercises reconstruct the missing Throughline, stage decisions, Debt Map, Transferable Pattern, and Boundary Rule. If the user wants a plan bound to visible full sections, tell them to use `--include-analysis` or `redo plan <artifact>`.

For `redo plan <artifact>` and `redo plan` from an existing artifact, do not output a compact summary by default. Output short artifact assumptions instead.

### Artifact Assumptions and Gaps

When planning from an existing artifact, include a short assumptions section:

```markdown
## Artifact Assumptions

- <how the plan treats the Throughline>
- <how the plan uses the Debt Map>
- <how the plan uses Sources or notes missing sources>
```

If the artifact is incomplete, include:

```markdown
## Artifact Gaps

Critical gaps:
- <missing Throughline, Evolution Stages, or Debt Map>

Useful gaps:
- <missing Sources, Transferable Pattern, Boundaries, Pain Point Ranking, or Causal Chain>
```

Critical gaps are gaps that can make the plan drift away from redo's philosophy. Useful gaps improve quality but can be reconstructed during the plan.

Do not reject an incomplete artifact by default. Produce a repair-oriented plan that first reconstructs the missing pieces.

### Standard Plan Output

Default plan settings:

- `--days 7`
- `--daily 45m`
- `--role senior-engineer`
- `--depth standard`

Use this structure:

```markdown
## Learning Goal

## Assumptions

## How To Use This Redo Artifact Or Summary

## Plan Overview

## 7-Day Plan

### Day 1: <cognitive focus>

- Focus:
- Use from redo artifact:
- Exercise:
- Required output:
- Self-check:

## Apply To Your Own System

## Review Rubric

## Anti-Rote Rules
```

Each day must have all five fields:

- `Focus`: the judgment skill being trained.
- `Use from redo artifact`: specific sections to inspect, such as Throughline, Evolution Stages, Debt Map, Transferable Pattern, Where This Pattern Stops, Pain Point Ranking, Causal Chain, or Sources.
- `Exercise`: an active practice task. Prefer prediction-before-reading: make the learner choose, explain, or predict first, then compare with the artifact.
- `Required output`: a concrete artifact the learner must produce.
- `Self-check`: a test of whether the learner can explain the judgment, not whether they memorized facts.

Bind the plan to the visible redo material. If a full artifact is visible, a good plan says things like "Use the Throughline section", "Use Stage 2 and Stage 3", "Use the Debt Map", "Use Transferable Pattern", "Use Where This Pattern Stops", and "Use the Causal Chain". If only a compact summary is visible, do not cite hidden sections; make the plan reconstruct the missing sections as required outputs. If a visible artifact is missing a section, the plan should say which day reconstructs it.

For a 7-day default plan, use this cognitive sequence unless the artifact demands a better order:

1. Core tension and throughline.
2. Stage decisions and rejected options.
3. Technical debt map.
4. Debt repayment and mitigation path.
5. Transferable patterns in sibling systems.
6. Boundaries and counterexamples.
7. Apply the pattern to the learner's own system and write design-review sentences.

Adjust intensity to the time budget:

- Short daily budgets should require smaller outputs: one sharp sentence, one small table, one boundary rule.
- Longer daily budgets can require richer outputs: a decision table, source verification, or a short design memo.

### Brief Plan Output

`--brief` produces a one-page-scan plan, not a day-by-day plan. It defaults to 90 minutes unless `--daily` overrides it.

Use this structure:

```markdown
## Learning Goal

## 90-Minute Path

| Step | Time | What to inspect | Exercise | Required output |
|---|---:|---|---|---|

## Must-Produce Outputs

## What Not To Memorize

## Final Self-Check
```

The path must preserve redo's minimum cognitive loop:

```text
core tension -> stage decisions -> debt -> transfer -> boundary -> design-review sentence
```

Do not include a long stage-by-stage plan in brief mode.

### Role and Depth

Use `--role` to tune emphasis without changing the core philosophy:

- `backend`: APIs, throughput, correctness boundaries, data flow, integration cost.
- `frontend`: state models, rendering or interaction constraints, compatibility, developer experience.
- `infra`: reliability, replication, operations, capacity, failure modes.
- `architect`: long-term evolution, boundaries, migration cost, organizational debt.
- `manager`: team cognition, platform governance, migration risk, communication.
- `senior-engineer`: balanced default.

Use `--depth deep` for research-grade plans. Deep mode should add:

- Primary source verification where the artifact's sources are weak or missing.
- At most two source-code or hands-on verification tasks.
- A one-page design-review memo or equivalent final output.
- A stronger "apply to your own system" exercise.

Even in deep mode, source-code or hands-on work must verify a specific trade-off, debt, boundary, or failure mode. Do not produce a source-reading roadmap.

### Required Outputs

Every plan must require outputs that force the learner to think:

- A core-constraint sentence.
- A recurring-trade-off sentence.
- A decision table for one or more stages.
- A debt trace from introduction to mitigation, resolution, or current pain.
- A sibling-system comparison.
- A boundary rule or counterexample.
- Three design-review sentences:
  1. The core constraint.
  2. The recurring trade-off.
  3. The boundary rule.

Do not produce a plan whose only outputs are "read", "review", "understand", or "summarize".

### Apply To Your Own System

Every standard plan must include an application module. Ask the learner to choose a system, service, module, or platform they work on and write:

- Its current constraint.
- The design choice it made.
- The debt it introduced.
- A sibling pattern from the studied system.
- A boundary warning: where copying would be wrong.

This module is mandatory because redo is meant to train system-design judgment, not passive knowledge acquisition.

### Review Rubric

Every standard plan must include a rubric. Use questions like:

1. Can the learner explain the core constraint without naming components?
2. Can the learner defend at least two major design choices under their historical constraints?
3. Can the learner trace at least three debts from introduction to mitigation, resolution, or current pain?
4. Can the learner name sibling systems that share the same idea and explain the different price they pay?
5. Can the learner state when not to copy this design?

### Anti-Rote Rules

Every standard plan must include anti-rote rules:

- Do not memorize component lists.
- Do not turn stages into interview Q&A.
- Do not study APIs before understanding the constraints that made them necessary.
- Do not produce a reading-list plan.
- Do not append generic follow-up prompts unless the user asks.
- Every session must produce at least one trade-off explanation, debt trace, boundary rule, sibling-system comparison, or design-review sentence.

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
- Match the output language consistently. For non-English output, translate headings and table labels into the user's language instead of leaking English template labels.

## Quality Gate

Before finalizing, check the answer against these questions:

- Could a reader infer the system's evolution from stage 1 to today by following only the trade-offs?
- Did you include major debt repayment stages, not just feature releases?
- Did you include major partial-mitigation stages when a painful debt later received an important fix?
- Does every stage have plausible rejected alternatives and a rational chosen path?
- Are the pain points concrete production symptoms rather than broad categories?
- Does every resolved or unresolved debt connect back to a stage or debt ID?
- Is the throughline sharp enough to quote in one sentence?
- Does the transferable-pattern section show where the core idea works in other systems and where it stops?
- Are sources high-signal and tied to the claims they support?
- Is the language of headings, labels, and section names consistent with the user's language?
- If learning-plan mode was requested, is the plan training engineering judgment rather than memorization?
- If learning-plan mode was requested, does every day or brief step have a required output?
- If learning-plan mode was requested, is the plan bound to redo artifact sections instead of becoming a generic study schedule?
- If learning-plan mode was requested from an incomplete artifact, did you identify critical and useful gaps before planning?

## Tool-Specific Invocation Notes

- Claude Code may expose this as `/redo <topic>` when installed with a command wrapper.
- Codex and Codex CLI should be invoked through skill selection or explicit skill mention, such as `$redo kafka`, `redo kafka`, or natural language requests that match this skill.
- Do not promise that every AI tool supports a native `/redo` slash command.
