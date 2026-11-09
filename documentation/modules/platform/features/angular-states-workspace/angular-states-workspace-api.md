# States complete Angular parity — api applied profile

Current 2026-11-08 presentation correction: Grid actions inherit the shared
responsive default, including disabled-menu semantics and an architecture guard.
[Source contract and executed evidence](SHARED_GRID_ACTIONS_2026-11-08.md). API/domain/Next/native
runtime is unchanged; new platform workflows are Excluded from this correction.
Historical inline-action receipts retain their original revision.

Current shared search/Chart correction: no overlapping projected criteria,
44px controls, compact widths and a growing query. Chart search is off by default.
[Current contract and acceptance](SHARED_COLLECTION_SEARCH_2026-11-08.md). API/domain/Next/native remain
unchanged; this is a Web presentation correction.

## 1. Ownership

Platform owns this Angular migration record; ReferenceData retains States business rules/persistence. Exact D42/S3-A9 scope and entry contract: documentation/plans/business/web-angular-migration/decomposition/angular-states-workspace.md.

## 2. Verified source

States now implements the complete authorized Angular workspace and canonical route, exact four-field editor/details/lifecycle, all five views and parent dependency. Current source and executed verification are in STATES_WORKSPACE_2026-11-06.md; STATE_FOUNDATION_2026-11-05.md remains a historical checkpoint. API/Next/native business implementations are retained.

## 3. Data contract

nameAr/nameEn printable2-100; code2-10 A-Z/0-9/hyphen uppercase; positive countryId. List adds districtsCount and embedded Country; detail never invents a count. Parent must be active for create/edit/restore.

## 4. Business rules

Global super_admin and exact States:View/Create/Edit/Archive/Restore. Parent lookup separately Countries:View. Read-only denies writes. Duplicates are within Country; archive dependencies and atomic batches enforced by server.

## 5. Platform decisions

Angular Grid/Cards/Detail/Chart/managed Report/Import Required; new native UI Excluded; existing Next/Mobile retained. ActiveReports/Tree/standalone Export Excluded by scope. No API/schema/dependency change.

## 6. Transport

Direct existing HTTPS API via HttpClient service only, cookies/CSRF and10s timeout; source server query limits and metadata validation. No API/BFF replacement, no retry of dispatched writes.

## 7. Shared composition

Reuse MyDataGrid/CardList/PageHeader/FormContainer/TextField/ReferenceField/DialogPanel/FeedbackState/confirmation, compact SpreadsheetImportPanel and chart/Reporting owner. Focused feature folders/external HTML/SCSS, Signal Forms Option B.

## 8. States and lifetime

Pending/empty/error/forbidden/background read, parent lookup readiness, details/edit dirty lifecycle, rejection/not-sent/uncertain. Actor-scoped cancel/mask stale data; existing UnsavedChanges and realtime foundation.

## 9. Authorization and consistency

Recheck direct actions, target activity, IDs/batch100. No invented concurrency token;409 duplicate is distinct. Atomic server batch, uncertain results lock replay and reconcile. No tenant/company authority from UI.

## 10. Localization and accessibility

Existing reference-states/core EN/AR and tokens. Keyboard/RTL/390/1440, accessible shared field errors and no browser dialogs. Catalog additions only canonical generator with PROD-019 host deployment boundary.

## 11. Implementation preflight

G0-G3 fixed in exact contract; phase00 request/readiness/source inventory authored. Initial canonical generation/check passed for468recipes and Check-Planning passed on2026-11-05 (two unrelated inherited contract migration warnings). Phase00 permits the frozen States runtime scope. This initial book records verified current source and requested Angular target, not completed runtime.

## 12. Verification

Phase06 **Verified**2026-11-06 for the complete authorized Angular client contract.
Full npm run check passed637tests/112files,30architecture/dependency checks,
format/lint/configuration/tokens/fonts/catalog/strict app+spec types and production
build. Initial574.50kB retains RISK-020; no new component-style budget warning.
Browser8full EN/AR/light/dark/390/1440 journeys cover all five views, CRUD/lifecycle,
parent/status/dependency criteria/reset/paging, invalid-field focus and dirty keep,
PDF fixture and mixed-validity import.14negative cases and8CountriesImport plus
24shell regressions pass. Independent source review has no remaining P1/P2.
Actual hosted read-only State page/parent/detail/filter checks pass; catalog200is
empty, and own session logout204. No real business writes or State RPT/PDF proof.
No native runtime/domain change; five-point UI audit covers creation/edit/view/
list+filters/dev mock on Angular, with native unchanged/Excluded for this migration.
STATES_WORKSPACE_2026-11-06.md and its receipt own exact scope/current source hashes.
Hosted publication/provider checks remain PROD-019/028/025, separate from this
client implementation. Phase07 may now document the verified customer workflow.

## 13. Operations and release

PROD-019 synchronized catalog deployment; PROD-028 Crystal provider integration; RISK-020 existing startup warning. These release-only checks do not change frozen business meaning. No database migration or API business change.

## 14. Education

Phase07 customer education completed after Phase06 Verified. The verified Arabic workflow guide is documentation/plans/business/web-angular-migration/education/angular-states-workspace.md; it covers permissions, all five views, parent selection, validation, dirty protection, archive/restore/bulk, import and uncertain outcomes. Empty hosted report catalog and production publication remain explicit.

## 15. Handoff

States complete authorized client implementation is Verified; canonical reconciliation and handoff close it before Districts activates under D42. Other Super Admin workflows and comprehensive final review remain Required. Current-only sources and bounded hosted/fixture distinctions are retained; this feature does not close the parent migration goal.
