# States complete Angular parity — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S3-A9 — States complete Angular parity |
| Child Feature ID | angular-states-workspace |
| Child feature name | States complete Angular parity |
| Owner | ReferenceData business; Platform Angular migration evidence |
| Depends on | Existing verified Countries read/edit/import and Shared foundations; unchanged States API |
| Execution status | Closed |
| Runtime authorization | Exact bounded source parity authorized by requester D42; G0-G3 fixed below, Phase00 required before source changes; release-only G4 PROD-019/028/RISK-020 remain |

## 1. Child boundary and outcome

Port the actual global States workflow to Angular, including five source views,
Country parent dependency, create/edit/view and archive/restore/bulk lifecycle.
No District business screen, tenant management, API rules/schema, native rewrite or
engine belongs here. Other features remain Queued. Countries hosted-report gate
is Deferred under PROD-028; no claim that it passed.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reference-data.states | Web | /super-admin/geography/states | Global State records under a Country | Server collection and dependent parent form | P-001 | Shared Signal Form/dialog, active Country reference selector | web-next/src/modules/reference-data/geographical-information/states/pages/StatesPage.tsx; web-next/src/modules/reference-data/geographical-information/states/components/StatesMultiView.tsx; web-next/src/modules/reference-data/geographical-information/states/components/StateForm.tsx | Adapted | Grid/Cards/Detail/Chart/managed Report/Import Required; standalone Export/Tree Excluded | Loading/background/empty/error/forbidden/dirty/duplicate/dependency/uncertain | Online authoritative; no offline writes | Realistic dev-only four-field sample with active parent, never auto-submit | super_admin plus exact States action; Countries:View for active parent lookup | EN/AR390/1440, keyboard/filter/pager, shared controls and contained scroll | Angular PrimeNG implementation of same feature contract; ActiveReports Excluded by DEC-028 |
| reference-data.states | Mobile | Existing native States route | Retain source | Existing native collection | N/A | No new native form | mobile-react/src/modules/reference-data/geography/states/presentation/screens/StatesScreen.tsx | Excluded | New native Grid/Cards/Detail/Chart/Report/Import/Export/Tree Excluded | Existing native states unchanged | Existing native policy unchanged | No new generator | Existing native authority | Compact browser Required under Web | No conversion of native application |

## 3. Closest existing reference

Inspect StatesPage, StatesMultiView, StateForm, stateService and import-data in
web-next/src/modules/reference-data/geographical-information/states. Reuse actual
Angular Countries composition under web-angular/src/app/modules/reference-data/
geographical-information/countries for shared layout/state lifetime only. States
fields are nameAr/nameEn/code/countryId; never copy Countries optional codes.

## 4. Reuse and composition contract

MyDataGrid/CardList/CollectionChartView, PageHeader, DialogPanel, FormContainer,
TextField/ReferenceField, FeedbackState, lifecycle Confirmation and compact
SpreadsheetImportPanel are existing Shared owners. Feature-owned state/services
and focused component folders; external HTML/SCSS and curated public APIs only.
Small pure helpers for query/conversion/validation are permitted. No CRUD base,
generic business switch, form schema renderer, dependency or persistence engine.

## 5. Screen and workspace contract

Server paging/sort/search field/operator/status, parent Country and hasDistricts
criteria, current-page row selection up to100, Grid options and Cards share one
controlled source. Chart uses current first page and labels page scope, with
Country distribution, District counts and timeline plus source summary metrics.
Report uses existing Reporting owner with entity states, independent NameAr/NameEn
criteria and binary/PDF lifecycle. Import uses headers nameAr,nameEn,code,countryName,
active Country lookup, correct invalid/failed/uncertain handling and exact bulk.

## 6. Typed transport and server criteria

Unchanged StatesController under api/Modules/ReferenceData/
ErpSystem.Modules.ReferenceData.Presentation/Features/GeographicalInformation/States/V1.
GET /api/v1/states supports one-based pageNumber, pageSize1-5000, bounded search200,
searchField all/nameAr/nameEn/code/country, six existing operators, status
active/archived/all, optional countryId/hasDistricts, sort nameEn/nameAr/code/country/
createdOn and asc/desc. List includes country and districtsCount; detail has parent
but no invented count. Strict parse nullable fields, IDs, duplicate IDs, matching
page metadata and status/parent criteria. Direct cookie+CSRF transport; no BFF.

### Permission Action Matrix

| Action | Existing API | Exact permission | Guard |
| --- | --- | --- | --- |
| List/detail | GET states, states/id | States:View | super_admin; authoritative session; query cancellation |
| Parent lookup | GET countries/lookup | Countries:View | active Country only; dependency forbidden/error distinct |
| Create/import | POST states; states/bulk with states array | States:Create | not read-only; valid active parent; max100; no replay |
| Edit | PUT states/id | States:Edit | active record; fresh detail; exact payload |
| Archive/bulk | DELETE states/id; POST states/bulk-archive ids | States:Archive | active records/max100; dependency failure atomic |
| Restore | POST states/id/restore | States:Restore | archived State; server checks active Country |
| Report | Existing global-report paths | GlobalCrystalReports:View plus existing report ACL | Reporting retains catalog/token/binary authority |

## 7. Create, edit, view, and lifecycle contract

Names trimmed/NFC printable2-100; code required2-10 uppercase with existing source
pattern; Country positive Int32 selected from active lookup. Shared Signal Forms
own touched/errors/submit, first invalid focus and server field mapping. Save stays
enabled until submission. Edit/view load detail independently; archived retained
parent may be shown read-only without becoming an active selectable option.
Current server rejects duplicate names/codes within one Country; same value under
another Country is allowed. Archive fails for active Districts/Addresses; restore
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
Realtime invalidates states and dependent hints using existing event owner.

## 10. i18n, RTL, accessibility, and responsive behavior

Use existing core/reference-states EN/AR captions and shared tokens. Add only
evidenced gaps through canonical catalog generator; PROD-019 deployment stays
explicit. Logical styling, modal focus/close, keyboard selection/paging and bounded
scroll must pass. Native runtime unchanged. Source comparisons at same viewport.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing States books/controller/source | No API change; actual DTO/permission/transaction traced | documentation/modules/platform/features/angular-states-workspace/angular-states-workspace-api.md |
| 2 | Web | Verified | D42, this contract and Phase00 generated books/check | Complete runtime, all Required source views and tests | documentation/modules/platform/features/angular-states-workspace/angular-states-workspace-web.md |
| 3 | Mobile | Verified | Web evidence | Explicit retained native boundary and compact browser verification | documentation/modules/platform/features/angular-states-workspace/angular-states-workspace-mobile.md |
| 4 | Integrated live verification | Verified | All Required Web journeys | Fixture browser/source comparison and authorized live reads; release-only limits separated | documentation/modules/platform/features/angular-states-workspace/angular-states-workspace-evidence.md |
| 5 | Documentation and closure | Verified | Phase06 Verified for this scope | Canonical manifests/books regenerated; Districts activates only afterward | documentation/modules/platform/features/angular-states-workspace/angular-states-workspace-review.md |

**Next-step rule:** Districts and later Super Admin siblings remain Queued until
this feature's required verification and documentation are complete. D42 explicitly
defers the previous Countries hosted-report gate under PROD-028 without claiming it
passed; this resequencing does not waive States acceptance or any new finding.

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
- [x] Phase00 request/review/books and existing-only manifest generation/check pass (468 recipes; Check-Planning passes with two unrelated legacy migration warnings).
- [x] All required runtime and meaningful tests/browser/source parity pass.
- [x] Phase06 records Verified within executed scope and remaining production limits.
- [x] Canonical documentation/education and closure complete, then activate Districts.

Remaining G4 is release-only PROD-019 catalog deployment, PROD-028 actual Crystal
provider acceptance and RISK-020 startup budget. None changes this frozen business
contract. Actual failures found during implementation must be repaired or recorded
with a stable central ID; they cannot be silently treated as accepted parity.

Closure2026-11-06: Phase06 Verified, Phase07 customer guide completed; portable
receipt verification/STATES_WORKSPACE_2026-11-06.json under the feature records
637tests/112files,30architecture,8full/14negative browser journeys,8Import/24Shell
regressions and hosted read-only evidence. Hosted State catalog200empty is explicit;
PROD-019/028/025 and RISK-020 remain external release boundaries. Canonical closure
generation/check/planning must pass before activating Districts.
