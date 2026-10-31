# API Notes Index

This is the API-focused index into the central note registries.

Do not duplicate full note details here. Add the canonical note to one of:
- `PRODUCTION_NOTES.md`
- `DEFERRED_ITEMS.md`
- `KNOWN_RISKS.md`
- `FOLLOW_UPS.md`
- `DECISION_BACKLOG.md`

Then reference its stable ID here.

## Active API notes

| Note ID | Type | Area | Summary | Canonical registry |
| --- | --- | --- | --- | --- |
| FOLLOW-011 | Follow-up | SQL integration gate | First full run had two non-reproduced SQL failures; complete diagnostic repeat passed. Preserve diagnostics on recurrence. | `FOLLOW_UPS.md` |
| DEC-025 | Decision | Angular direct API | Closed: no BFF; retain Next and reuse current API. | `DECISION_BACKLOG.md` |
| DEC-027 | Decision | Direct authentication | Closed: direct API Cookie binding implemented/verified in R2; Angular consumer next. | `DECISION_BACKLOG.md` |
| RISK-018 | Risk | Authentication contract/source drift | Session drift repaired/tested in S0-AUTH-R1; provider/browser acceptance remains open. | `KNOWN_RISKS.md` |
| DEC-023 | Decision | Error-log capture | Select first-release capture boundaries. | `DECISION_BACKLOG.md` |
| DEC-022 | Decision | Error-log lifecycle | Confirm retention and append-only/export policy. | `DECISION_BACKLOG.md` |
| PROD-010 | Production | Hosted device/API E2E | Mobile authenticated release journeys require the deployed API. | `PRODUCTION_NOTES.md` |
| PROD-011 | Production | Swagger/API drift | Hosted API description and smoke must be reconciled after contract/version changes. | `PRODUCTION_NOTES.md` |
| PROD-016 | Production | Database migrations | Production module migrations are a deployment step, not multi-instance startup work. | `PRODUCTION_NOTES.md` |
| PROD-017 | Production | Configuration/security | Production secrets, effective connections, and malware scanning must pass startup validation. | `PRODUCTION_NOTES.md` |
| PROD-018 | Production | Workforce Planning | Authenticated lifecycle/tenancy/permission/concurrency smoke remains environment evidence. | `PRODUCTION_NOTES.md` |
| PROD-021 | Production | Address Type migration | Existing-environment company expansion needs drained jobs, backup, SQL review, and maintenance-window deployment. | `PRODUCTION_NOTES.md` |
| DEF-006 | Deferred | Addresses | Owner-link CQRS commands remain separate owner-specific slices. | `DEFERRED_ITEMS.md` |
| DEF-008 | Deferred | Workforce governance | Delegated separation of duties remains deferred. | `DEFERRED_ITEMS.md` |
| DEF-009 | Deferred | Workforce authorization | Delegable budget-approval permission remains deferred. | `DEFERRED_ITEMS.md` |
| RISK-004 | Risk | Authentication | Current refresh rotation lacks full multi-generation token-family ancestry. | `KNOWN_RISKS.md` |
| RISK-005 | Risk | Platform effects | Future critical post-commit effects must use an outbox rather than best-effort dispatch. | `KNOWN_RISKS.md` |
| FOLLOW-003 | Follow-up | Contract parity | Scoped assessment Verified; typed fallback and remaining remediation/whole-API automation are FOLLOW-003. | `FOLLOW_UPS.md` |
| PROD-022 | Production | Delivery security | Deployment approval gates and artifact signing/provenance remain Production Scale work. | `PRODUCTION_NOTES.md` |
| PROD-023 | Production | Disaster recovery | Backup/restore/RPO/RTO evidence remains Production Scale work. | `PRODUCTION_NOTES.md` |
| PROD-024 | Production | Observability | Central error tracking, dashboards, alerts, SLOs, and redaction remain Production Scale work. | `PRODUCTION_NOTES.md` |
| PROD-025 | Production | Managed Crystal runtime | Matching contract fingerprints, runtime/catalog packaging, worker-capacity limits and a live authenticated render require deployment evidence. | `PRODUCTION_NOTES.md` |
| RISK-008 | Risk | Managed Crystal fixture | Real positive `.rpt` acceptance is Deferred during development and becomes mandatory before Fiscal Years live acceptance or release. | `KNOWN_RISKS.md` |

## API note checklist

Use `Surface = API` or `Surface = Cross-platform` for items involving:
- CQRS/application handlers;
- Domain invariants exposed through API behavior;
- endpoint/request/response contracts;
- permissions and access modes;
- ProblemDetails/error codes;
- transactions/concurrency/idempotency;
- EF migrations/seeds/data repair;
- cross-module Contracts/messaging/outbox;
- background jobs;
- API performance/observability;
- versioning/backward compatibility;
- deployment-only infrastructure checks.

A business plan cannot become `Implementation Ready` while a blocking Required API
decision is recorded only as an unresolved note.
| RISK-010 | Risk | Error Logs capture availability | Best-effort sink and authenticated runtime capture limits; see canonical note. | `KNOWN_RISKS.md` |

`PROD-027` — Company account email provider/client acceptance; canonical ownership, trigger and production gate are in PRODUCTION_NOTES.md.

`DEC-024` — Company message logs scope; canonical decision in DECISION_BACKLOG.md. `RISK-011` — Observational capture availability/uncertain SMTP outcome; canonical risk in KNOWN_RISKS.md.
