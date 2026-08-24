# Countries Mobile Applied Feature Profile

| Item | Current mobile contract |
|---|---|
| Status | Canonical applied server-managed reference for `mobile-react` |
| Physical route | `app/(main)/basic-data/geographical-information/countries.tsx` |
| Typed route | `/basic-data/geographical-information/countries` |
| Feature owner | `src/features/basic-data/countries` |
| Access | `RouteGuard` plus `Countries:View` route policy |
| Primary views | Server-managed Table and Cards |
| Optional view | Independent PDF Report |
| Form | Full-screen create/edit/view `AppForm` |
| Lifecycle | Archive, bulk archive and restore; no hard delete |
| Cross-platform master | [Countries Full Review](../project/COUNTRIES_FEATURE_FULL_REVIEW.md) |
| Mobile architecture | [Mobile Architecture](MOBILE_ARCHITECTURE.md) |
| General feature guide | [Mobile Feature Guide](MOBILE_FEATURE_GUIDE.md) |
| Styling contract | [Mobile Style Guide](MOBILE_STYLE_GUIDE.md) |

This is the exact mobile Countries implementation profile. Copy its route,
feature/API/query ownership and shared-component composition; replace all
Countries-specific fields, permissions, filters, lifecycle rules, report
contracts and global-data assumptions for the next feature.

## 1. Exact Source Inventory

```text
app/(main)/basic-data/geographical-information/
  _layout.tsx
  countries.tsx

src/features/basic-data/countries/
  index.ts
  api/
    country-endpoints.ts
    country-schemas.ts
    country-api.ts
    country-report-api.ts
    __tests__/country-api.test.ts
  types/country.ts
  queries/
    country-keys.ts
    use-countries.ts
    use-country-reports.ts
  components/
    CountryCard.tsx
    CountryForm.tsx
    CountryReportView.tsx
  screens/CountriesScreen.tsx

src/features/reporting/
  index.ts
  crystal-reports/
    crystal-report-api.ts
    crystal-report-schemas.ts
```

Required integration sources:

- `src/features/basic-data/index.ts` — public screen export;
- `src/core/constants/routes.ts` — typed path;
- `src/features/auth/rbac/route-manifest.ts` — canonical access policy;
- `src/features/auth/rbac/permissions.ts` — Countries and managed-report permission constants;
- `src/features/basic-data/screens/GeographicalInformationScreen.tsx` — module navigation;
- `src/core/localization/translations/en-basic-data.ts` and
  `ar-basic-data.ts` — paired strings;
- `src/features/realtime/realtime-query-registry.ts` — stable invalidation prefix;
- `src/features/notifications/utils/notification-presentation.ts` — maps the
  API's web-oriented notification action URL to the mobile route;
- `src/features/reporting/index.ts` — shared Crystal Report Manager catalog and
  render boundary (see the
  [Crystal Report Manager Integration Guide](../project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md)).

The route imports through the Basic Data public API. Router files must not import
feature-private screens, API modules or hooks.

## 2. Route, Navigation and Authorization

```text
Expo route
  -> RouteGuard(ROUTES.basicData.countries)
    -> routePolicies requires Countries:View
      -> CountriesScreen
```

- Add the physical Expo file, typed `ROUTES` value and route policy together.
- Keep `RouteGuard` even when module navigation hides unauthorized entries.
- `GeographicalInformationScreen` derives item visibility from the same route
  access policy rather than duplicating permission logic.
- Basic Data uses its responsive module drawer. The layout is permanent from the
  shared wide-screen breakpoint and overlay-style on narrower screens, with the
  drawer side following the live language direction.
- Unknown authenticated routes fail closed.

## 3. Feature Boundary and Public API

The feature root deliberately exports:

- `CountriesScreen`;
- `countryApi` and `countryReportApi`;
- `countryKeys`;
- selected transport/domain types, including the `CountryReportInfo` alias of
  the shared manager catalog item.

It does not expose feature-private components, mutation hooks or implementation
state. A cross-feature consumer uses the public root or a deliberately added
public contract, never `screens/...` or `queries/...` directly.

Dependency direction is:

```text
app/layout -> feature public API -> feature internals -> shared/core
```

`npm run check:architecture` enforces the broad boundary.

## 4. Type and Runtime Schema Contract

| Type/schema | Purpose |
|---|---|
| `Country` / `countrySchema` | Management page row including `statesCount` |
| `CountryDetail` / `countryDetailSchema` | Detail/mutation shape without count |
| `CountryWithStates` / `countryWithStatesSchema` | Relation detail with active states |
| `CountryRequest` | Mutable request fields only |
| `CountryPageQuery` | One-based API page plus the visible status/sort/search inputs, search field and search condition |
| `CountryFilters` | Visible status state only; no hidden criteria are retained |
| `BulkArchiveCountriesResponse` / schema | Runtime-validated archive count |
| lookup schema | Runtime-validated selector rows |
| shared reporting schemas | Manager catalog items and render request, owned by `src/features/reporting` |

Every JSON API method requests `unknown` from `apiService` and parses it with a
feature-owned Zod schema. A missing required field fails closed. Do not hide a
broken backend response with empty strings, zero counts or unchecked casts.

## 5. Endpoint and Query Serialization

`countryEndpoints` owns relative paths because `apiService` owns the configured
API base:

| Method | Relative endpoint |
|---|---|
| Page / create | `countries` |
| Lookup | `countries/lookup` |
| Detail / update / archive | `countries/{id}` |
| Relation detail | `countries/{id}/states` |
| Restore | `countries/{id}/restore` |
| Bulk archive | `countries/bulk-archive` |

`toCountryPageQuery` always sends page number, page size, status, search field,
search condition, sort column and direction. It sends search only after trimming,
sends currency only after trim and uppercase, and converts
`withStates`/`withoutStates` to `true`/`false` while omitting the `all` state.

## 6. Query Keys, Queries and Mutations

```text
countries
  list + CountryPageQuery
  lookup
  detail + id
  reports + catalog
```

- The list query uses `placeholderData: previous => previous` to retain the
  current page during a criteria/page transition.
- Detail runs only for a non-null ID.
- Save chooses create or update from nullable ID.
- Archive, restore and bulk archive use the same invalidating-mutation helper.
- Every successful mutation invalidates `countryKeys.all`.
- The realtime registry maps the backend `countries` resource to `['countries']`
  without importing private feature hooks.
- Authentication/company changes remain responsible for clearing cross-session
  query data.

React Query owns server data. Local state owns only form mode, selected row,
pending confirmation and selected IDs.

## 7. Server-Managed List Contract

`CountriesScreen` owns one
`useServerListState<CountrySortColumn, CountryFilters>` instance:

| State | Initial value |
|---|---|
| UI page | `0` |
| Table page size | `5` |
| Card page size | `3` when that view is selected |
| Sort | `createdOn` descending |
| Status | `active` |
| Currency | empty |
| State presence | `all` |
| Search | empty, shared 350 ms debounce |
| Search column | `all` |
| Search condition | `contains` |

The screen converts UI page to API page with `toApiPageNumber`. Search, page
size, sort and filter changes reset to page zero through the shared reducer.
Wrapped handlers also clear bulk selection before changing search, page,
page-size, status or sort.

`AppListScreen` receives controlled search and `serverPagination`. Its items are
the current server page; it must not search, filter or slice those rows locally.
`AppDataTable` receives `serverState` and disables its own pagination because
`AppMultiView` owns the shared pager.

The main toolbar keeps only the shared search field and one Filter button. Its
feature-owned modal applies Status, Column, and Condition together through
`AppListScreen.filterControl` and the shared `AppSearchFilterControls`.
The API's dedicated `currencyCode` and `hasStates` filters are intentionally not
part of the current mobile screen query state. Currency remains available as an
explicit search column; no criterion can remain active without a visible control.

## 8. View Contract

| View | Data scope | Exact behavior |
|---|---|---|
| Table | Current server page | Sortable Name EN/AR, Alpha-2, Currency and Created columns; state count, status and guarded row actions; shared server pager |
| Cards | Same current server page | Names, alpha codes, active-state count, lifecycle badge, selection and guarded touch actions |
| Report | Independent report catalog/API | No list pagination; available even when the country page is empty |

Table and Cards share criteria, rows, total count, actions and query state. View
switching applies the view's default server page size and resets page position.
There is no mobile Chart or XLSX Import view.

Pull-to-refresh refetches the current query key without clearing criteria.
Initial loading uses a full state view; list failure is persistent and retryable;
empty state is localized; background fetching retains current rows.

## 9. Form and Validation Contract

`CountryForm` uses `useZodForm`, React Hook Form `Controller`, `AppFormSection`
and shared fields.

| Field | Rule | Request normalization |
|---|---|---|
| `nameAr` | 2-100 Arabic letters/spaces | trim |
| `nameEn` | 2-100 English letters/spaces | trim |
| `alpha2Code` | blank or exactly two English letters | trim; blank -> `null` |
| `alpha3Code` | blank or exactly three English letters | trim; blank -> `null` |
| `phoneCode` | blank or optional `+` plus up to ten digits | trim; blank -> `null` |
| `currencyCode` | blank or exactly three English letters | trim; blank -> `null` |

`autoCapitalize="characters"` assists code entry; the backend mapping is the
final uppercase normalization boundary.

The form uses `presentation="fullScreen"`. Shared `AppForm`/`AppModal` owns
initial focus, first-error focus, next-field behavior, keyboard/safe-area
composition, dirty-exit confirmation and busy close protection. View mode has
no submit action and fields are not editable.

The Country list row contains every form field, so view/edit use that authoritative
row and no redundant detail hook is retained. A copied feature must fetch detail
and block unsafe edit on failure whenever its list DTO omits mutable form fields.

## 10. Permission, Read-only and Lifecycle Matrix

| Action | Permission | Lifecycle/read-only behavior |
|---|---|---|
| Open screen/view | View | Route guard and direct policy; active or archived row |
| Create | Create | Hidden when unauthorized/read-only; handler rechecks |
| Edit | Edit | Active only; hidden when archived/read-only; handler rechecks |
| Archive | Delete | Active row; confirmation; API dependency remains authoritative |
| Bulk archive | Delete | Selected active Cards; confirmation; atomic API command |
| Restore | Delete | Archived row; direct mutation; API is idempotent |

The screen checks read-only before permission denial in write handlers so users
receive the correct tenant-status explanation. Hiding an action is not enough;
direct handlers fail closed and the API remains the final invariant boundary.

Bulk selection exists in Cards only. Changing list criteria/page clears it.
Successful bulk archive clears selection; single archive removes the archived ID.

## 11. Report Contract

The report view is independent from the management query and reads the Crystal
Report Manager through the shared `src/features/reporting` boundary; see the
[Crystal Report Manager Integration Guide](../project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md)
for the canonical contract. Feature-specific behavior:

- The catalog comes from `crystalReportsApi.listPublished('countries')` and is
  stale for five minutes under one language-independent query key.
- The Report mode is visible only with `CrystalReports:View`. The report
  component repeats that authorization check before mounting its catalog query
  and renders a localized forbidden state if it is composed elsewhere.
- Catalog failure shows a localized warning with Retry; a loaded-but-empty
  catalog shows a localized info state. There is no static default report.
- Arabic selects `summaryTitle`, English selects `summarySubject`, both falling
  back to `displayName`.
- Report filters are Arabic/English country names with draft/apply/clear state;
  only trimmed non-empty values are sent as `NameAr`/`NameEn`.
- Rendering sends only the selected report ID, `ar`/`en`, and those filters to
  `crystalReportsApi.render`; the call stays available in tenant read-only mode.
- The response must be a non-trivial PDF validated by size and `%PDF-`
  signature.
- Native platforms write to sensitive temporary cache, print/preview through
  Expo Print, share through Expo Sharing and dispose the file best-effort.
- Web builds use an object URL, browser open/download and URL revocation.

The legacy `report/info`, `report/generate`, `X-ApiKey` header and
`EXPO_PUBLIC_REPORT_API_URL` are not part of this feature anymore. Mobile
environment configuration exposes only the authenticated HR API URL for managed
reports.

## 12. Localization, RTL, Responsive and Accessibility

- Add Countries keys to EN and AR basic-data modules together.
- Localize labels, validation, status, confirmations, loading/error/empty,
  report and accessibility text.
- Use the live `direction` from localization; never force RTL or reload.
- Use shared typography/theme semantics and feature-local `StyleSheet.create`.
- Use logical positioning or direction-aware shared components.
- Keep touch targets at least 44x44 and verify text scaling.
- `AppScreen` and shared modal/layout primitives own safe-area boundaries.
- Verify phone/tablet, portrait/landscape, light/dark/system, EN/AR and keyboard
  behavior; do not branch on device model names.

## 13. Exact Implementation Order for the Next Feature

1. Freeze the API DTOs, nullability, paging, filters, sort allow-list, errors,
   permissions, lifecycle and scope.
2. Add physical Expo route, typed route and route policy.
3. Create feature types and Zod schemas for every response.
4. Add endpoint constants and pure query serialization tests.
5. Add API functions that accept `unknown` and parse before return.
6. Add hierarchical query keys, list queries, invalidating mutations, and detail queries only when the list is not authoritative.
7. Configure one server-list state and map zero-based UI pages at the boundary.
8. Build Table and Cards through `AppListScreen`; add only API-supported sorts.
9. Add permission/read-only/lifecycle guards to visibility and handlers.
10. Build full-screen create/edit/view form with dirty and busy protection.
11. Add confirmations, pull-to-refresh and explicit state/retry feedback.
12. Add optional report/import/media workflows only from an explicit contract.
13. Add EN/AR, RTL, safe-area, keyboard, touch and responsive behavior.
14. Register realtime invalidation and notification route mapping.
15. Add API, state, route, permission, mutation and representative screen tests.
16. Run the full mobile quality gate and manual device matrix.

## 14. Resolved Review Findings

| ID | Resolution | Reusable rule |
|---|---|---|
| C-M01 | Removed unexposed `currencyCode`/`hasStates` filter state and serialization from the mobile screen contract. | Every active criterion must have a visible control; otherwise omit it from presented state. |
| C-M02 | Removed the unused detail hook/key because the list row includes every mutable Country form field. | Fetch detail only when the list is not authoritative, and block unsafe edit on detail failure. |
| C-M03 | Added Countries screen composition/action/permission coverage and mutation transport/invalidation tests. | Pair boundary tests with representative screen and mutation-hook integration coverage. |

## 15. Verification

Existing focused evidence:

- `src/features/basic-data/countries/api/__tests__/country-api.test.ts`;
- `src/features/basic-data/countries/screens/CountriesScreen.test.tsx`;
- `src/features/basic-data/countries/queries/use-countries.test.ts`;
- `src/features/reporting/crystal-reports/__tests__/crystal-report-api.test.ts`;
- `src/shared/listing/__tests__/useServerListState.test.ts`;
- `src/features/auth/rbac/__tests__/route-access.test.ts`;
- `src/features/realtime/__tests__/realtime-query-registry.test.ts`;
- architecture and localization parity tests in the full suite.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run check:architecture
npm.cmd test -- --runTestsByPath src/features/basic-data/countries/api/__tests__/country-api.test.ts
npm.cmd run check
```

Manual verification must include direct route access, phone/tablet,
portrait/landscape, EN/AR, LTR/RTL, light/dark/system, text scaling, keyboard,
safe areas, list state transitions, pull-to-refresh, permissions, read-only,
archive/restore/bulk behavior, dirty/busy form exits, report unavailable/error,
PDF preview/share and realtime refresh.
