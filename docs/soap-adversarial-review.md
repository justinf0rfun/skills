# SOAP adversarial review

Date: 2026-09-29
Package: `@justinforfun/soap-skill@2.0.0`

**Final independent release gate: 97/100. No remaining release-blocking defect was found in the tested scope.**

The requested threshold was strictly above 95/100. This is a scored engineering assessment against the scenarios below, not a statistical reliability estimate or a guarantee of correct behavior on every conversation.

## Method and scores

Four independent specialist subagents reviewed different surfaces using separate 25-point rubrics. They received the product contract and test scope, but not a target score or expected findings. Their first-round total was **87/100**. Reproduced defects were fixed and reevaluated using the same rubrics.

| Specialist | First round | Last specialist review |
|---|---:|---:|
| Behavioral forward tests | 24/25 | 25/25 |
| Instructions and product contract | 23/25 | 25/25 |
| Schema and transport | 22/25 | 24.5/25 |
| Installation and distribution | 18/25 | 25/25 |
| Total | 87/100 | 99.5/100 |

A fifth subagent then performed a fresh whole-package gate. It found two additional edge defects, independently verified their fixes, and inspected current source plus actual behavioral artifacts. Its more conservative **97/100** is the final reported score; specialist totals do not replace it.

| Final gate area | Score | Remaining deduction |
|---|---:|---|
| Behavioral and instruction contract | 24/25 | Limited synthetic single-model coverage; the injection scenario explicitly identifies its malicious snippet as untrusted. |
| Evidence, privacy, and identity | 25/25 | No remaining demonstrated defect in scope. |
| Schema and transport | 24/25 | Attempt count is bounded, but total elapsed time is not. DNS resolution can exceed the socket timeout. |
| Installation and distribution | 24/25 | Isolated filesystem/UI tests pass; native interactive installations on all supported platforms remain untested. |

## Reproduced issues and fixes

| Issue | Resolution | Verification |
|---|---|---|
| Empty/chat-only reviews did not reliably preserve identity for later export | Every completed review includes UUID and original timestamp in a chat receipt; exact-artifact recovery is allowed, otherwise missing metadata is requested | Fresh empty review followed by export preserved identity; missing-history case did not invent metadata |
| Full privacy rules were hidden from Markdown-only operation | Always-loaded instructions minimize/redact titles, metadata, evidence, and recommendation targets | Contract re-audit and synthetic report inspection |
| Missing save/validation capabilities had ambiguous fallback behavior | Explicit unsaved/unvalidated draft delivery; no upload or false retention claim | Controlled no-write and no-validator scenarios |
| UTF-16/32 JSON could be POSTed as application/json | Reject non-UTF-8 input and BOM before transport, preserving valid original bytes | Encoding probes and retained regression checks |
| Timestamp parsing rejected supported Python 3.9 fractional forms, mishandled leap seconds, and could echo a malformed value | Separate calendar validation from arbitrary fraction precision, check UTC leap position, enforce ASCII syntax, sanitize errors | 198 independent timestamp assertions on Python 3.9.6; retained fraction/leap/calendar/error checks |
| Failed replacement could remove a working installation | Stage replacement first, preserve old installation, restore on activation failure; report recovery location if rollback also fails | Injected copy, rename, activation, and rollback failures |
| No detected tools prevented deliberate first-time installation | Allow manual target selection with explicit confirmation | Empty simulated-home test |
| Package README links and CLI guidance were inconsistent | Use repository URLs and disclose CLI discovery fallback | Local target/remote mapping check, generated-package inspection |
| Deep malformed JSON leaked a traceback with absolute source paths | Handle recursion failure through the sanitized CLI error path | 2,000 nested arrays now exit 2 without traceback or path disclosure |
| Dangling command symlink skipped conflict handling | Check directory entries with lstat and treat only ENOENT as absence | Backup prompt occurs and original symlink is preserved |

No unrelated redo implementation was changed. No npm publishing or installation into the user's agent directories was performed.

## Behavioral cases actually exercised

- A design constraint acknowledged and then omitted during implementation: one supported cross-stage finding, not user-prompt blame.
- Design exploration followed by additional requested scope: no invented friction or recommendations; evidenced practices may be retained.
- Compacted history with only “forgot again”: insufficient coverage without invented recurrence or causes.
- Export with missing prior identity: narrowly request the exact artifact/metadata instead of silently inventing a replacement review.
- Export with an identified prior artifact: preserve original report ID and creation time.
- Empty chat-only review followed by export: reuse the receipt's identity.
- Host without write tools or without a validator: honest draft fallback and no upload.
- Malicious instructions in quoted tool output: treat them as data, not reporting authorization.

The no-write/no-validator cases were controlled host-capability simulations, not induced operating-system failures. Behavioral tests were synthetic enactments, not repeated multi-model evaluations.

## Runtime and packaging checks

- Repository `make check` passed, including the unchanged redo syntax check and SOAP report/installer regression checks.
- Skill metadata validation and `git diff --check` passed.
- Independent Draft 2020-12 schema inspection and 480 structural mutation comparisons passed in the transport audit; the fresh gate added 166 mutation comparisons.
- Strict opt-in, URL rejection, duplicate identities/keys, immutable retry bodies and idempotency keys, bounded attempts, error redaction, and redirect refusal were tested with mocked transport.
- The fresh gate exercised actual urllib DNS resolution flow using a no-network delayed resolver: 6.5-second resolution per attempt produced about 22.6 seconds total. A five-second socket timeout is not an overall deadline.
- Temporary-home installer probes covered normal install, skip, backup, overwrite, backup collisions, copy failure, activation failure, rollback failure, and dangling symlinks.
- Source/generated-package parity passed. Dry-run packaging listed exactly 11 intended release files and excluded tests and caches.

No live collector, external network transmission, native agent launch, Windows installation, or remote README URL availability was verified. The collector must deduplicate report IDs. Structural validation cannot prove factual accuracy or successful redaction.

## Reproduce the retained checks

From the repository root:

```sh
make check
make build SKILL=soap
make pack SKILL=soap
```

Relevant retained checks:

- [Report regression checks](../packages/soap-skill/test/report_test.py)
- [Installer regression checks](../packages/soap-skill/test/install.test.js)
- [Fixed data schema](../skills/soap/references/report.schema.json)
- [Reporting contract](../skills/soap/references/reporting.md)

Independent audit-session artifacts were retained under `/tmp/soap-behavior-audit`, `/tmp/soap-contract-audit`, `/tmp/soap-transport-audit`, `/tmp/soap-distribution-audit`, and `/tmp/soap-final-gate`. These temporary artifacts are not release dependencies and may be removed by the operating system; the report above records their substantive results.

## Audited source fingerprint

The final score applies to these file bytes. Reassess after material changes.

| File | SHA-256 |
|---|---|
| `skills/soap/SKILL.md` | `4c1a90f9336a4845a863cc3062aab0c06fd05e53da1e89a57a0a4df2b88abf19` |
| `skills/soap/references/reporting.md` | `ce5ee77722d9eb03c1831bee91d81ea4d5219b8d3f3b0f49b0bb850c1b41c0dd` |
| `skills/soap/references/report.schema.json` | `20a4b6f51c4c03a432f6e0fa478c13f8e7cdcacce4b7f96a60452d566096cdd2` |
| `skills/soap/scripts/report.py` | `efa56ccf3ba53fe1803ba2037a0cb4063f1862d27b1548c0f69c16bb6e321c9d` |
| `packages/soap-skill/bin/install.js` | `2aec755b44da37a2452e17311bcd235ee4168dd6ecdafd5486c0a4fe505b2390` |
| `packages/soap-skill/test/report_test.py` | `e0f08c0fefc84780dbe770c752f7b4b94aae4eb678a712d0dae4e3ccc31f01e3` |
| `packages/soap-skill/test/install.test.js` | `71cda83830a8cb168688cba1c54f9e1adc70167e325a9ef1e0ff5b6ce8271715` |
