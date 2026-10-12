# Workforce Planning Mobile Reference

## 1. Route and shell

Workforce Planning is a standalone main-drawer module at `/(main)/workforce-planning`, separate from Finance and Recruitment. Its index is a permission-aware overview, and its Expo Drawer layout mirrors the Basic Data module shell: a permanent module drawer at tablet/desktop widths and a front drawer on smaller screens.

Plans, Budgets, Authorized Position Capacity, Staffing Requests, Capacity Amendments, and Planning Trace & Commitments are physical child routes. The module root is available when the user has any Workforce Planning view permission; each child route and drawer item enforces its exact view permission. Finance retains Fiscal Years only.

## 2. Feature boundary

The feature owns API endpoints, runtime schemas, types, queries, forms, screens, and its module layout. Finance and Basic Data dependencies are imported only through their public feature APIs. The module layout reuses `ModuleDrawerContent`, `AppNavigationHeader`, and shared cards instead of rebuilding navigation primitives.

## 3. Runtime contracts

Zod parses page, detail, nested lines/period targets, mutation responses, and revision history from `unknown`. Detail contracts do not falsely inherit list-only summary fields.

## 4. Listing

Shared AppListScreen provides responsive table and cards, server pagination, search, refresh, loading, error, and empty states.

## 5. Filters

Shared AppFilterFormButton and AppSelectField filter lifecycle status and FiscalYear. Filters remain available in app read-only mode because they do not mutate data.

## 6. Cards

Cards show bilingual plan identity, lifecycle badge, revision, line/slot counts, and the same governed actions as the table.

## 7. Creation journey

Shared AppForm uses FiscalYear, Position, Branch, and FiscalPeriod selects. Nested line/period repeaters support add, remove, and reorder. Development mock data generates a structured plan.

## 8. Editing journey

Edit loads the detail graph, keeps PlanCode and FiscalYear read-only, preserves nested targets, and submits the loaded RowVersion.

## 9. Viewing journey

Create/edit asks for plain-language new positions and replacement positions only. Summary badges show that current employees are server-calculated and display expected year-end employees plus total recruitment. View mode presents nested demand, baseline snapshot date, category-specific period targets, revision history, lifecycle badges, and previous-revision slot delta.

## 10. Lifecycle actions

The table and cards expose Submit, Begin Review, Approve, Reject, and Create Revision according to status and permission. Shared ConfirmationDialog is used and the rejection reason is validated inline.

## 15. Phase 2 budgets journey

`WorkforceBudgetsScreen` mirrors the plans screen (AppListScreen table/cards, server paging/search/refresh, filter button for status/FiscalYear, lifecycle confirmations, read-only mode). Create picks an eligible approved plan, loads its source detail, renders one non-removable allocation line per plan line with read-only ceilings and live category sums, preserves nested allocations across edit/view, and offers dependency-aware development mock data. Draft/Rejected budgets expose Edit and Submit; Submitted budgets expose Approve only to the built-in `admin` role and Reject to budget managers.

## 16. Phase 2 envelopes journey

`PositionEnvelopesScreen` is read-only: table/cards show headcount and salary capacity with native accessible progress indicators, and a read-only `AppForm` dialog presents full lineage plus organization snapshots. No mutation action exists.

## 17. Phase 2 realtime, cache, and verification

Budget mutations invalidate `workforce-budgets` keys; approval additionally invalidates `position-envelopes` and `workforce-plans`. Runtime Zod schemas parse every budget/envelope/source-plan payload from `unknown`. `npm run typecheck` and `check:architecture` pass; `workforce-budget-api.test.ts` (3/3) covers endpoint mapping, nested parsing, and independent category reconciliation. Mobile lint has been re-run for the current feature surface; repository-wide inherited findings are recorded separately from Workforce Planning evidence. Migration `20260906204810_create-workflow-budget` is applied and EF reports no pending model changes. Status is `Source Complete / Database Applied / Device Smoke Not Run` per the user instruction.

## 11. Permissions and read-only

The module root requires any Workforce Planning view permission. Every physical child route and module-drawer item requires its exact view permission; a Plans viewer cannot open Budgets, Staffing Requests, Amendments, Envelopes, or Trace without the corresponding claim. Create, edit/submit, and review decisions use their exact feature permissions. The built-in API `admin` role is reconciled with all tenant permissions on API startup even when optional production data seeding is disabled. Users must sign in again after a newly deployed permission is reconciled so the mobile session receives a newly issued token.

View, Create, Edit, and Approve are checked separately. App read-only mode blocks every mutation and leaves navigation, search, filter, and view available.

## 12. Realtime and query ownership

React Query owns page/detail/revision cache. `workforce-plans` realtime events invalidate the feature query root.
The Fiscal Year dependency uses Finance's mount-refreshed lookup, so entering the
screen reconciles years created since the previous visit.

## 13. Localization and RTL

English and Arabic modules contain every visible label, action, validation, confirmation, status, baseline, revision, and feedback string. Shared components provide RTL layout.

## 14. Verification

Required automated checks are `npm run typecheck`, `npm run lint`, `npm run check:architecture`, and focused API/schema tests. Device smoke tests cover narrow layout, keyboard, scroll, repeaters, dialogs, and lifecycle actions after the database gate.

## 15. Status

The Mobile Phase 1 surface is source-complete. Live data and realtime verification are pending the user-owned corrective migration.

## 18. Phase 5–6 trace and governance

Offer actions are separate lifecycle commands and never auto-issue or auto-hire. The Trace screen uses shared `AppScreen`, `AppDataCard`, `AppSegmentedControl`, `AppTextField`, and `AppStateView` components, Zod runtime schemas, and a chronological accessible timeline. Salary/currency values are only present when the API caller has financial visibility. Device/simulator smoke is intentionally omitted per the user request; typecheck, lint, architecture, and focused API/schema tests remain the automated gate.

Offer creation now uses the shared `AppForm` controls, validates salary/currency/start
date inline, and sends only commercial terms plus application identity. Organization
placement remains server-derived and cannot be overridden by the device.
