# Countries pilot preparation — web applied evidence

Next is reviewed as the requested design/source baseline. Controller/shared Grid/Card/form/state ownership is retained in equivalent Angular owners. No Next runtime change or partial business route exists in this preparation.

## 1. Ownership

Technical migration evidence belongs to Platform; business Country stays ReferenceData/global and PDF stays Reporting. No API ownership transfer or new module.

## 2. Existing-System Relationship Review

AUDIT_REPORT.md and SOURCE_SNAPSHOT.json reconcile current Countries manifest, CQRS/controller/stores/validation, Next controller/multi-view/shared composition and native sources. All139 required paths exist; source discrepancies are recorded under RISK-016.

## 3. Scope

Current source and requested Angular parity are distinct. This child is read-only preparation, with Web/Mobile new UI Excluded. Full pilot retains Grid/Cards/Chart/managed Report/Import/create/edit/archive/restore/bulk. DEC-028 excludes AR. No standalone Countries export endpoint is invented.

## 4. Reference and shared reuse

Use actual Countries Page/controller/MyDataGrid/EntityCard/form/feedback patterns, adapted through Angular shared public APIs. MyDataGrid/CardList/OptionSelect/PageHeader/SurfaceCard/ProgressMeter/StatusBadge/DialogPanel and createScopedRead already exist. Generic extensions precede local look-alikes.

## 5. Fields and contracts

List/detail/lookup stay distinct. Six editable strings/codes, positive integer IDs, statesCount only in list, audit/isDeleted. No expected rowVersion in Country DTOs; no client token invention. AUDIT_REPORT owns exact route/query/envelope vocabulary.

## 6. Permission Action Matrix

super_admin plus Countries:View/Create/Edit/Archive/Restore independently. Bulk create usesCreate, bulk archive usesArchive. Managed PDF usesGlobalCrystalReports:View. Native retained; no new grants/entitlements. Server authoritative; UI guards direct handlers too.

## 7. Business Rules Matrix

Names printable Unicode2..100 trimmed/NFC; optional code normalization/uniqueness; active-only edits; dependency-blocked atomic archive; idempotent archive/restore; bulk1..100 and distinct archiveIDs. Reporting owns separate PDF source/hash. Client cannot supply persistence/transaction authority.

## 8. Edge Cases and Validation Matrix

Audit invalid/empty/duplicate/malformed body,200search/201invalid,zero/final/out-of-range page,criteria false/empty/status,403/404,field400/duplicate409,late read/context/permission loss,100/101batch and uncertain writes/import. Structured JSON editor/schema changes N/A: Country fields remain flat and native retained.

## 9. Consistency and effects

Only current server page; metadata and Id tie-break authoritative. Selection cleared by criteria,detail fetched by ID,current identity masks old rows. No write replay or client stale-editor guarantee. Existing jobs/realtime after commit retained; no new outbox/event/schema.

## 10. Localization and security

Existing core/reference-countries EN/AR SQL-backed resources and strict catalog identity, secure API Cookies/CSRF and source permissions retained. No resource/domain/schema/native change during preparation. No private query data is approved for URL merely from a DTO.

## 11. Verification

Initial381recipe check,focused API74 and Next5files13tests passed. Snapshot records current source hashes. RISK-012 installed/lock drift and inherited analyzer warnings remain. Phase06 Verified/Closed after389recipe/planning checks and complete child decomposition; see the verified handoff below.

## 12. Impact Matrix

Reuse current API/domain/persistence/permissions/notification/native; Add migration audit/books/snapshot/child contracts; Extend Angular shared only when a frozen child needs a generic capability. No runtime edit, new SDK/license, migration, deployment or source retirement in this child.

## 13. Screen pattern

Preparation has explicit Excluded new UI rows and N/A no-screen rationale. Real Countries read workflow uses reviewed P-001/C-01/C-02 references and shared controls; current native five views are retained. Each future child requires its own explicit screen/platform classification.

## 14. Readiness and release

G0-G3 for read-only preparation fixed by actual source; overall Draft and runtime blocked here. No implicit G4 closure from snapshots/tests. RISK-016/017/008 and PROD-002/017/019/RISK-018 retained as applicable, with remaining specialist proofs required before their entry.

## 15. Handoff

Next exact candidate is S3-A2 read workspace, not full CRUD/pilot readiness. Later edit/lifecycle/chart/report/import/integrated acceptance remain independently gated. Phase06 must be Verified before Phase07 technical handoff; education N/A customer-facing because no new UI here.

Phase06: **Verified**2026-10-30 for the source-only preparation. Current API74 and
Next13 focused tests passed;389recipe entry and complete child-contract planning
checks passed. SOURCE_SNAPSHOT records current source and RISK-016/017/008/012 and
release limits remain explicit. No runtime, SQL/schema or full Countries UI claim.
