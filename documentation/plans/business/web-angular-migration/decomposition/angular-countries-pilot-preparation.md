# Countries pilot preparation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S3-A1 — Countries pilot preparation |
| Child Feature ID | angular-countries-pilot-preparation |
| Child feature name | Countries pilot preparation |
| Owner | Platform migration + ReferenceData + Reporting |
| Depends on | angular-managed-reporting-adapter Verified/Closed bounded minimum |
| Execution status | Closed |
| Status evidence | ROADMAP.md and RESUME.md |
| Runtime authorization | Blocked — preflight-only read-only preparation; no Countries/API/schema/native runtime before an exact frozen child and Phase00 |

## 1. Child boundary and outcome

Reconcile Countries API, current Next feature and canonical books. Prepare the
exact pilot decomposition and Screen/Workflow Contracts from actual business
permissions, scope and source. This single feature is a read-only preparation;
it does not authorize implementing the whole pilot in one increment. DEC-028
excludes ActiveReports. Managed Crystal/PDF remains within the pilot.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| countries.pilot.preflight | Web | No route | Source/parity audit | Read-only evidence and decomposition | N/A — no UI | Existing references only; freeze business pattern later | documentation/modules/reference-data/features/countries/required-files.json | Excluded | New UI Excluded | No UI change | Current source only | No new mocks | No grants; inspect actual action/scope | Existing proof only | No runtime in this read-only preparation |
| countries.pilot.preflight | Mobile | No route | Reconcile retained boundary | Read-only source | N/A — no UI | Existing client retained | mobile-react/src/modules/reference-data/geography/countries | Excluded | New UI Excluded | No UI change | Current policy | No new generator | No grants/schema | Existing source only | No native rewrite in this read-only preparation |

## 3. Closest existing reference

Use the complete Countries required-file manifest for canonical review/API/Web/
Mobile books and current source. Record RISK-016/017 discrepancies and DEC-028.
Neither generated packets nor the report minimum prove the whole Countries feature.

## 4. Reuse and composition contract

Audit the current controller hook, multi-view composition, shared PageHeader/
MyDataGrid toolbar/cards/paging/forms/feedback in Next. Identify matching Angular
shared public APIs and generic gaps before creating another local shell.

## 5. Screen and workspace contract

No new UI. Freeze every required view/action and same-viewport comparison. No
CRUD-only acceptance or omitted view without an explicit scope classification.

## 6. Typed transport and server criteria

Inspect list/detail/create/update/archive/restore/bulk/export/import/report routes,
DTOs, paging/sort/filter, row versions, permissions, scope and effects. No generated
contract or reference-specific business semantics are assumed.

## 7. Create, edit, view, and lifecycle contract

Audit validation/duplicate/conflict/restore, structured data if actually present,
delete/disabled behavior and uncertain writes. Freeze each coherent child before
runtime. This preparation makes no database or business change.

## 8. UX states, permissions, offline, and mock data

No new mocks or data generator. Classify each optional capability per platform.
ActiveReports is Excluded by DEC-028, without a placeholder. Other clients remain
current-source evidence, with their behavior retained.

## 9. Concurrency, transactions, and consistency

Read-only source/evidence, no API mutation/schema/database change. Preserve secure
cookies, server authority, shared unsaved/context barriers and scoped read lifetime.

## 10. i18n, RTL, accessibility, and responsive behavior

Review SQL-backed scope/keys, EN/AR, focus/errors/scroll, five palettes and compact/
wide composition. New captions use canonical generated resources.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Reporting minimum Verified | Complete API/source/action/permission audit | This contract |
| 2 | Web | Verified | API evidence | Exact multi-view/shared parity/decomposition freeze | This contract |
| 3 | Mobile | Verified | Web evidence | Retained platform classification | This contract |
| 4 | Integrated live verification | Verified | Exact prior gates | Provenance/limits and bounded-entry decision; no live mutation here | This contract |
| 5 | Documentation and closure | Verified | Preparation decision | Books/manifest/recipes/evidence/handoff | This contract |

Next-step rule: this source-only preparation is Closed; S3-A2 read workspace is the next Active feature. Do not build Countries runtime or
a partial production route from the reporting dev preview.

## 12. Verification contract

Graphify query ran and the Countries manifest was located; the audit is not yet
complete. Register four current books/manifest and Phase00 recipes before any
bounded runtime decision. Recipe/planning checks remain required. No engine/SQL/
full feature/native/release proof is inferred from mock tests.

## 13. Child exit gate

- [x] Reporting minimum Verified/Closed; next read-only prerequisite registered.
- [x] Complete current API/Web/Mobile source and canonical evidence audit.
- [x] Freeze complete pilot decomposition and exact feature contracts.
- [x] Register current-only evidence/Phase00 and check before runtime.
- [x] Phase06 preparation decision and canonical handoff; no runtime claim here.

Exact pilot children2026-10-30: S3-A2..A8 have individual version2.0 contracts under decomposition/ and Queued roadmap rows. These are independently gated; only preparation is Active. AUDIT_REPORT.md owns current fields/routes/errors/permissions and intentional scope.

Phase06 Verified/Closed2026-10-30: AUDIT_REPORT/SOURCE_SNAPSHOT/389recipes/planning/API74/Next13 and technical education record exact coverage and limits. No runtime in this preparation.
