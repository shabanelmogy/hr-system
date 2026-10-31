# Countries lifecycle — web applied book

Exact S3-A4 Phase06 Verified /Phase07 completed /Closed2026-10-30. Current acceptance: verification/CURRENT_LIFECYCLE_ACCEPTANCE.md. API/native retained; no new native UI.

## 1. Ownership

ReferenceData owns global Country lifecycle; Platform owns Angular migration evidence. Existing CQRS/controller/store remain canonical. No API/schema/native runtime change.

## 2. Existing-system relationship

Extend an existing capability with an Angular consumer. Reviewed CountriesController DELETE/{id}, POST/{id}/restore and POST/bulk-archive; three handlers, batch validator and CountryErrors; retained Next CountryArchiveDialog/CountryRestoreDialog, Countries page selection, Angular shared controls and scoped reads.

## 3. Scope and platforms

Web archive/restore/bulk archive Required at authenticated Countries preview; existing Grid/Cards/View/Create/Edit retained. Chart/managed Crystal-PDF Report/Import Required in queued siblings. Standalone export and ActiveReports Excluded. New native UI Excluded; retained native country screen unaffected. Online commands only.

## 4. Shared reuse inventory

Reuse MyDataGrid and CardList native selection, toolbarContent slot, existing RowActions, ConfirmationDialog/DialogPanel safe cancel focus and pending lock; FeedbackNotifications native success Toast and general error Modal; command outcome classifier and scoped list refresh. Rejected feature-local modal/grid/selection shells. Domain state supplies IDs, exact permissions and callbacks only. No shared extension needed unless current source demonstrates a gap.

## 5. Typed transport

DELETE /api/v1/countries/{id} and POST /{id}/restore return204; POST /bulk-archive sends {ids:[positive distinct IDs]} and returns {archivedCount:integer 0..requested}. Cold HTTPS origin-bound cookie/CSRF services,10s timeout, no auto retry. Validate IDs before CSRF; malformed successful responses are uncertain after dispatch. No bearer/BFF/new revision mechanism.

## 6. Permissions and read-only

Require super_admin plus Countries:View and exact Countries:Archive or Countries:Restore. Block all writes on authoritative tenantReadOnly. Recheck visibility, direct open/confirm callbacks and latest actor. Archive active current-page rows; restore archived current-page rows. Pending/editor conflicts blocked. Server403 latches denial for that actor until authoritative replacement.

## 7. Business rules matrix

BR-L1 Application handlers: dependency states/addresses/company blocks archive; Country.CountryInUseByState/Address/Company; verify rejection/no fabricated success. BR-L2 Application bulk handler:1..100 distinct positive IDs, missing member/dependency fails atomically; no partial client splice; verify exact body and rejected bulk. BR-L3 Application lifecycle: already-target-state no-op is valid; bulk count0..N; verify zero success and invalid count rejection. BR-L4 Application trusted permission/current actor: callbacks cannot bypass grants/read-only; test direct denial/stale confirmation. BR-L5 Database/entity existing soft-delete and audit retained; no hard delete or new migration.

## 8. Edge cases and validation

Covered: empty/duplicate/invalid/oversized batch; no selected active rows; archived checkbox disabled; status/search/page/view/actor change clears selection/consent; expired or changed row state; mixed batch dependency or missing404; rejected400/401/403/409; network/5xx/malformed2xx uncertainty; repeated confirm/pending cancel; late effects after destroy/actor replacement. Enforcement: strict service parse, current page state guards and server atomic handler. Required service/state/browser tests cover these. Name uniqueness/creation/structured fields, approvals, financial arithmetic, date boundaries, import duplicate rules and offline storage are N/A: no change to those capabilities in this lifecycle child.

## 9. Concurrency and consistency

Confirmation captures actor, source/query identity and IDs; criteria/page/refresh replacement invalidates unsent consent. Pending request owns shared busy barrier; no duplicate send/cancel or navigation replay. Identity loss masks/cancels stale effects. Rejected outcomes show Modal; uncertainty closes unsafe action, clears selection and refreshes latest list without replay. Success uses validated authoritative count, shared Toast and refresh; no optimistic deletion or invented concurrency precondition.

## 10. Localization and accessibility

Use canonical core/reference-countries EN/AR SQL-backed resources through catalog generation; current action captions reused. Allowlisted dependency codes map to safe bilingual keys; never dump server internals. PrimeNG MCP metadata precedes shared control changes; native Dialog uses body append/accessible name, shared safe action focus/keyboard and pending lock. Compact390/wide1440, EN/AR, light/dark proof Required; palette tokens reused.

## 11. Verification

D31 shared post-success record continuity is Verified in angular-countries-edit-workflow/verification/FORM_RECORD_ACCEPTANCE.md: archive/bulk predecessor, first survivor, empty and page boundary. Command/API/permission/atomic/uncertain contract is retained; restore behavior unchanged. Angular405/combined browser8 retain lifecycle regression. No native/schema change.

Phase06 Verified: Angular390/66files,4config/11architecture, production498.70kB and eight combined command browser cases. See verification/CURRENT_LIFECYCLE_ACCEPTANCE.md and ACTIONS_RESULTS.json for actual scope and limitations. Synthetic commands only, no host writes.

## 12. Impact matrix

Reuse API/entity/database, auth/session/CSRF, native, shared confirmation/selection/feedback. Extend typed CountryService and countryWriteAllowed action union. Add domain lifecycle controller and meaningful verification. Change page composition only to supply selection and callbacks. Configuration/dependencies/routes/schema N/A: no new package, route, endpoint or entity. Catalog regenerated only for actual missing translated messages.

## 13. UI pattern and fidelity

P-001/C-01 shared confirmation and C-02 existing MyDataGrid/Cards. Same view/edit/archive vs view/restore source semantics. Toolbar archive-selected action includes count and existing selection bar clears selection; no second paginator, local raw control, placeholder action or feature-local modal. User D26 success Toast/general error Modal preserved; field validation stays inline.

## 14. Readiness and authorization

Exact S3-A4 bounded entry passed source/frozen Phase00 and421 recipe/planning checks before runtime. S3-A3 dependency was Verified/Closed. Executed bounded Phase06 is now Verified; education/closure completes this child. Remaining G4 host/full-pilot checks retain central owners and queued sibling scope. Only S3-A5 source/Phase00 is next Active, without runtime authority before its own gates.

## 15. Handoff

S3-A4 Closed after bounded acceptance and customer education. CountryLifecycleState supplies current actor/source/IDs, shared selection/confirmation/feedback callbacks, dependency errors and outcome reconciliation. CountryService implements exact existing DELETE/restore/bulk methods with strict IDs/count/204 response checks. Grid/Cards share row actions and native selection; general errors Modal, success Toast. No hard delete/API/schema/native change. Next S3-A5 chart is Active for source/preflight only, runtime blocked until its Phase00 gates. Remaining Report/Import/full pilot Required.
