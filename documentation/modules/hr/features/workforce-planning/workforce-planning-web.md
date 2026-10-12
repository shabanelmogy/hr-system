# Workforce Planning Web Reference

## 1. Route

Workforce Planning is a standalone sidebar module at `/workforce-planning`, separate from Finance and Recruitment. Its permission-aware overview and shared `FeatureModuleLayout` group the protected leaf routes into planning and approval, capacity and demand, and monitoring and analysis. The module root is available when the user has any Workforce Planning view permission; every leaf still enforces its exact view permission. Finance retains Fiscal Years only.

The leaf routes are `/workforce-planning/plans`, `/workforce-planning/budgets`, `/workforce-planning/position-envelopes`, `/workforce-planning/staffing-requests`, `/workforce-planning/envelope-amendments`, and `/workforce-planning/trace`. The user-facing module labels are Authorized Position Capacity, Capacity Amendments, and Planning Trace & Commitments, while API/domain entity names remain unchanged.

## 2. Feature boundary

API contracts live in `types`, calls only in `services`, query ownership in React Query hooks, and pages/components compose shared UI. Cross-feature lookups are consumed through public APIs. The module shell owns only navigation composition and consumes the shared `FeatureModuleLayout` and `FeatureModuleOverview`; leaf pages continue to own their existing data journeys.

## 3. Listing

`WorkforcePlansMultiView` follows the reviewed Fiscal Years structure: shared PageHeader, server MyDataGrid, responsive EntityCards, shared pagination, loading progress, empty/no-results states, and refresh/add actions.

## 4. Search, filters, and sort

Search is server-side. Filters cover lifecycle status and FiscalYear. Sort choices are allow-listed and shared between Grid and Cards.

## 5. Cards

Cards show bilingual identity, revision, lifecycle badge, line count, planned slots, effective status, and the same permission/status-aware actions as the grid.

## 6. Creation journey

Shared MyForm, MyTextField, and MySelect compose the form. FiscalYear, Position, Branch, and FiscalPeriod are lookup-backed. Lines and targets support add/remove/reorder. Zod supplies all client validation and nested errors.

## 7. Editing journey

PlanCode and FiscalYear are immutable and read-only. Persisted nested lines/targets reset into the repeaters without loss. RowVersion is taken from the loaded detail.

## 8. Viewing journey

Create/edit asks for plain-language new positions and replacement positions only. The server-calculated current employee count, expected year-end count, and total recruitment are presented as summaries; none is manually editable. View mode displays all nested demand, baseline snapshot date, category-specific period allocation, revision chips, and previous-revision slot delta.

Mutation failures pass the complete API error object to the shared error dialog so status, server trace identifier, and structured details are retained for support diagnostics.

## 9. Lifecycle actions

Draft/Rejected exposes Submit, Submitted exposes Begin Review, UnderReview exposes Approve and Reject, and Approved/Superseded exposes Create Revision. Shared confirmations are used; rejection reason is validated inline.

## 15. Phase 2 budgets journey

`WorkforceBudgetsMultiView` mirrors the plans structure (PageHeader, server MyDataGrid, EntityCards, shared pagination/feedback). Grid and Cards show budget code, plan, FiscalYear, revision, currency, status, authorized headcount, salary, recruitment, grand total, and effective state with vertically centered status badges in both views. Filters cover status, FiscalYear, and plan; the first unfiltered option is localized `common.all`. Draft/Rejected budgets expose Edit and Submit; Submitted budgets expose Approve only to the built-in `admin` role and Reject to budget managers. A delegable approval permission is Deferred. No delete/archive action exists. Create selects an eligible approved plan from `source-plans`, loads `source-plans/{planId}`, and renders exactly one non-removable allocation line per plan line with read-only server snapshots and planned ceilings plus live client-side category sums as guidance. BudgetCode and plan are immutable after creation; currency becomes immutable after submission. Edit/view preserve all nested allocations; API field errors map to exact nested paths with first-invalid focus. Development-only mock data uses a real eligible plan and real period IDs within every ceiling with exactly distributed amounts, disabled until dependencies load.

## 16. Phase 2 envelopes journey

`PositionEnvelopesMultiView` is read-only: Grid and Cards present authorized/reserved/hired/available headcount and authorized/reserved/contracted/available salary with accessible progress indicators and a full-lineage detail dialog (FiscalYear -> Plan -> Budget -> Line -> Envelope plus organization snapshots and policy/currency). No mutation affordance exists.

## 17. Phase 2 realtime, cache, and verification

Budget mutations invalidate budget pages/details/source-plan lookups; approval additionally invalidates position envelopes and workforce plans. `npm run type-check` and `npm run check:architecture` pass; `workforceBudgetService.test.ts` covers serialization, filters, nested reconciliation, and field-path validation. Migration `20260906204810_create-workflow-budget` is applied and EF reports no pending model changes. Status is `Source Complete / Database Applied / Browser Smoke Pending` until authenticated browser smoke tests (creation, editing, viewing, listing/filtering, mock data) pass.

## 10. Permissions

The sidebar module and `/workforce-planning` overview require any Workforce Planning view permission. Each leaf route and navigation item requires its exact view permission, so access to Plans cannot authorize Budgets, Staffing Requests, Amendments, Envelopes, or Trace. Create, edit/submit, and review decisions continue to use their exact feature permissions. The built-in API `admin` role is reconciled with all tenant permissions on API startup even when optional production data seeding is disabled. Users must sign in again after a newly deployed permission is reconciled so the web session receives a newly issued token.

View, Create, Edit, and Approve controls are evaluated separately and app read-only mode removes mutation capability.

## 11. Localization and RTL

Every visible string exists in English and Arabic translation JSON. Direction is inherited from the shared theme and components.

## 12. Realtime and cache

The `workforce-plans` resource invalidates the feature root query key. Mutations invalidate page, detail, and revision queries.
The Fiscal Year selector consumes Finance's live lookup query, which refetches on
every dependent-screen mount; a newly created year therefore appears when this
page or its create dialog is opened even if an older inactive lookup was cached.

## 13. Verification

Required automated checks are `npm run type-check` and `npm run check:architecture`, plus focused tests where behavior is extracted. Browser comparison at mobile and desktop widths remains a manual release check after the database gate.

## 14. Status

The Web Phase 1 surface is source-complete. Live create/edit/lifecycle and realtime smoke tests are pending the user-owned corrective migration.

## 18. Phase 5–6 trace and governance

Offer UI actions are explicit Submit, Approve, Reject, Issue, Accept and Decline actions; no create flow auto-issues an offer. The trace page uses the shared PageHeader/Card/feedback primitives, Zod parsing of `unknown`, server queries, a framer-motion timeline, and an accessible ordered-card alternative. Financial amounts are displayed only when the API includes them; the client never attempts to redact a leaked value. Source checks are complete; authenticated browser smoke remains a manual release gate and is intentionally not run in this pass.

Offer creation sends only commercial terms and the application identity. Organization
placement is rendered from server data and cannot be overridden by the browser.
