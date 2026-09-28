# Fiscal Years Feature Full Review

## 1. Purpose and decision

Fiscal Years is a shared Finance foundation. It owns the company financial calendar
that future Workforce Plans, headcount budgets, Payroll, Attendance reporting,
position envelopes, staffing requests, and recruitment requisitions may reference.
Recruitment is deliberately downstream: it receives an approved staffing request
and does not create financial years, budgets, or planning demand.

This slice is implemented across API, Next.js, and Expo. The Countries feature is
the implementation reference for CQRS, controlled lists, shared form/list shells,
authorization, localization, realtime invalidation, and verification. Its global
ownership, optional-view count, import, bulk, report, and super-admin rules are
not copied.

## 2. Product boundary and operating model

The target operating chain is:

`Fiscal Year -> Workforce Plan -> Workforce Budget -> Position Envelope -> Staffing Request -> Recruitment Requisition -> Candidate Pipeline -> Offer -> Employee`

This release completes only the Fiscal Year and generated Fiscal Period part of
that chain. It improves on a recruitment-first workflow by placing Finance and HR
planning controls before Recruitment. Later slices must consume the published
calendar instead of adding another year/date source.

Ownership is tenant and current-company scoped. The authenticated actor supplies
both identifiers; API bodies and client forms never accept either identifier.

## 3. Domain contract

`FiscalYear` contains a normalized unique code, bilingual names, start/end dates,
period frequency, lifecycle status, optimistic RowVersion, audit data, soft archive
data, and generated `FiscalPeriod` children. A year covers exactly twelve months.

Exactly one non-archived year may be marked company `Current`; a new Current target
must be `Open`. Current remains a default context marker rather than a lifecycle
state, so an already-current year may later progress through Closing/Closed/Locked
until another Open year replaces it. Each user may keep a different working-year
selection per company. No selection, or a selection that later becomes unavailable,
falls back to company Current. Changing company Current never rewrites other users'
valid personal selections and the selection is not stored in an auth token.

Monthly frequency creates 12 consecutive periods; quarterly frequency creates 4.
Periods cover the complete range with no gaps or overlap and cannot be authored as
JSON or mutated independently. Draft updates reconcile children by sequence and
preserve matching period identities instead of replacing every row. Periods removed
by a frequency change remain soft-archived and can be restored by a later draft
update without creating duplicate codes. Domain methods own reconstruction and
lifecycle.

Lifecycle is `Draft -> Open -> Closing -> Closed -> Locked`, with controlled
exceptions `Closed -> Open` and `Locked -> Open` for an authorized reopen. Reopening also returns every
generated period to Open, preserves the audit history, and does not make the year
identity/calendar editable; Draft remains the only editable and archivable state.
Repeating an action already at its target is a no-op; skipped transitions fail.

## 4. API and persistence contract

The versioned surface is `/api/v1/fiscal-years` with page, lookup, detail, context,
create, update, archive, restore, open, begin-closing, close, lock, reopen, and Set
Current operations. All actions use MediatR commands/queries from a thin controller
and require `TenantMember` plus an exact feature permission. The context request
contains only `FiscalYearId`; actor user/company scope is server derived.

Writes run under one company-calendar resource lock and the Accounting-owned
`IAccountingUnitOfWork` transaction. The module-specific contract ensures the
handler, stores, and `AccountingDbContext` share the same scoped context even when
other ERP modules register the shared `IUnitOfWork`. Duplicate code includes
archived records. Overlap checks include all
active records and are repeated during restore so an old archived year cannot be
restored over a newer calendar. Update, archive, restore, and lifecycle operations use
RowVersion. Audit persistence is part of the transaction; Hangfire/realtime is
scheduled after commit only.

The Accounting migration `20260922091842_InitialAccounting` creates the `acc`
schema baseline. Applied migration `20260927132148_AddFiscalYearWorkingContext`
adds `FiscalYears.IsCurrent`, its filtered company-unique index, and the
company/user-unique `FiscalYearUserSelections` table with a composite scoped
foreign key. Applied data-cleanup migration
`20260927190043_EnforceOpenFiscalYearCurrentEligibility` clears legacy Draft
Current markers without clearing a legitimate Current year that progressed beyond
Open. Changing Current clears the previous row before setting the target
inside the same company lock and SQL transaction so the filtered unique index is
never transiently violated. Fiscal Year
permissions are assigned through the runtime system-role seeding path. HR's
`ApplicationDbContext` and `ErrorsService` do not own this feature.

## 5. Authorization and ownership

Permissions are `FiscalYears:View`, `FiscalYears:Create`, `FiscalYears:Edit`,
`FiscalYears:Archive`, `FiscalYears:Restore`, `FiscalYears:Open`,
`FiscalYears:BeginClosing`, `FiscalYears:Close`, `FiscalYears:Lock`, and
`FiscalYears:Reopen`, plus `FiscalYears:SetCurrent`. `FiscalYears:View` also allows
the caller to change only their own working-year preference. The server is authoritative;
clients repeat the rules for discoverability and fail closed when claims are absent.
Read-only subscription mode suppresses financial and company-Current mutations
while preserving reads and the caller's personal context preference.

Tenant/company query filters and ownership stamping are supplied by
`AccountingDbContext`. No route, DTO, query string, form, or mobile payload allows
a caller-selected tenant/company scope.

## 6. Web implementation

Route `/finance/ledger-setup/fiscal-years` is registered in typed routes, access policies, and
the Accounting Ledger Setup sidebar group. Fiscal Years is a child capability of
`acc:ledger-setup`, not a standalone Finance module entry. The feature boundary
owns contracts, service calls, React Query hooks, validation, list/card views,
form, and page orchestration.

The page uses shared `PageHeader`, `MyDataGrid`, grid toolbar/options, cards,
server pagination, feedback states, `MyForm`, shared fields, and confirmation
dialogs. Search field/operator, record status, lifecycle, sorting, and pagination
are server driven. Create/edit includes calculated end date and frequency; view
loads detail and renders generated periods. The shared Generate Mock Data action
is available on writable forms in hosted trials and development alike; it fills
only a local valid draft and never submits or fabricates scope/identity/concurrency
metadata.

The Accounting-owned `FiscalYearContextSwitcher` is injected by the app composition
root into generic full/compact Topbar slots. It displays the effective bilingual
working year and confirms unsaved-change discard before switching. The management
Grid/Cards/detail identify company Current with the shared gold/warning treatment,
independently gate Set Current, expose it only for an Open target, and do not offer
archive for the Current row. The API rejects non-Open assignment with
`FiscalYear.MustBeOpenForCurrent` without disturbing the existing Current year.

## 7. Mobile implementation

Expo route `/finance/ledger-setup/fiscal-years` is protected by `RouteGuard` and
registered under the Ledger Setup route group. The feature uses runtime Zod response schemas,
an API boundary, React Query keys/mutations, `useServerListState`, `AppListScreen`,
`AppDataTable`, `AppDataCard`, `AppFilterButton`, `AppForm`, shared fields,
status badges, toasts, and confirmation dialogs.

Table and Cards consume the same server page. The full-screen create/edit/view
workflow calculates the end date, selects frequency, hydrates detail for editing,
shows periods in view mode, and exposes the shared mock-data action. All colors and
selected states come from the active theme palette.

The same Accounting-owned selector is injected into the generic navigation-header
context provider at the Expo composition root, so nested module headers receive it
without Platform importing Accounting. Narrow phones use an icon trigger; the
modal shows bilingual years and the company Current marker. Table/Cards/detail
also show Current in gold/warning and independently gate Set Current to Open rows.

## 7A. UI Pattern contract

Fiscal Years management uses **P-001 Server-managed Grid/CRUD** from the canonical
`documentation/project/SCREEN_PATTERN_CATALOG.md` as its layout and interaction
pattern. P-001 does not require Countries' five views; each optional surface is
decided by this feature contract. Web requires Grid, Cards, and managed Report
views; Mobile requires Table, Cards, and managed Report views. Import, Export, and
Chart are Excluded on both platforms and have no route or control. The
create/edit/view experience is one compact sectioned shared form; P-003 tabs are
intentionally not applied. Generated periods are a read-only child preview/detail
and have no independent CRUD route. Loading,
background fetch, empty/no-results, error/retry, permission/read-only, validation,
dirty-exit, busy, and RowVersion conflict/reload states are part of the pattern
evidence on both platforms.

The global working-year surface uses **P-008 Global Scoped Context Selector**:
Web is `Implemented` through the shared `ContextSwitcher` and generic Topbar slots,
while Mobile is `Adapted` through the generic App-header action provider and shared
native modal/list primitives. Accounting retains the API, permission, personal
preference, fallback, localization, and invalidation rules on both platforms.

## 8. Lifecycle, integration, and UI audit

The API scheduler publishes resource `fiscal-years`; Web and Mobile map it to the
root Fiscal Year query key. Mutations invalidate the same family, while the
cross-feature lookup explicitly refetches on mount in both clients. This closes
the inactive-cache path in which a newly created year could be absent when the
user later entered Workforce Planning. Route and permission parity tests cover
visibility.

Closed rows expose both explicit Reopen and Lock actions, while Locked rows expose
Reopen, in Web Grid/Cards and Mobile Table/Cards. The confirmation explains the selected action;
the request uses the latest RowVersion and its exact action permission, and the successful
transaction records the previous status and `Open` before post-commit cache/realtime refresh.

Five-point audit:

1. Creation: bilingual fields, code, start date, calculated end date, frequency,
   field errors, focus-first-invalid, and mock data are available on both clients.
2. Editing: detail is loaded first, RowVersion is sent, and periods are regenerated
   by the domain without client-authored child payloads.
3. Viewing: read-only aggregate fields and period rows/cards are rendered.
4. Listing/filtering: code, names, dates, period count/frequency, lifecycle,
   Current, archive state, search, sort, and server paging appear in Grid/Table and Cards.
5. Mock data: both forms generate a valid next-year monthly fiscal calendar.

Global-context audit: Web Topbar and Mobile app header expose the same effective
year; switching is personal, company-scoped, bilingual, protected by dirty-state
confirmation, and falls back to company Current.

## 9. Verification evidence and known repository state

Step 01 revalidation is **Active — pending live authenticated verification**. The
automated checks below prove source contracts and focused behavior; they do not
mark this vertical slice `Verified` or authorize Step 02 Currency.

The executable user journey is
`documentation/plans/business/accounting-core-gl/manual-acceptance/FISCAL-YEARS-STEP-01.md`.
It covers full-access, view-only, denied, read-only and second-company identities;
Web and actual-device Mobile; bilingual data and EN/AR RTL/LTR; lifecycle,
reporting, validation, concurrency, offline behavior, UI-pattern parity and cleanup.
Only the user's explicit acceptance after completing that scenario authorizes
Phase 06 `Verified`, Step 01 closure, and activation of Step 02.

- API feature tests include domain/lifecycle generation, company isolation,
  Current uniqueness behavior, personal user/company isolation and fallback,
  Current archive rejection, archive RowVersion dispatch, non-deleted period-count
  projection, restore/idempotency, and controller CQRS/route contracts.
- The migration was applied to the configured development database and EF reported
  no pending model changes.
- Web feature lint, regular type-check, architecture, route/permission parity, and
  realtime tests pass.
- Mobile feature lint, type-check, architecture, route, API/validation, realtime,
  and Expo 57 Android export pass.
- The full Web strict gate has three inherited errors in Organizational Structure
  and Basic Data files outside this slice.
- The full Mobile lint gate currently has inherited React Compiler memoization
  findings in `LedgerSetupResourceScreen`; all files changed for the Fiscal Year
  context pass focused lint. Fiscal Years checks are clean.
- Full solution build remains blocked by the legacy CrystalReportGeneratorApi
  dependency on missing Visual Studio WebApplication targets; the runtime API
  project itself builds.

## 10. Handoff and next slices

Fiscal Years remains pending the Step 01 live API-backed Web/Mobile journey. Fiscal
Year Report is Required on Web and Mobile through the shared managed
Crystal catalog/render contract and the Accounting-owned `fiscalyears` dataset;
it remains company-scoped and uses tenant Reporting entitlement. Import, Export,
and charts are Excluded from this feature on both platforms; no placeholder UI,
transport, or future Workforce Budget dependency is recorded here. Reopen is a
Required single-record lifecycle action on API, Web, and Mobile.

The implementation agent sends the detailed scenario and any versioned retest;
the user runs or supervises it and supplies the transition decision. A partial run,
an unavailable environment, or a rejected case keeps Fiscal Years Active and does
not advance the roadmap.

After explicit Step 01 acceptance and documentation closure, the next Accounting
step is Currency (`1A`), followed by COA & Hierarchy (`1B`). Dimensions and the
remaining Ledger Setup children stay queued behind that dependency order. No later
child may become Active merely because broad compatibility source already exists.

The 2026-09-27 Current-eligibility rerun passed 33 focused API tests, 11 focused
Web lifecycle-policy tests, and 8 focused Mobile calendar-policy tests, plus Mobile
type-check and focused Web/Mobile feature lint. The repository-wide Web type-check
is currently blocked by an unrelated missing-props error in
`CrystalReportManagerPage`; earlier context verification passed the Web/Mobile
architecture and contract gates. Migrations
`20260927132148_AddFiscalYearWorkingContext` and
`20260927190043_EnforceOpenFiscalYearCurrentEligibility` were applied to the
configured development database and EF reported no pending Accounting model changes. These
results qualify the revised feature for manual execution but do not replace
authenticated Web and actual-device Mobile acceptance.
