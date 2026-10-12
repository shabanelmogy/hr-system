# Mobile phases 01–08 implementation record

Date: 2026-09-19.

| Phase | Implemented evidence | Verification state |
|---|---|---|
| 01 | Features moved to ReferenceData, Platform, Accounting and CRM owners; module registry, route ownership, permissions and boundaries updated without legacy wrappers | Automated gates implemented |
| 02 | Auth transition generation fence, in-memory lease expiry/resume validation, scoped entitlement cache bounded by lease, subscription timer rescheduling | Automated gates implemented; full role/device matrix remains Phase 08 evidence |
| 03 | Persisted retry scheduling, enqueue/manual wake-up, per-command authority/scope guard, non-destructive legacy-table preservation, provider-independent bootstrap recovery and Sync Center | Automated gates implemented; native disk/key/process-death fault injection remains device evidence |
| 04 | Recruitment server paging/status search, hydrated paged envelope selector, explicit form modes/detail states and nested ProblemDetails field mapping | Automated gates implemented; >100 hosted dataset journey remains device/API evidence |
| 05 | Shared form/select/list components retained, translated access/offline/sync states and UI evidence matrix established | Source gates implemented; visual/accessibility matrix remains device evidence |
| 06 | Decimal/money/date/UTC/quantity contracts, query AppState lifecycle and transient retry policy, telemetry redaction and capability/performance decisions | Automated contracts implemented; performance measurements remain device evidence |
| 07 | Regression tests, exact backend permission parity, dead-submodule validation, coverage gate, and `check:foundation` join type/lint/architecture/contracts/i18n/Jest in the main gate | Automated gate implemented; 148 suites/440 tests. Full-source baseline: 21.57% statements, 14.08% branches, 18.52% functions and 24.02% lines; non-regression thresholds are 20/13/17/22 |
| 08 | Release metadata, EAS preview/production separation (demo login preview-only), version auto-increment, HTTPS app-link enforcement, and the isolated `check:release` gate are implemented | **Deferred by decision:** real Android/iOS EAS artifacts, hosted API journeys, links, Observe, physical accessibility and measured performance require external evidence |

No business feature should bypass module ownership, server permissions,
company scope, shared forms, API schema validation or the declared offline
capability registry. New offline mutations require their own certified replay
contract; the Workforce draft pilot is a reference, not a generic queue.

## Deferred Release Gates

Phase 08 is postponed until a real release target exists. Owners, triggers and
evidence are recorded in [MOBILE_API_READINESS_REVIEW.md](MOBILE_API_READINESS_REVIEW.md#deferred-release-gates)
and [MOBILE_RELEASE_RUNBOOK.md](MOBILE_RELEASE_RUNBOOK.md#deferred-release-gates).
The postponement keeps development focused on business features without losing
the release acceptance contract.
