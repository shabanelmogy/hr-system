# Workforce Planning API Implementation Profile

## 1. Surface

The Phase 1 route is `/api/v1/workforce-planning/plans`. It exposes bounded page/detail/revision reads and create, update, submit, begin-review, approve, reject, and create-revision commands.

Phase 2 adds `/api/v1/workforce-planning/budgets` (bounded page/detail reads, `source-plans` and `source-plans/{planId}` lookups over approved unbudgeted plan revisions, create, update, submit, approve, reject) and `/api/v1/workforce-planning/position-envelopes` (read-only bounded page/detail). There is no envelope mutation route.

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

Budget lifecycle is `Draft|Rejected -> Submitted -> Approved|Rejected` with system `Approved -> Superseded` during newer-pair activation; `Closed` has no public Phase 2 action. Create/update require a Draft or Open FiscalYear; submit/approve/reject and activation require Open. Budget approval reloads budget, plan, FiscalYear, and the current effective pair after the company lock, revalidates status/ownership/full line coverage/ceilings/exact period reconciliation, approves and activates the budget, activates the referenced plan, supersedes the previous effective pair when different, materializes exactly one zero-usage `PositionEnvelope` per line, and commits once with a single `SaveChangesAsync`. Any failure rolls the whole transition back.

## 7. Baseline and relationships

Position determines Department and Division. TargetBranch must exist, be active, and match a branch-scoped Position. Baseline counts distinct employees with primary, non-deleted assignments whose effective interval contains the captured date and applies TargetBranch when supplied.

Clients submit `NewHireSlots` and `ReplacementSlots` for each line. The API derives `TargetHeadcount` as baseline plus new positions and derives `PlannedHiringSlots` as new positions plus replacements. Period allocations must reconcile each vacancy category independently; baseline, target, and total are not writable client fields.

## 8. Security and tenancy

Controllers are `[TenantMember]`, inject only `ISender`, and use `WorkforcePlans:View/Create/Edit/Approve`. TenantId and CompanyId come only from `ICurrentActor`; global query filters fail closed without scope. The application reads the authenticated role through `ICurrentActor.IsInRole`: the built-in `admin` role may temporarily approve a plan it created, while creator self-approval still fails for every non-admin approver. Delegated separation-of-duties policy remains Deferred.

Budget read and authoring routes use `WorkforceBudgets:View/Manage`, while the Phase 2 budget approval route is restricted directly to the built-in `admin` role. A delegable `WorkforceBudgets:Approve` permission is Deferred. Envelope routes use `PositionEnvelopes:View`. Permission reconciliation continues through the existing `GetTenantPermissions()` path; a new login is required for updated role or permission claims.

## 9. Realtime and errors

Successful committed writes dispatch `workforce-plans` through `IRealtimeChangeDispatcher` to the active company and View permission. Dispatch failure is logged after commit and does not make the write retryable. Stable localized errors cover missing/closed FiscalYear, missing Position/Branch/Period, duplicates, transitions, and concurrency.

Budget mutations dispatch `workforce-budgets`; approval additionally dispatches `position-envelopes` and `workforce-plans` because activation and supersession may change them. Budget errors add duplicate code/plan, unapproved plan, incomplete/duplicate/foreign lines, headcount ceilings, duplicate/foreign periods, period headcount ceilings, independent headcount/salary/recruitment mismatches, and envelope generation failure, all localized in `en-US.json` and `ar-EG.json`.

## 10. Persistence and migration gate

The EF model defines unique plan-code/revision identity and unique effective plan per tenant/company/FiscalYear. A user-created `FixWorkforcePlanningPhase1Integrity` migration is required. Its generated index change must be supplemented with guarded SQL dropping the nine legacy columns listed in the review artifact because they are no longer present in the snapshot.

Phase 2 adds `WorkforceBudgets`, `WorkforceBudgetLines`, `WorkforceBudgetPeriodAllocations`, and `PositionEnvelopes` with unique indexes for budget code/year, one budget per plan revision, one effective budget per company/year (`UX_WorkforceBudgets_OneEffectivePerFiscalYear`), one allocation per line/period, one envelope per line, and envelope code per company; Restrict FKs to Plan/Year/Period/Position/Branch/Department/Division/Budget/Line; Cascade Budget->Lines->Allocations; `decimal(18,2)` money; integer enums; RowVersion concurrency. Migration `20260906204810_create-workflow-budget` is applied to the configured database and EF reports no pending model changes.

## 11. API verification

The targeted API build and Workforce tests pass, and the configured database has been updated and passes pending-model validation. Authenticated smoke tests remain for create, edit, every lifecycle transition, revisions, filters, tenancy, permission denial, and concurrency conflict.

Built-in system-role permission reconciliation is independent from `DatabaseSettings:SeedOnStartup`. Every API startup first ensures that the built-in system roles exist, then idempotently restores missing tenant permissions, including `WorkforcePlans:View/Create/Edit/Approve`, to the built-in `admin` role. Optional bootstrap users, geography, and sample-data seeds remain controlled by `SeedOnStartup`. A new sign-in is required after reconciliation because access-token claims represent the permissions present when the token is issued.

## 12. Phase 3–6 contracts

Phase 3/4 adds Staffing Request and Envelope Amendment command/query surfaces plus the planned requisition bridge. Phase 5 adds offer submit/approve/reject endpoints, append-only approval history, Accepted-offer-only hire, and idempotent employee creation. `ExecuteAtomicallyAsync` locks are ordered by resource string; the hire path uses a company lock together with application, idempotency, and employee-number locks and calls `SaveChangesAsync` once.

Phase 6 adds explicit trace routes `/api/v1/workforce-planning/trace/application/{id}`, `/offer/{id}`, `/employee/{id}`, and `/plan-commitment`. The read port never accepts a free-form entity type, uses bounded `AsNoTracking` projections, and lets the controller derive financial visibility from the authenticated permission claim. Tenant/company query filters fail closed and salary fields are null when financial visibility is absent.
