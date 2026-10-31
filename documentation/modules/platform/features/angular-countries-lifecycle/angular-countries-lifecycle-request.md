# Countries lifecycle implementation request

Existing-feature Angular consumer; plan web-angular-migration; exact S3-A4 — Countries archive and restore. Child angular-countries-lifecycle; owning documentation package documentation/modules/platform/features/angular-countries-lifecycle. Current public contract is existing Countries V1 lifecycle endpoints and country-actions type; no new cross-module contract.

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

Phase00 source contract reviewed; runtime/browser acceptance pending at entry. Retain unchanged API1162/0/3 evidence, no newly executed host writes. Required: service ID/CSRF/count/outcome tests; state actor/grant/read-only/selection/consent/pending/stale tests; full Angular check;8 shell browser cases across EN/AR/light/dark/390/1440 and retained read/Create/Edit regressions. Separate feature regressions from inherited warnings and host release checks PROD-019/023.

## 12. Impact matrix

Reuse API/entity/database, auth/session/CSRF, native, shared confirmation/selection/feedback. Extend typed CountryService and countryWriteAllowed action union. Add domain lifecycle controller and meaningful verification. Change page composition only to supply selection and callbacks. Configuration/dependencies/routes/schema N/A: no new package, route, endpoint or entity. Catalog regenerated only for actual missing translated messages.

## 13. UI pattern and fidelity

P-001/C-01 shared confirmation and C-02 existing MyDataGrid/Cards. Same view/edit/archive vs view/restore source semantics. Toolbar archive-selected action includes count and existing selection bar clears selection; no second paginator, local raw control, placeholder action or feature-local modal. User D26 success Toast/general error Modal preserved; field validation stays inline.

## 14. Readiness and authorization

Dependency S3-A3 Verified/Closed; exact S3-A4 becomes sole Active child. G0 ownership, G1 current relationships, G2 bounded lifecycle/authority/atomic contract and G3 reuse/edge/test contract are frozen in v2 decomposition and current source. G4 remaining host publication/full-pilot work is release-only or separate Required siblings. Runtime may start only after current books/manifest/recipes generation and planning checks pass. No blanket sibling authorization.

## 15. Handoff

Entry state Active/bounded-runtime; no new lifecycle UI or execution acceptance claimed by this Phase00 packet. Extend manifest with actual created runtime files. Phase06 remains pending until executed checks; Phase07 only after Verified. API unchanged; Mobile new UI Excluded. Full Countries closure and hosted deployment remain outside bounded acceptance.
