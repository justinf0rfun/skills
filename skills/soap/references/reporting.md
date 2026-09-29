# Reporting contract

Reporting is optional. There is no default collector and no legacy payload compatibility.

## Enable and send

The user enables reporting by setting both `SOAP_REPORTING=1` and `SOAP_ENDPOINT` to their collector URL in the agent's environment. This is standing authorization for the documented payload scope; do not ask again for each report. Never set these variables yourself to enable reporting. A request for a local JSON export does not authorize transmission.

Resolve scripts relative to this installed skill directory. The runtime uses Python 3.9+ and its standard library, with no packages to install.

```sh
python3 <skill-directory>/scripts/report.py validate <report.json>
python3 <skill-directory>/scripts/report.py send <report.json>
```

Save JSON as UTF-8 without a byte-order mark; other encodings are rejected before sending. Validate before delivering a JSON export. Repair invalid generated data using the evidence; never invent values just to satisfy validation. Keep a saved payload immutable once submitted. Resending the same report must use the same payload and report ID; a new retrospective gets a new ID.

Sending is a JSON POST with `Content-Type: application/json` and `Idempotency-Key: <report_id>`. Collectors must deduplicate by `report_id` and return a 2xx response after accepting a report. Delivery is at least once, not exactly once. The helper makes at most three attempts, retrying network failures and HTTP 408, 429, and 5xx responses. Other HTTP failures stop immediately. It does not follow redirects.

Use HTTPS for remote collectors. HTTP is accepted only for loopback testing. Do not put credentials or sensitive query parameters in the endpoint URL. The helper does not print server response bodies or endpoint values. Custom authentication, background delivery, and batch resync are outside this version's scope.

Report local validation or delivery failure briefly and keep the JSON. `soap resync <report.json>` runs the same send command on the named file. No state database or background retry loop is required.

## Identity and coverage

[report.schema.json](report.schema.json) is the authoritative JSON Schema (Draft 2020-12). All declared object fields are required; unknown fields are rejected. Use explicit `null` only where the schema permits it, never sentinel strings such as `N/A`. Arrays may be empty unless the schema says otherwise.

- `schema_version`: `2.0`. A breaking field, type, enum, or semantic change requires a new schema version.
- `report_id`: a fresh UUID for each completed retrospective. Retry and export preserve identity.
- `created_at`: the report's original creation time, RFC 3339 with an explicit offset. Validation accepts fractional seconds, checks calendar values and UTC month-end leap-second position, but does not consult a historical leap-second announcement registry.
- `task.id`: an ID explicitly supplied by the user or platform, otherwise `null`. Never infer it from a branch. `title` describes the task; `scope` describes the portion reviewed.
- `context`: optional repository label (basename, not URL/path), branch, and agent name. Use `null` for unknown values; do not collect a developer identity.
- `coverage.status`: `complete` means the selected scope is available, `partial` means some evidence is missing or summarized, and `insufficient` means no defensible causal assessment is possible. `limitations` lists the concrete gaps. These states do not assert that the task succeeded.
- `findings[].id`: unique within the report. A platform identifies a finding by `(report_id, id)`.
- `dimensions[]`: objects with `code` and `detail`. Use `detail: null` for standard codes; require a nonempty explanation for `other`. Do not repeat a code within a finding.
- `evidence[]`: redacted summaries plus source descriptions, not raw transcripts. Each finding and practice must have evidence.
- `cause.status`: `supported`, `inferred`, or `unknown`. `explanation` states the reasoning or the missing evidence; classification does not hide uncertainty.
- `recommendations[]`: each has an ID unique within the report, actionable `change`, `target`, `applicability`, and `verification`. Keep this schema unchanged: put copy-ready safe prose or commands and the minimum ordered adoption steps in the existing `change` string. `target` identifies the repository-relative file and section/function or a specific workflow step; `verification` gives the observable completion criterion and its check. Keep code patches in local Markdown, not the uploaded payload; when a patch is needed, include a repository-relative report/section reference and a concrete code-free change description in `change`. If required context is missing, state the blocked input and next inspection step instead of fabricating an implementation. Recommendations may be empty.
- `practices[]`: an observed reusable `practice`, supporting evidence, and applicability conditions.

An empty findings array is valid. Interpret it together with coverage: no observed friction in a complete scope differs from insufficient history. Do not emit ratings, stage selection, adoption status, ownership, effectiveness claims, or fabricated durations. Those tracking responsibilities belong to the platform.

## Privacy

Minimize and redact before saving and again before transmitting. Send only task context, findings, necessary evidence summaries, recommendations, and reusable practices. Do not include full conversations, source code, secrets, personal identities, private URLs, or local absolute paths in prose fields. Keep locators descriptive and reliable; if exact turn numbers are unavailable, use an event description.

Schema validation checks structure, not factual accuracy or successful redaction. If saving or validation is unavailable, provide a clearly labeled unsaved or unvalidated draft in chat and do not transmit it. The agent remains responsible for those checks. The helper sends the chosen JSON verbatim; it does not scrape conversation history or collect environment metadata.

## Minimal valid example

```json
{
  "schema_version": "2.0",
  "report_id": "c13f9f0c-a2eb-48d6-9fa1-38419c40be70",
  "created_at": "2026-09-28T14:30:00+00:00",
  "task": {"id": null, "title": "Implement request deduplication", "scope": "Design through verification in the current task"},
  "context": {"repository": null, "branch": null, "agent": "Codex"},
  "coverage": {"status": "complete", "limitations": []},
  "summary": "No evidenced avoidable friction was found in the available task history.",
  "findings": [],
  "practices": []
}
```
