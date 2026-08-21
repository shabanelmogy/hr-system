# States Next.js Frontend Reference

Status: applied server-managed feature profile. Feature owner: `src/features/basic-data/geographical-information/states`.

## 1. Route and ownership

The App Router adapter at `app/(main)/basic-data/(geographical-information)/states/page.tsx` imports only the States public API. Feature pages, components, hooks, services, types, and utilities remain inside States.

## 2. Browser transport

`StateListItem`, detail, lookup, relation, request, page-query, and bulk-response types mirror the CQRS API. `StateService` normalizes names/code once, serializes the State query, and uses canonical State routes from `config/api/basicData.ts`.

## 3. Query model

`stateKeys` has hierarchical page, lookup, detail, and District relation keys. Page queries keep previous data; detail is enabled only when a record is selected; every mutation invalidates the States prefix.

## 4. Server-list controller

`useStateGridLogic` owns the only browser list state. It debounces search, converts zero-based page state in `toStatePageQuery`, resets on criteria changes, clamps an invalid last page, clears bulk selection on criteria/page changes, and never filters or sorts a server page locally.

## 5. Shared toolbar and Grid Options

`StatesDataGrid` uses `MyDataGrid` server modes and the shared toolbar. The column dropdown, condition dropdown, search input, and Reset button use the shared aligned 40px control row. Grid Options is the terminal toolbar item; it owns status selection, the shared Columns/Density controls, and bulk archive. The grid does not expose unsupported client sorting.

## 6. Views

Grid is the default. Cards render the same server page and actions through the
shared `EntityCard` scaffold, shared card criteria toolbar, loading/empty/no-results
states, highlight behavior, and server-page pagination. State-specific content is
Country, State code, District count, quality, and created date. Report mode renders
the same current server page and declares its current-row/total scope because no
State report backend exists. Chart and import are deliberately absent; they are
Countries-only capabilities without a States contract.

### Web Cards applied profile

States Cards use the same server-owned list state as Grid. The shared card
toolbar renders the State search-column choices (`all`, English name, Arabic
name, State code, and Country) and all six supported conditions before the
search input, then the shared sort controls and Reset in the same aligned row.
The terminal Grid Options menu owns Status and the permission-gated bulk Archive action; it does
not add State-specific client filtering. Shared sort-column and direction
controls follow search and accept only the State server sort allow-list.

`StatesCardView` maps the current server page into the shared responsive
`12 / 6 / 4 / 3` card grid (`xs / sm / md / lg`). It composes `EntityCard` for
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
selection or while its mutation is pending.

## 7. Form and details

`StateForm` uses React Hook Form/Zod and the Countries public lookup API for parent selection. Edit/view requests State detail, blocks submission on detail load failure, maps Country/duplicate API errors, and uses modal dirty/busy behavior. Code entry is normalized to uppercase at service/API boundaries.

## 8. Actions and permissions

The State permission matrix differentiates view, create, edit, archive, and restore. Visible actions and direct handlers check tenant read-only first, then permission and active/archived lifecycle. Archive, restore, and bulk archive use explicit confirmation dialogs.

## 9. Realtime and navigation

The existing State basic-data route, permission policy, navigation configuration, and realtime registry are retained. `stateKeys.all` remains the public realtime prefix so a post-commit State event refreshes States and affected Country/District views.

## 10. Localization and RTL

The `states` namespace has paired EN/AR search, status, lifecycle, report, empty/error, and accessibility labels. Names choose active locale/Theme direction without hard-coded left/right layout.

## 11. Responsive and accessibility

Shared feature header/breadcrumb layout, DataGrid toolbar, MUI dialogs, cards, table overflow, icon labels, focus-managed forms, and status text provide desktop, tablet, and narrow-screen behavior. Manual keyboard, dialog focus, and high text-scale verification remains a release gate.

## 12. Test focus

Add pure query serialization, State permission matrix, service route, and controller/view integration coverage as the implementation evolves. Existing generic server-list, toolbar, route, and realtime tests remain shared evidence.

## 13. State-specific differences from Countries

States has required parent Country and active District archive checks; it has no currency, alpha code, phone, Country-state presence filters, XLSX bulk create/import, chart, or State PDF report. Do not copy any of those Countries fields or findings.

## 14. Verification

Run architecture, type-check, strict type-check, lint, tests, build, documentation validation, link checks, and a browser matrix for EN/AR, RTL, desktop/tablet/mobile widths, permissions/read-only, lifecycle dependency errors, reset/search conditions, and realtime refresh.
