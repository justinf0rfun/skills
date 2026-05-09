# Skills

[English](./README.md) | [中文](./README.zh-CN.md)

A collection of cross-platform AI skills by Justin, designed to work across tools such as Codex, Codex CLI, and Claude Code.

This repository is organized as a monorepo:

```text
skills/                  # Source of each skill
packages/                # npm packages for installation
scripts/                 # Build and sync scripts
```

The root package is private. Each installable skill is published from its own package under `packages/`.

## Available Skills

### redo

`redo` helps you reverse-learn a programming technology, framework, tool, or infrastructure system by reconstructing how it evolved through real engineering constraints.

Instead of giving a feature tour, it asks:

- What problem existed at each stage?
- What options were available?
- What did each option cost?
- Why did the chosen design win at that time?
- What technical debt did it introduce?
- Which debts were later fixed, and which still shape the tool today?

Install:

```bash
npx @justinforfun/redo-skill
```

Trigger examples:

```text
Claude Code: /redo kafka
Codex: $redo kafka, redo kafka, or select redo from the skill picker
Codex CLI: $redo kafka, redo kafka, or /skills then choose redo
```

Language:

- By default, `redo` replies in the user's current conversation language.
- Use `--lang zh` or `--lang en` to force Chinese or English.

Examples:

```text
/redo kafka
redo react --lang en
$redo docker --lang zh
```

## Development

Install dependencies:

```bash
make install
```

Build a package by syncing the skill source into the npm package:

```bash
make build
```

Run checks:

```bash
make check
```

Preview the npm package contents:

```bash
make pack
```

Run the installer locally:

```bash
make run
```

Publish:

```bash
npm login
npm whoami
make publish
```

The `prepack` hook automatically syncs `skills/redo` into `packages/redo-skill` before publishing.
