# Workforce Planning Mobile Reference

## 1. Route and shell

The protected Expo route is `/(main)/workforce-planning`. It renders inside the main application layout and requires `WorkforcePlans:View`.

## 2. Feature boundary

The feature owns API endpoints, runtime schemas, types, queries, form, filter, and screen. Finance and Basic Data dependencies are imported only through their public feature APIs.

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

## 11. Permissions and read-only

The route requires `WorkforcePlans:View`; create, edit/submit, and review decisions use their exact feature permissions. The built-in API `admin` role is reconciled with all tenant permissions on API startup even when optional production data seeding is disabled. Users must sign in again after a newly deployed permission is reconciled so the mobile session receives a newly issued token.

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
