# Workforce Planning Implementation Request

Status: Phases 0 through 6 are source-complete with additive migrations applied;
automated API/Web/Mobile checks are recorded. Browser and Mobile visual/simulator
smoke was intentionally not run per the user request. Phase 7 documentation is
registered; generation uses the consolidated baseline migration that contains the global geography transition.
The frozen contract and gates below remain the release reference.

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Workforce Planning` (`workforce-planning`) |
| Operating mode | New feature |
| Applied reference | `states` for parent-dependent lifecycle and cross-platform discipline |
| Request date | `2026-09-06` |
| Review artifact | `documentation/system/features/workforce-planning/WORKFORCE_PLANNING-REVIEW-ARTIFACTS.md` |
| Review guide | `documentation/project/WORKFORCE_PLANNING_V1_ALL_PHASES_REVIEW_GUIDE.md` |
| Required-file manifest | `documentation/system/features/workforce-planning/required-files.json` (final) |
| Runtime policy | No client-selected tenant/company scope; no direct page-to-API calls; no monolithic workforce service |

## Product boundary

The feature establishes one traceable chain:

`FiscalYear -> WorkforcePlan -> WorkforceBudget -> PositionEnvelope -> StaffingRequest -> JobRequisition -> JobOpening -> Application -> Interview/Evaluation -> JobOffer -> Hire -> Employee + Assignment + Contract`

FiscalYear and FiscalPeriod remain the only financial calendar source. V1 supports
the existing Monthly and Quarterly frequencies. Custom periods, currency conversion,
Payroll Actuals, and Import/Export are Deferred or Excluded as recorded below.

## Frozen domain contract

### Scope and lifecycle

- All new aggregates are company-scoped through the authenticated actor and the existing tenant/company filters. `TenantId` and `CompanyId` never appear in client payloads.
- Plans and budgets may be drafted while the FiscalYear is Draft or Open. Submission, approval, activation, reservation, and all downstream planned hiring require an Open FiscalYear. Pre-open approval is explicitly Deferred in V1.
- A plan has a non-null `Guid PlanSeriesId`, immutable `RevisionNumber`, `ActivatedOn`, and `SupersededOn`. `Approved` is not the same as effective. Plan and budget activation occurs together; there is exactly one effective pair per company and fiscal year.
- In-year changes never silently rebase downstream records. They use a positive EnvelopeAmendment, and records with downstream activity are not relinked automatically.

### Workforce Plan

- `WorkforcePlanLine` owns demand only: `PositionId`, `TargetBranchId`, server-derived `DepartmentId` and `DivisionId`, immutable `BaselineHeadcount` with `BaselineAsOfDate`, `NewHireSlots`, `ReplacementSlots`, and `Justification`. `TargetHeadcount = BaselineHeadcount + NewHireSlots` and `PlannedHiringSlots = NewHireSlots + ReplacementSlots` are server-derived values, never client inputs.
- The plan does not own authoritative salary or recruitment money. `PlannedHiringSlots` is the ceiling for the budget; it is not an authorization.
- Period targets contain `FiscalPeriodId`, `NewHireSlots`, and `ReplacementSlots`. Each category must reconcile independently with its line total; period identities and dates come from the FiscalYear.
- Baseline is calculated from active primary assignments for the same Position and optional TargetBranch as of the plan snapshot date. The client cannot submit baseline, target headcount, total hiring, department, or division values.
- Status values are fixed: `Draft=1`, `Submitted=2`, `UnderReview=3`, `Approved=4`, `Rejected=5`, `Superseded=6`.

### Workforce Budget and cost policy

- A budget references exactly one approved plan revision and the same FiscalYear. Its currency is immutable after submission and must match every offer and input amount in the chain.
- V1 authoritative categories are `SalaryCost` and `RecruitmentCost`. Training and unallocated “other” totals are Deferred until explicit line/period allocations exist; no header-only money is allowed to enter reconciliation.
- Budget line authorization is `AuthorizedHeadcount`, never greater than the plan line's `PlannedHiringSlots`. Period allocations contain separate `AllocatedSalaryCost`, `AllocatedRecruitmentCost`, and `TargetHeadcount`, with per-category sums reconciled to the line.
- `CalculationPolicyVersion=2026-09-V1` is stored with every financial reservation snapshot. Monthly salary annualizes as base salary times twelve; annual salary remains unchanged. Fiscal-year commitment is annualized salary multiplied by the exact inclusive remaining-day fraction from `TargetStartDate` through `FiscalYear.EndDate`.
- Monetary precision is SQL `decimal(18,2)`, rounded once at the final category boundary using the company policy. No `Math.Max` masking is permitted; negative or over-capacity results raise a stable domain error.
- Offer approval atomically increases or releases the reservation delta. An increase without available capacity is rejected and requires an approved amendment; a decrease releases the difference. The accepted offer stores the immutable calculation and currency snapshot.

### Position Envelope and Amendment

- One `PositionEnvelope` is generated atomically for every approved budget line; manual envelope creation is forbidden.
- The envelope snapshots Position, Branch, Department, and Division after server validation. `AvailableHeadcount = AuthorizedHeadcount - ReservedHeadcount - HiredHeadcount`; `AvailableSalaryBudget = AuthorizedSalaryBudget - ReservedSalaryBudget - ContractedSalaryBudget`.
- Capacity and money can never become negative. New requests reserve both dimensions in one transaction.
- `EnvelopeAmendment` is an independent aggregate with `Draft -> Submitted -> Approved | Rejected`, requester/approver identities, timestamps, reason, RowVersion, and positive-only deltas in V1. A requester cannot approve their own amendment.

### Staffing and recruitment bridge

- `StaffingRequest` tracks `ReservedHeadcount`, `ReservedFiscalCost`, `AllocatedRequisitionPositions`, `HiredPositions`, `RemainingAllocatable`, and `RemainingToHire`; derived values are never silently clamped.
- Cancellation releases only the unallocated/unhired remainder. A partially fulfilled request closes with a reason and never invalidates existing hires.
- `PlanningSource` contains only `Planned=1` and `Legacy=2` in V1. `Exceptional` and `EmergencyUnbudgeted` are excluded. Legacy is server-assigned during backfill and is not a client-selectable option.
- Every new Planned JobRequisition requires an Approved StaffingRequest with remaining quota. Creating a requisition consumes quota atomically; cancellation returns only the unused quota. Existing requisitions are backfilled as Legacy without fabricated links.
- A server-only enforcement flag performs a compatibility rollout: schema and backfill, compatible clients, feature flag, then rejection of new unlinked planned requisitions.

### Offer governance and atomic hire

- Existing `JobOfferStatus` numbers `Draft=1` through `Expired=6` are immutable. V1 appends `PendingApproval=7` and `Approved=8`; the workflow is `Draft -> PendingApproval -> Approved -> Issued -> Accepted`.
- `JobOfferApprovalHistory` is append-only and records submission, approval, rejection, actor, reason, and timestamps. Self-approval is rejected. The active-offer uniqueness filter includes statuses `1,2,3,7,8`.
- Hire is one idempotent command. It acquires deterministic locks for Application, Offer, Opening, Requisition, StaffingRequest, Envelope, and EmployeeNumber, reloads all rows after locking, verifies an Accepted offer, writes Employee/Assignment/Contract and all capacity transitions in one transaction and one `SaveChangesAsync`, and performs notifications only after commit. A unique application-to-employee link or idempotency key makes retries return the existing employee.

## Application and API boundaries

- Every write is a typed MediatR command with a co-located FluentValidation validator. Every read is a bounded query with an `AsNoTracking` read projection.
- Workforce Planning owns planning aggregates and orchestration ports; Recruitment owns requisition/opening/application/offer commands; Employees owns Employee/Assignment/Contract creation. No `IWorkforcePlanningService` or cross-aggregate entity passing is allowed.
- Controllers inject `ISender` only. Errors are stable, localized, and field-addressable. Exact permissions are frozen as `WorkforcePlans:View/Create/Edit/Approve`, `WorkforceBudgets:View/Manage`, `PositionEnvelopes:View`, `EnvelopeAmendments:View/Create/Approve`, `StaffingRequests:View/Create/Approve`, `Recruitment:ManageRequisitions`, `JobOffers:Approve`, `Employees:Hire`, `WorkforcePlanning:ViewTrace`, and `WorkforcePlanning:ViewFinancials`. In Phase 2, budget approval is temporarily restricted to the built-in `admin` role; introducing a delegable `WorkforceBudgets:Approve` permission is Deferred.
- Trace reads use typed/allow-listed entity kinds, bounded page/node counts, company scope, optional authorized branch filtering, and financial redaction when `ViewFinancials` is absent. They must not perform N+1 loading.

## Client contract

- Web uses the established `PageHeader`, `MyDataGrid`, cards, pagination, feedback states, `MyForm`, `MyTextField`, `MySelect`, React Query hooks, and feature services. Repeaters for plan lines and period targets are dedicated builders, not JSON text fields.
- Mobile uses the shared `AppListScreen`, `AppDataTable`, `AppDataCard`, `AppFilterButton`, `AppForm`, route guards, runtime schemas, and the chronological trace timeline. The interactive tree is Web-only; mobile keeps the same data and actions.
- Both platforms provide Create, Edit, View, List/Filter, permission/read-only, Loading/Empty/Error, EN/AR localization, RTL, realtime invalidation, and mock-data journeys for every Required surface. Import/Export is Deferred on both; chart mode is Excluded in V1.
- Web Trace uses `framer-motion` with an accessible table/list alternative. Mobile Trace is a chronological step timeline.

## Database and rollout plan

Migrations are additive and independently verifiable:

1. `AddWorkforcePlanningPlans`
2. `AddWorkforceBudgetsAndPositionEnvelopes`
3. `AddStaffingRequestsAndEnvelopeAmendments`
4. `LinkStaffingRequestsToJobRequisitions`
5. `AddJobOfferApprovalGovernance`

Each migration is checked against `__EFMigrationsHistory`, followed by
`dotnet ef database update` and `dotnet ef migrations has-pending-model-changes`.
No migration is rewritten after it has been applied.

## Phase 0 gate

Phase 0 is complete only when the review artifact records verified current source,
the decisions above, platform Required/Deferred/Excluded choices, migration and
database evidence, exact permissions, lifecycle tables, and the verification
commands/results. No Runtime source is changed during Phase 0. After the user
accepts the frozen contract, Phase 1 may start with Workforce Plans.
