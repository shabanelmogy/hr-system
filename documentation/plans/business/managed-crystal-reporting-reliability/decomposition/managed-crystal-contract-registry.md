# Managed Crystal Contract Registry — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `managed-crystal-reporting-reliability` |
| Authorized slice | `Slice 1 — Managed Crystal Reporting Reliability` |
| Child Feature ID | `managed-crystal-contract-registry` |
| Child feature name | Managed Crystal Contract Registry |
| Owner | Reporting; Accounting and ReferenceData remain owners of their business rows |
| Depends on | Existing managed Crystal providers/runtime profiles and approved plan |
| Execution status | `Completed — Phase 06 Verified on 2026-09-27` |
| Status evidence | `documentation/plans/business/managed-crystal-reporting-reliability/IMPLEMENTATION-ROADMAP.md` |

## 1. Child boundary and outcome

Business workflow owned by this child: define and load one versioned,
machine-readable registry for every currently supported managed Crystal entity. The
registry owns entity key, scope, table name, ordered fields, portable type,
nullability, approved filters, maximum rows and managed parameters. Reporting data
providers and the .NET Framework runtime must consume or prove parity with the same
canonical artifact. `fiscalyears` is added with its exact Fiscal Year/optional
Fiscal Period contract and remains tenant/company scoped.

Independent acceptance outcome: both processes load the same canonical bytes and
fingerprint; malformed/duplicate contracts fail deterministically; current
providers emit the exact declared schema; runtime lookup recognizes all registered
entities including `fiscalyears`; focused tests prove positive and negative parity.

Explicitly outside this child: entity-aware `.rpt` inspection, validation-state
migration, publication/render fingerprint gates, error-taxonomy redesign, Report
Manager UI changes, real Fiscal Years PDF acceptance, runtime deployment/performance
work, and security/dependency hardening. Those are ordered sibling features.

## 2. UI Pattern Gate (mandatory before implementation)

This child introduces no route, screen, field, control or client wire-contract
change. The rows document the existing Fiscal Years report-consumer surfaces and
explicitly defer their business acceptance to the later Fiscal Years child. P-001
is the already approved parent-screen pattern, not new UI work in this child.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `managed-crystal-contract-consumer` | Web | `/finance/ledger-setup/fiscal-years` | Consume the existing managed Fiscal Years report after later children close | Existing server-managed Fiscal Years collection with Report view | P-001 | Read-only managed report sub-view; no form in this child | `web-next/src/modules/accounting/fiscal-years/reports/pages/FiscalYearReportPage.tsx` | Excluded — no Web implementation in this child | Grid Excluded; Table Excluded; Cards Excluded; Tree Excluded; Detail Excluded; Report Deferred to `fiscal-years-managed-crystal-report`; Import Excluded; Export Excluded; Chart Excluded | Existing states unchanged; no new loading/empty/error/forbidden/dirty/conflict UI is claimed | Online authoritative; offline render Excluded | N/A — report/query-only child contract | Existing `FiscalYears:View` route access plus `CrystalReports:View` and report Run grant; tenant/company | Existing P-001 responsive/RTL/accessibility behavior is unchanged | Registry correctness is server/runtime foundation only |
| `managed-crystal-contract-consumer` | Mobile | `/finance/ledger-setup/fiscal-years` | Consume the existing managed Fiscal Years report after later children close | Existing native Fiscal Years Table/Cards with Report view | P-001 | Read-only managed report sub-view; no form in this child | `mobile-react/src/modules/accounting/fiscal-years/presentation/components/FiscalYearReportView.tsx` | Excluded — no Mobile implementation in this child | Grid Excluded; Table Excluded; Cards Excluded; Tree Excluded; Detail Excluded; Report Deferred to `fiscal-years-managed-crystal-report`; Import Excluded; Export Excluded; Chart Excluded | Existing states unchanged; no new loading/empty/error/forbidden/dirty/conflict UI is claimed | Online authoritative; offline render Excluded | N/A — report/query-only child contract | Existing `FiscalYears:View` route access plus `CrystalReports:View` and report Run grant; tenant/company | Existing native small/large viewport, RTL and accessibility behavior is unchanged | Registry correctness is server/runtime foundation only |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Existing runtime profiles | `api/CrystalReportGeneratorApi/Runtime/Rendering/CrystalReportProfileRegistry.cs` | Entity lookup and fail-closed unsupported behavior | Hard-coded name-only profiles are replaced by exact versioned contracts. |
| Reporting providers | `api/Modules/Reporting/ErpSystem.Modules.Reporting.Infrastructure/Features/Analytics/CrystalReports/Persistence/ReferenceDataCrystalReportProviders.cs` | Provider ownership and pushed ADO.NET XML shape | Provider schemas are verified against the registry rather than duplicated without a parity gate. |
| Fiscal Years provider | `api/Modules/Reporting/ErpSystem.Modules.Reporting.Infrastructure/Features/Analytics/CrystalReports/Persistence/AccountingCrystalReportProviders.cs` | Accounting source boundary, filters and flattened Year/Period projection | Required versus nullable columns become explicit and the runtime gains the same entity contract. |
| Existing consumers | `web-next/src/modules/accounting/fiscal-years/reports/pages/FiscalYearReportPage.tsx`; `mobile-react/src/modules/accounting/fiscal-years/presentation/components/FiscalYearReportView.tsx` | Stable `fiscalyears` entity key and Code/Name filters | No client behavior is implemented or accepted in this child. |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Canonical ownership | Reporting module managed Crystal feature | Extend module-locally | Store the portable artifact under the Reporting-owned contract surface; do not create a BuildingBlocks business abstraction. |
| Portable runtime input | Existing runtime project content/embedded-resource support | Reuse | Link/package the same canonical artifact into the .NET Framework runtime and validate it at startup. |
| Data providers | `ICrystalReportDataProvider` implementations | Extend with verification seam | Keep business-row acquisition unchanged; validate generated DataTable/XML schema against the registry. |
| Runtime lookup | `CrystalReportProfileRegistry` | Replace implementation behind existing responsibility | Preserve case-insensitive entity lookup/fail-closed outcome while constructing exact profiles from the artifact. |
| Fingerprint | Platform cryptographic/runtime primitives | Feature-specific deterministic utility | Canonicalize registry bytes and compute SHA-256 without moving business contracts into BuildingBlocks. |
| Web/Mobile | Existing managed report viewers | Reuse later; no change now | Consumers keep entity keys; later siblings own UI/error/live-render evidence. |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid/Table/Cards | Excluded | No UI surface in this child | None |
| Tree/Hierarchy | Excluded | Not applicable to a registry | None |
| Detail/View | Excluded | No registry administration screen | None |
| Create/Edit | Excluded | Registry is source-controlled, not tenant-authored runtime data | None |
| Report/Import/Export/Chart | Deferred | Existing report consumers are verified by later children | None in this child |
| Other workflow-specific surface | Required — process startup/test boundary | Reporting/runtime configuration load | Load, validate and expose in-process exact contracts/fingerprint |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | Versioned JSON document parsed into immutable `ManagedCrystalReportContract`, `ManagedCrystalReportColumnContract`, filter and parameter models in each process; no client request/response is added. |
| Canonical routes | N/A — no public or internal HTTP route changes in this child. |
| Server search/filter/sort | Registry declares the existing allow-listed filter names; it does not execute filtering. Current entity filters remain unchanged. |
| Paging/limits | Registry declares a positive `maxRows` matching current provider limits; rendered datasets remain bounded and unpaged. |
| Domain errors / ProblemDetails | Artifact/load/parity failures are startup/test configuration failures in this child. Public error-taxonomy changes belong to `managed-crystal-template-validation`. |
| Permission and tenant/company scope | Contract declares `global` or `tenant-company`; Reporting remains authoritative. `fiscalyears` is `tenant-company`. No permission changes. |
| Cross-module contract | Accounting/ReferenceData public reporting sources remain unchanged; the registry describes Reporting transport, not owner-domain DTOs. |
| Persistence/schema/migration | N/A — source-controlled contract artifact only; no EF/domain persistence change in this child. |

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Report consumer | Managed Crystal report | List/render an existing published report after later children close | Existing `GET /api/v1/crystal-reports` and `POST /api/v1/crystal-reports/{id}/render` | `CrystalReports:View` plus per-report Run grant | Authenticated tenant/company; Fiscal Years never global | Existing read-only/report behavior remains unchanged | Existing `ManagedCrystalReportView` permission/direct-handler guards; no change in this child | Existing platform Reporting access/use-case guard; no change in this child | View Crystal reports | عرض تقارير Crystal | Existing API/client denial tests remain baseline; this child adds no authorization path |
| Process startup | Managed entity contracts | Load and validate source-controlled registry | In-process startup/composition | N/A — not a user action | Deployment artifact | Fail startup/readiness deterministically on malformed, duplicate or unsupported contract vocabulary | N/A — no Web control | N/A — no Mobile control | N/A | N/A | Loader tests reject malformed/duplicate entries before serving requests |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create | N/A | No runtime/user creation | Contracts are authored in source control and reviewed as code | No tenant-authored registry record |
| Edit | N/A | No runtime/user edit | Contract evolution requires explicit version/fingerprint and parity updates | Old bytes cannot silently masquerade as the same contract |
| View/detail/preview | Deferred | Existing report consumer remains unchanged | No route/response change | Later Fiscal Years child owns visible acceptance |
| Archive/restore/other lifecycle | N/A | No registry lifecycle endpoint | Artifact replacement is deployment/version evolution | Report version revalidation belongs to a later child |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | N/A for UI. Registry load is deterministic startup work; empty registry is invalid. |
| Permission / forbidden / read-only | No new action or permission. Existing report permissions stay server-authoritative. |
| Archived / locked | N/A — registry entries are source-controlled contracts, not lifecycle records. |
| Unsaved changes / destructive confirmation | N/A — no UI form or runtime mutation. |
| Offline / stale / conflict | No client offline behavior. Artifact fingerprint exposes cross-process drift; mismatch fails tests/readiness rather than merging. |
| Mock data | N/A — use deterministic contract/DataTable fixtures; do not add a user-facing mock action. |

## 9. Concurrency, transactions, and consistency

The registry is immutable after process startup. Parsing produces a read-only map
with unique case-insensitive entity keys. The canonical fingerprint is deterministic
for the same artifact bytes. There is no transaction, RowVersion or user write in
this child. Consistency is enforced at build/startup/test: Reporting and runtime
must package the same artifact/fingerprint, and provider parity tests fail before a
release can proceed. Runtime hot reload is Excluded; contract changes require
coordinated artifact deployment and process restart.

## 10. i18n, RTL, accessibility, and responsive behavior

No visible UI text or layout changes are authorized. Entity contracts use stable
English technical identifiers and do not contain translated display strings in
this child. Existing Web/Mobile localization, RTL, keyboard/touch and responsive
behavior remains unchanged and is reverified by the later UI/business acceptance
children. Portable type names are invariant technical vocabulary.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Plan/slice/contract approved; Phase 00 completed | Canonical artifact/models/loader/fingerprint; all current provider schemas including Fiscal Years match; 110/110 Reporting tests pass | `documentation/system/features/managed-crystal-contract-registry/IMPLEMENTATION-REQUEST.md` and API profile |
| 2 | Web | Verified — Excluded implementation | API stage Verified | No wire/UI change; Excluded decision and current consumers recorded | Web applied profile |
| 3 | Mobile | Verified — Excluded implementation | Web stage Verified | No wire/UI change; Excluded decision and current consumers recorded | Mobile applied profile |
| 4 | Integrated live verification | Verified | API, Web and Mobile stages Verified | Identical source/runtime resource fingerprint; runtime resolves `fiscalyears`; provider schema parity passes | Review artifact Phase 06 evidence |
| 5 | Documentation and closure | Closed | Integrated verification Verified | Canonical books/manifests/recipes/generated packets reconciled; customer education N/A | Required-file manifest and generated feature packet |

**Next-step rule:** no sibling feature may become Active until this feature's
Integrated live verification is Verified and Documentation and closure is Closed.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | Immutable model/parser validation tests | duplicate entity/field, unknown scope/type, missing members, invalid maxRows/filter/parameter | Passed in focused/full Reporting suites |
| API/transport | Reporting registry composition/provider-parity tests | countries/states/districts/addresstypes/fiscalyears load with exact fingerprints and scopes | Passed; 110/110 Reporting and 59/59 architecture |
| Persistence/migration | N/A — no EF state | Prove no migration/model change | Verified by scoped diff; no persistence change |
| Web | N/A implementation | No public wire/UI change | Verified by scoped diff and applied profile |
| Mobile | N/A implementation | No public wire/UI change | Verified by scoped diff and applied profile |
| E2E/manual/live | Runtime loader/profile harness and cross-artifact fingerprint comparison | `fiscalyears` lookup succeeds and its 16-column contract matches provider XML schema | Passed; fingerprint `4d751113…573c` |

## 13. Child exit gate

This child is complete only when:

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No Candidate pattern remains; no new UI pattern is introduced.
- [x] Its boundary is implemented without absorbing sibling workflows.
- [x] The canonical registry is the only managed-entity contract source.
- [x] Reporting and runtime package identical canonical bytes/fingerprint.
- [x] Current providers and runtime profiles, including `fiscalyears`, pass exact schema parity tests.
- [x] No persistence, route, permission or client behavior change is introduced silently.
- [x] API → Web → Mobile → integrated verification evidence is recorded in order.
- [x] Documentation/manifest/recipe and N/A customer-education decision are reconciled.
- [x] The roadmap records this feature Verified/Closed before the next feature becomes Active.
