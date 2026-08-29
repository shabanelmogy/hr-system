# States Next.js Frontend Reference

Status: applied adaptive-list feature profile. Feature owner: `src/features/basic-data/geographical-information/states`.

## 1. Route and ownership

The canonical App Router adapter at `app/(main)/super-admin/geography/states/page.tsx` imports only the States public API. The route is `super_admin` only; tenant Basic Data does not expose global State management. Feature pages, components, hooks, services, types, and utilities remain inside States.

## 2. Browser transport

`StateListItem`, detail, lookup, relation, request, page-query, and bulk-response types mirror the CQRS API. Bulk create uses the named `CreateStatesRequest` envelope and serializes exactly `{ states: [...] }`, never a raw array. `StateService` normalizes names/code once, serializes the State query, and uses canonical State routes from `config/api/basicData.ts`.

## 3. Query model

`stateKeys` has hierarchical page, lookup, detail, and District relation keys. Page queries keep previous data; detail is enabled only when a record is selected; every mutation invalidates the States prefix.

## 4. Server-list controller

`useStateGridLogic` owns the only browser list criteria state. It debounces search, converts zero-based page state in `toStatePageQuery`, resets on criteria changes, clamps an invalid last page, and clears bulk selection on criteria/page changes. The shared adaptive hook loads the complete filtered/sorted result through 5000 rows and otherwise retains server paging.

## 5. Shared toolbar and Grid Options

`StatesDataGrid` uses the same `MyDataGrid` in client or server pagination mode and the shared toolbar. The column dropdown, condition dropdown, search input, and Reset button use the shared aligned 40px control row. Grid Options is the terminal toolbar item; it owns status selection, the shared Columns/Density controls, and bulk archive. Sorting and filtering continue through the API contract in both pagination modes.

ID, District count, Updated, Status, and Actions are explicitly non-sortable;
Country remains sortable because the State API allow-list supports it. Selection
is normalized to active eligible IDs and rejects more than 100 with localized
feedback instead of truncating or sending an invalid bulk request.

The shared multi-view header Filter button begins pressed and toggles only
criteria-bar visibility. It controls the Grid toolbar in Grid, the State
criteria header in Cards and Chart, and the `ReportViewer` criteria sidebar in
Report. It never resets or locally applies controlled criteria, and it exposes
its pressed state for keyboard and screen-reader users. The implementation
comes from shared `PageHeader` and `HeaderActions`, so future multi-view
features reuse the same props instead of creating another header toggle.

## 6. Views

Grid is the default. Cards render the same adaptive display page and actions through the
shared `EntityCard` scaffold, shared card criteria toolbar, loading/empty/no-results
states, highlight behavior, and shared pagination. State-specific content is
Country, State code, District count, quality, and created date. Report mode uses
the shared Crystal `ReportViewer`, a States-only report catalog, and the
States-only generation route; it does not render a local table as a pretend
report. The checked-in `Reports/States` slot is intentionally empty, so report
mode displays a localized unavailable state until a valid State `.rpt` is
added. Chart mode is Required and uses the same controlled criteria, resets to
the first page when entered, and does not render pagination controls. Its notice
and metric labels explicitly distinguish matching authoritative totals from
first-page-scoped Country, State, District, and timeline data.
Grid and Cards remain the paginated list surfaces. Import is Required and uses
the State bulk-create contract (`POST /api/v1/states/bulk`, `States:Create`,
1-100 rows, atomic submit).

States uses the shared global `views.*` names and shared padded view toggle rather
than feature-owned label variants. Its Chart root provides responsive inner
padding so analytics do not render flush against the feature shell.

### Web Chart applied profile

`StatesChartView` uses the same controlled criteria as Grid and Cards and resets
to the first page on entry. `totalCount` remains the authoritative matching-State
total; visible States, Country distribution, District count, and timeline data
are derived from that first page. The localized States scope notice and metric
labels make this boundary explicit. The view has no pager and does not claim
global aggregation.

The Chart root is a viewport-bounded flex column with responsive inner padding,
`height: 100%`, `minHeight: 0`, and hidden outer overflow. Its scope notice and
summary cards do not shrink; the chart grid fills the remaining height and owns
vertical scrolling when space is short. Country bar, Country pie, District, and
optional Timeline panels fill their responsive grid cells, have a 280px narrow-
screen minimum, and stretch in desktop rows. This removes the unused area below
the chart grid while keeping the application document from scrolling vertically.

Grid keeps the reusable `MyDataGrid`/`GridFooter` pagination used by Districts.
States configures the same component for client paging only when the complete
result is loaded through 5000 rows, and for controlled server paging above that
boundary; it never hides navigation or creates a feature-specific replacement.
An older hosted API that rejects the bounded complete-result request triggers a
safe server-pagination fallback until the updated States contract is deployed.

### Web Cards applied profile

States Cards use the same adaptive list criteria as Grid. The shared card
toolbar renders the State search-column choices (`all`, English name, Arabic
name, State code, and Country) and all six supported conditions before the
search input, then the shared sort controls and Reset in the same aligned row.
The terminal Grid Options menu owns Status and the permission-gated bulk Archive action; it does
not add State-specific client filtering. Shared sort-column and direction
controls follow search and accept only the State server sort allow-list.

`StatesCardView` maps the current page into the shared responsive
`12 / 6 / 4 / 3` card grid (`xs / sm / md / lg`). Results at or below 5000 rows
are loaded once and paged on the client; larger results remain server-paged. It composes `EntityCard` for
the fixed card scaffold, guarded active-row selection, action footer,
hover/reduced-motion behavior, logical RTL positioning, and the temporary
five-second create/edit highlight. State fields remain State-owned; do not add
Countries-only card content or filters.

The card grid—not the document—owns vertical overflow. `StateCardViewPagination`
is the final non-shrinking pinned footer and delegates to shared
`CardViewPagination` with State page sizes `5`, `10`, `25`, and `50`. It presents
a localized live range, responsive one-based page navigation and a page-size
selector while the server-list controller remains zero-based. The Basic Data
feature shell is viewport-bounded so the pager stays at the bottom; only the
cards area scrolls when needed.

Default empty results preserve the permitted Add action; filtered empty results
offer Clear criteria and Refresh. Selection clears through controller transitions
on criteria/page/page-size changes, and bulk Archive is disabled with no eligible
selection or while its mutation is pending. Initial loading owns skeleton/overlay
UI; background refetch preserves the current Grid, Cards, or Chart and uses the
non-destructive progress indicator at the view boundary.

## 7. Form and details

`StateForm` uses React Hook Form/Zod and the Countries public lookup API for parent selection. In development, its shared `MyForm` footer can fill a domain-owned State sample and an active Country; it never submits automatically and is disabled until the parent lookup is ready. Edit/view requests State detail, blocks submission on detail load failure, maps Country/duplicate API errors, and uses modal dirty/busy behavior. Names use the shared 2-100 printable-Unicode schema (spaces, digits, punctuation, and mixed scripts are allowed; control characters and line breaks are rejected). Code entry is normalized to uppercase at service/API boundaries and remains restricted to 2-10 ASCII letters, digits, or hyphens.

## 8. Actions and permissions

The State permission matrix differentiates view, create, edit, archive, and restore. Visible actions and direct handlers check tenant read-only first, then permission and active/archived lifecycle. Archive, restore, and bulk archive use explicit confirmation dialogs.

## 9. Realtime and navigation

The existing State basic-data route, permission policy, navigation configuration, and realtime registry are retained. `stateKeys.all` remains the public realtime prefix so a post-commit State event refreshes States and affected Country/District views.

## 9b. Import contract

The XLSX column order is:

```text
nameAr, nameEn, code, countryName
```

Download `states-import-template.xlsx` and treat row 1 as a required schema, not
a disposable row. The shared browser parser accepts `.xlsx` with the canonical
XLSX MIME, browser-empty MIME, or generic binary MIME up to 5 MiB; requires a
real XLSX ZIP container; reads only the first worksheet; requires the exact
case-sensitive headers above in order; and
rejects duplicate headers, unexpected value columns, formulas, header-only files,
and more than 100 non-empty data rows. Wholly blank rows are ignored while real
worksheet row numbers are preserved for feedback.

`countryName` accepts the parent Country English or Arabic name. State Import
requires `States:Create` to submit and `Countries:View` to load the registered
active lookup. Lookup loading, empty, forbidden, and transport-error states block
submission and display their own localized message. They never produce an empty
lookup or false “Country not found” rows. Only after lookup state is `ready` can
an unmatched parent become `unknownCountry`; a lookup transport failure has its
own explicit retry action.

Rows whose Country cannot be resolved after readiness, that fail the shared State
Zod schema, or that repeat the same field case-insensitively for the same Country
stay local `invalid` rows. Arabic name, English name, and code are tracked
independently, so cross-field equality is not a duplicate. Valid rows progress
from `pending` to `submitted`, then to `uploaded` only after the atomic
`{ states: [...] }` request succeeds and the States prefix is invalidated.

The bulk endpoint has no idempotency key. A no-response/timeout or 5xx marks the
submitted preview `uncertain`, locks file selection, clear, and resubmission, and
offers a refreshed Grid reconciliation path. It does not offer “Retry failed.” A
stable 4xx validation/conflict marks the submitted batch `failed`; select a
corrected file or refresh before another attempt.

Reuse `excelService.ts` and `SpreadsheetImportCard` for file safety, template,
actions, and uncertainty feedback. Keep `stateImport.ts`, Country lookup mapping,
Country-scoped duplicate rules, exact request mapping, and domain messages inside
States. This ownership split—not a copy of Countries internals—is the pattern for
future dependent imports.

Import visibility is not the write boundary. `uploadStates` independently blocks
tenant read-only mode and requires `States:Create` before dependency resolution or
submission; the card's `canSubmit` combines that decision with the ready Country
lookup. `Countries:View` remains a separate required lookup permission and its
failure never becomes an unknown-Country row.

Import is web-only in States; mobile exposes neither document picking nor bulk
create.

## 10. Crystal report integration

`StateReportPage` follows Country report catalog and viewer behavior. It sends
`{ subFolderPath: "States", reportCategory: "States" }` to `report/info` and
only mounts `ReportViewer` after the catalog supplies a valid `.rpt`. The viewer
calls `report/states/generate`, whose request supports Arabic and English State
name parameters and uses the `V_AllStates` dataset. The shared viewer accepts a
feature generation route and a controlled filter-sidebar state, preserving the
existing Countries route.

`api/CrystalReportGeneratorApi/Reports/States/.gitkeep` deliberately creates a
catalog location without inventing an invalid report file. When the State
Crystal template is ready, place the valid `.rpt` in that folder with `States`
in its filename (for example, `States.rpt`); the current catalog filter will
then expose it without a browser replacement. The Crystal template itself must
use the documented State dataset fields rather than Country-only report fields.

## 11. Localization and RTL

The `states` namespace has paired EN/AR search, status, lifecycle, report, import, empty/error, and accessibility labels. Names choose active locale/Theme direction without hard-coded left/right layout.

## 12. Responsive and accessibility

Shared feature header/breadcrumb layout, DataGrid toolbar, MUI dialogs, cards, table overflow, icon labels, focus-managed forms, and status text provide desktop, tablet, and narrow-screen behavior. Manual keyboard, dialog focus, and high text-scale verification remains a release gate.

## 13. Test focus

Shared parser tests prove file metadata, exact/headerless/reordered/duplicate
headers, blank and empty files, formulas, unexpected columns, row limits, row
numbers, and ambiguous-response classification. State Import tests prove lookup
resolution and the explicit loading/empty/forbidden/error/ready state matrix;
duplicate tests prove field-scoped, case-insensitive behavior per Country. State
service tests assert the exact normalized `{ states: [...] }` body for the bulk
route. Page wiring tests cover controller criteria, separate initial and
background loading, forms, and bulk callbacks; query-hook tests prove invalidation
precedes consumer success handling; column and shared-selection tests cover sort
affordances and the 100-ID bulk boundary. Keep direct permission/read-only guards,
locked uncertainty reconciliation, and EN/AR/RTL coverage current.
Existing generic server-list, toolbar, route, and realtime tests remain shared
evidence.

## 14. State-specific differences from Countries

States has required parent Country and active District archive checks; it has no currency, alpha code, phone, Country-state presence filters, or global aggregate analytics. Unlike Countries, State import rows carry a parent-Country column that must resolve to an active Country. Its Crystal report uses State plus parent-Country dataset fields, and its Chart is intentionally first-page scoped with no pager. Do not copy Countries-only fields, report parameters, or findings.

## 15. Verification

Run architecture, type-check, strict type-check, lint, tests, build, documentation validation, link checks, and a browser matrix for EN/AR, RTL, desktop/tablet/mobile widths, permissions/read-only, lifecycle dependency errors, reset/search conditions, and realtime refresh.
