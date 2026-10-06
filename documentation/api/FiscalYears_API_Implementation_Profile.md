# Fiscal Years API Implementation Profile

## 1. Scope and ownership

Fiscal Years is a Finance-owned, tenant/current-company aggregate. It is the only
financial calendar source for future workforce planning. `ICurrentActor` supplies
scope and handlers reject missing company context.

## 2. Domain model

`FiscalYear` owns `FiscalPeriod`. It validates an exact twelve-month interval,
normalizes the code, generates 12 monthly or 4 quarterly children, and protects
Draft/Open/Closing/Closed/Locked transitions plus controlled Closed-to-Open and
Locked-to-Open reopen transitions. Period mutation is internal.

`IsCurrent` is the company default calendar marker, not a lifecycle state, but a
year may be newly assigned as Current only while its lifecycle status is `Open`.
Once assigned, it may continue through Closing/Closed/Locked until another Open
year replaces it. At most one active year is Current per tenant/company.
`FiscalYearUserSelection` stores an optional
per-user working-year override inside that same company; it is not an authentication
claim and is never added to access tokens.

## 3. Persistence model

`FiscalYears` and `FiscalPeriods` use tenant/company composite alternate keys and
foreign keys. Code is unique for the company including archived rows. Period code
and year/sequence are unique. Date and active-state indexes support overlap/list
queries. RowVersion provides optimistic concurrency.

`FiscalYearUserSelections` is company scoped, unique by
`TenantId + CompanyId + UserId`, and uses a composite optional foreign key to the
selected Fiscal Year. A filtered unique index on active `FiscalYears.IsCurrent`
enforces the single company Current invariant in SQL as well as in the command
lock.

## 4. Read contract

Page query accepts one-based page/pageSize, optional search, exact search field and
operator allow-lists, record/lifecycle status, sort column, and direction. Default
ordering is StartDate descending then Id descending. Detail includes ordered
periods; lookup returns eligible non-archived/non-locked years. `GET /context`
returns the company Current year, the signed-in user's effective working year,
whether that value is a personal override, and all selectable non-archived years.
If the stored override is absent, archived, or missing, the effective selection
falls back to company Current.

## 5. Write contract

Create and update accept code, bilingual names, ISO dates, and numeric frequency.
Update and archive add a required Base64 RowVersion. Restore/lifecycle accept only
RowVersion; route owns ID. TenantId and CompanyId are never request fields. An
already archived year remains an idempotent archive success, but an active archive
must still compare the supplied RowVersion.

`POST /{id}/set-current` changes the company default under RowVersion and the exact
`FiscalYears:SetCurrent` permission. A non-current target must be `Open`; Draft,
Closing, Closed, Locked, and archived targets are rejected without clearing the
existing Current year. Repeating the command for the already-current row is
idempotent even if that row has subsequently progressed beyond Open. `PUT /context` accepts only a nullable
`FiscalYearId`; it derives the user and company from the trusted actor and requires
only `FiscalYears:View`. Selecting the same year as company Current clears the
personal override so that the user follows future Current changes. The personal
preference endpoint is explicitly allowed during tenant read-only mode because it
does not mutate financial master data; company Current remains blocked there.

Update reconciles generated periods by sequence. Matching periods retain their
database identity; only surplus periods are soft-archived and only missing periods
are added. A matching archived period is restored in place. This avoids transient
unique-index collisions on period code/sequence during a normal draft edit.

## 6. Lifecycle and invariants

Create starts Draft. Only Draft can update/archive. Restore accepts archived Draft
and rechecks active date overlap. Open, begin-closing, close, and lock are ordered.
Reopen accepts Closed or Locked and returns the aggregate and every active generated
period to Open without making calendar fields editable.
Target-state repeats are idempotent and do not create audit/realtime noise.
Current is not a lifecycle state. A Current year cannot be archived until another
year is made Current; changing Current does not rewrite or clear other users'
personal overrides.

## 7. Transactions, locks, and audit

Every mutation executes atomically under `FiscalYearLocks.CompanyCalendar`.
Domain/persistence changes and `EntityChangeLog` commit once. Update audit records
changed fields; lifecycle records status. Scheduler invocation occurs only after a
successful commit and sends resource `fiscal-years`. Fiscal Year handlers depend on
the Accounting-owned `IAccountingUnitOfWork`, which resolves to the same scoped
`AccountingDbContext` used by the read/write stores. This prevents another module's
shared `IUnitOfWork` registration from intercepting Accounting commits.
Personal selection writes use a narrower tenant/company/user lock so two users can
change their own working context independently without serializing the company
calendar.

## 8. HTTP surface and permissions

`FiscalYearsController` is a thin MediatR controller under API v1 and
`TenantMember`. `FiscalYears:View` protects list/lookup/detail/context and permits
updating only the caller's personal context. Create, Edit, Archive, Restore, Open,
BeginClosing, Close, Lock, Reopen, and SetCurrent each protect exactly their own
endpoint; there is no `Manage` or shared lifecycle authorization shortcut.

## 9. Errors and localization

Stable errors cover not found, duplicate code, overlap, invalid transition,
not-editable, not-archivable, not-restorable, non-Open Current assignment through
`FiscalYear.MustBeOpenForCurrent`, Current-year archive rejection,
invalid personal selection, missing company/user context, validation, and
concurrency conflict. English and Arabic resources contain user-facing text.

## 10. Verification

Domain tests cover monthly/quarterly generation, reopen/re-close, lifecycle, immutability, exact
duration, period identity preservation, and archived-period restoration. Controller
tests cover every CQRS dispatch, the explicit kebab-case route
`api/v{version:apiVersion}/fiscal-years`, permission, TenantMember, and success
status. The explicit route prevents the conventional `[controller]` token from
silently exposing `/api/v1/FiscalYears` while clients request
`/api/v1/fiscal-years`. The API suite, API build, migration apply, localization
JSON, and pending-model check are mandatory release evidence.
`AccountingUnitOfWorkRegistrationTests` composes competing shared unit-of-work
registrations both before and after Accounting and verifies that create persists the
year and all generated periods through Accounting before scheduling the change.

These checks are readiness evidence for the manual acceptance gate, not customer
acceptance. Before Phase 06 can record `Verified`, the API must support the live
authenticated and company-scoped cases in
`documentation/plans/business/accounting-core-gl/manual-acceptance/FISCAL-YEARS-STEP-01.md`:
valid lifecycle, bilingual data, duplicate/overlap/duration failures, permissions,
read-only mode, company Current, per-user/per-company working-year isolation,
second-company isolation, stale RowVersion conflict, report scope, and post-commit
refresh. The user's explicit acceptance is required after the Web
and actual-device journey; no API-only pass advances Currency.

## 11. Reporting, persistence, and deferred integration

Fiscal Period has no independent mutation route. `FiscalYearsController` has no
report endpoint: the Reporting module/catalog owns managed Crystal rendering over
Accounting's public `fiscalyears` dataset and applies the Reporting entitlement.
Persistence belongs to `AccountingDbContext` in schema `acc`, with the
`20260922091842_InitialAccounting` baseline plus applied migrations
`20260927132148_AddFiscalYearWorkingContext` and
`20260927190043_EnforceOpenFiscalYearCurrentEligibility`; the latter clears only
legacy Draft Current markers and deliberately preserves a Current year that has
legitimately progressed beyond Open. HR's `ApplicationDbContext` and
`ErrorsService` are not feature dependencies. Import/export remain unpublished in
this release. Workforce Plans and Budgets must reference FiscalYearId through
server-enforced company scope and lifecycle eligibility.
