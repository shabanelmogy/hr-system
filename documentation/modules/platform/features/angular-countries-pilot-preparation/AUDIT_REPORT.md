# Countries migration audit and bounded delivery decisions

S3-A1 source-only preparation. No API/domain/schema/Next/native runtime change.
Source stamp: SOURCE_SNAPSHOT.json; all139 current Countries manifest paths exist.
The snapshot includes collections as navigation evidence, not a claim that every
AR file is required in Angular. Graphify query precedes source navigation.

## Verified current API and ownership

ReferenceData owns global Country; Reporting owns global deployment Crystal PDF.
ReferenceDataDbContext/IReferenceDataUnitOfWork persist the aggregate. Countries
controller requires super_admin and the exact action permission. No tenant module
entitlement or selected-company grant substitutes for this global authority.

| Action | Current route | Permission | Success |
| --- | --- | --- | --- |
| Page | GET /api/v1/countries | Countries:View | items + metaData |
| Lookup | GET /lookup | Countries:View | active lightweight array |
| Detail | GET /{id} | Countries:View | detail including archived; no states |
| Relations | GET /{id}/states | Countries:View | active states collection |
| Create | POST base | Countries:Create |201detail |
| Import batch | POST /bulk {countries} | Countries:Create |201createdCount |
| Update | PUT /{id} six editable fields | Countries:Edit |200detail |
| Archive | DELETE /{id} | Countries:Archive |204 |
| Bulk archive | POST /bulk-archive {ids} | Countries:Archive |200archivedCount |
| Restore | POST /{id}/restore | Countries:Restore |204 |
| Managed report | global-crystal-reports catalog/render | GlobalCrystalReports:View plus super_admin | PDF/hash contract, independent criteria |

Page fields: pageNumber1-based, pageSize1..5000 API maximum, search<=200,
searchField all/nameAr/nameEn/alpha2Code/alpha3Code/phoneCode/currencyCode;
operators contains/doesNotContain/equals/doesNotEqual/startsWith/endsWith;
status active/archived/all; optional currencyCode3letters and hasStates boolean;
sort nameEn/nameAr/alpha2Code/alpha3Code/currencyCode/createdOn, asc/desc.
API default nameEn asc differs from explicit Web default createdOn desc.
Current Web starts UI page0,size10 and only requests the current server page.
useAdaptivePagination currently returns server mode, not a hidden all-data cache.
Metadata currentPage/pageNumber/pageSize/totalPages/totalCount/hasPrev/hasNext
is authoritative; empty totals may have totalPages0. Ordering has an Id tie-break.

List adds statesCount; detail has six editable fields plus id/audit/isDeleted;
lookup is separate. No Country request/response expected rowVersion or ETag exists.
409 is Country.Duplicated, not proof of stale-editor prevention. Current update
reloads the row server-side and has no client-held revision precondition. Do not
invent a frontend token, automatic write replay, or lost-update guarantee.

Names are trimmed/NFC normalized printable Unicode,2..100; no Arabic-only or
English-only script rule. Optional empty codes become null; alpha2/3/currency
uppercase; phone trimmed. Names and alpha codes are unique across archived data.
Currency/phone follow current validators. No structured child editor is introduced.

Archive is idempotent for already archived rows. It blocks active states, active
addresses and company usage; bulk archive checks all dependencies before changing
any row, under shared Country lifecycle locks. Restore of active rows is a no-op.
Bulk create1..100 atomically saves accepted rows and rejects duplicates; bulk archive
requires1..100 distinct positive IDs. Single normal update has no client idempotency
key. Writes schedule existing notification/realtime effects after commit; no new
outbox or cross-module data ownership is authorized by this client migration.

## Verified current UI and intentional target boundaries

Next CountriesPage -> useCountryGridLogic -> shared list/query/service. Detail is
fetched for view/edit; selected list rows are not treated as complete detail.
MyDataGrid supplies search field/operator, status filters, sort, column/density
options, footer and record navigation. Cards reuse EntityCard, quality indicators,
code/status chips, audit display, state count and action footer. Quality score is
50 +15 per present name +5 each alpha2/alpha3/phone/currency, capped100.
Selection is cleared on criteria/page/sort changes and limited100 active current rows.

Chart switches to page0, uses only that current page, and labels total matching
versus visible countries/states/currencies. It has currency/timeline/states/coverage
charts and no chart pagination controls. It is not whole-dataset analytics.
Report is current managed global Crystal, separate applied NameAr/NameEn criteria.
ActiveReports viewer/designer/SDK/authoring is Excluded by DEC-028.

XLSX import has canonical six headers in field order, first worksheet,5MiB max,
100rows max, preview/row statuses/validation/duplicate checks. One bulk request sends
valid pending rows; invalid rows stay local. Server atomicity covers the submitted
valid batch, not invalid rows. Lost submission response becomes uncertain and must
not auto-replay. Current shared Countries Grid toolbar has no configured standalone
CSV/XLSX export. Do not invent an export endpoint from another feature's reference.
Template download and PDF download remain required in their owning children.

Native current CountriesScreen imports Chart and Import and exposes five views;
canonical mobile/web prose claiming those absent is stale. Native implementation
and its centrally gated optional scoped offline reads remain retained. No new
native code, offline write queue, schema or mock generator is changed here.

## Documentation/source discrepancies — RISK-016

| Existing authored evidence | Verified source | Migration decision |
| --- | --- | --- |
| Web HTTP table calls archive/restore Delete | Controller uses Countries:Archive and Countries:Restore | Exact separate permissions |
| Countries manifest HrDbContext entry purpose claims country DbSet ownership | CountryReadStore uses ReferenceDataDbContext; module UoW owns writes | Do not copy historical HR persistence |
| Web profile claims Countries AR viewer/designer integration | Current MultiView/report leaf uses global managed Crystal; DEC-028 cancels AR target | Crystal/PDF only for Angular |
| Mobile profile says no Chart/Import | Current CountriesScreen imports and renders both | Retain current native source, no platform deletion |
| API concurrency may be inferred from409 | Current DTOs have no revision precondition;409duplicate | Preserve exact server semantics, no concurrency claim |

These are migration findings, not permission to rewrite existing API or retained
client behavior. RISK-016 owns baseline drift; RISK-017/RISK-008 own remaining
specialist/engine proofs, PROD-019 matching localization resource publication.

## Delivery decomposition (all remain in full pilot scope)

| Slice / Feature ID | Coherent acceptance outcome | Dependency / entry |
| --- | --- | --- |
| S3-A2 angular-countries-read-workspace | Actual global Grid/Cards/page/search/status/sort/detail-read workflow, shared toolbar/footer/navigation, scope/deny/cancel/empty/errors | This preparation Closed; exact read contract/Phase00 |
| S3-A3 angular-countries-edit-workflow | Six-field create/edit, shared form/error/draft/conflict handling and realistic dev mock data | Read workspace Verified; frozen actual write semantics |
| S3-A4 angular-countries-lifecycle | Confirmed single/bulk archive/restore with dependency failures and selection limits | Edit workflow Verified; no hard delete |
| S3-A5 angular-countries-chart-view | Four charts, explicit visible-page scope and matching-total summary | Lifecycle Verified; shared chart adapter compatibility proof |
| S3-A6 angular-countries-report-view | Countries multi-view reuses existing global Crystal/PDF owner and independent applied criteria | Chart Verified; S3-A0 minimum retained |
| S3-A7 angular-countries-import-view | Shared XLSX parsing/preview/template, valid-batch atomic submission and uncertain outcome | Report integration Verified; parser/worker/file proof before runtime |
| S3-A8 angular-countries-pilot-acceptance | Realtime invalidation, complete source comparison/all five views/actions, host/production-size and release classification | All prior children Verified; no CRUD-only pilot claim |

Only the first read workspace is the next entry candidate. Each later feature
gets its own completed Screen/Workflow Contract and Phase00 before runtime; this
table is sequencing, not blanket runtime authorization. No future runtime file is
registered. Production Countries navigation is not exposed by this preparation.

## Verification and limits

Current-source audit plus focused API74 tests and Next5files/13tests passed.
Next run uses actual installed Vitest4.1.11; lock drift RISK-012 is retained and a
focused pass is not a locked full-Next release gate. No runtime changes justify
rerunning Angular295/browser suites in this source-only child. S3-A0 current
295unit/PDF40+8 and other regression results remain historical unchanged evidence.
No live mutation, schema check, SQL write, engine render, physical device or new
customer screen is claimed. Initial documentation check381recipes passed.
