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
ownership, import, bulk, report, and super-admin rules are not copied.

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

The versioned surface is `/api/v1/fiscal-years` with page, lookup, detail, create,
update, archive, restore, open, begin-closing, close, lock, and reopen operations. All
actions use MediatR commands/queries from a thin controller and require
`TenantMember` plus a feature permission.

Writes run under one company-calendar resource lock and the Accounting-owned
`IAccountingUnitOfWork` transaction. The module-specific contract ensures the
handler, stores, and `AccountingDbContext` share the same scoped context even when
other ERP modules register the shared `IUnitOfWork`. Duplicate code includes
archived records. Overlap checks include all
active records and are repeated during restore so an old archived year cannot be
restored over a newer calendar. Update, restore, and lifecycle operations use
RowVersion. Audit persistence is part of the transaction; Hangfire/realtime is
scheduled after commit only.

The consolidated EF baseline migration `20260906112413_create-database` creates
`FiscalYears` and `FiscalPeriods`, composite tenant/company relationships,
unique code/sequence indexes, and RowVersion columns. Fiscal Year permissions
are assigned through the runtime system-role seeding path.

## 5. Authorization and ownership

Permissions are `FiscalYears:View`, `FiscalYears:Create`, `FiscalYears:Edit`,
`FiscalYears:Delete`, and `FiscalYears:ManageLifecycle`. The server is authoritative;
clients repeat the rules for discoverability and fail closed when claims are absent.
Read-only subscription mode suppresses every mutation while preserving view access.

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
loads detail and renders generated periods. Development builds expose shared
Generate Mock Data.

## 7. Mobile implementation

Expo route `/finance/ledger-setup/fiscal-years` is protected by `RouteGuard` and
registered under the Ledger Setup route group. The feature uses runtime Zod response schemas,
an API boundary, React Query keys/mutations, `useServerListState`, `AppListScreen`,
`AppDataTable`, `AppDataCard`, `AppFilterButton`, `AppForm`, shared fields,
status badges, toasts, and confirmation dialogs.

Table and Cards consume the same server page. The full-screen create/edit/view
workflow calculates the end date, selects frequency, hydrates detail for editing,
shows periods in view mode, and exposes development mock data. All colors and
selected states come from the active theme palette.

## 8. Lifecycle, integration, and UI audit

The API scheduler publishes resource `fiscal-years`; Web and Mobile map it to the
root Fiscal Year query key. Mutations invalidate the same family, while the
cross-feature lookup explicitly refetches on mount in both clients. This closes
the inactive-cache path in which a newly created year could be absent when the
user later entered Workforce Planning. Route and permission parity tests cover
visibility.

Closed rows expose both explicit Reopen and Lock actions, while Locked rows expose
Reopen, in Web Grid/Cards and Mobile Table/Cards. The confirmation explains the selected action;
the request uses the latest RowVersion and `ManageLifecycle`, and the successful
transaction records the previous status and `Open` before post-commit cache/realtime refresh.

Five-point audit:

1. Creation: bilingual fields, code, start date, calculated end date, frequency,
   field errors, focus-first-invalid, and mock data are available on both clients.
2. Editing: detail is loaded first, RowVersion is sent, and periods are regenerated
   by the domain without client-authored child payloads.
3. Viewing: read-only aggregate fields and period rows/cards are rendered.
4. Listing/filtering: code, names, dates, period count/frequency, lifecycle,
   archive state, search, sort, and server paging appear in Grid/Table and Cards.
5. Mock data: both forms generate a valid next-year monthly fiscal calendar.

## 9. Verification evidence and known repository state

- API feature tests include domain/lifecycle generation, company isolation,
  restore/idempotency, and controller CQRS/route contracts; the full API suite
  passed 407 tests at reconciliation.
- The migration was applied to the configured development database and EF reported
  no pending model changes.
- Web feature lint, regular type-check, architecture, route/permission parity, and
  realtime tests pass.
- Mobile feature lint, type-check, architecture, route, API/validation, realtime,
  and Expo 57 Android export pass.
- The full Web strict gate has three inherited errors in Organizational Structure
  and Basic Data files outside this slice.
- The full Mobile lint gate has an inherited React Hooks error in Recruitment's
  `InterviewEvaluationModal`; the full test run also has inherited Recruitment
  translation debt and a shared tree timeout. Fiscal Years checks are clean.
- Full solution build remains blocked by the legacy CrystalReportGeneratorApi
  dependency on missing Visual Studio WebApplication targets; the runtime API
  project itself builds.

## 10. Handoff and next slices

Fiscal Years is releasable after an authenticated manual smoke test in both
clients. Fiscal Year Report is Required on Web and Mobile through the shared managed
Crystal catalog/render contract and the Accounting-owned `fiscalyears` dataset;
it remains company-scoped and uses tenant Reporting entitlement. Import is
Deferred until the Workforce Budget dataset is defined; charts and bulk lifecycle
are Excluded. Reopen is a Required single-record lifecycle action on API, Web, and
Mobile. No placeholder UI exists for deferred capabilities.

The next implementation slice is Workforce Plans and Workforce Budgets, followed
by Position Envelopes and Staffing Requests. Only after approval and reservation
of a staffing request should Recruitment create/manage a requisition. The eventual
Offer-to-Employee conversion must preserve the originating plan, envelope, request,
and requisition trace.
