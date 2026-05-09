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
make build SKILL=redo
```

Run checks:

```bash
make check
```

Preview the npm package contents:

```bash
make pack SKILL=redo
```

Run the installer locally:

```bash
make run SKILL=redo
```

Optionally bump the package version without publishing:

```bash
make version redo BUMP=patch
```

Publish:

```bash
npm login
npm whoami
make publish SKILL=redo
```

If npm asks for two-factor authentication during publishing, pass the one-time password:

```bash
make publish redo OTP=123456
```

`make publish SKILL=redo` runs checks, a dry-run pack, bumps the package version, and then publishes `@justinforfun/redo-skill`. The default version bump is `patch`.

To publish a minor or major version:

```bash
make publish redo BUMP=minor
make publish redo BUMP=major
```

You do not need to run `make version` or `make pack` manually before publishing unless you only want to preview or bump without publishing.

You can also pass the skill name as a positional argument:

```bash
make publish redo
```

For another skill, use its skill name:

```bash
make build SKILL=other
make pack SKILL=other
make run SKILL=other
make publish SKILL=other
```

The Makefile derives the npm package as `@justinforfun/<skill>-skill`. The `prepack` hook automatically syncs the source skill into its npm package before publishing.
