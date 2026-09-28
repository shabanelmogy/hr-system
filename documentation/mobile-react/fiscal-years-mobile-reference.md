# Fiscal Years Expo Implementation Profile

## 1. Feature boundary

Source lives under `src/modules/accounting/fiscal-years`; Expo Router files
are thin route guards. API, runtime schemas, types, queries, validation, filter,
form, and screen remain feature owned.

## 2. Routes and navigation

Canonical route is `/finance/ledger-setup/fiscal-years`. Constants, route manifest,
drawer definition, nested layout, redirect, and guarded route are registered.
Access requires `FiscalYears:View`.

## 3. Runtime response validation

Zod schemas validate page metadata, list records, detail periods, enum values,
Current markers, per-user context responses, archive markers, and RowVersion
before data enters UI state.

## 4. API contract

The API module serializes the complete page criteria, trims search, normalizes
codes/names, sends RowVersion for update/restore/lifecycle/company Current, reads
and updates the signed-in user's context, and never accepts caller-selected
tenant/company/user scope.

## 5. Query ownership

React Query owns page/detail reads, mutations, and root invalidation. Stable keys
start with `fiscal-years` so realtime and reconnect invalidation stay independent
of individual hook implementations. The lookup explicitly refetches on mount
because it supplies downstream workflows such as Workforce Planning.

## 6. Server list state

`useServerListState` owns search, filters, sort, page, and size. `AppListScreen`
provides the shared view selector, search row, filter slot, loading/background
fetching, empty state, and server pagination.

## 7. UI pattern and Table view

The screen follows **P-001 Server-managed Grid/CRUD** from
`documentation/project/SCREEN_PATTERN_CATALOG.md`. Table, Cards, and managed
Report are required; Chart is Excluded, Import/Export are Excluded for Mobile,
and generated periods are a read-only child preview. The full-screen form remains
one compact sectioned workflow; P-003 tabs are intentionally not applied.

`AppDataTable` shows code, bilingual names, dates, lifecycle, Current, and
authorized row actions. It renders Current with the shared warning/gold semantic,
hides archive for the Current row, and offers Set Current only for an Open target
with `FiscalYears:SetCurrent`. Sorting and paging remain server-side and
columns use shared responsive horizontal scrolling.

## 8. Card view

`AppDataCard` displays localized identity, code, dates, frequency, period count,
lifecycle badge, gold/warning company Current badge, and actions. Draft, Closing,
Closed, and Locked cards do not expose Set Current. Palette colors come from the
active theme.

## 9. Create workflow

The full-screen `AppForm` uses shared text/date/select fields and Zod validation.
Start date calculates end date, frequency is explicit, save stays actionable for
field-error feedback, and the shared Generate Mock Data action is available on
writable forms in hosted trials and development alike without submitting or
fabricating identity, scope, or RowVersion.

## 10. Edit workflow

Edit is available only for active Draft rows. It loads detail first, preserves all
aggregate fields, and sends latest RowVersion. Periods are domain-generated and
never manually edited or sent as JSON.

## 11. View and lifecycle workflow

View mode renders read-only fields and generated period cards. Shared confirmation
dialogs handle archive, restore, and valid lifecycle actions. Closed rows expose
separate Reopen and Lock actions; Locked rows expose a warning-backed Reopen action. Reopen uses RowVersion and
leaves calendar identity fields read-only. Shared toast feedback reports success
and mapped API failure.

## 11A. Global working-year context

This surface is the Mobile `Adapted` implementation of **P-008 Global Scoped
Context Selector**. `FiscalYearContextSwitcher` is Accounting-owned. The Expo composition root passes
it into `NavigationContextActionsProvider`; every generic `AppAppBar`, including
nested module layouts, consumes the slot without importing Accounting. It shows an
icon-only trigger on narrow phones and the bilingual current value where space
allows. The
selection is personal and company-scoped, uses only `FiscalYears:View`, warns via
the shared unsaved-change confirmation before discarding a form, and falls back to
company Current through the API contract.
The App header uses the shared `AppContextBadge` for Tenant, Company, and Working
Fiscal Year in that scope order inside one translucent on-primary group. Tablet/
wide layouts show icon plus current value on one line; narrow phones render
44-point icon-only actions while retaining the complete translated label/value for
assistive technology. The group has no individual card shadows. Tenant is read-only
session identity; Company and Fiscal Year keep their existing modal and dirty-guard
behavior.

## 12. Permissions and read-only mode

Create/Edit/Archive/Restore/Open/BeginClosing/Close/Lock/Reopen/SetCurrent are
evaluated independently. Read-only mode blocks financial master/lifecycle changes
through visible action rules and shared blocked-action feedback, but permits the
personal working-year preference. `RouteGuard` protects entry; the API remains
authoritative.

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

Feature ESLint, type-check, architecture, API/schema/validation, route, endpoint
contract-matrix, and realtime tests are required. The matrix records `context`
GET/PUT separately from `setCurrent` POST, including their different permission
and user/company scope. Table, Cards, detail, create, edit, lifecycle, and mock data are
Required. Fiscal Year Report is Required through the shared managed Crystal
component with entity key `fiscalyears`; the Reporting module/catalog owns report
rendering. Chart and bulk lifecycle are Excluded; Import and Export remain
Excluded with no placeholder route or control.

The required manual device evidence is cases `M-01` through `M-05`, the applicable
security cases, bilingual/RTL coverage, and the Mobile five-point UI audit in
`documentation/plans/business/accounting-core-gl/manual-acceptance/FISCAL-YEARS-STEP-01.md`.
It must run on an actual device and record device/OS/build, light/dark where
supported, portrait/landscape, keyboard/safe-area/dirty-back behavior, online-only
financial mutation, conflict reload, permissions, current-company scope, and the
Table/Cards/Report views. Emulator/source evidence alone is insufficient. The step
remains Active until the user explicitly accepts the combined Web/device result.
