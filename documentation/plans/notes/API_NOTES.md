# API Notes Index

Audit matching-total rollout: [PROD-035](PRODUCTION_NOTES.md#prod-035--audit-matching-total-rollout)
owns the hosted publication, scope and SQL-volume verification boundary.

Independent Super Admin system-session rollout: PROD-034 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

This is the API-focused index into the central note registries.

Geography ID sorting rollout: PROD-033 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

Shared all-filtered collection export rollout: PROD-032 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

System log advanced query rollout: PROD-030 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

System Error Logs managed RPT/PDF integration and real provider/database acceptance: PROD-031 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

Current Crystal review references: **PROD-029** (published runtime auth/version
mismatch) in `PRODUCTION_NOTES.md`, **FOLLOW-023** (rejected catalog descriptor
interoperability) in `FOLLOW_UPS.md`, and existing **PROD-028** (hosted ERP report503).
Canonical details stay in those registries; review evidence is
`documentation/plans/business/managed-crystal-reporting-reliability/RUNTIME_REVIEW_2026-11-01.md`.

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

### PROD-028 — Hosted Countries managed-report acceptance

See canonical PROD-028 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md#prod-028--hosted-countries-report-catalog-unavailable); hosted catalog503 blocks complete report/pilot acceptance.

Crystal correction2026-11-01: FOLLOW-023 is Verified in FOLLOW_UPS.md. PROD-029 and
PROD-028 retain publication/access/native-render gates in PRODUCTION_NOTES.md.
Source/local acceptance and private package instructions: `documentation/plans/business/managed-crystal-reporting-reliability/RUNTIME_CORRECTION_RESULT_2026-11-01.md`.

FOLLOW-024 — Versioned global Angular Crystal manager. Canonical ownership,
requester decision, current preflight gate and trigger are in FOLLOW_UPS.md.
PROD-028 current render400/template rejection supersedes the earlier catalog-only
diagnosis; see the canonical latest entry in PRODUCTION_NOTES.md.

FOLLOW-024 current implementation/technical acceptance and remaining hosted/native/browser owner are canonical in FOLLOW_UPS.md; global-crystal-template-management/IMPLEMENTATION_2026-11-01.md is the current receipt index.


### DEF-028 — Crystal empty-template preparation and base designs

Canonical deferral, current priority and reopening trigger:
[DEF-028](DEFERRED_ITEMS.md#def-028--empty-template-preparation-and-reusable-base-designs).


### RISK-019 — Original RPT source contents

Canonical risk, owner and reassessment trigger:
[RISK-019](KNOWN_RISKS.md#risk-019--original-rpt-source-contents).

Current runtime key and Hub query repair2026-11-07: PROD-029/028 and PROD-003 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).
