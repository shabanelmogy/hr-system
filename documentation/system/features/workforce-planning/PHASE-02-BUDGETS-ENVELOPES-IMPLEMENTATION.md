# Phase 2 Execution Contract — Workforce Budgets and Position Envelopes

Status: Approved for delegated source implementation. Database completion remains
user-owned because the user explicitly prohibited agents from creating or applying
EF migrations.

## 1. Objective

Implement Phase 2 of the frozen Workforce Planning chain end to end:

`Approved WorkforcePlan -> WorkforceBudget -> automatic PositionEnvelope`

This phase owns budget authoring, budget lifecycle, exact period/category
reconciliation, atomic budget activation, automatic envelope materialization,
read-only envelope capacity views, and complete Web/Mobile parity. It must not
implement Staffing Requests, Envelope Amendments, Recruitment linkage, Offer
governance, Hire, Trace, or Plan-versus-Commitment.

## 2. Current-state evidence and preconditions

- Phase 1 source exists in Domain, Application, Infrastructure, API, Web, and
  Mobile. Reuse its patterns and public feature APIs.
- Current EF evidence on 2026-09-06:
  - `dotnet ef migrations list ... --no-build` returns the applied consolidated
    migration `20260906112413_create-database`.
  - `dotnet ef migrations has-pending-model-changes ... --no-build` reports no
    model changes before Phase 2 starts.
- Old documentation mentioning `modifyPahse01`,
  `RepairWorkforcePlanLinesLegacySchema`, or a pending
  `FixWorkforcePlanningPhase1Integrity` migration is stale after the database was
  recreated. Correct authored Workforce Planning documentation during handoff;
  do not recreate those historical migrations.
- The consolidated baseline
  `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Migrations/20260906112413_create-database.cs`
  resolves the former Addresses migration reference and contains the global
  geography transition. Workforce-scoped generation and its check pass; a global
  documentation check may still report a stale organizational-structure packet.
- Preserve every pre-existing dirty worktree change. Never reset, checkout,
  overwrite, stage, or commit user work. Inspect diffs before editing overlapping
  files, especially Workforce Plan commands/errors, Web DataGrid, translations,
  and `web-next/tsconfig.tsbuildinfo`.

## 3. Non-negotiable architecture rules

- No `IWorkforcePlanningService`, budget service facade, generic CRUD service, or
  controller access to `ApplicationDbContext`.
- Each write is a typed MediatR `ICommand` with a co-located FluentValidation
  validator and handler. Each read is a typed `IQuery` backed by a dedicated
  `AsNoTracking()` projection store.
- Controllers inject `ISender` only and remain tenant-member boundaries.
- Application must not reference EF Core or Infrastructure.
- TenantId and CompanyId come only from `ICurrentActor`; neither is accepted from
  Web/Mobile payloads.
- Cross-aggregate coordination occurs in command handlers. Do not pass aggregate
  entities into other aggregates.
- Use `TimeProvider`; never use `DateTime.UtcNow` inside Domain.
- Every mutation carries a Base64 RowVersion except create. Apply the original
  RowVersion before saving and map optimistic concurrency to a stable 409 error.
- Use `IUnitOfWork.ExecuteAtomicallyAsync` and deterministic Workforce Planning
  company locks. Budget approval, plan activation/supersession, budget
  supersession, and generation of all envelopes must use one transaction and one
  `SaveChangesAsync` call.
- Dispatch realtime invalidation only after commit. A dispatch failure is logged
  and must not make a committed command retryable.
- Never use `Math.Max(0, ...)`, silent clamping, floating-point money, client
  totals, or client-derived organization identities.
- Web components never call `apiService` directly. Calls live in feature services;
  React Query hooks own keys/caching/mutations.
- Web forms must use `MyForm`, `MyTextField`, `MySelect`, React Hook Form,
  `zodResolver`, shared error mapping, enabled primary submit, per-field errors,
  and first-invalid-field focus. No native alert/confirm/browser validation.
- Mobile must use the existing shared `AppListScreen`, list/table/card/form,
  filter, feedback, confirmation, and authorization primitives.
- Add every visible string in English and Arabic and preserve inherited RTL.
- Do not create a Migration and do not run `database update`. The final status is
  `Source Complete / Database Pending` until the user creates and applies the
  migration.

## 4. Frozen domain model

### 4.1 WorkforceBudgetStatus

Numeric values are fixed:

```text
Draft = 1
Submitted = 2
Approved = 3
Rejected = 4
Superseded = 5
Closed = 6
```

Allowed Phase 2 transitions:

```text
Draft -> Submitted
Rejected -> Submitted
Submitted -> Approved
Submitted -> Rejected
Approved -> Superseded (system action during activation of a newer pair)
```

`Closed` is reserved for later Fiscal Year integration and has no public Phase 2
action. Draft and Rejected budgets are editable. Approved, Superseded, and Closed
budgets are immutable.

### 4.2 WorkforceBudget aggregate

Persist and expose:

- `Id`
- `BudgetCode` — required, trimmed, uppercase, max 50, immutable after create.
- `WorkforcePlanId` — required and immutable; references exactly one approved,
  non-deleted plan revision.
- `FiscalYearId` — copied from the plan on the server; never client-writable.
- `RevisionNumber` — copied from the referenced plan revision; never client-writable.
- `CurrencyCode` — required ISO-style three uppercase letters; editable only while
  Draft/Rejected and immutable after submission.
- `CalculationPolicyVersion` — server value `2026-09-V1`, immutable.
- `Status` with the fixed values above.
- `SubmittedOn`, `SubmittedById`, `ApprovedOn`, `ApprovedById`, `RejectedOn`,
  `RejectedById`, `DecisionReason`, `ActivatedOn`, `SupersededOn`.
- Derived, non-writable totals: `TotalAuthorizedHeadcount`, `TotalSalaryBudget`,
  `TotalRecruitmentBudget`, `GrandTotalBudget`.
- Audit fields and `RowVersion` inherited from the common audited entity model.

Do not add Training or Other header totals in V1. There is no authoritative money
without line and period allocation.

### 4.3 WorkforceBudgetLine child

Each Budget must contain exactly one line for every active line in its referenced
Workforce Plan. Omitting plan lines, adding foreign plan lines, or duplicating a
plan line is rejected. An unfunded planned line remains present with zero
authorization and zero money.

Persist and expose:

- `WorkforceBudgetId`
- `WorkforcePlanLineId`
- server-copied snapshots: `PositionId`, nullable `BranchId`, `DepartmentId`,
  `DivisionId`
- `AuthorizedHeadcount` — integer, non-negative, not greater than the plan line's
  `PlannedHiringSlots`
- `AllocatedSalaryBudget` — `decimal(18,2)`, non-negative
- `AllocatedRecruitmentBudget` — `decimal(18,2)`, non-negative
- derived `TotalAllocatedBudget`
- child `PeriodAllocations`

The request supplies only `WorkforcePlanLineId`, authorization, money, and period
allocations. Position/Branch/Department/Division are always resolved and copied by
the server.

### 4.4 WorkforceBudgetPeriodAllocation child

Persist and expose:

- `WorkforceBudgetLineId`
- `FiscalPeriodId`
- `TargetHeadcount` — integer, non-negative
- `AllocatedSalaryCost` — `decimal(18,2)`, non-negative
- `AllocatedRecruitmentCost` — `decimal(18,2)`, non-negative

Rules per Budget line:

- Every Fiscal Period belongs to the Budget Fiscal Year.
- A period appears at most once.
- `sum(TargetHeadcount) == AuthorizedHeadcount`.
- `sum(AllocatedSalaryCost) == AllocatedSalaryBudget` exactly after decimal(18,2)
  normalization.
- `sum(AllocatedRecruitmentCost) == AllocatedRecruitmentBudget` exactly.
- A period's TargetHeadcount cannot exceed that plan line period's
  `NewHireSlots + ReplacementSlots`.
- No requested or derived value can be negative.
- Required categories are explicit non-null values, even when the valid amount is
  zero.

### 4.5 PositionEnvelope

The system creates one and only one envelope for each approved Budget line. There
is no public create, edit, delete, archive, restore, or import endpoint/UI.

Persist and expose:

- `EnvelopeCode` — deterministic and unique per company; derive from BudgetCode
  and persisted BudgetLine identity so approval retries cannot create a different
  code.
- `WorkforceBudgetId`, unique `WorkforceBudgetLineId`
- `WorkforcePlanId`, `WorkforcePlanLineId`, `FiscalYearId`
- copied snapshots: `PositionId`, nullable `BranchId`, `DepartmentId`, `DivisionId`
- `CurrencyCode`, `CalculationPolicyVersion`
- `AuthorizedHeadcount`, initial `ReservedHeadcount=0`, initial `HiredHeadcount=0`
- derived `AvailableHeadcount = AuthorizedHeadcount - ReservedHeadcount - HiredHeadcount`
- `AuthorizedSalaryBudget`, initial `ReservedSalaryBudget=0`, initial
  `ContractedSalaryBudget=0`
- derived `AvailableSalaryBudget = AuthorizedSalaryBudget - ReservedSalaryBudget - ContractedSalaryBudget`
- audit fields and RowVersion

Derived capacity must throw a stable Domain exception if persisted state would
make it negative. Do not clamp. Phase 3 will own reservation/release operations;
Phase 2 must not expose premature reservation commands.

## 5. Aggregate and activation invariants

- Budget create/update is allowed only while its Fiscal Year is Draft or Open.
- Budget submit/approve/reject and activation require Fiscal Year Open.
- Budget references a Workforce Plan with the same tenant/company, not deleted,
  Status `Approved`, and the same Fiscal Year.
- At most one Budget exists for a Plan revision. Enforce with a company-scoped
  unique index.
- BudgetCode is unique per tenant/company/FiscalYear.
- `Approved` is not automatically effective until the approval transaction
  activates the Budget and its Plan together.
- Approval must atomically:
  1. reload Budget, all lines/allocations, Plan/all lines/targets, Fiscal Year,
     and any currently effective Budget/Plan after acquiring the company lock;
  2. apply RowVersion and revalidate status, Open year, relationship ownership,
     full line coverage, ceilings, and exact period/category reconciliation;
  3. supersede the previous effective Budget and Plan for that company/year when
     they are a different pair;
  4. mark the submitted Budget Approved and activated;
  5. activate the referenced approved Plan;
  6. materialize exactly one PositionEnvelope for every Budget line using copied
     identities and zero usage counters;
  7. save the whole transition once and commit once.
- Any validation, uniqueness, concurrency, or envelope creation failure rolls the
  entire approval back. No partially generated envelopes or half-activated pair
  may remain.
- Enforce database uniqueness for one effective Budget per company/FiscalYear and
  one envelope per BudgetLine. Keep the existing one-effective-Plan constraint.

## 6. Application contracts and CQRS

Add typed list/detail/mutation contracts. JSON is camelCase and does not include
TenantId or CompanyId.

Required commands and validators:

- `CreateWorkforceBudgetCommand`
- `UpdateWorkforceBudgetCommand`
- `SubmitWorkforceBudgetCommand`
- `ApproveWorkforceBudgetCommand`
- `RejectWorkforceBudgetCommand`

Create request:

```json
{
  "budgetCode": "WB-2027-001",
  "workforcePlanId": 42,
  "currencyCode": "EGP",
  "lines": [
    {
      "workforcePlanLineId": 4201,
      "authorizedHeadcount": 3,
      "allocatedSalaryBudget": 720000.00,
      "allocatedRecruitmentBudget": 45000.00,
      "periodAllocations": [
        {
          "fiscalPeriodId": 101,
          "targetHeadcount": 1,
          "allocatedSalaryCost": 240000.00,
          "allocatedRecruitmentCost": 15000.00
        }
      ]
    }
  ]
}
```

Update keeps BudgetCode, Plan, FiscalYear, and revision immutable; it accepts
`currencyCode`, `lines`, and `rowVersion`. Lifecycle action bodies accept
`rowVersion`; reject also accepts required `reason` max 2000.

Required queries:

- `GetWorkforceBudgetsQuery` — server page, search, Status, FiscalYearId, PlanId,
  sort and direction.
- `GetWorkforceBudgetByIdQuery` — full nested detail.
- `GetBudgetSourcePlansQuery` — bounded searchable lookup of Approved,
  non-deleted Plan revisions eligible for budgeting.
- `GetBudgetSourcePlanByIdQuery` — plan lines, period targets, Fiscal Year periods,
  and display snapshots needed to build the allocation UI without client guesses.
- `GetPositionEnvelopesQuery` — server page with search and FiscalYear, Budget,
  Plan, Branch, Department, Position, and current/historical filters.
- `GetPositionEnvelopeByIdQuery` — full lineage and capacity detail.

Query projections use `AsNoTracking`, bounded page sizes, allow-listed sort
fields, no N+1 loading, active company scope, and stable not-found errors.

Suggested source ownership:

- `Contracts/WorkforceBudgetContracts.cs`
- `Commands/WorkforceBudgetCommands.cs`
- `Queries/WorkforceBudgetQueries.cs`
- `Abstractions/IWorkforceBudgetStores.cs`
- `Errors/WorkforceBudgetErrors.cs`
- Infrastructure `Features/WorkforcePlanning/Persistence/WorkforceBudgetStores.cs`

Follow the current Phase 1 layout if naming needs minor adaptation. Do not place
EF types in Application.

## 7. Persistence model (source only; no migration)

Add DbSets and configurations for:

- `WorkforceBudgets`
- `WorkforceBudgetLines`
- `WorkforceBudgetPeriodAllocations`
- `PositionEnvelopes`

Required relationship rules:

- All keys and relationships are tenant/company composite and fail closed.
- Plan, Fiscal Year, Fiscal Period, Position, Branch, Department, and Division
  delete behavior is Restrict.
- Budget owns lines and line owns allocations with Cascade.
- Budget-to-Plan is Restrict.
- Envelope-to-Budget and Envelope-to-BudgetLine are Restrict; envelopes are not
  manually cascade-deleted historical capacity.
- Money is SQL `decimal(18,2)`.
- All lifecycle enums use integer conversion.
- Common audited configuration supplies RowVersion.
- Unique indexes cover Budget code/year, one Budget per Plan revision, one
  effective Budget per company/FiscalYear, one allocation per line/period, one
  Envelope per BudgetLine, and EnvelopeCode per company.

Expected user-owned migration name after source review:
`AddWorkforceBudgetsAndPositionEnvelopes`.

The implementing agent must stop before migration generation and report the exact
model delta and command the user can run.

## 8. API surface

Add thin controllers:

```text
GET    /api/v1/workforce-planning/budgets
GET    /api/v1/workforce-planning/budgets/{id}
POST   /api/v1/workforce-planning/budgets
PUT    /api/v1/workforce-planning/budgets/{id}
POST   /api/v1/workforce-planning/budgets/{id}/submit
POST   /api/v1/workforce-planning/budgets/{id}/approve
POST   /api/v1/workforce-planning/budgets/{id}/reject
GET    /api/v1/workforce-planning/budgets/source-plans
GET    /api/v1/workforce-planning/budgets/source-plans/{planId}

GET    /api/v1/workforce-planning/position-envelopes
GET    /api/v1/workforce-planning/position-envelopes/{id}
```

Permissions:

- Budget page/detail/source reads: `WorkforceBudgets:View`
- Budget create/update/submit/review paths: `WorkforceBudgets:Create`, `WorkforceBudgets:Edit`, `WorkforceBudgets:Submit`, and `WorkforceBudgets:Review` respectively
- Budget approve: built-in `admin` role only for Phase 2
- Envelope page/detail: `PositionEnvelopes:View`

Use the already-frozen permission constants in API, Web, and Mobile for all
permission-gated actions. The approval endpoint and both approval controls must
check the built-in `admin` role directly. A delegable
`WorkforceBudgets:Approve` permission is Deferred and must not be exposed or
seeded in Phase 2. Keep normal permission reconciliation on the existing
`GetTenantPermissions()` path; do not add one-off role seeding.

Successful mutations return the updated detail contract. Create returns 201;
list/detail return 200. Stable ProblemDetails and localized codes are required for
not found, duplicate code/plan, invalid transition, Fiscal Year state, Plan state,
relationship mismatch, incomplete/duplicate lines, period mismatch, ceiling
breach, category total mismatch, concurrency, and atomic generation failure.

Add controller contract tests proving exact route, permission, `TenantMember`,
and `ISender`-only construction.

## 9. Web implementation

Routes:

- `/workforce-planning/budgets`
- `/workforce-planning/position-envelopes`

Keep `/workforce-planning/plans` unchanged. Register typed `appRoutes`, route
access, API routes, realtime invalidation resources, and English/Arabic navigation
text. Workforce Planning is now a standalone permission-aware module with a root
overview and shared module layout; Finance contains Fiscal Years only. The module
root is visible for any Workforce Planning view permission, while each child route
continues to require its exact view permission.

### 9.1 Budget list

- Shared PageHeader, server `MyDataGrid`, responsive cards, shared pagination,
  loading/background refresh/error/empty/no-results states.
- Search and filters: Status, Fiscal Year, Plan. First unfiltered option is
  localized `common.all`.
- Grid and Cards show BudgetCode, Plan, Fiscal Year, revision, Currency, Status,
  authorized headcount, salary, recruitment, grand total, activation/effective
  state, and permission/status-aware actions.
- Actions: Create, View, Edit for Draft/Rejected, Submit for Draft/Rejected,
  Approve/Reject for Submitted. No unsupported delete/archive action.
- Render lifecycle badges vertically centered in both Grid and Cards.

### 9.2 Budget form

- Use shared form-dialog system and a feature-owned structured allocation editor.
- Create selects an eligible approved Plan and loads source detail. BudgetCode and
  Plan are immutable after creation. Currency becomes immutable after submission.
- Render exactly one non-removable Budget line per Plan line. Show server-owned
  Position/Branch/Department/Division and planned new/replacement/total ceilings
  read-only.
- For each line expose AuthorizedHeadcount, Salary budget, Recruitment budget,
  and a dedicated Period Allocation repeater/table with headcount, salary, and
  recruitment inputs. Never ask for JSON.
- Display live client-side category sums/differences as guidance, but server values
  remain authoritative.
- Preserve all nested allocations during edit and view. Apply API field errors to
  exact nested paths and focus the first invalid field.
- Development-only mock data must choose a real eligible Plan and its real Fiscal
  Period IDs, remain within every plan/period ceiling, distribute amounts exactly,
  and never enable itself before dependencies are loaded.

### 9.3 Position Envelope views

- Read-only Grid and Cards with filters listed in the API contract.
- Show headcount Authorized/Reserved/Hired/Available and salary
  Authorized/Reserved/Contracted/Available using accessible labels and visual
  progress indicators. This is capacity presentation, not the Excluded chart
  mode.
- Detail view shows full lineage: Fiscal Year -> Plan -> Budget -> Budget Line ->
  Envelope plus organization snapshots and policy/currency.
- Provide no manual mutation affordance.

## 10. Mobile implementation

Extend the current Workforce Planning route using shared navigation/segmented
controls so users can reach Plans, Budgets, and Position Envelopes without losing
the existing Plan journey.

- Budget list/table/cards, server search/filter/paging, create/edit/view form,
  lifecycle confirmations, nested allocation builder, exact totals, mock data,
  permissions, read-only mode, errors, EN/AR, and RTL must match Web capability.
- Envelope cards/table and detail show the same numerical and financial capacity
  with native accessible progress indicators and no mutation action.
- Add runtime Zod schemas at the API boundary; parse responses from `unknown`.
- Add API modules, endpoint constants, React Query keys/hooks, service boundary,
  route permissions, navigation visibility, realtime invalidation, and tests.
- Do not replace the current plan screen with raw primitives or lose any Phase 1
  capability.

## 11. Realtime, localization, and permission behavior

- Resource keys: `workforce-budgets` and `position-envelopes`.
- Budget mutation invalidates Budget pages/details/source-plan lookups. Approval
  also invalidates Position Envelopes and Workforce Plans because activation and
  supersession may change them.
- API broadcasts are scoped to company and the matching View permission.
- Add every API message to `en-US.json` and `ar-EG.json` and every Web/Mobile
  string to the existing English/Arabic locale owners.
- New permissions must appear automatically in the built-in admin role after API
  startup through idempotent system-role reconciliation. A new login is required
  to receive updated token claims.

## 12. Required automated evidence

### API/Domain

- Budget constructor/editability/lifecycle and fixed enum values.
- Create requires an approved same-company Plan and Draft/Open year.
- Submit/approve/reject require Open year and valid transitions.
- Full exact Plan-line coverage and duplicate/foreign-line rejection.
- AuthorizedHeadcount ceiling against PlannedHiringSlots.
- Duplicate/foreign period rejection and period headcount ceiling.
- Exact headcount, salary, and recruitment reconciliation independently.
- Derived totals cannot be client-controlled.
- Approval creates one envelope per line with exact snapshots and zero usage.
- Fault injection proves no partial approval/envelopes/activation.
- A newer pair supersedes the previous effective Budget and Plan atomically.
- RowVersion conflict maps to 409.
- Query projection is tenant/company scoped, server paged/sorted/filtered, and
  no-tracking.
- Controller construction/routes/permissions are exact.

### Web

- Service serialization for create/update/actions and query filters.
- Query invalidation, including approval cross-resource invalidation.
- Zod nested reconciliation and field-path errors.
- Budget Grid/Cards action gating, sortable allow-list, filter reset, and status
  badge alignment.
- Create/Edit/View allocation preservation and dependency-aware mock data.
- Envelope read-only capacity presentation.

### Mobile

- Runtime schema parsing and exact API payloads.
- Query invalidation and permission/read-only action gating.
- Create/Edit/View nested allocation preservation and mock data.
- Plans remain reachable and unchanged; Budgets and Envelopes are reachable.
- English/Arabic/RTL and compact-screen behavior.

Run the narrow tests first, then at minimum:

```powershell
dotnet build api/ErpSystem.Api/ErpSystem.Api.csproj --no-restore
dotnet test api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore
npm run type-check --prefix web-next
npm run check:architecture --prefix web-next
npm run typecheck --prefix mobile-react
npm run check:architecture --prefix mobile-react
npm run lint --prefix mobile-react
```

Do not start a development server for static validation.

## 13. Documentation and handoff

Update the authored Workforce Planning master/API/Web/Mobile profiles and the
feature review artifact with verified Phase 2 source and exact command results.
Update the draft required-files manifest for new source/test/config/route/locale
evidence. Never hand-edit `documentation/system/generated/`.

Run `Generate-Documentation.ps1 -Recipe workforce-planning` followed by the same
feature-scoped `-Check`. Record any global stale packet separately from Workforce
Planning evidence.

The handoff must contain:

- changed files grouped by Domain/Application/Infrastructure/API/Web/Mobile/Docs;
- exact tests and pass/fail counts;
- inherited failures versus Phase 2 regressions;
- a five-point Web and Mobile audit: Creation, Editing, Viewing, Listing/Filtering,
  Mock Data;
- explicit statement: `No migration was created or applied`;
- exact proposed migration name and model/table/index/FK delta for the user;
- status `Source Complete / Database Pending`, never fully complete before the
  user migration, live database validation, and browser/device smoke tests.

## 14. Gate 2 acceptance

Phase 2 source passes only when:

1. no Budget authorization exceeds the referenced Plan demand;
2. headcount, salary, and recruitment period allocations reconcile independently
   and exactly;
3. approval generates the complete Envelope set atomically with zero partial
   state under injected failure;
4. exactly one effective Plan/Budget pair exists per company/Fiscal Year;
5. no manual Envelope mutation surface exists;
6. Web and Mobile expose complete Create/Edit/View/List/Filter/Mock journeys using
   shared components and bilingual RTL-safe presentation;
7. architecture, focused tests, build/type checks, permissions, realtime, and
   authored documentation are reconciled;
8. the agent has stopped before migration generation and clearly handed the
   schema step to the user.
