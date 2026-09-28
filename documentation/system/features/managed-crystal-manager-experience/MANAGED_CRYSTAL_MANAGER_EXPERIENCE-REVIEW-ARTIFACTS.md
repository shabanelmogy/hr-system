# Managed Crystal Report Manager Experience — Review Artifacts

Status: Phase 00 complete; API Verified; Web stage Active.

Reviewed: 2026-09-27

## Scope ledger

| Requirement | Status | Evidence / acceptance |
| --- | --- | --- |
| Canonical supported-entity selector | Target approved | API registry query then Web selector; no duplicated key list |
| Four-state validation display | Target approved | Pending/Valid/Invalid/NeedsRevalidation with reason/evidence |
| Stored-version revalidation | Target approved | Same bytes, Upload permission/ACL, current registry contract |
| Existing manager lifecycle | Preserve | Create/import/upload/publish/grants/download/archive and 409 reload |
| Web shared form/grid/feedback | Required | P-001 plus shared form-dialog system |
| Mobile administration | Excluded | No route or placeholder UI |
| Real designer `.rpt`/PDF | Deferred | `RISK-008`, mandatory in Phase 4/release |
| Security/dependency hardening | Deferred | Phase 6 final implementation stage |

## Current behavior evidence

- `CrystalReportManagerPage.tsx` owns a server-paged grid but uses raw MUI filters
  and free-text entity input.
- `CrystalReportCreateDialog.tsx` uses a raw dialog and disables Save rather than
  shared form validation/focus behavior.
- `types.ts` accepts only `Valid`/`Invalid`, while Domain/DB allow four states and
  API responses include schema/fingerprint evidence.
- `CrystalReportDetailDialog.tsx` has no revalidate action.
- The embedded registry already owns the bounded entity collection; no public
  supported-entity endpoint exists.
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
| MGR-001 | High | Web parser rejects Pending/NeedsRevalidation and omits evidence. | Web Reporting | Phase 02 after API verification. |
| MGR-002 | High | Entity entry is free text and duplicates server knowledge. | API/Web Reporting | Registry metadata endpoint and selector. |
| MGR-003 | High | Stale versions have no authorized recovery action. | Reporting | Revalidation command/route/UX. |
| MGR-004 | Medium | Create dialog bypasses shared form system. | Web Reporting | Phase 02 refactor. |
| RISK-008 | Deferred | No approved real designer `.rpt`/PDF positive fixture. | Reporting/Product | Phase 4/release; not a development blocker. |

## Verification ledger

| Layer | Command/check | Current result |
| --- | --- | --- |
| Planning | `./documentation/plans/Check-Planning.ps1` | Passed 2026-09-27 |
| Documentation | Feature Phase 00 generation/check | Passed: 8 packets generated; 125-recipe check passed |
| API | Focused/full tests and architecture | Verified: 32 focused, 128 full Reporting, 59 Architecture passed |
| Web | Focused tests/type/architecture | Active after API verification |
| Mobile | Administration source audit | Queued after Web |
| Integrated | Authenticated EN/AR manager journey | Pending; real `.rpt` governed by `RISK-008` |

## Phase decision

Phase 00 is complete and the API stage is Verified. Web is the only active runtime
stage. No completion claim is made for Web, integrated verification or closure.
