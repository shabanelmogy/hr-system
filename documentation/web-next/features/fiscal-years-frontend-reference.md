# Fiscal Years Next.js Implementation Profile

## 1. Feature boundary

Source lives under `web-next/src/modules/accounting/fiscal-years`; the App Router
file only renders `FiscalYearsPage`. Types, services, hooks, validation, visual
composition, and orchestration stay inside the feature boundary.

## 2. Route and navigation

Canonical route is `/finance/ledger-setup/fiscal-years`. Typed routes, access policy,
navigation type/title, and the shared Finance sidebar config all reference it.
Visibility requires `FiscalYears:View`.

## 3. UI pattern and transport contract

The screen follows **P-001 Server-managed Grid/CRUD** from
`documentation/project/SCREEN_PATTERN_CATALOG.md` as its layout and interaction
pattern. P-001 does not imply Countries' five views. Grid, Cards, and managed
Report are the required views; Import, Export, and Chart are Excluded and have no
route, control, parser, or transport. Generated periods are a read-only child
preview. Create/edit/view uses one sectioned shared form; P-003 tabs are
intentionally not applied because this is a single bounded calendar workflow.

Only `FiscalYearService` calls `apiService`. It normalizes code/names, sends the
server page criteria, sends RowVersion for update/archive/restore/lifecycle/company
Current, updates the signed-in user's context without sending a user/company ID,
and never sends tenant/company identifiers. React Query owns one stable
`fiscal-years` key family including the context query.

## 4. Validation

The feature Zod schema mirrors code/name/frequency and exact twelve-month rules.
`FiscalYearForm` uses `react-hook-form`, `zodResolver`, `MyForm`, and shared fields.
API field errors map back to code and date fields.

## 5. List state

`useServerListState` owns zero-based UI page, size, debounced search, filters, and
sort; the API conversion to one-based pages happens once. Server-first pagination
consumes the same criteria for Grid and Cards and preserves the prior page while
the next authoritative page loads.

## 6. Grid view

`FiscalYearsDataGrid` composes `MyDataGrid`, its shared toolbar/search controls,
grid options, reset control, server sort/paging, theme-aware chips, and authorized
row actions. It identifies the company Current year with a gold/warning badge,
offers Set Current only for an Open target and only with `FiscalYears:SetCurrent`,
and disables archive for Current. It does not call
transport or perform local business filtering.

## 7. Card view

`FiscalYearsCardView` composes the shared card header/filter scaffold, EntityCard,
CardActionButtons, feedback states, and pagination. Cards show localized names,
code, dates, frequency, period count, lifecycle, archive state, and company Current
badge/action. Grid, Cards, detail, and the confirmation surface use the same
gold/warning semantic treatment; Draft/Closing/Closed/Locked rows do not expose
Set Current.

## 8. Create and edit

Create/edit use the shared dialog system. Start date calculates the exact end date;
frequency is explicit. Edit hydrates current detail and RowVersion before submit.
Only Draft is offered for edit/archive.

## 9. Detail and lifecycle

View mode is read-only and lists generated periods. Shared confirmation dialogs
own archive, restore, open, begin-closing, close, lock, and reopen confirmation.
Closed rows expose separate translated Reopen and Lock actions; Locked rows expose
Reopen. The selected action sends RowVersion,
returns the year/periods to Open, and leaves calendar fields read-only. No native
alert, confirm, or browser validation is used.

## 9A. Global working-year context

This surface follows **P-008 Global Scoped Context Selector**. The
`FiscalYearContextSwitcher` is Accounting-owned and is injected by `MainShell`
into generic full/compact `MainLayout`/`TopBar` slots; the shell never imports
Accounting internals. It appears for users with `FiscalYears:View`, displays the
effective bilingual year, and writes only that user's selection for the current
company. Company switching naturally loads a different scoped preference. The
shared unsaved-changes registry must approve a context switch before the request
runs. Missing/archived preferences fall back to company Current on the server.
The Topbar presents the complete scope hierarchy as Tenant, Company, then Working
Fiscal Year through the shared `ContextBadge`/`ContextSwitcher` presentation. Wide
layouts group the three contexts into one restrained surface and show icon plus
current value on one line; translated context labels remain in each complete
accessible name and tooltip instead of consuming a second visual line. Compressed
layouts retain all three as icon-only controls/identity. Only context values may
truncate; the fixed user-avatar frame and its focus/ring decoration must remain
fully visible in LTR and RTL. Tenant is informational and does not imply a
post-login tenant-switch API.

## 10. Permissions and read-only mode

The page derives separate view/create/edit/archive/restore/lifecycle/SetCurrent
decisions. Subscription read-only mode removes financial mutations and company
Current changes, while the personal working-year selector remains available with
View. Server permission checks remain authoritative.

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
invalidates the complete feature key family. The Fiscal Year lookup is a live
cross-feature dependency and explicitly refetches on every mount, which is
stricter than the application's global stale-on-mount reconciliation. A reopened
year therefore returns to Workforce Planning without an inactive-cache gap.

## 14. Verification and optional capabilities

Feature ESLint, standard type-check, architecture, service/validation, route,
permission parity, and realtime tests are required. Grid, Cards, detail, create,
edit, lifecycle, and mock data are Required. Chart, Import, Export, and bulk
lifecycle are Excluded with no reachable placeholder. Report is Required through
the shared managed Crystal component with entity key `fiscalyears`; the Reporting
module/catalog owns report endpoint and dataset rendering. Mock
data is available on writable forms through the shared form contract in hosted
trials and development alike; it never submits or fabricates identity, scope, or
RowVersion.

The source checks above are followed by the user-operated Web cases `W-01` through
`W-09`, security cases `S-01` through `S-04`, bilingual/RTL coverage, and the
five-point UI-pattern audit in
`documentation/plans/business/accounting-core-gl/manual-acceptance/FISCAL-YEARS-STEP-01.md`.
Run them at desktop and compact widths with full-access, view-only, denied,
read-only and second-company contexts. A passing browser journey is recorded but
does not close the feature until the same scenario's actual-device cases pass and
the user explicitly accepts the complete step.
