# Central Notes Registry

This folder is the single collection point for observations that are important
but are not immediately implemented.

Use it for:

- Production-only checks and release notes.
- Deferred improvements.
- Known limitations.
- Follow-up architecture work.
- Performance findings that need production evidence.
- Security/CSP observations requiring deployment verification.
- Technical debt that has an explicit owner/trigger.
- Business decisions postponed to a later phase.

Do **not** use chat history, TODO comments, or random feature documents as the only
record of an important deferred item.

## Files

| File | Purpose |
| --- | --- |
| [`PRODUCTION_NOTES.md`](PRODUCTION_NOTES.md) | Items that must be verified or performed in staging/Production. |
| [`DEFERRED_ITEMS.md`](DEFERRED_ITEMS.md) | Accepted work intentionally postponed. |
| [`KNOWN_RISKS.md`](KNOWN_RISKS.md) | Known risks, limitations, and operational concerns. |
| [`FOLLOW_UPS.md`](FOLLOW_UPS.md) | Non-blocking follow-up work that should be revisited. |
| [`DECISION_BACKLOG.md`](DECISION_BACKLOG.md) | Product/architecture/business decisions intentionally left open. |
| [`API_NOTES.md`](API_NOTES.md) | API-focused index into canonical notes. |
| [`WEB_NOTES.md`](WEB_NOTES.md) | Web-focused index into canonical notes. |
| [`MOBILE_NOTES.md`](MOBILE_NOTES.md) | Mobile-focused index into canonical notes. |
| [`CROSS_PLATFORM_NOTES.md`](CROSS_PLATFORM_NOTES.md) | Coordinated API/Web/Mobile note index. |

## Required fields

Every note must have:

- stable ID;
- title;
- source/context;
- owner;
- status;
- impact;
- reason it is not being done now;
- exact reopening trigger;
- target milestone if known;
- links to the canonical plan/guide/source;
- closure evidence when resolved.

## Status vocabulary

Use only:

`Open`, `Accepted`, `Deferred`, `Blocked`, `In Progress`, `Verified`, `Closed`,
`Cancelled`.

## ID format

Use one of:

- `PROD-###`
- `DEF-###`
- `RISK-###`
- `FOLLOW-###`
- `DEC-###`

Never recycle an ID after closing an item.

## Surface classification

Every canonical note must declare one or more affected surfaces:

- `API`
- `Web`
- `Mobile`
- `Data`
- `Infrastructure`
- `Cross-platform`

Use `Cross-platform` when the note cannot be resolved safely by one client/backend
in isolation.

The canonical detail lives in the type registry. `API_NOTES.md`, `WEB_NOTES.md`,
`MOBILE_NOTES.md`, and `CROSS_PLATFORM_NOTES.md` are indexes only.

## Moving scattered notes here

When a guide or plan still holds a deferred, production-only, "revisit later",
known-limitation, follow-up, or architecture/release TODO item, move it here:

1. Create one stable ID in the right registry, keeping the original meaning.
2. Record owner, status, and the reopen trigger, and link back to the source.
3. Replace the long copy in the secondary document with the ID only when that
   list is not itself part of a canonical contract.
4. Never move Required current-release work to Deferred to tidy a roadmap, and
   never mark a release blocker non-blocking without evidence or an explicit
   product/architecture decision.

A closed note keeps its row and adds the status (`Closed`/`Verified`), the date,
the verification evidence, and the replacing plan/commit/guide when there is
one. Completed notes are not deleted.
