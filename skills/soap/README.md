# SOAP

**Friction happens.Soap it.**

Review a development collaboration, trace avoidable friction to evidence, and propose concrete improvements. Design and implementation can stay in one conversation. No ratings, task-type questionnaire, or mandatory category checklist.

## Install

From this repository, run `make build SKILL=soap` and `make run SKILL=soap`. The installer provides arrow-key navigation, Space to select tools, and Enter to confirm. Existing installations can be backed up before overwrite, overwritten, or skipped.

Install from npm:

```sh
npx @justinforfun/soap-skill
```

Node.js 18+ runs the installer. JSON validation and optional reporting require Python 3.9+; ordinary conversational analysis does not.

| Tool | Installer destination | Invocation |
|---|---|---|
| Codex | `~/.agents/skills/soap` | `$soap`, select SOAP, or ask to use SOAP |
| Codex CLI | `${CODEX_HOME:-~/.codex}/skills/soap` (repository installer convention) | `$soap` or select SOAP if discovered by your version |
| Claude Code | `~/.claude/skills/soap` and command wrapper | `/soap` |

Codex's documented shared discovery directory is `~/.agents/skills`; if your CLI does not discover the repository's CLI destination, select the Codex installer target. Other agents can load the skill folder or read its `SKILL.md`; native slash commands are host-specific.

## Use

```text
$soap
$soap review the implementation since our last retrospective
$soap export
$soap resync docs/soap/<saved-report>.json
```

Report prose follows the user's conversation language unless another language is explicitly requested. Instructions, documentation, JSON keys, and dimension codes are English.

SOAP distinguishes missing information from unread, misunderstood, or ignored information. Normal exploration and new requirements are not automatically rework. It can report no evidenced friction or insufficient evidence without inventing recommendations.

The chat response leads with the main finding and next useful change. Substantive findings or reusable practices produce a Markdown report in `docs/soap/`. JSON is generated only for requested export or enabled reporting. Proposed changes are not applied without authorization.

## Optional reporting

Default behavior is local only. To opt in, configure both variables in the agent's environment:

```sh
export SOAP_REPORTING=1
export SOAP_ENDPOINT='https://collector.example.com/events'
```

The collector receives each completed retrospective, including empty findings, under a [fixed versioned schema](https://github.com/justinf0rfun/skills/blob/main/skills/soap/references/report.schema.json). Every report has an independent ID; a business task ID is nullable and never inferred from a branch. The collector deduplicates retries by report ID. No collector service is included.

Only minimized, redacted evidence summaries are sent, not raw conversations, source code, personal identities, or local absolute paths. Schema validation does not prove redaction or factual accuracy. Failed uploads retain their JSON for explicit retry and never prevent local delivery. Unset `SOAP_REPORTING` to disable reporting.

See [the reporting contract](https://github.com/justinf0rfun/skills/blob/main/skills/soap/references/reporting.md) for validation, payload semantics, retries, and collector requirements. Cross-task analysis, adoption tracking, and effectiveness measurement belong to your AI SDLC platform, not this skill.

## Development

From the repository root:

```sh
make build SKILL=soap
make check
make pack SKILL=soap
```

Release checks include JSON validation, opt-in transport behavior, retries, and isolated installer scenarios. No live collector is used by the checks.

## License

MIT. See [LICENSE](LICENSE).
