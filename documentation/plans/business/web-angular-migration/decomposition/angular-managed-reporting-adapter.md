# Managed reporting adapter preparation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S3-A0 — Managed reporting adapter preparation |
| Child Feature ID | angular-managed-reporting-adapter |
| Child feature name | Managed reporting adapter preparation |
| Owner | Reporting + Shared report host |
| Depends on | angular-foundation-exit-assessment Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded GLOBAL_PDF_CONTRACT after381Phase00 recipe/planning checks; G0-G3 fixed, remaining G4 release-only; DEC-028 excludes ActiveReports |

## 1. Child boundary and outcome

Prepare the existing managed reporting minimum required before Countries. No runtime/API/schema/new SDK/license/renderer choice until exact proof and Phase00.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reporting.adapter.preflight | Web | dev/reports target | Verify global Countries PDF minimum | Catalog/criteria/PDF | P-001 | C-01 shared report proof | web-next/src/modules/reporting/crystal-report-manager/ManagedCrystalReportView.tsx | Adapted | Global Countries report proof Required; manager/tenant/designer Excluded from child | Loading/empty/error/forbidden/conflict/PDF/fallback | No store | No new mocks | Current global/tenant authority retained | No UI change | Source is not Angular proof |
| reporting.adapter.preflight | Mobile | No new route | Review browser fallback/native boundary | Source only | N/A — no UI | Native retained | mobile-react/src/platform/reporting/presentation/ManagedCrystalReportView.tsx | Excluded | New native UI Excluded | Retained | Existing policy | No new mocks | No grants/schema | Browser compact acceptance frozen later | No native rewrite |

## 3. Closest existing reference

Countries CountryReportPage → Reporting public ManagedCrystalReportView → crystalReportService global PDF → Shared ReportViewer. Separate ActiveReports path is not assumed equivalent.

## 4. Reuse and composition contract

Shared host layout/feedback/fields/actions first; Reporting owns catalog/auth/service and typed binary transport. No copied React shell or claim PrimeNG supplies rendering.

## 5. Screen and workspace contract

No current UI. Freeze smallest report view/catalog/criteria/renderer plus scope/error/loading/empty/mobile/focus/scroll and designer entry independently.

## 6. Typed transport and server criteria

Read actual API/routes/DTO/CSRF/cookies/status/MIME/PDF/content/disposition/cancel policy. Global selected report carries entityKey/expectedSha256/language/filters; no new API semantics inferred.

## 7. Create, edit, view, and lifecycle contract

No business CRUD. Freeze render replacement/late response/object URL revoke/destroy/current scope and selected-version drift before implementation.

## 8. UX states, permissions, offline, and mock data

Global super_admin+GlobalCrystalReports:View differs from tenant CrystalReports:View+accessible Reporting. Server authoritative; no grants/offline/new mocks in preparation.

## 9. Concurrency, transactions, and consistency

No report requests/writes in preparation. Rendering/retry/hash/version/cancel and any server-side effects require explicit current-source reconciliation.

## 10. i18n, RTL, accessibility, and responsive behavior

SQL-backed captions/Shared controls; freeze EN/AR/compact-wide browser PDF fallback, keyboard/retry/scroll. Native app rewrite Excluded.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A13 Closed | Current managed report contracts/auth/binary/CSRF audit | This contract |
| 2 | Web | Verified | API/source audit | Shared reuse/renderer/lifecycle/frozen Phase00 | This contract |
| 3 | Mobile | Verified | Web evidence | Browser fallback/native retained classification | This contract |
| 4 | Integrated live verification | Verified | Exact prior gates | Authorized renderer/binary/cancel/scope proof | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Books/report/manifests/recipes/handoff | This contract |

Next-step rule: bounded minimum Closed after Phase06; S3-A1 read-only Countries preparation follows. DEC-028 excludes Angular ActiveReports.

## 12. Verification contract

Graphify/current source/required manifests/vendor entitlement and binary API evidence; four current books/current-only manifest/recipes/Phase00 before bounded runtime. RISK-017 owns specialist gaps; no blind package/purchase or Countries acceptance.

## 13. Child exit gate

- [x] S1-A13 read-only assessment Closed; sole next prerequisite registered.
- [x] Current-source/permission/binary/renderer/lifecycle/native review and GLOBAL_PDF_CONTRACT; RISK-016/017 drift recorded.
- [x] Frozen global minimum/four current books/manifest/381recipes; entry checks follow.
- [x] Global Crystal/PDF proof Phase06 Verified; technical education and canonical handoff afterward.

Overall plan Draft; no full S1/Countries/release claim. Release notes and RISK-017 retained.

Scope decision DEC-0282026-10-30: ActiveReports viewer/designer/SDK/licensing is Excluded by requester. Current child continues managed Crystal/PDF only; no designer entry proof is required for the canceled capability. Existing managed Crystal manager remains owned by later slices.

Closure2026-10-30: IMPLEMENTATION_REPORT.md and verification/ own295unit,PDF40+8,retained regressions/API/resource checks and limits. Phase06 Verified; Phase07 technical handoff afterward. No real RPT/physical/manager/full Countries acceptance.
