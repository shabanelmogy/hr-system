# Workforce Planning Web Reference

## 1. Route

The protected route is `/workforce-planning/plans` and requires `WorkforcePlans:View`.

## 2. Feature boundary

API contracts live in `types`, calls only in `services`, query ownership in React Query hooks, and pages/components compose shared UI. Cross-feature lookups are consumed through public APIs.

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

## 10. Permissions

The sidebar and route require `WorkforcePlans:View`; create, edit/submit, and review decisions use their exact feature permissions. The built-in API `admin` role is reconciled with all tenant permissions on API startup even when optional production data seeding is disabled. Users must sign in again after a newly deployed permission is reconciled so the web session receives a newly issued token.

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
