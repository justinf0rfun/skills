# redo skill

Reverse-learn any programming technology, framework, tool, or infrastructure system by reconstructing its evolution through real engineering constraints, trade-offs, technical debt, later fixes, and unresolved pain points.

> Every mature system is a fossil record of the constraints it survived.

## Install

```bash
npx @justinforfun/redo-skill
```

The installer supports:

- Codex
- Codex CLI
- Claude Code

The installer detects supported tools on the local machine. Detected tools are selected by default; tools that are not detected are left unselected but can still be chosen. If you choose an undetected tool, the installer asks for confirmation before writing to its default directory.

## Invocation

```text
Claude Code: /redo kafka
Codex: $redo kafka, redo kafka, or select redo from the skill picker
Codex CLI: $redo kafka, redo kafka, or /skills then choose redo
```

## Language

`redo` replies in the user's current conversation language by default.

Use explicit language flags when needed:

```text
redo kafka --lang en
redo kafka --lang zh
```

## What redo Produces

For each technology, `redo` reconstructs:

- The core evolution stages
- The engineering constraint at each stage
- Candidate options and their costs
- Why the chosen design won
- Key trade-offs
- Transferable design patterns in sibling systems
- Boundary cases and counterexamples
- Technical debt introduced
- Debt that was later resolved
- Pain points that still remain
- A final causal chain that connects the system's history
