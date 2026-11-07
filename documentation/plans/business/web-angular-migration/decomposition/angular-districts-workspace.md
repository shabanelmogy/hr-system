# Districts complete Angular parity — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S3-A10 — Districts complete Angular parity |
| Child Feature ID | angular-districts-workspace |
| Child feature name | Districts complete Angular parity |
| Owner | ReferenceData business; Platform Angular migration evidence |
| Depends on | Existing verified Countries/States read/edit/import and Shared foundations; unchanged Districts API |
| Execution status | Closed |
| Runtime authorization | Exact bounded source parity authorized by requester D42; G0-G3 fixed below, Phase00 required before source changes; release-only G4 PROD-019/028/RISK-020 remain |

## 1. Child boundary and outcome

Port the actual global Districts workflow to Angular, including five source views,
State parent dependency, create/edit/view and archive/restore/bulk lifecycle.
No Address business screen, tenant management, API rules/schema, native rewrite or
engine belongs here. States client is Closed; later Super Admin features remain Queued. States hosted-report gate
is Deferred under PROD-028; no claim that it passed.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict districts | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reference-data.districts | Web | /super-admin/geography/districts | Global District records under a State | Server collection and dependent parent form | P-001 | Shared Signal Form/dialog, active State reference selector | web-next/src/modules/reference-data/geographical-information/districts/pages/DistrictsPage.tsx; web-next/src/modules/reference-data/geographical-information/districts/components/DistrictsMultiView.tsx; web-next/src/modules/reference-data/geographical-information/districts/components/DistrictForm.tsx | Adapted | Grid/Cards/Detail/Chart/managed Report/Import Required; standalone Export/Tree Excluded | Loading/background/empty/error/forbidden/dirty/duplicate/dependency/uncertain | Online authoritative; no offline writes | Realistic dev-only four-field sample with active parent, never auto-submit | super_admin plus exact Districts action; States:View for active parent lookup | EN/AR390/1440, keyboard/filter/pager, shared controls and contained scroll | Angular PrimeNG implementation of same feature contract; ActiveReports Excluded by DEC-028 |
| reference-data.districts | Mobile | Existing native Districts route | Retain source | Existing native collection | N/A | No new native form | mobile-react/src/modules/reference-data/geography/districts/presentation/screens/DistrictsScreen.tsx | Excluded | New native Grid/Cards/Detail/Chart/Report/Import/Export/Tree Excluded | Existing native districts unchanged | Existing native policy unchanged | No new generator | Existing native authority | Compact browser Required under Web | No conversion of native application |

## 3. Closest existing reference

Inspect DistrictsPage, DistrictsMultiView, DistrictForm, districtService, useDistrictGridLogic and import-data in
web-next/src/modules/reference-data/geographical-information/districts. Reuse actual
Angular States composition under web-angular/src/app/modules/reference-data/
geographical-information/states for shared layout/district lifetime only. Districts fields are nameAr/nameEn/code/stateId. The form has one State selector; no Country field is added. Next UI default is createdOn descending, page1/size10.

## 4. Reuse and composition contract

MyDataGrid/CardList/CollectionChartView, PageHeader, DialogPanel, FormContainer,
TextField/ReferenceField, FeedbackDistrict, lifecycle Confirmation and compact
SpreadsheetImportPanel are existing Shared owners. Feature-owned district/services
and focused component folders; external HTML/SCSS and curated public APIs only.
Small pure helpers for query/conversion/validation are permitted. No CRUD base,
generic business switch, form schema renderer, dependency or persistence engine.

## 5. Screen and workspace contract

Server paging/sort/search field/operator/status, parent State and hasAddresses
criteria, current-page row selection up to100, Grid options and Cards share one
controlled source. Chart uses current first page and labels page scope, with
State distribution, District counts and timeline plus source summary metrics.
Report uses existing Reporting owner with entity districts, independent NameAr/NameEn/StateAr/StateEn
criteria and binary/PDF lifecycle. Import uses headers nameAr,nameEn,code,stateName,
active State lookup, correct invalid/failed/uncertain handling and exact bulk.

## 6. Typed transport and server criteria

Unchanged DistrictsController under api/Modules/ReferenceData/
ErpSystem.Modules.ReferenceData.Presentation/Features/GeographicalInformation/Districts/V1.
GET /api/v1/districts supports one-based pageNumber, pageSize1-5000, bounded search200,
searchField all/nameAr/nameEn/code/state, six existing operators, status
active/archived/all, optional stateId/hasAddresses, sort nameEn/nameAr/code/state/
createdOn and asc/desc. List includes State lookup (id/nameAr/nameEn/code/countryId) and addressesCount; detail has parent
but no invented count. Strict parse nullable fields, IDs, duplicate IDs, matching
page metadata and status/parent criteria. Direct cookie+CSRF transport; no BFF.

### Permission Action Matrix

| Action | Existing API | Exact permission | Guard |
| --- | --- | --- | --- |
| List/detail | GET districts, districts/id | Districts:View | super_admin; authoritative session; query cancellation |
| Parent lookup | GET states/lookup | States:View | active State only; dependency forbidden/error distinct |
| Create/import | POST districts; districts/bulk with districts array | Districts:Create | not read-only; valid active parent; max100; no replay |
| Edit | PUT districts/id | Districts:Edit | active record; fresh detail; exact payload |
| Archive/bulk | DELETE districts/id; POST districts/bulk-archive ids | Districts:Archive | active records/max100; dependency failure atomic |
| Restore | POST districts/id/restore | Districts:Restore | archived District; server checks active State |
| Report | Existing global-report paths | GlobalCrystalReports:View plus existing report ACL | Reporting retains catalog/token/binary authority |

## 7. Create, edit, view, and lifecycle contract

Names trimmed/NFC printable2-100; code required2-10 uppercase with existing source
pattern; State positive Int32 selected from active lookup. Shared Signal Forms
own touched/errors/submit, first invalid focus and server field mapping. Save stays
enabled until submission. Edit/view load detail independently; archived retained
parent may be shown read-only without becoming an active selectable option.
Current server rejects duplicate names/codes within one State; same value under
another State is allowed. Archive fails for active Addresses; restore
requires active parent; bulk atomic count validated. Dev sample fills but never saves.

## 8. UX states, permissions, offline, and mock data

Actor-scoped Signals, createScopedRead, takeUntilDestroyed and generation fencing
retain current lifetime conventions. Direct callbacks recheck exact grants and
read-only. No optimistic bulk result, hidden backend validation, native alerts,
offscreen input errors, storage persistence, fake runtime rows or auto retries.
Import forbids invalid workbook/formulas and resolves parent names; unknown or
ambiguous name resolution must produce row guidance rather than choose a parent.

## 9. Concurrency, transactions, and consistency

Server remains authoritative for parent activity, scoped duplicate and dependencies.
No revision field is invented;409 duplicate is not optimistic concurrency.
Distinguish not-sent/rejected/uncertain; unknown dispatched outcomes lock replay and
reconcile reads. Unsaved and pending barriers apply on route/view/context changes.
Realtime invalidates districts and dependent hints using existing event owner.

## 10. i18n, RTL, accessibility, and responsive behavior

Use existing core/reference-districts EN/AR captions and shared tokens. Add only
evidenced gaps through canonical catalog generator; PROD-019 deployment stays
explicit. Logical styling, modal focus/close, keyboard selection/paging and bounded
scroll must pass. Native runtime unchanged. Source comparisons at same viewport.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing Districts books/controller/source | No API change; actual DTO/permission/transaction traced | documentation/modules/platform/features/angular-districts-workspace/angular-districts-workspace-api.md |
| 2 | Web | Verified | D42, this contract and Phase00 generated books/check | Complete runtime, all Required source views and tests | documentation/modules/platform/features/angular-districts-workspace/angular-districts-workspace-web.md |
| 3 | Mobile | Verified | Web evidence | Explicit retained native boundary and compact browser verification | documentation/modules/platform/features/angular-districts-workspace/angular-districts-workspace-mobile.md |
| 4 | Integrated live verification | Verified | All Required Web journeys | Fixture browser/source comparison and authorized live reads; release-only limits separated | documentation/modules/platform/features/angular-districts-workspace/angular-districts-workspace-evidence.md |
| 5 | Documentation and closure | Verified | Phase06 Verified for this scope | Canonical manifests/books regenerated; Next Super Admin feature activates only afterward | documentation/modules/platform/features/angular-districts-workspace/angular-districts-workspace-review.md |

**Next-step rule:** Later Super Admin siblings remain Queued until
this feature's required verification and documentation are complete. D42 explicitly
defers the previous Countries hosted-report gate under PROD-028 without claiming it
passed; this resequencing does not waive Districts acceptance or any new finding.

## 12. Verification contract

Meaningful contracts/validators/transport/actor/lifecycle/parent/import tests precede
implementation. Full npm run check includes lint, architecture, strict types,
format, catalog and production build. Browser fixture matrices EN/AR light/dark
390/1440 exercise Grid/Card/create/edit/view/archive/restore/bulk/lookup/chart/report/
import, keyboard and denied/pending/uncertain behavior. No live business writes
without existing task authorization; source/API retained tests unaffected.

## 13. Child exit gate

- [x] G0 scope/actor/source verified; G1 source journey/P-001 fixed; G2 exact API
  and shared ownership fixed; G3 no new business/schema/external dependency.
- [x] Phase00 request/review/books and existing-only manifest generation/check pass.
- [x] All required runtime and meaningful tests/browser/source parity pass.
- [x] Phase06 records Verified within executed scope and remaining production limits.
- [x] Canonical documentation/education and closure complete, then activate the next Super Admin workflow.

Remaining G4 is release-only PROD-019 catalog deployment, PROD-028 actual Crystal
provider acceptance and RISK-020 startup budget. None changes this frozen business
contract. Actual failures found during implementation must be repaired or recorded
with a stable central ID; they cannot be silently treated as accepted parity.

## 14. Source-specific District decisions

Next useDistrictGridLogic verifies createdOn descending/page1/size10 defaults.
SimpleStateResponse has id/nameAr/nameEn/code/countryId, without isDeleted.
Only list contains addressesCount; detail must not invent that count. Parent lookup
requires States:View independently of Districts permissions. Exact known errors:
District.Duplicated, District.DistrictNotFound, District.DistrictInUseByAddress,
District.StateNotFound and District.NoDistrictsProvided. Bulk archive accepts
archivedCount0..requested (idempotent); create count must equal requested.

Import headers are exactly nameAr,nameEn,code,stateName. Normalized State names
may collide across Countries: ambiguous parent names are rejected explicitly,
correcting the source index's silent overwrite without changing domain behavior.
Only active authorized States are selectable; no guessed/hard-coded parent ID.

District managed report supports four exact contract filters, verified in
api/Modules/Reporting/ErpSystem.Modules.Reporting.Contracts/Features/Analytics/
CrystalReports/managed-crystal-report-contracts.v1.json. Extend the existing
Reporting filter contract with typed StateAr/StateEn only for Districts; retain
Countries/States two-filter behavior, native Signal Forms validation, server error
mapping and PDF lifecycle. No schema-driven renderer or parallel viewer.

States closure generation/check passes468recipes. Planning's temporary no-Active
diagnostic is resolved by this atomic successor activation; rerun planning before
runtime and do not claim the intermediate state passed.

Acceptance2026-11-06: Phase06 Verified with701tests/125files,30architecture,8full/14negative browser cases and1States regression; actual hosted District page200empty/State lookup27/catalog200empty/logout204, no business writes. Report/source hashes in the canonical District workspace receipt. Arabic education exists; documentation checks and successor activation remain the final current step.

Closure2026-11-06: canonical generation/check476recipes and Check-Planning pass with two inherited unrelated contract warnings. Phase07 Arabic education complete. Successor is S4-A1 angular-tenant-management-workspace under D42; no other sibling is active.
