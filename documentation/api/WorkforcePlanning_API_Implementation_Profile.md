# Workforce Planning API Implementation Profile

## 1. Surface

The Phase 1 route is `/api/v1/workforce-planning/plans`. It exposes bounded page/detail/revision reads and create, update, submit, begin-review, approve, reject, and create-revision commands.

## 2. Domain model

`WorkforcePlan`, `WorkforcePlanLine`, and `WorkforcePlanLinePeriodTarget` are company-scoped aggregates. Domain methods own editability, lifecycle, self-approval, duplicate-period, and target-total invariants.

## 3. Contracts

Create accepts identity plus editable demand. Update excludes immutable plan code and FiscalYear and includes RowVersion. All lifecycle action bodies include RowVersion; reject additionally requires Reason. Response contracts distinguish list items from detail graphs.

## 4. Validation

FluentValidation bounds identifiers, strings, line/period counts, non-negative values, duplicate periods, rejection reason, and Base64 row versions. Domain and server relationship checks remain authoritative.

## 5. Queries

Read stores use `AsNoTracking`, server paging/sorting/filtering, explicit projections, and a revision query bounded to 50 members of one PlanSeriesId. Empty detail/revision results return stable not-found errors.

## 6. Commands and lifecycle

Commands execute through deterministic company locks and one unit-of-work boundary. The sequence is `Draft|Rejected -> Submitted -> UnderReview -> Approved|Rejected`. Revision creation requires Approved or Superseded and an Open FiscalYear.

## 7. Baseline and relationships

Position determines Department and Division. TargetBranch must exist, be active, and match a branch-scoped Position. Baseline counts distinct employees with primary, non-deleted assignments whose effective interval contains the captured date and applies TargetBranch when supplied.

Clients submit `NewHireSlots` and `ReplacementSlots` for each line. The API derives `TargetHeadcount` as baseline plus new positions and derives `PlannedHiringSlots` as new positions plus replacements. Period allocations must reconcile each vacancy category independently; baseline, target, and total are not writable client fields.

## 8. Security and tenancy

Controllers are `[TenantMember]`, inject only `ISender`, and use `WorkforcePlans:View/Create/Edit/Approve`. TenantId and CompanyId come only from `ICurrentActor`; global query filters fail closed without scope.

## 9. Realtime and errors

Successful committed writes dispatch `workforce-plans` through `IRealtimeChangeDispatcher` to the active company and View permission. Dispatch failure is logged after commit and does not make the write retryable. Stable localized errors cover missing/closed FiscalYear, missing Position/Branch/Period, duplicates, transitions, and concurrency.

## 10. Persistence and migration gate

The EF model defines unique plan-code/revision identity and unique effective plan per tenant/company/FiscalYear. A user-created `FixWorkforcePlanningPhase1Integrity` migration is required. Its generated index change must be supplemented with guarded SQL dropping the nine legacy columns listed in the review artifact because they are no longer present in the snapshot.

## 11. API verification

Run the targeted API build and Workforce Plan tests, then—after the user migration—`dotnet ef database update`, pending-model validation, and authenticated smoke tests for create, edit, every lifecycle transition, revisions, filters, tenancy, permission denial, and concurrency conflict.

Built-in system-role permission reconciliation is independent from `DatabaseSettings:SeedOnStartup`. Every API startup first ensures that the built-in system roles exist, then idempotently restores missing tenant permissions, including `WorkforcePlans:View/Create/Edit/Approve`, to the built-in `admin` role. Optional bootstrap users, geography, and sample-data seeds remain controlled by `SeedOnStartup`. A new sign-in is required after reconciliation because access-token claims represent the permissions present when the token is issued.
