# States Expo Mobile Reference

Status: applied Expo server-managed feature profile. Requires Expo SDK 54 conventions.

## 1. Source inventory

The physical route is `app/(main)/basic-data/geographical-information/states.tsx`. The feature owns `src/features/basic-data/states/{api,queries,types,components,screens,index.ts}` and uses only shared mobile primitives plus Countries’ deliberate public API for parent lookup.

## 2. Route and policy

`RouteGuard(ROUTES.basicData.states)` enforces the `super_admin` route policy; action controls retain States permissions. Typed route constants, the Platform geography navigation item, realtime registry, and notification action mapper are registered together.

## 3. Runtime contract

Zod parses page, detail, relation, lookup, and bulk response shapes. State list rows include the active District count and parent Country. Requests contain only printable Unicode Arabic/English display names, code, and CountryId. Names are 2-100 characters and allow spaces, digits, punctuation, and mixed scripts; control characters and line breaks are rejected. Codes remain 2-10 ASCII letters, digits, or hyphens.

## 4. Endpoints

The API wrapper owns `states`, lookup, compatibility by-country lookup, details, State-with-Districts relation, create/update/archive, restore, and bulk archive endpoints. Query serialization always sends page/status/sort/search field/search condition and omits empty optional criteria.

## 5. Query keys and mutations

`stateKeys` provides list, lookup, and relation prefixes. List uses prior-page placeholder data. Because each State list row contains every mutable form field, no redundant detail hook/key is retained. Save selects create/update; lifecycle mutations invalidate `stateKeys.all`; realtime uses the same stable prefix without importing private hooks.

## 6. Controlled list state

`StatesScreen` owns a single zero-based `useServerListState`. It converts page number with `toApiPageNumber`, debounces search through the shared hook, resets page on search/status/sort/field/operator changes, and clears bulk selection on criteria/page changes. Current page rows are not client-filtered, sorted, or sliced.

## 7. Search and filters

The shared search field drives server search. The navigation App Header owns the
page identity, so the content does not repeat a State title/subtitle. The main
toolbar contains Search, one Filter button, and the permission-guarded Add icon
through `AppListScreen.searchActions`. Its feature-owned modal applies
active/archived/all, all/name Arabic/name English/code/country, and all six API
operators together through `AppListScreen.filterControl` and the shared
`AppSearchFilterControls`. Bulk Archive uses `aboveViews` only while rows are
selected and does not crowd the search row.
Controls use direction-aware, accessible shared select modals.

## 8. Views

Table and Cards share rows, criteria, total, controlled pagination, actions, and
pull-to-refresh. Chart uses the same loaded server page with no pager and renders a
compact matching/loaded/country/district summary, states-by-country comparison,
district-coverage ring, districts-by-state comparison, and vertical creation timeline. Its
summary labels distinguish loaded-page series from the authoritative matching
total without a scope paragraph below the view buttons; chart cards scroll
vertically inside the view. Report uses the managed Crystal catalog and render
contract independently from list pagination. Import is a required native XLSX
workflow, independent from list pagination: it selects one `.xlsx` up to 5 MiB,
requires exactly `nameAr,nameEn,code,countryName`, previews no more than 100 rows,
and renders picker, validation, row feedback, submit, failure, and reconciliation
states inside a `paginate: false`, `renderWhenEmpty: true`, scrollable view.

Each State row resolves `countryName` against the authorized active-Countries
lookup (Arabic or English normalized matching) before it becomes the exact
`{ nameAr, nameEn, code, countryId }` payload. Unknown/inactive/ambiguous parents
remain local row errors and are never sent. Valid rows are submitted once to
`POST states/bulk` as `{ states: [...] }`; the server batch is atomic. Picker
cancellation is non-error. A timeout or transport outcome that cannot prove no
commit becomes `uncertain`, retains the preview, and requires canonical-list
reconciliation before resubmission. Import requires `States:Create` plus Country
lookup/View authorization; direct handlers check tenant read-only first. Success
invalidates `stateKeys.all`.

The Chart view composes shared `src/shared/components/charts` primitives and keeps
State aggregation in `components/chart-view/state-chart-data.ts`. It uses
`paginate: false`, `renderWhenEmpty: true`, and `scrollable: true`; labels and
accessible summaries carry meaning in addition to color.
Long country and State names use horizontal bars, the bounded with/without
districts proportion uses a ring, and short ordered month labels use vertical
bars. This shape-by-meaning rule is part of the reference; do not repeat one
visual type for every series or infer a complete timeline from the loaded page.
On phone widths, the five view positions use one full-width row of equally
distributed icon-only buttons with localized accessibility labels, preventing
Report and Import from wrapping or overflowing below Chart.

## 9. Form

The full-screen State form uses React Hook Form/Zod, validates State-specific fields, loads active Countries through the Countries public API, normalizes code, supports create/edit/view, and uses shared keyboard/safe-area/dirty/busy handling. In development, `AppForm` can fill a domain-owned sample with an active Country parent; it never submits and is disabled until the lookup is ready. The list row contains all State form fields, so no redundant detail hydration is required for edit.

## 10. Permissions and lifecycle

Route/view uses `States:View`; create/edit/archive/restore recheck permission and read-only state in direct handlers. Active cards can be selected for bulk archive. Archived cards offer restore. The API remains authoritative for Country-active and District-dependency validation.

## 11. Report decision

The browser State report catalog and generation contract are ready, but Expo deliberately keeps a current-page summary. It is not a PDF/export workflow until device file download, viewing, sharing, error handling, and permissions are designed and implemented against that existing report contract.

## 12. RTL, responsive, and accessibility

Paired Arabic/English resources, live localization direction, shared AppScreen safe areas, full-screen form, horizontal table overflow, responsive multi-view, 44px shared controls, icon labels, status badges, and device-friendly cards are used. Verify orientation, text scale, color mode, and keyboard behavior on real devices.

## 13. Notifications and realtime

The `states` realtime resource invalidates `['states']`. `/super-admin/geography/states` notification actions map to the direct guarded States Expo route, so notifications and realtime point to the same Platform feature.

## 14. Tests

Feature API tests cover serialization/runtime schemas. `StatesScreen.test.tsx`
covers server criteria, filter/view composition including Chart, form entry,
permission visibility, single archive, and bulk archive wiring.
`state-chart-data.test.ts` covers localized deterministic page aggregation, empty
district removal, invalid dates, and summaries. `use-states.test.ts` proves
create/update/archive/restore/bulk transport and root invalidation. Shared route,
server-list, realtime, localization, and architecture tests cover common behavior.
`components/import-data/state-import.test.ts` covers State normalization,
country-scoped duplicates, Arabic/English Country lookup, and unknown/inactive/
ambiguous parent failures. `src/shared/importing/native-spreadsheet.test.ts`
covers exact headers, 5 MiB/100-row policy primitives, formula rejection, and
uncertain status classification. `api/__tests__/state-bulk-api.test.ts` covers the
exact normalized JSON envelope; screen/API/query tests cover view visibility,
response parsing, and root invalidation.

## 15. Verification

Run `npm.cmd run typecheck`, lint, architecture check, Jest, and full
`npm.cmd run check`; then manually test direct route access, phone/tablet
portrait/landscape, EN/AR, RTL, text scaling, every theme palette/light/dark,
screen-reader Chart summaries, read-only, permissions, archive/restore/bulk
errors, Country selector, offline/error/empty/retry, and realtime refresh. Also
verify Import picker cancellation, unsupported/oversized/corrupt/header-invalid
files, row preview/error accessibility, Create and Country-lookup permission
guards, read-only behavior, atomic success/conflict, uncertain reconciliation,
EN/AR/RTL, and cache refresh.
