# Managed Crystal Report Manager Experience — Review Artifacts

Status: Phase 00 complete; API/Web Verified; Mobile exclusion Verified; integrated stage Active.

Reviewed: 2026-09-29

## Scope ledger

| Requirement | Status | Evidence / acceptance |
| --- | --- | --- |
| Canonical supported-entity selector | Verified | API registry query drives list/create/import selectors; no duplicated key list |
| Four-state validation display | Verified | Pending/Valid/Invalid/NeedsRevalidation with reason/evidence/source identity |
| Stored-version revalidation | Verified | Same bytes, Upload permission/ACL, current registry contract |
| Existing manager lifecycle | Preserve | Create/import/upload/publish/grants/download/archive and 409 reload |
| Web shared form/grid/feedback | Required | P-001 plus shared form-dialog system |
| Mobile administration | Excluded | No route or placeholder UI |
| Real designer `.rpt`/PDF | Deferred | `RISK-008`, mandatory in Phase 4/release |
| Security/dependency hardening | Deferred | Phase 6 final implementation stage |

## Current behavior evidence

- `CrystalReportManagerPage.tsx` keeps the authoritative server-paged grid and now
  consumes the registry-backed selector rather than free text.
- `CrystalReportCreateDialog.tsx` uses shared `MyForm`, React Hook Form, Zod,
  field-level errors, accessible file focus and prerequisite-only submit blocking.
- `types.ts` and the service parser accept all four Domain states plus exact
  schema/fingerprint evidence.
- Version detail exposes safe reason/evidence/source identity, authorized
  revalidation, and blocks publish unless the exact version is `Valid`.
- The public supported-entity endpoint projects the embedded registry; no client
  entity list is authoritative.
- Private storage can verify/open immutable bytes and the inspector can inspect a
  supplied stream, so no new storage model is required.

## Target contract evidence

The approved v2.0 child contract is
`documentation/plans/business/managed-crystal-reporting-reliability/decomposition/managed-crystal-manager-experience.md`.
Planning checks pass with this feature as the single active step. API is first;
Web stays queued until API verification. No schema migration is planned.

## Existing-system relationship

Extend the existing canonical Reporting capability. Keep the same v1 controller
and Web route. Extend the registry abstraction, CQRS and feature service/types; do
not create a second entity list, separate manager or runtime-owned DB workflow.

## UI/reuse audit

| Need | Current source | Decision |
| --- | --- | --- |
| Page/header/grid | Manager page + shared components | Reuse and compose |
| Create form | Raw manager dialog | Refactor to shared `MyForm` layout/fields |
| Entity input | Raw `TextField` | API-backed shared select |
| Detail/version history | Feature dialog | Add accessible state/evidence/revalidate |
| Import | Feature dialog | Preserve catalog; improve state/reason |
| Confirmation/feedback | Shared dialog/toasts | Preserve |

## Findings and handoffs

| ID | Severity | Finding | Owner | Resolution |
| --- | --- | --- | --- | --- |
| MGR-001 | High | Web parser rejected Pending/NeedsRevalidation and omitted evidence. | Web Reporting | Resolved: strict four-state/evidence parser and detail UI. |
| MGR-002 | High | Entity entry was free text and duplicated server knowledge. | API/Web Reporting | Resolved: registry metadata endpoint and selectors. |
| MGR-003 | High | Stale versions had no authorized recovery action. | Reporting | Resolved: immutable-source revalidation command/route/UX. |
| MGR-004 | Medium | Create dialog bypassed shared form system. | Web Reporting | Resolved: `MyForm`, RHF and Zod. |
| RISK-008 | Deferred | No approved real designer `.rpt`/PDF positive fixture. | Reporting/Product | Phase 4/release; not a development blocker. |

## Verification ledger

| Layer | Command/check | Current result |
| --- | --- | --- |
| Planning | `./documentation/plans/Check-Planning.ps1` | Passed 2026-09-27 |
| Documentation | Feature Phase 00 generation/check | Passed: 8 packets generated; 125-recipe check passed |
| API | Focused/full tests and architecture | Verified: 32 focused, 128 full Reporting, 59 Architecture passed |
| Web | Focused/full tests, static gate and production build | Verified: 19 focused; 190 files/666 tests; full check; 77/77 pages |
| Web bundle | `npm run measure:build` | Feature route 2.31 MiB < 2.55 MiB; repository gate fails on inherited protected-shell budget drift, `RISK-009` |
| Mobile | Administration source audit, focused regressions, contract matrix | Verified: no admin surface; 8/8 tests; 83 routes/230 endpoint members |
| Integrated | Authenticated EN/AR manager journey | Pending; real `.rpt` governed by `RISK-008` |

## Phase decision

Phase 00, API, Web and the explicit Mobile exclusion are Verified. Authenticated
integrated EN/AR and RTL/LTR workflow verification is the only active runtime
stage. No completion claim is made for integrated verification or closure; real
designer `.rpt`/PDF acceptance remains `RISK-008`/Phase 4.
