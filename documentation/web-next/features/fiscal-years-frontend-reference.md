# Fiscal Years Next.js Implementation Profile

## 1. Feature boundary

Source lives under `src/features/finance/fiscal-years`; the App Router
file only renders `FiscalYearsPage`. Types, services, hooks, validation, visual
composition, and orchestration stay inside the feature boundary.

## 2. Route and navigation

Canonical route is `/finance/fiscal-years`. Typed routes, access policy,
navigation type/title, and the shared Finance sidebar config all reference it.
Visibility requires `FiscalYears:View`.

## 3. Transport and contracts

Only `FiscalYearService` calls `apiService`. It normalizes code/names, sends the
server page criteria, sends RowVersion for update/restore/lifecycle, and never sends
tenant/company identifiers. React Query owns one stable `fiscal-years` key family.

## 4. Validation

The feature Zod schema mirrors code/name/frequency and exact twelve-month rules.
`FiscalYearForm` uses `react-hook-form`, `zodResolver`, `MyForm`, and shared fields.
API field errors map back to code and date fields.

## 5. List state

`useServerListState` owns zero-based UI page, size, debounced search, filters, and
sort; the API conversion to one-based pages happens once. Adaptive pagination
consumes the same criteria for Grid and Cards.

## 6. Grid view

`FiscalYearsDataGrid` composes `MyDataGrid`, its shared toolbar/search controls,
grid options, reset control, server sort/paging, theme-aware chips, and authorized
row actions. It does not call transport or perform local business filtering.

## 7. Card view

`FiscalYearsCardView` composes the shared card header/filter scaffold, EntityCard,
CardActionButtons, feedback states, and pagination. Cards show localized names,
code, dates, frequency, period count, lifecycle, and archive state.

## 8. Create and edit

Create/edit use the shared dialog system. Start date calculates the exact end date;
frequency is explicit. Edit hydrates current detail and RowVersion before submit.
Only Draft is offered for edit/archive.

## 9. Detail and lifecycle

View mode is read-only and lists generated periods. Shared confirmation dialogs
own archive, restore, open, begin-closing, close, and lock confirmation. No native
alert, confirm, or browser validation is used.

## 10. Permissions and read-only mode

The page derives separate view/create/edit/delete/lifecycle decisions. Subscription
read-only mode removes every mutating action. Server permission checks remain
authoritative.

## 11. Localization and RTL

All visible strings are present in English and Arabic translation JSON. Layout uses
shared theme/RTL behavior; no manual left/right business styling is introduced.

## 12. Responsive and accessibility contract

Grid and Cards are first-class views; Cards remain usable below 900px. Shared
dialog scrolling retains header/footer, errors render beneath fields, the first
invalid field receives focus, and accessible labels identify status/action icons.

## 13. Integration and realtime

API endpoint config, route registry, auth permission parity, sidebar navigation,
and realtime query registry are required evidence. Resource `fiscal-years`
invalidates the complete feature key family.

## 14. Verification and optional capabilities

Feature ESLint, standard type-check, architecture, service/validation, route,
permission parity, and realtime tests are required. Grid, Cards, detail, create,
edit, lifecycle, and mock data are Required. Chart and bulk lifecycle are Excluded.
Report/import/export are Deferred and have no reachable placeholder.
