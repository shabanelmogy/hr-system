# Managed Crystal Template Validation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `managed-crystal-reporting-reliability` |
| Authorized slice | `Slice 1 — Managed Crystal Reporting Reliability` |
| Child Feature ID | `managed-crystal-template-validation` |
| Child feature name | Managed Crystal Template Validation |
| Owner | Reporting module for lifecycle/persistence; `CrystalReportGeneratorApi` for Crystal SDK inspection; source modules remain owners of report rows |
| Depends on | `managed-crystal-contract-registry` Verified/Closed |
| Execution status | `Completed — Phase 06 Verified and child Closed on 2026-09-27` |
| Status evidence | `documentation/plans/business/managed-crystal-reporting-reliability/IMPLEMENTATION-ROADMAP.md` |

## 1. Child boundary and outcome

Business workflow owned by this child: inspect every uploaded or imported `.rpt`
against the exact canonical contract of its selected/inherited entity; persist the
contract schema version and fingerprint that were used; expose an explicit
validation lifecycle; and prevent publishing or rendering a version whose latest
validation is not `Valid` for the current canonical fingerprint.

Independent acceptance outcome: create, import and add-version flows fail closed on
unsupported entities, source/table/field/type/order/parameter mismatch or inspection
unavailability; accepted versions record current validation evidence; publication
and render refuse stale or incompatible evidence; existing development versions are
marked `NeedsRevalidation`; focused positive/negative fixtures and migration tests
prove the lifecycle.

Explicitly outside this child: Report Manager visual changes, administrator-driven
revalidation controls, Web/Mobile error presentation, a production Fiscal Years
template and PDF acceptance, runtime capacity/packaging work, and final security or
dependency hardening. Those remain ordered sibling features. Fiscal Years stays a
supported tenant/company report entity but no report depends on the selected or
current Fiscal Year context.

## 2. UI Pattern Gate (mandatory before implementation)

This child changes API/runtime contracts and persistence only. It does not add or
change a screen in Web or Mobile. The existing manager is inspected as a downstream
consumer, then explicitly deferred to `managed-crystal-manager-experience`. Report
viewers are deferred to `fiscal-years-managed-crystal-report`.

**Next-step rule:** runtime implementation starts only after this contract and
Phase 00 pass; the manager sibling remains queued until this child is Verified and
Closed.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `managed-crystal-template-validation` | Web | `/reporting/crystal-reports/manage` | Later: understand and recover from compatibility state | Manager collection, detail and lifecycle actions | P-003 | Existing manager workspace; validation-state composition deferred | `web-next/src/modules/reporting/crystal-report-manager/CrystalReportManagerPage.tsx` | Deferred to `managed-crystal-manager-experience` | Grid Deferred; Table Excluded; Cards Excluded; Tree Excluded; Detail Deferred; Report Deferred; Import Deferred; Export Excluded; Chart Excluded | No UI claim in this child; API exposes deterministic state/reason for later loading/error/conflict treatment | Online authoritative; offline mutation Excluded | N/A — managed server files and validation evidence cannot be mocked as authoritative | Existing Crystal report permissions and trusted tenant/company context; security redesign remains Phase 6 | Existing route behavior unchanged; later child owns EN/AR, RTL/LTR, focus and error announcement | API/runtime lifecycle must be stable before UI work |
| `managed-crystal-template-validation` | Mobile | Managed report consumer entry points | Later: consume only a currently compatible published report | Read-only report execution | P-001 | Existing report sub-view; no admin form | `mobile-react/src/modules/accounting/fiscal-years/presentation/components/FiscalYearReportView.tsx` | Deferred to `fiscal-years-managed-crystal-report`; manager administration Excluded | Grid Excluded; Table Excluded; Cards Excluded; Tree Excluded; Detail Excluded; Report Deferred; Import Excluded; Export Excluded; Chart Excluded | No UI claim in this child; stable render errors are transport evidence only | Online authoritative render; offline render Excluded | N/A — runtime PDF cannot be fabricated | Existing feature View plus CrystalReports View/Run ACL; tenant/company for Fiscal Years | Existing native RTL/accessibility unchanged | Mobile manager administration is intentionally Excluded |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Current upload inspection | `api/CrystalReportGeneratorApi/Runtime/Inspection/CrystalReportInspectionService.cs` | Crystal SDK load, saved-data/source/subreport checks and summary extraction | Inspection becomes entity-aware and verifies exact table, ordered fields/types and managed parameter contract. |
| Canonical registry | `api/CrystalReportGeneratorApi/Runtime/Rendering/CrystalReportProfileRegistry.cs` | Current embedded contract bytes, entity lookup, schema version and fingerprint | Inspector consumes the full profile instead of only render-time name lookup. |
| Reporting file boundary | `api/Modules/Reporting/ErpSystem.Modules.Reporting.Infrastructure/Features/Analytics/CrystalReports/Storage/PrivateCrystalReportFileStorage.cs` | Bounded file checks, platform inspection, runtime inspection, hash and private storage | The entity key enters inspection explicitly and returned fingerprint/state is persisted. |
| Existing aggregate/version | `api/Modules/Reporting/ErpSystem.Modules.Reporting.Domain/Analytics/CrystalReports/Entities/CrystalReport.cs`; `CrystalReportVersion.cs` | Immutable identity/source/version number and publication pointer | Validation evidence gains explicit transitions; source identity stays immutable. |
| Existing manager | `web-next/src/modules/reporting/crystal-report-manager/CrystalReportManagerPage.tsx` | Downstream route/action inventory only | No UI is modified or accepted in this child. |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Entity contract | Canonical embedded managed Crystal JSON registry | Reuse | Both processes use the same bytes/fingerprint; no second schema list is introduced. |
| Crystal metadata inspection | `CrystalReportInspectionService` and Crystal SDK `Table.Fields`/parameter definitions | Extend | Compare exactly one approved table and its ordered field definitions plus the single `Language` parameter. |
| Upload pipeline | `PrivateCrystalReportFileStorage` | Generic feature extension | Accept required entity key, return immutable inspection evidence with the stored file, and fail before persistence on mismatch. |
| Validation lifecycle | `CrystalReportVersion` | Extend Domain behavior | Keep source fields immutable; expose named validation transitions and current-fingerprint predicate. |
| Persistence | Reporting `ReportingDbContext` and `CrystalReportVersionConfiguration` | Extend | Add fingerprint/schema-version evidence and a real owning-module migration/backfill. |
| Stable failures | `CrystalReportErrors` and runtime internal response envelope | Extend | Distinguish unsupported entity, schema mismatch, parameter mismatch, stale validation and inspector unavailable without leaking SDK exceptions. |
| Web/Mobile | Existing consumers | Defer | No component or client contract implementation is claimed in this child. |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid/Table/Cards | Deferred | Existing Web manager consumes the state in Phase 3 | None in this child |
| Tree/Hierarchy | Excluded | No hierarchical workflow | None |
| Detail/View | Deferred | Existing manager detail/version history | None in this child |
| Create/Edit | Deferred visually; Required through existing API | Existing multipart create/add-version/import routes | Submit a report file and receive accepted detail or stable failure |
| Report/Import/Export/Chart | Import API Required; report rendering gate Required; all visual surfaces Deferred | Existing routes/runtime adapter | Import verified catalog source; reject stale render |
| Other workflow-specific surface | Required | Internal inspector request/response and validation lifecycle | Inspect exact entity contract and record evidence |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | Internal inspection multipart includes `entityKey`; success returns summary plus `contractSchemaVersion` and `contractFingerprint`; version responses expose `validationStatus`, `validationReason`, schema version and fingerprint. Existing create/add/import public request shapes stay stable. |
| Canonical routes | Existing `POST /api/v1/crystal-reports`, `POST /api/v1/crystal-reports/{id}/versions`, `POST /api/v1/crystal-reports/import`, publish and render routes; internal `POST /internal/reports/inspect`. No new client route in this child. |
| Server search/filter/sort | N/A — management query semantics are unchanged. |
| Paging/limits | Existing file/catalog/runtime limits remain; inspection requires exactly one file and one bounded canonical entity key. |
| Domain errors / ProblemDetails | Stable errors for unsupported entity, source/schema/parameter mismatch, inspector unavailable, version not current-valid and deployment source changed. Runtime diagnostics retain details; public errors remain bounded/localizable. |
| Permission and tenant/company scope | Existing endpoint permissions and Reporting tenant/company filters remain authoritative. Security redesign is not authorized until Phase 6. Entity selection never changes trusted scope. |
| Cross-module contract | Reuse Reporting-owned provider contract; `fiscalyears` reads Accounting through its existing approved contract/source. No new cross-module persistence. |
| Persistence/schema/migration | Extend `rpt.CrystalReportVersions` with validation contract schema version/fingerprint. Development migration marks all existing versions `NeedsRevalidation`, clears stale evidence/reason as designed, and leaves source/version history and published pointer intact but non-renderable until current-valid. |

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Report administrator | CrystalReports | Create and inspect initial version | `POST /api/v1/crystal-reports` | `CrystalReports:Create` | trusted tenant; entity contract may be global or tenant/company data scope at render | Rejected upload creates no row/file residue | Deferred; existing control unchanged | Excluded | Create report | إنشاء تقرير | Existing controller/permission test plus handler failure tests |
| Granted operator | CrystalReport version | Add and inspect version | `POST /api/v1/crystal-reports/{id}/versions` | `CrystalReports:Upload` plus report Upload grant unless bypass permission | report tenant; inherited immutable entity key | Rejected upload creates no version | Deferred | Excluded | Upload version | رفع نسخة | Existing permission/ACL tests plus inherited-entity test |
| Report administrator | Deployment report | Import inspected catalog item | `POST /api/v1/crystal-reports/import` | `CrystalReports:Create` | trusted tenant; catalog hash/source identity rechecked | Changed or incompatible source is rejected | Deferred | Excluded | Import report | استيراد تقرير | Source-change and inspection mismatch tests |
| Granted publisher | CrystalReport version | Publish current-valid version | `POST /api/v1/crystal-reports/{id}/versions/{versionId}/publish` | `CrystalReports:Publish` plus report Publish grant unless bypass permission | report tenant | Non-current-valid version remains read-only/unpublished | Deferred | Excluded | Publish | نشر | Current-valid and stale-fingerprint tests |
| Granted runner | CrystalReport | Render published current-valid version | Existing render query/route | `CrystalReports:Run` plus report Run grant unless bypass permission | report tenant and provider-owned data scope | Stale/invalid version returns stable failure and no PDF | Deferred | Deferred consumer | Run report | تشغيل التقرير | Query/handler gate tests |

No new permission is introduced. Existing broad permission naming is preserved for
this bounded business-logic phase and is audited in the final security phase.

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create | Supported entity and bounded uploaded file | Existing multipart submission | Inspect exact entity; store file; atomically create report/version with `Valid` current evidence | Mismatch/unavailable leaves no report/version and cleans any staged file |
| Add version | Active report; caller permitted | Upload file; entity is not caller-selectable | Inherit report entity, inspect, store, atomically append next version with evidence | Earlier versions and published pointer unchanged |
| Import | Catalog item with exact source ID/hash | Existing import request | Re-list, re-download, verify hash, inspect exact item entity, then use create workflow | Changed/non-importable/mismatch item is rejected |
| View detail/history | Existing report | Existing queries | Project validation status, reason, schema version and fingerprint per version | Source identity and version history remain read-only |
| Publish | Active report/version and matching row version | Existing publish action | Require version ownership and `Valid` evidence whose fingerprint equals current registry; move publication pointer | Invalid/Pending/NeedsRevalidation/stale fingerprint cannot publish |
| Render | Published version | Existing run action | Recheck current-valid fingerprint before opening source/building data/calling runtime | Failure returns no PDF and stable incompatibility result |
| Contract evolution | Registry fingerprint changes | Deployment/migration process | Mark previous validation evidence `NeedsRevalidation`; no automatic trust carry-forward | Version stays visible/downloadable but cannot publish/render |
| Revalidate | Existing stored version | Deferred to manager sibling | No public action is added in this child | State remains `NeedsRevalidation` until a later authorized revalidation workflow or corrected new version |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | API/runtime distinguish retryable inspection unavailability from deterministic incompatibility; UI presentation is deferred. |
| Permission / forbidden / read-only | Existing server permissions/ACL stay authoritative; no client-only authorization is introduced. |
| Archived / locked | Archived reports cannot receive versions or publish; download/history behavior stays current. |
| Unsaved changes / destructive confirmation | N/A — no UI modification. Rejected uploads are cleaned automatically. |
| Offline / stale / conflict | Mutations and rendering are online-only; row-version conflict behavior remains. Fingerprint mismatch is a business compatibility failure, not a client cache conflict. |
| Mock data | N/A — Crystal SDK metadata, file bytes, fingerprints and validation state require real fixtures/test doubles; no fabricated authoritative records. |

## 9. Concurrency, transactions, and consistency

Create keeps the identity resource lock and duplicate check. Add-version keeps the
report lock and computes the next version under the transaction. Publish retains
SQL row-version concurrency and additionally evaluates current fingerprint inside
the locked use case. File inspection and private storage happen before the database
transaction; any duplicate, cancellation before commit, or exception cleans the
new file. Import revalidates catalog identity/hash immediately before download and
then passes through the same exact inspection. No external runtime call occurs after
business rows are staged but before a required rollback-sensitive decision.

Version source identity (`StorageKey`, file name, size, SHA-256, report/entity and
version number) is immutable. Validation fields may change only through named
Domain transitions or the reviewed data migration; the DbContext rejects all other
version modifications.

## 10. i18n, RTL, accessibility, and responsive behavior

New public error keys and version-state labels are localized in the API resources.
No visible Web/Mobile text, layout or focus behavior changes in this child. The next
manager child owns bilingual state labels, actionable error presentation, RTL/LTR,
focus recovery and responsive history layout. The Fiscal Years child owns actual
Web/Mobile report accessibility and visual acceptance.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Registry child Verified/Closed and this Phase 00 passes | Domain lifecycle, typed inspection contract, migration, current-valid publish/render gates, focused/full Reporting tests | 120 Reporting tests; migration/model/live DB evidence |
| 2 | Web | Verified | API Verified | No runtime implementation authorized; downstream contract impact recorded and manager work remains a sibling | Web applied profile |
| 3 | Mobile | Verified | Web disposition recorded | No runtime implementation authorized; downstream consumer impact recorded and administration remains Excluded | Mobile applied profile |
| 4 | Integrated live verification | Verified | API Verified and platform exclusions reconciled | Runtime semantic harness and development DB are verified; real `.rpt`/PDF business acceptance is explicitly Deferred to Phase 4 under `RISK-008` | Review artifact; `RISK-008` |
| 5 | Documentation and closure | Closed | Integrated verification Verified | Canonical books, manifest/recipes, Phase 06 and the deferred customer-education handoff are reconciled | Generated packets and roadmap |

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | Version lifecycle and handler tests | invalid transition; stale fingerprint publish/render; inherited entity on add version | Verified — Reporting 120/120 |
| API/transport | Inspector client/controller contracts | entity key required; typed success; stable mismatch/unavailable mapping | Verified — modern build/tests and legacy Release build |
| Runtime | .NET Framework harness plus inspected fixtures | exact table/field/type/order and required non-editable `Language` parameter; unsupported entity | Semantic harness Verified; real positive `.rpt` Deferred to Phase 4 under `RISK-008` |
| Persistence/migration | EF migration inspection, model drift and development DB update | all old versions become `NeedsRevalidation`; new evidence constraints | Verified — no model drift; migration present; live schema/constraints and invalid-evidence count checked |
| Web | Contract-impact check only | no accidental route/type regression | Excluded from implementation; documentation evidence complete |
| Mobile | Contract-impact check only | no accidental route/type regression | Excluded from implementation; documentation evidence complete |
| E2E/manual/live | API ↔ runtime inspection/harness | accepted and rejected real fixture evidence with exact fingerprint | Deferred — required before Fiscal Years Phase 06/release, not this development child (`RISK-008`) |

## 13. Child exit gate

This child is complete only when:

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; Web/Mobile implementation is explicitly deferred/excluded.
- [x] Its boundary is implemented without absorbing manager, Fiscal Years acceptance, operations or security siblings.
- [x] Exact source/table/ordered fields/types and required single non-editable `Language` parameter are inspected against the canonical profile.
- [x] Source identity remains immutable while validation transitions are Domain-controlled.
- [x] Create/import/add-version cleanly reject mismatch/unavailability and persist current fingerprint only on success.
- [x] Publish and render require `Valid` for the current contract fingerprint.
- [x] A real Reporting migration marks existing versions `NeedsRevalidation` and is applied to the development database.
- [x] Stable errors, localization and response evidence are verified.
- [x] API/runtime semantic positive and negative contract tests pass; full Reporting/architecture gates remain green and real-file acceptance is owned by `RISK-008`/Phase 4.
- [x] Web/Mobile impact dispositions and no-change evidence are recorded.
- [x] Documentation/manifest/recipes and Phase 06 verification are reconciled before roadmap closure.

Phase 06 is Verified for the authorized backend/runtime development scope: semantic
positive/negative metadata cases, 120 Reporting tests, 59 architecture tests,
Release x64 build, fingerprint harness, migration and live development database
evidence pass. By requester decision, `RISK-008` real designer-produced `.rpt` and
PDF acceptance are Deferred to the Fiscal Years live-acceptance child and release;
strict upload/publish/render validation remains enabled.

Integrated verification is Verified and documentation closure is Closed. The next
authorized child may proceed without disabling validation or pulling security work
forward.
