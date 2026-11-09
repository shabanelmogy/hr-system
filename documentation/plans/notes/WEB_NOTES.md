# Web Notes Index

Geography ID sorting rollout: PROD-033 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

Angular composition-test timeout reliability: FOLLOW-031 in [FOLLOW_UPS.md](FOLLOW_UPS.md).


Collection view design corrections verified/closed 2026-11-08: FOLLOW-028
(non-list header counts), FOLLOW-029 (compact Import summary/preview) and
FOLLOW-030 (header touch density).
Canonical details: [FOLLOW_UPS.md](FOLLOW_UPS.md).

Angular Clean Code hardening: FOLLOW-022 in [FOLLOW_UPS.md](FOLLOW_UPS.md).
Canonical audit and execution proposal: web-angular-migration/CLEAN_CODE_HARDENING.md.

Historical verification-log transfer: FOLLOW-018 in FOLLOW_UPS.md.
Angular initial bundle warning: FOLLOW-019 in FOLLOW_UPS.md.

This is the Web-focused index into the central note registries.

Shared all-filtered collection export rollout: PROD-032 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

System log advanced query rollout: PROD-030 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

System Error Logs managed RPT/PDF integration and real provider/database acceptance: PROD-031 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).

Collection view-preference parity: FOLLOW-027 in [FOLLOW_UPS.md](FOLLOW_UPS.md),
Required within the current Super Admin goal before final acceptance.

Do not duplicate full note details here. Add the canonical note to one of:
- `PRODUCTION_NOTES.md`
- `DEFERRED_ITEMS.md`
- `KNOWN_RISKS.md`
- `FOLLOW_UPS.md`
- `DECISION_BACKLOG.md`

Then reference its stable ID here.

## Active Web notes

| Note ID | Type | Area | Summary | Canonical registry |
| --- | --- | --- | --- | --- |
| FOLLOW-026 | Follow-up | Reporting browser harness | Verified: refreshed sidebar selectors and eight focused lifecycle cases; RPT sidebar12 additional fixture cases passed. | `FOLLOW_UPS.md` |
| FOLLOW-025 | Follow-up | Historical Reporting raw logs | Current manifests use existing evidence; unavailable historical logs remain inventoried for future runtime acceptance. | `FOLLOW_UPS.md` |
| FOLLOW-021 | Follow-up | Historical Countries browser harness | Refresh current shared-control selectors before full S3-A8 acceptance. | `FOLLOW_UPS.md` |
| FOLLOW-020 | Follow-up | Retained Next preview bootstrap | Deferred outside Angular under D35; separate Next scope only. | `FOLLOW_UPS.md` |
| RISK-020 | Risk | Angular startup bundle | Measured startup localization cost exceeds unchanged warning budget; release review remains required. | `KNOWN_RISKS.md` |
| DEC-028 | Decision | Angular reporting scope | ActiveReports viewer/designer/SDK canceled by requester; managed Crystal/PDF retained. | `DECISION_BACKLOG.md` |
| FOLLOW-017 | Follow-up | Angular scoped lookup/live consumers | Actual owner snapshot/watch/lifetime/loading acceptance remains canonical. | `FOLLOW_UPS.md` |
| FOLLOW-016 | Follow-up | Advanced Angular collections | Baseline S1-A3 verified; each advanced option requires actual consumer/API/RTL/performance evidence. | `FOLLOW_UPS.md` |
| FOLLOW-015 | Follow-up | Angular authenticated workspace | S2-A1/2/3 frame, module discovery and read-only role home Verified; remaining exact workspace scope is canonical in FOLLOW_UPS.md. | `FOLLOW_UPS.md` |
| DEC-025 | Decision | Angular direct API | Closed: requester excluded BFF; Angular calls the existing API. | `DECISION_BACKLOG.md` |
| DEC-027 | Decision | Direct authentication | Closed: verified direct API Cookie contract ready for Angular consumer. | `DECISION_BACKLOG.md` |
| RISK-018 | Risk | Authentication contract/source drift | Actual refresh/revocation/provider behavior gates Angular auth acceptance and retained Web compatibility. | `KNOWN_RISKS.md` |
| DEC-026 | Decision | Pattern identity | Resolve duplicate P-008 meaning before affected contracts. | `DECISION_BACKLOG.md` |
| RISK-016 | Risk | Client parity | Track drift while Next is retained. | `KNOWN_RISKS.md` |
| RISK-017 | Risk | Specialist adapters | Prove required Angular integration compatibility/licensing. | `KNOWN_RISKS.md` |
| PROD-001 | Production | Observability | Real Collector/dashboard/alert delivery must be verified in deployment. | `PRODUCTION_NOTES.md` |
| PROD-002 | Production | Authentication | Exercise real Google popup auth against the deployed origin. | `PRODUCTION_NOTES.md` |
| PROD-003 | Production | Realtime | Verify production SignalR connection/reconnect through the deployed origin. | `PRODUCTION_NOTES.md` |
| PROD-004 | Production | Reporting | Verify report/PDF viewers with representative deployment data. | `PRODUCTION_NOTES.md` |
| PROD-005 | Production | Files/Media | Verify deployed file upload/download/range/media flows. | `PRODUCTION_NOTES.md` |
| PROD-006 | Production | Background jobs | Verify deployed Hangfire access/session/CSP behavior. | `PRODUCTION_NOTES.md` |
| PROD-007 | Production | External frames | Verify configured external frames against final CSP. | `PRODUCTION_NOTES.md` |
| PROD-008 | Production | Demo Login | Demo Login is currently allowed in Production by product decision. | `PRODUCTION_NOTES.md` |
| DEF-001 | Deferred | i18n/performance | Active-language-only translation loading remains evidence-driven. | `DEFERRED_ITEMS.md` |
| DEF-002 | Deferred | Reporting/charts | Whole-dataset chart contracts reopen only when a real chart requires them. | `DEFERRED_ITEMS.md` |
| DEF-003 | Deferred | Realtime | Realtime-token hop reduction remains evidence-driven. | `DEFERRED_ITEMS.md` |
| DEF-004 | Deferred | Calendar/Kanban | Additional FullCalendar/Kanban tuning requires measured need. | `DEFERRED_ITEMS.md` |
| DEF-005 | Deferred | Entitlements | Fetch-on-intent optimization remains evidence-driven. | `DEFERRED_ITEMS.md` |
| DEF-026 | Deferred | Partial Prefetching adoption | Preserve existing prefetch behavior during the security update; reopen the documented migration before the compatibility option is removed. | `DEFERRED_ITEMS.md` |
| PROD-019 | Production | Core authenticated release | Run the complete deployed baseline journey, not only special integration smokes. | `PRODUCTION_NOTES.md` |
| PROD-020 | Production | Managed Crystal publication | Managed report views require published compatible report versions and `Run` ACL evidence. | `PRODUCTION_NOTES.md` |
| FOLLOW-003 | Follow-up | API contract parity | Scoped assessment Verified; typed-service fallback, metadata/security remediation and broader diff remain FOLLOW-003. | `FOLLOW_UPS.md` |
| PROD-023 | Production | Recovery | Angular release acceptance references canonical backup/isolated-restore proof before external production data. | `PRODUCTION_NOTES.md` |
| PROD-024 | Production | Diagnostics | Apply canonical hosted monitoring/redaction requirements to the claimed Angular release. | `PRODUCTION_NOTES.md` |
| RISK-009 | Risk | Protected-shell bundle budget | Verified 2026-10-27: the current production build passes unchanged bundle budgets, including the protected-shell class. Reopen on regression. | `KNOWN_RISKS.md` |
| RISK-012 | Risk | Dependency security baseline | Reopened for current-workstation installed/locked version drift; historical verified baseline and exact restoration gate remain canonical. | `KNOWN_RISKS.md` |
| FOLLOW-007 | Follow-up | Full-suite runner | Verified with the bounded two-worker profile and correctly owned Node/Vitest suites; see canonical closure evidence. | `FOLLOW_UPS.md` |

| FOLLOW-009 | Follow-up | Countries development SSR | Reference client rendering succeeds after a style-prefixer SSR fallback; isolate before the next Web release gate. | `FOLLOW_UPS.md` |

## Web note checklist

`FOLLOW-012` — Angular persisted UI translation consumer acceptance; canonical
scope, owner and reopening point are in FOLLOW_UPS.md.

`FOLLOW-013` — Angular PrimeNG local license activation and actual licensed browser
acceptance; canonical ownership/trigger are in FOLLOW_UPS.md.

`FOLLOW-014` — Angular remaining shared form/control/dirty/dialog compatibility;
canonical scope and first-consumer trigger are in FOLLOW_UPS.md.

Use `Surface = Web` or `Surface = Cross-platform` for browser/App Router/BFF,
shared UI, forms, accessibility, CSP, browser integrations, performance, and Web
release evidence.

`DEC-024` — Company message logs scope; canonical decision in DECISION_BACKLOG.md. `RISK-011` — Observational capture availability/uncertain SMTP outcome; canonical risk in KNOWN_RISKS.md.

### PROD-028 — Hosted Countries managed-report acceptance

See canonical PROD-028 in [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md#prod-028--hosted-countries-report-catalog-unavailable); hosted catalog503 blocks complete report/pilot acceptance.

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
