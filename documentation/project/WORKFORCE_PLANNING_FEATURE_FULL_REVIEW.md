# Workforce Planning Feature Review

## 1. Scope and status

Workforce Planning owns the governed demand chain beginning at `FiscalYear -> WorkforcePlan`. Phase 1 implements Workforce Plans only. Budget, Envelope, Staffing Request, Recruitment linkage, Offer governance, Hire, Trace, and Plan-versus-Commitment remain later gated phases. Phase 1 source is complete; its database gate is pending application and verification of the user-created `RepairWorkforcePlanLinesLegacySchema` migration.

## 2. Ownership boundary

Finance owns FiscalYear and FiscalPeriod. Organizational Structure owns Position, Division, Department, and Branch. Employees owns assignment history. Workforce Planning references those identities and stores immutable baseline snapshots; it never accepts tenant/company scope or derived organization identities from clients.

## 3. Phase 1 aggregate

`WorkforcePlan` owns revision identity, bilingual titles, status, decisions, activation metadata, lines, and period targets. Lines store Position, optional TargetBranch, server-derived Department/Division, baseline headcount/date, new-position demand, replacement demand, justification, and fiscal-period distribution. Target headcount and total hiring are derived rather than persisted or accepted from clients.

## 4. Lifecycle and concurrency

The only approval route is `Draft|Rejected -> Submitted -> UnderReview -> Approved|Rejected`. Direct Submitted-to-Approved and Submitted-to-Rejected transitions are forbidden. Every mutating action after create requires RowVersion. Creator self-approval is forbidden. Revisions preserve PlanSeriesId and immutable revision ordering.

## 5. Baseline and fiscal rules

Baseline counts distinct employees with active primary EmployeeAssignments for the requested Position and optional TargetBranch as of the captured UTC date. Target headcount equals baseline plus new positions; replacement demand does not increase target headcount. Total hiring equals new positions plus replacements. Create/update require a Draft or Open FiscalYear; submit, review, approve, reject, and revision creation require Open. Period IDs must belong to that FiscalYear, and new-position and replacement totals must each reconcile independently.

## 6. Cross-platform experience

Web and Mobile both provide server paging, search, lifecycle and FiscalYear filters, grid/table and cards, create/edit/view journeys, lookup-backed fields, nested line/period repeaters with add/remove/reorder, lifecycle confirmations, rejection reason validation, automatic current-employee and expected-headcount summaries, separate plain-language new-position/replacement demand, revision history/comparison, bilingual text, and development mock data. The Finance-owned Fiscal Year lookup refetches whenever this workflow mounts, preventing a previously cached list from hiding a newly created year.

## 7. Security and realtime

The feature uses exact `WorkforcePlans:View/Create/Edit/Approve` permissions. System-role permission reconciliation runs on every API startup independently from optional sample-data seeding, preserving the contract that the built-in `admin` role receives every tenant permission in production and development. Newly issued access tokens then carry those role claims. API controllers inject `ISender` only. Successful post-commit changes dispatch company-and-permission-scoped realtime invalidation for resource `workforce-plans`; clients map that resource to their feature query keys.

## 8. Persistence and rollout

The model requires one effective plan per tenant/company/FiscalYear through a unique filtered index. Existing legacy plan tables require a corrective additive migration owned by the user; no migration was generated or applied during the correction pass. The affected tables were verified empty, but row counts must be rechecked before migration application.

## 9. Verification evidence

Focused Workforce Plan tests cover lifecycle, self-approval, category-specific period totals, derived target/total calculations, duplicate periods, branch/date baseline calculation, revision ordering, persistence shape, and unique-index metadata. Targeted API build, Web type/architecture checks, Mobile type/architecture checks, localization parsing, and documentation validation are release evidence. Live database and UI smoke tests remain mandatory after the migration.

## 10. Phase gate

Phase 1 is `Source Complete / Database Pending`. Phase 2 must not begin until `FixWorkforcePlanningPhase1Integrity` is created, reviewed, applied, EF reports no pending model changes, and create/edit/submit/review/approve/reject/revision smoke tests pass against the live database.
