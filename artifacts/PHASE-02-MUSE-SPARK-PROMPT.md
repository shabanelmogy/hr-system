# Phase 2 Handoff Prompt — Workforce Budgets + Position Envelopes (for Muse Spark)

> Copy everything below the line into a fresh Muse Spark session rooted at `F:/Portofolio Projects/HrManagementSystem`. This file itself is the handoff; do not edit it from the implementing session.

---

You are implementing **Phase 2 (Workforce Budgets + Position Envelopes)** of the Workforce Planning chain in this repo.
Work in `F:/Portofolio Projects/HrManagementSystem`. Phase 1 (Workforce Plans) source already exists — reuse its patterns, do not reinvent them.

## 1. Source of truth (read first, in this order)

1. `documentation/system/features/workforce-planning/PHASE-02-BUDGETS-ENVELOPES-IMPLEMENTATION.md` — **the binding Phase 2 execution contract (sections 1–14). Follow it exactly.**
2. `documentation/system/features/workforce-planning/IMPLEMENTATION-REQUEST.md` — the frozen full-chain contract (scope, lifecycle, financial policy, permissions, client rules).
3. `documentation/system/features/workforce-planning/WORKFORCE_PLANNING-REVIEW-ARTIFACTS.md` — Phase 0/1 evidence ledger.
4. `AGENTS.md` — repo-wide rules (shared-component-first, web baseline, reference fidelity, docs system).

If any instruction below conflicts with (1), (1) wins. If (1) conflicts with (2), ask the user before proceeding.

## 2. Preconditions (verify, do not fix by migrating)

- Current EF state (2026-09-06): `dotnet ef migrations list --no-build` returns the applied consolidated migration `20260906112413_create-database`; `has-pending-model-changes --no-build` reports no model changes before you start.
- `Generate-Documentation.ps1 -Check` currently FAILS on inherited Addresses evidence (`20260827082513_RefactorAddressesForGlobalGeography.cs` missing). This is out of scope: record it in your handoff, do NOT edit Addresses or fabricate that migration.
- Old docs mentioning `modifyPahse01`, `RepairWorkforcePlanLinesLegacySchema`, or `FixWorkforcePlanningPhase1Integrity` are stale after the DB recreate. Correct authored Workforce Planning docs at handoff; do NOT recreate those migrations.
- Preserve every dirty worktree change. Never `reset`, `checkout --`, overwrite, stage, or commit user work. Inspect diffs before touching overlapping files (Plan commands/errors, Web DataGrid, translations, `web-next/tsconfig.tsbuildinfo`).

## 3. Objective

Implement end to end: `Approved WorkforcePlan -> WorkforceBudget -> automatic PositionEnvelope`.
Own: budget authoring + lifecycle + exact period/category reconciliation + atomic activation + automatic envelope materialization + read-only envelope views + full Web/Mobile parity.
Do NOT implement: Staffing Requests, Envelope Amendments, Recruitment linkage, Offer governance, Hire, Trace, Plan-vs-Commitment.

## 4. Non-negotiable architecture rules

- No `IWorkforcePlanningService`, budget facade, generic CRUD service, or controller access to `ApplicationDbContext`.
- Each write = typed MediatR `ICommand` + co-located FluentValidation validator + handler. Each read = typed `IQuery` + dedicated `AsNoTracking()` projection store.
- Controllers inject `ISender` only; they are tenant-member boundaries with exact routes/permissions (contract section 8 + controller contract tests).
- Application must not reference EF Core or Infrastructure. Use `TimeProvider`, never `DateTime.UtcNow` in Domain.
- `TenantId`/`CompanyId` come only from `ICurrentActor`; never accept them from client payloads.
- Cross-aggregate coordination lives in command handlers. Never pass aggregate entities into other aggregates.
- Every mutation except create carries a Base64 RowVersion; apply the original before save; map concurrency conflicts to stable 409.
- Use `IUnitOfWork.ExecuteAtomicallyAsync` + deterministic company locks. Approval + plan activation/supersession + budget supersession + envelope generation = ONE transaction, ONE `SaveChangesAsync`.
- Dispatch realtime only after commit; a dispatch failure is logged and never retries the committed command.
- Never use `Math.Max(0, ...)`, silent clamping, floating-point money, client totals, or client-derived org identities. Money = `decimal(18,2)`, rounded once at the final category boundary.
- Web: feature `services/` own `apiService` calls; React Query hooks own keys/caching/mutations. Forms use `MyForm` + `MyTextField`/`MySelect` + React Hook Form + `zodResolver`, enabled primary submit, per-field errors under inputs, first-invalid focus, `noValidate`. No native alert/confirm/validation. Reuse `PageHeader`, `MyDataGrid`, cards, pagination, feedback states.
- Mobile: reuse `AppListScreen`, `AppDataTable`, `AppDataCard`, `AppFilterButton`, `AppForm`, route guards, runtime Zod schemas (parse `unknown` at the boundary), confirmation + authorization primitives. No raw-primitive replacement of the plan journey.
- Every visible/API string in EN + AR (`en-US.json` / `ar-EG.json` on API; existing locale owners on Web/Mobile). Preserve RTL. First unfiltered option = localized `common.all`.
- **STOP BEFORE MIGRATION.** Do not create a migration, do not run `database update`. Final status is `Source Complete / Database Pending`.
- Never hand-edit `documentation/system/generated/`. Update only authored profiles + review artifact + draft manifest.

## 5. Frozen domain model (implement exactly; details in contract sections 4–5)

- `WorkforceBudgetStatus`: `Draft=1, Submitted=2, Approved=3, Rejected=4, Superseded=5, Closed=6`. Allowed: `Draft->Submitted`, `Rejected->Submitted`, `Submitted->Approved`, `Submitted->Rejected`, `Approved->Superseded` (system, on newer-pair activation). `Closed` has no public Phase 2 action. Draft/Rejected editable; Approved/Superseded/Closed immutable.
- `WorkforceBudget`: `BudgetCode` (required, trimmed, UPPER, max 50, immutable after create), `WorkforcePlanId` (immutable, exactly one approved non-deleted same-company/same-year plan revision), `FiscalYearId` + `RevisionNumber` server-copied, `CurrencyCode` (3 uppercase ISO, editable only in Draft/Rejected), `CalculationPolicyVersion=2026-09-V1` (immutable), lifecycle timestamps/actors + `DecisionReason` (max 2000) + `ActivatedOn`/`SupersededOn`, derived non-writable `TotalAuthorizedHeadcount`, `TotalSalaryBudget`, `TotalRecruitmentBudget`, `GrandTotalBudget`. No Training/Other header totals.
- `WorkforceBudgetLine`: exactly one line per active plan line (missing/foreign/duplicate rejected; unfunded line stays with zeros). Server copies `PositionId`, nullable `BranchId`, `DepartmentId`, `DivisionId`. Client sends only `WorkforcePlanLineId`, `AuthorizedHeadcount` (0+, ≤ plan line `PlannedHiringSlots`), `AllocatedSalaryBudget`, `AllocatedRecruitmentBudget` (`decimal(18,2)`, 0+), derived `TotalAllocatedBudget`, plus period allocations.
- `WorkforceBudgetPeriodAllocation`: `FiscalPeriodId` (must belong to budget year, unique per line), `TargetHeadcount` (0+), `AllocatedSalaryCost`, `AllocatedRecruitmentCost` (explicit, zero allowed, never null). Per line: `sum(TargetHeadcount)==AuthorizedHeadcount`, `sum(Salary)==AllocatedSalaryBudget` exactly, `sum(Recruitment)==AllocatedRecruitmentBudget` exactly, each period headcount ≤ plan-line-period `NewHireSlots+ReplacementSlots`.
- `PositionEnvelope` (system-created only — NO public create/edit/delete/archive/restore/import): deterministic unique `EnvelopeCode` per company (derive from BudgetCode + persisted BudgetLine identity so retries are stable), `WorkforceBudgetId`, unique `WorkforceBudgetLineId`, `WorkforcePlanId/LineId`, `FiscalYearId`, copied org snapshots, `CurrencyCode`, policy version, `AuthorizedHeadcount` with `Reserved=0/Hired=0` initial, derived `AvailableHeadcount`; `AuthorizedSalaryBudget` with `Reserved=0/Contracted=0` initial, derived `AvailableSalaryBudget`. Negative derived capacity throws a stable Domain error, never clamps.
- Activation invariants: create/update allowed in Draft/Open year; submit/approve/reject + activation require Open year. At most one Budget per plan revision (unique index); BudgetCode unique per tenant/company/year; one effective Budget per company/year (+ existing one-effective-Plan). Approval atomically reloads everything after the company lock, revalidates all rules, supersedes the previous effective pair when different, marks budget Approved+activated, activates the referenced plan, materializes exactly one envelope per line with zero usage — single save, single commit; any failure rolls everything back with zero partial state.

## 6. CQRS / persistence / API (contract sections 6–8)

- Commands+validators: `Create/Update/Submit/Approve/RejectWorkforceBudgetCommand`. Create body example and immutability rules are in contract section 6 — follow them verbatim (camelCase JSON, no tenant/company fields; update keeps code/plan/year/revision immutable; reject requires reason).
- Queries: `GetWorkforceBudgets` (page/search/Status/FiscalYearId/PlanId/sort), `GetWorkforceBudgetById` (full nested detail), `GetBudgetSourcePlans` + `GetBudgetSourcePlanById` (eligible approved plans + lines/targets/periods/snapshots for the allocation UI), `GetPositionEnvelopes` (page/search + FiscalYear/Budget/Plan/Branch/Department/Position/current-historical filters), `GetPositionEnvelopeById` (lineage + capacity). All `AsNoTracking`, bounded pages, allow-listed sorts, no N+1, company-scoped, stable not-found.
- Suggested ownership: `Contracts/WorkforceBudgetContracts.cs`, `Commands/WorkforceBudgetCommands.cs`, `Queries/WorkforceBudgetQueries.cs`, `Abstractions/IWorkforceBudgetStores.cs`, `Errors/WorkforceBudgetErrors.cs`, Infrastructure `Features/WorkforcePlanning/Persistence/WorkforceBudgetStores.cs` — adapt to the existing Phase 1 layout (`api/Modules/HR/ErpSystem.Modules.HR.Application/Features/WorkforcePlanning/...`). Mirror the Phase 1 file naming you find there:
- Domain: `api/Modules/HR/ErpSystem.Modules.HR.Domain/WorkforcePlanning/Entities/WorkforcePlan.cs`, `Enums/WorkforcePlanStatus.cs`
- Application: `api/Modules/HR/ErpSystem.Modules.HR.Application/Features/WorkforcePlanning/...`
- API controller: `api/ErpSystem.Api/Features/WorkforcePlanning/V1/WorkforcePlansController.cs`
- Persistence configs under `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Persistence/Configurations/WorkforcePlanning/`.
- DbSets + configs for `WorkforceBudgets`, `WorkforceBudgetLines`, `WorkforceBudgetPeriodAllocations`, `PositionEnvelopes`: composite tenant/company keys (fail closed), Restrict on Plan/Year/Period/Position/Branch/Department/Division + Budget-to-Plan + Envelope-to-Budget/Line, Cascade Budget->Lines->Allocations, `decimal(18,2)`, integer enums, audited RowVersion, unique indexes (code/year, one budget per plan revision, one effective budget per company/year, one allocation per line/period, one envelope per line, envelope code per company).
- Routes (thin controllers, `ISender` only):
- `GET/POST /api/v1/workforce-planning/budgets`, `GET/PUT /api/v1/workforce-planning/budgets/{id}`, `POST .../{id}/submit|approve|reject`, `GET .../budgets/source-plans`, `GET .../budgets/source-plans/{planId}`, `GET /api/v1/workforce-planning/position-envelopes`, `GET .../position-envelopes/{id}`.
- Authorization: budget list/detail/source = `WorkforceBudgets:View`; create/update/submit/reject = `WorkforceBudgets:Manage`; approve = built-in `admin` role only for Phase 2; envelopes = `PositionEnvelopes:View`. A delegable `WorkforceBudgets:Approve` permission is Deferred and must not be exposed or seeded. Keep existing permission reconciliation through `GetTenantPermissions()` with no one-off seeding. Mutations return updated detail (201 on create); stable localized ProblemDetails for every failure in contract section 8. Controller contract tests cover exact routes/permissions, admin-only approval authorization, `TenantMember`, and `ISender`-only construction.

## 7. Web (contract section 9)

- Reuse `web-next/src/features/workforce-planning/` (service, hooks, types, validation, `WorkforcePlansPage`, `WorkforcePlanForm`, `WorkforcePlansDataGrid/CardView/MultiView`). Keep `/workforce-planning/plans` unchanged; add `/workforce-planning/budgets` + `/workforce-planning/position-envelopes` with typed `appRoutes`, route access, API routes, Finance sidebar children, realtime resources (`workforce-budgets`, `position-envelopes`), EN/AR nav text. Finance visible with any of Years/Plans/Budgets/Envelopes permission.
- Budget list: shared PageHeader + server `MyDataGrid` + responsive cards + shared pagination/loading/empty/error/no-results; filters Status/FiscalYear/Plan (resettable); columns/cards show code/plan/year/revision/currency/status/headcount/salary/recruitment/grand-total/activation + permission+status-gated actions (Create, View, Edit Draft/Rejected, Submit Draft/Rejected, Approve/Reject Submitted; no delete/archive). Status badges vertically centered in Grid AND Cards. Sortable allow-list only.
- Budget form: shared form-dialog + structured allocation editor. Create picks an eligible approved plan and loads source detail; code+plan immutable after create; currency immutable after submit. Render exactly one non-removable line per plan line with read-only server org snapshots + planned ceilings; per line expose headcount/salary/recruitment + dedicated period-allocation repeater (never JSON). Live client sums are guidance only. Preserve nested allocations across edit/view; map API field errors to exact nested paths; focus first invalid. Dev-only mock data: real eligible plan + real period IDs, within all ceilings, amounts distributed exactly, disabled until dependencies load.
- Envelopes: read-only Grid+Cards (+ filters from section 6) showing headcount Authorized/Reserved/Hired/Available and salary Authorized/Reserved/Contracted/Available with accessible labels + progress indicators (not chart mode); detail shows full lineage FiscalYear->Plan->Budget->Line->Envelope + org/policy/currency. Zero mutation affordance.

## 8. Mobile (contract section 10)

- Extend `mobile-react/src/features/workforce-planning/` (api/endpoints/schemas, queries, screens, components, validation) via shared navigation/segmented controls: Plans + Budgets + Envelopes reachable, Phase 1 journey intact.
- Budget list/table/cards + server search/filter/paging + create/edit/view + lifecycle confirmations + nested allocation builder + exact totals + mock data + permissions/read-only + errors + EN/AR + RTL + compact-screen = Web parity. Envelope cards/table/detail with native accessible progress indicators, no mutations. Runtime Zod schemas parsing `unknown` at the boundary; API modules + endpoint constants + React Query keys/hooks + service boundary + route permissions + nav visibility + realtime invalidation + tests.

## 9. Realtime / localization / permissions (contract section 11)

- Resources `workforce-budgets`, `position-envelopes`. Budget mutations invalidate budget pages/details/source-plan lookups; approval ALSO invalidates envelopes + plans. Broadcasts scoped to company + matching View permission.
- Every API message in `en-US.json` + `ar-EG.json`; every Web/Mobile string in the existing EN/AR locale owners.

## 10. Build order

1. Domain (status enum, Budget + Line + Allocation + Envelope aggregates, lifecycle/editability rules, derived math, no client totals).
2. Application contracts + commands/validators + queries + errors + stores interfaces.
3. Infrastructure stores/configs/DbSets (source only).
4. API controllers + permissions + ProblemDetails + realtime effects.
5. Web (services/hooks first, then list, form, envelopes, routes/sidebar/realtime/locales).
6. Mobile (schemas/endpoints/api/queries, list, form, envelopes, nav/permissions/realtime/locales).
7. Tests (section 11 below), then authored docs.

## 11. Required automated evidence (contract section 12 — implement ALL of it)

- API/Domain: constructor/editability/lifecycle + fixed enum values; create needs approved same-company plan + Draft/Open year; submit/approve/reject need Open year + valid transitions; full exact plan-line coverage + duplicate/foreign rejection; headcount ceiling vs `PlannedHiringSlots`; duplicate/foreign period rejection + period headcount ceiling; independent exact headcount/salary/recruitment reconciliation; derived totals not client-controllable; approval creates one envelope per line with exact snapshots + zero usage; fault-injection proves zero partial approval/envelopes/activation; newer pair supersedes previous effective pair atomically; RowVersion -> 409; query projection scoping/paging/sorting/filtering/no-tracking; controller construction/routes/permissions exact.
- Web: service serialization (create/update/actions/query filters); invalidation incl. approval cross-resource; Zod nested reconciliation + field-path errors; Grid/Cards gating + sort allow-list + filter reset + badge alignment; create/edit/view preservation + dependency-aware mock data; envelope read-only capacity.
- Mobile: runtime schema parsing + exact payloads; invalidation + permission/read-only gating; create/edit/view preservation + mock data; plans reachable/unchanged, budgets+envelopes reachable; EN/AR/RTL + compact screens.
- Run narrow tests first, then at minimum:
```powershell
dotnet build api/ErpSystem.Api/ErpSystem.Api.csproj --no-restore
dotnet test api/ErpSystem.Tests/ErpSystem.Tests.csproj --no-restore
npm run type-check --prefix web-next
npm run check:architecture --prefix web-next
npm run typecheck --prefix mobile-react
npm run check:architecture --prefix mobile-react
npm run lint --prefix mobile-react
```
- Do not start a dev server for static validation.

## 12. Documentation + handoff (contract section 13)

- Update authored profiles: `documentation/project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md`, `documentation/api/WorkforcePlanning_API_Implementation_Profile.md`, `documentation/web-next/features/workforce-planning-frontend-reference.md`, `documentation/mobile-react/workforce-planning-mobile-reference.md`, plus `documentation/system/features/workforce-planning/WORKFORCE_PLANNING-REVIEW-ARTIFACTS.md` and the draft manifest `required-files.draft.json`. Never touch `documentation/system/generated/`.
- Run `Generate-Documentation.ps1 -Check`; record the inherited Addresses failure separately — do not claim a full pass while it exists.
- Your final handoff MUST contain: changed files grouped by Domain/Application/Infrastructure/API/Web/Mobile/Docs; exact tests with pass/fail counts; inherited failures vs Phase 2 regressions; five-point Web audit + five-point Mobile audit (Creation, Editing, Viewing, Listing/Filtering, Mock Data); the literal line `No migration was created or applied`; the exact proposed migration name `AddWorkforceBudgetsAndPositionEnvelopes` plus the model/table/index/FK delta for the user; status `Source Complete / Database Pending` (never "complete" before the user migration + live DB validation + smoke tests).

## 13. Gate 2 acceptance (you pass ONLY when all hold)

1. No budget authorization exceeds referenced plan demand.
2. Headcount, salary, recruitment reconcile independently and exactly.
3. Approval generates the complete envelope set atomically; injected failure leaves zero partial state.
4. Exactly one effective plan/budget pair per company/fiscal year.
5. No manual envelope mutation surface exists.
6. Web + Mobile expose complete Create/Edit/View/List/Filter/Mock journeys on shared components, bilingual RTL-safe.
7. Architecture, focused tests, build/type checks, permissions, realtime, authored docs reconciled.
8. You stopped before migration generation and handed the schema step to the user.

## 14. Strict prohibitions

- No migration files, no `dotnet ef migrations add`, no `database update`.
- No Phase 3–6 scope (amendments, staffing, requisition bridge, offers, hire, trace).
- No Training/Other money, no header-only money, no `Closed` budget action.
- No `any` in new TypeScript (use `unknown` + narrowing), no duplicated DTOs, no business rules hidden in presentation components.
- Do not start a dev server to validate. Do not stage or commit.

Begin by confirming the two source-of-truth files you read and the precondition check results, then implement in the section-10 order.
