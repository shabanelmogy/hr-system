# Workforce Planning Feature Review

## 1. Scope and status

Workforce Planning owns the governed demand chain beginning at `FiscalYear -> WorkforcePlan`. Phase 1 implements Workforce Plans only. Budget, Envelope, Staffing Request, Recruitment linkage, Offer governance, Hire, Trace, and Plan-versus-Commitment are now implemented through Phase 6. Phase 1 source and database model are verified; EF reports no pending model changes in the configured Development database. Authenticated browser/device smoke remains intentionally not run per the user instruction.

Phase 2 implements `Approved WorkforcePlan -> WorkforceBudget -> automatic PositionEnvelope` end to end across Domain, Application, Infrastructure, API, Web, and Mobile. Phase 2 source is complete and migration `20260906204810_create-workflow-budget` is applied to the configured database; authenticated Web/Mobile visual smoke was not run per the user instruction. Phases 3–6 source surfaces and migrations are implemented; live release smoke remains a manual gate.

## 2. Ownership boundary

Finance owns FiscalYear and FiscalPeriod. Organizational Structure owns Position, Division, Department, and Branch. Employees owns assignment history. Workforce Planning references those identities and stores immutable baseline snapshots; it never accepts tenant/company scope or derived organization identities from clients.

## 3. Phase 1 aggregate

`WorkforcePlan` owns revision identity, bilingual titles, status, decisions, activation metadata, lines, and period targets. Lines store Position, optional TargetBranch, server-derived Department/Division, baseline headcount/date, new-position demand, replacement demand, justification, and fiscal-period distribution. Target headcount and total hiring are derived rather than persisted or accepted from clients.

## 4. Lifecycle and concurrency

The only approval route is `Draft|Rejected -> Submitted -> UnderReview -> Approved|Rejected`. Direct Submitted-to-Approved and Submitted-to-Rejected transitions are forbidden. Every mutating action after create requires RowVersion. Creator self-approval remains forbidden for normal approvers; as a temporary policy, the built-in `admin` role may approve a plan it created until delegated approval and separation-of-duties permissions are introduced. Revisions preserve PlanSeriesId and immutable revision ordering.

## 5. Baseline and fiscal rules

Baseline counts distinct employees with active primary EmployeeAssignments for the requested Position and optional TargetBranch as of the captured UTC date. Target headcount equals baseline plus new positions; replacement demand does not increase target headcount. Total hiring equals new positions plus replacements. Create/update require a Draft or Open FiscalYear; submit, review, approve, reject, and revision creation require Open. Period IDs must belong to that FiscalYear, and new-position and replacement totals must each reconcile independently.

## 6. Cross-platform experience

Web and Mobile both provide server paging, search, lifecycle and FiscalYear filters, grid/table and cards, create/edit/view journeys, lookup-backed fields, nested line/period repeaters with add/remove/reorder, lifecycle confirmations, rejection reason validation, automatic current-employee and expected-headcount summaries, separate plain-language new-position/replacement demand, revision history/comparison, bilingual text, and development mock data. The Finance-owned Fiscal Year lookup refetches whenever this workflow mounts, preventing a previously cached list from hiding a newly created year.

## 7. Security and realtime

The feature uses exact `WorkforcePlans:View/Create/Edit/Approve` permissions. System-role permission reconciliation runs on every API startup independently from optional sample-data seeding, preserving the contract that the built-in `admin` role receives every tenant permission in production and development. Newly issued access tokens then carry those role claims. API controllers inject `ISender` only. Successful post-commit changes dispatch company-and-permission-scoped realtime invalidation for resource `workforce-plans`; clients map that resource to their feature query keys.

## 8. Persistence and rollout

The model requires one effective plan per tenant/company/FiscalYear through a unique filtered index. Existing legacy plan tables require a corrective additive migration owned by the user; no migration was generated or applied during the correction pass. The affected tables were verified empty, but row counts must be rechecked before migration application.

## 9. Verification evidence

Focused Workforce Plan tests cover lifecycle, rejection of non-admin self-approval, the temporary admin self-approval exception, category-specific period totals, derived target/total calculations, duplicate periods, branch/date baseline calculation, revision ordering, persistence shape, and unique-index metadata. Targeted API build, Web type/architecture checks, Mobile type/architecture checks, localization parsing, and documentation validation are release evidence. Live database and UI smoke tests remain mandatory after the migration.

## 11. Phase 2 aggregate and activation

`WorkforceBudget` references exactly one approved plan revision and the same FiscalYear, owns immutable budget code/plan/year/revision, currency (editable only while Draft/Rejected), `CalculationPolicyVersion=2026-09-V1`, lifecycle timestamps, and derived non-writable headcount/salary/recruitment/grand totals. Each budget holds exactly one line per active plan line with server-copied Position/Branch/Department/Division snapshots, `AuthorizedHeadcount` never greater than the plan line `PlannedHiringSlots`, salary/recruitment budgets in `decimal(18,2)`, and period allocations whose headcount, salary, and recruitment sums reconcile independently and exactly. `PositionEnvelope` is system-generated only (one per approved budget line, deterministic `EnvelopeCode`, zero initial usage, derived available capacity that throws instead of clamping); no manual mutation surface exists. Approval atomically approves and activates the budget, activates the referenced plan, supersedes the previous effective pair, and materializes all envelopes in one transaction and one `SaveChangesAsync`.

Phase 2 budget approval is restricted directly to the built-in `admin` role across API, Web, and Mobile. Budget read and authoring remain governed by `WorkforceBudgets:View/Manage`; a delegable `WorkforceBudgets:Approve` permission is Deferred.

## 12. Phase 2 verification evidence

Phase 2 evidence: `WorkforceBudgetDomainTests` (frozen enum values, normalization, lifecycle, independent category reconciliation, deterministic envelope codes, zero usage), `WorkforceBudgetHandlerTests` (coverage/ceiling/duplicate/foreign-line and period rejection, atomic approval with one envelope per line, pair supersession, single-save atomicity, fault-injection with zero dispatches), `WorkforceBudgetPersistenceTests` (unique index metadata, `decimal(18,2)` precision, paging/detail projections, client page-size regression coverage), `WorkforceBudgetsControllerContractTests` (exact routes, permissions, admin-only approval authorization, `ISender`-only construction, concurrency contract), Web `workforceBudgetService.test.ts` (serialization, filters, nested reconciliation), Mobile `workforce-budget-api.test.ts` (runtime schemas, exact payloads, nested reconciliation). Validation run: API build clean; focused Workforce tests 48/48 and budget tests 27/27; Web `npm run type-check` + `check:architecture` clean; Mobile `typecheck` + `check:architecture` clean with 3/3 budget API tests passing. The configured database reports the baseline and Phase 2 migrations applied and no pending EF model changes. Authenticated browser/device smoke tests remain pending; inherited full-solution, API-test, Mobile-lint, and documentation-check failures remain recorded separately.

## 10. Phase gate

Phase 1 is `Source Complete / Database Applied / Visual Smoke Not Run` in the configured Development database. The EF pending-model check is clean; authenticated visual smoke remains a manual release gate.

## 13. Phase 2 gate

Phase 2 is `Source Complete / Database Applied / Smoke Pending`. Migration `20260906204810_create-workflow-budget` creates `WorkforceBudgets`, `WorkforceBudgetLines`, `WorkforceBudgetPeriodAllocations`, and `PositionEnvelopes` with the required unique indexes, foreign keys, cascades, `decimal(18,2)` money, integer enum conversion, and RowVersion concurrency. EF reports no pending model changes for the configured database. Live create/edit/submit/approve/reject/envelope-capacity smoke tests on Web and Mobile remain required before Phase 2 is fully complete.

## 14. Phase 3–4 staffing and recruitment bridge

`PositionEnvelope` owns guarded headcount and salary reservations. `EnvelopeAmendment` and `StaffingRequest` are independent CQRS lifecycles with append-only requester/approver decisions, deterministic company locks, and no negative or silently clamped capacity. Planned requisitions copy organization from an approved staffing request on the server, allocate quota atomically, and release only unfilled positions on cancellation; legacy requisitions remain explicitly marked `PlanningSource.Legacy`.

## 15. Phase 5 offer governance and hire

Job offer states 1–6 are unchanged; states 7 (`PendingApproval`) and 8 (`Approved`) add the governed path `Draft -> PendingApproval -> Approved -> Issued -> Accepted`. Approval rejects requester/creator self-approval, records immutable `JobOfferApprovalHistory`, snapshots annual/fiscal cost and policy version, validates currency and reservation delta before mutation, and permits Issue only from Approved. Hire now requires an Accepted offer and OfferAccepted application, locks the company/application/idempotency/employee-number resources, creates employee/assignment/contract in one tracked graph and one transaction, consumes planned reservation/counters exactly once, and returns the existing application on retry. `HireIdempotencyKey` and employee number are tenant/company unique.

## 16. Phase 6 trace and commitment projection

`IWorkforceTraceReadStore` exposes only allow-listed application, offer, and employee roots plus a paginated Fiscal Year Plan-vs-Commitment projection. Queries are `AsNoTracking`, bounded to one root/page, and inherit tenant/company global filters. Salary and currency fields are populated only when the caller has `WorkforcePlanning:ViewFinancials`; Payroll Actuals remain Deferred. Web renders an animated framer-motion timeline and an accessible ordered list/table; Mobile renders a chronological shared-component timeline and commitment cards.

## 17. Phase 7 handoff status

Source reconciliation is complete for API, Web, Mobile, localization, permissions, routes, realtime invalidation, migrations, and the executable review guide. Automated checks are recorded in the handoff guide. Browser/device smoke tests are intentionally omitted per user instruction; database migration application and authenticated release smoke remain explicit manual gates.
