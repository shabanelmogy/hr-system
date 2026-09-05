# Fiscal Years Expo Implementation Profile

## 1. Feature boundary

Source lives under `src/features/finance/fiscal-years`; Expo Router files
are thin route guards. API, runtime schemas, types, queries, validation, filter,
form, and screen remain feature owned.

## 2. Routes and navigation

Canonical route is `/finance/fiscal-years`. Constants, route manifest,
drawer definition, nested layout, redirect, and guarded route are registered.
Access requires `FiscalYears:View`.

## 3. Runtime response validation

Zod schemas validate page metadata, list records, detail periods, enum values,
archive markers, and RowVersion before data enters UI state.

## 4. API contract

The API module serializes the complete page criteria, trims search, normalizes
codes/names, sends RowVersion for update/restore/lifecycle, and never accepts
tenant/company scope.

## 5. Query ownership

React Query owns page/detail reads, mutations, and root invalidation. Stable keys
start with `fiscal-years` so realtime and reconnect invalidation stay independent
of individual hook implementations.

## 6. Server list state

`useServerListState` owns search, filters, sort, page, and size. `AppListScreen`
provides the shared view selector, search row, filter slot, loading/background
fetching, empty state, and server pagination.

## 7. Table view

`AppDataTable` shows code, bilingual names, dates, lifecycle, and authorized row
actions. Sorting and paging remain server-side and columns use shared responsive
horizontal scrolling.

## 8. Card view

`AppDataCard` displays localized identity, code, dates, frequency, period count,
lifecycle badge, and actions. Palette colors come from the active theme.

## 9. Create workflow

The full-screen `AppForm` uses shared text/date/select fields and Zod validation.
Start date calculates end date, frequency is explicit, save stays actionable for
field-error feedback, and development mode exposes Generate Mock Data.

## 10. Edit workflow

Edit is available only for active Draft rows. It loads detail first, preserves all
aggregate fields, and sends latest RowVersion. Periods are domain-generated and
never manually edited or sent as JSON.

## 11. View and lifecycle workflow

View mode renders read-only fields and generated period cards. Shared confirmation
dialogs handle archive, restore, and the next valid lifecycle action. Shared toast
feedback reports success and mapped API failure.

## 12. Permissions and read-only mode

Create/Edit/Delete/ManageLifecycle are evaluated independently. Read-only mode
blocks mutations through visible action rules and shared blocked-action feedback.
`RouteGuard` protects entry; the API remains authoritative.

## 13. Localization, theme, and safe area

English/Arabic vocabularies own all text. Shared AppScreen/AppForm shells own RTL,
safe-area, keyboard, scroll, and theme palette behavior. No deprecated native
SafeAreaView or feature-local toast offsets are introduced.

## 14. Responsive and UI parity audit

Table and Cards share the same authoritative page. Creation, editing, viewing,
listing/filtering, and mock-data journeys cover all new fields. Frequency and
lifecycle appear as labels/badges; periods appear as dedicated rows/cards rather
than JSON. Small screens scroll within shared shells.

## 15. Verification and optional capabilities

Feature ESLint, type-check, architecture, API/schema/validation, route, and realtime
tests are required. Table, Cards, detail, create, edit, lifecycle, and mock data are
Required. Chart, bulk lifecycle, import, and export are Excluded. Report is
Deferred until the Workforce Budget reporting dataset is approved; no placeholder
route or control exists.
