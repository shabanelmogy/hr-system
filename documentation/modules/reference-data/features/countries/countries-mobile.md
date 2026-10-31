# Countries Mobile Applied Feature Profile

| Item | Current mobile contract |
|---|---|
| Status | Canonical Clean Architecture reference with optional scoped offline reads |
| Physical route | `app/(main)/basic-data/geographical-information/countries.tsx` |
| Typed route | `/basic-data/geographical-information/countries` |
| Feature owner | `src/modules/reference-data/geography/countries` |
| Access | `RouteGuard` plus `super_admin` route policy; action permissions remain explicit |
| Primary views | Server-managed Table and Cards |
| Optional view | Independent PDF Report |
| Form | Full-screen create/edit/view `AppForm` |
| Lifecycle | Archive, bulk archive and restore; no hard delete |
| Cross-platform master | [Countries Full Review](countries-review.md) |
| Mobile architecture | [Mobile Architecture](../../../../guides/mobile/MOBILE_ARCHITECTURE.md) |
| General feature guide | [Mobile Feature Guide](../../../../guides/mobile/MOBILE_FEATURE_GUIDE.md) |
| Styling contract | [Mobile Style Guide](../../../../guides/mobile/MOBILE_STYLE_GUIDE.md) |

This is the exact mobile Countries implementation profile. Copy its route,
feature/API/query ownership and shared-component composition; replace all
Countries-specific fields, permissions, filters, lifecycle rules, report
contracts and global-data assumptions for the next feature.

Countries is a Platform catalog. The Super Admin dashboard exposes Global
Geography; tenant administrators use Company Geographic Scope instead and cannot
open this master screen even if an old token still contains Countries claims.

## 1. Exact Source Inventory

```text
app/(main)/basic-data/geographical-information/
  _layout.tsx
  countries.tsx

src/modules/reference-data/geography/countries/
  index.ts
  application/
    country-use-cases.ts
  composition/
    use-country-use-cases.ts
  data/
    local/
      country-local-data-source.ts
      sqlite-country-local-data-source.ts
    remote/
      country-endpoints.ts
      country-schemas.ts
      country-remote-data-source.ts
      __tests__/country-remote-boundary.test.ts
      __tests__/country-bulk-remote.test.ts
    repositories/
      default-country-repository.ts
  domain/
    models/country.ts
    policies/country-request-policy.ts
    repositories/country-repository.ts
  presentation/
    components/
      CountryCard.tsx
      CountryForm.tsx
      CountryReportView.tsx
    queries/
      country-keys.ts
      use-countries.ts
    reporting/ (shared global Crystal report adapter)
    screens/CountriesScreen.tsx
    utils/country-mock-data.ts

src/platform/reporting/
  index.ts
  presentation/ManagedCrystalReportView.tsx
  data/remote/crystal-report-remote-data-source.ts
  data/remote/crystal-report-schemas.ts
```

Required integration sources:

- `src/modules/reference-data/geography/countries/index.ts` — public screen export;
- `src/core/constants/routes.ts` — typed path;
- `src/platform/auth/presentation/rbac/route-manifest.ts` — canonical access policy;
- `src/platform/auth/presentation/rbac/permissions.ts` — Countries and managed-report permission constants;
- `src/modules/hr/basic-data/presentation/screens/GeographicalInformationScreen.tsx` — module navigation;
- `src/core/localization/translations/en-basic-data.ts` and
  `ar-basic-data.ts` — paired strings;
- `src/platform/realtime/application/realtime-query-registry.ts` — stable invalidation prefix;
- `src/platform/notifications/presentation/utils/notification-presentation.ts` — maps the
  API's web-oriented notification action URL to the mobile route;
- `src/platform/reporting/index.ts` — shared Crystal Report Manager catalog and
  render boundary (see the
  [Crystal Report Manager Integration Guide](../../../reporting/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md)).

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

The feature root deliberately exports only:

- `CountriesScreen`;
- `useCountryLookup` for authorized cross-subdomain selectors such as States;
- `CountryLookupItem` as the narrow public lookup type.

It does not expose feature-private components, mutation hooks or implementation
state. A cross-feature consumer uses the public root or a deliberately added
public contract, never `screens/...` or `queries/...` directly.

Dependency direction is:

```text
app/layout -> feature public API -> feature internals -> shared/core
```

`npm run check:architecture` enforces the broad boundary and rejects Basic Data
subdomain imports that reach another subdomain's internals. Static imports,
re-exports, and literal dynamic imports are checked.

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
| shared reporting schemas | Manager catalog items and render request, owned by `src/platform/reporting` |

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
  list + read-mode + CountryPageQuery
  lookup + read-mode
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

### Optional cached reads

Countries is the first implemented `offline-read` reference. Cached reads are off
by default, so the feature requires a live connection. A permitted user can opt in
to saved reads; successful Countries reads are then stored in SQLite under the
authenticated `userId + tenantId + companyId` scope and may be served for up to
24 hours when connectivity is unavailable. The screen shows connection state,
whether the current result came from saved storage, and the last update time.

The opt-in itself is a lightweight preference stored in AsyncStorage; durable
business rows remain in SQLite. Disabling the option stops reading and refreshing
the durable Countries cache. Create, update, archive, restore, bulk archive, and
bulk import remain online-authoritative and are never queued for replay.

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

The navigation App Header owns the page identity, so the content does not repeat
the Countries title/subtitle in `AppPageHeader`. The main toolbar keeps the shared
search field, one Filter button, and the permission-guarded Add icon passed through
`AppListScreen.searchActions`. Its feature-owned modal applies Status, Column, and
Condition together through `AppListScreen.filterControl` and the shared
`AppSearchFilterControls`. Bulk Archive appears through `aboveViews` only while
rows are selected, rather than crowding the search row.
The API's dedicated `currencyCode` and `hasStates` filters are intentionally not
part of the current mobile screen query state. Currency remains available as an
explicit search column; no criterion can remain active without a visible control.

## 8. View Contract

| View | Data scope | Exact behavior |
|---|---|---|
| Table | Current server page | Sortable Name EN/AR, Alpha-2, Currency and Created columns; state count, status and guarded row actions; shared server pager |
| Cards | Same current server page | Names, alpha codes, active-state count, lifecycle badge, selection and guarded touch actions |
| Chart | Same loaded server page | No pager; compact summary, horizontal states ranking, ring coverage, vertical currency columns, and a vertical creation timeline inside the view's scroll |
| Report | Independent report catalog/API | No list pagination; available even when the country page is empty |
| Import | Required native XLSX workflow | No list pager; select one `.xlsx` (max 5 MiB), require `nameAr,nameEn,alpha2Code,alpha3Code,phoneCode,currencyCode`, preview at most 100 rows, then atomically submit `{ countries: [...] }` to `POST countries/bulk` |

Table, Cards and Chart share criteria, rows, total count and query state. View
switching applies paginated views' default server page size and resets their page
position. Chart uses `paginate: false`, `renderWhenEmpty: true`, and
`scrollable: true`; it does not render list pagination. Its localized scope alert
is intentionally omitted; the summary labels distinguish loaded-page metrics from
the authoritative matching total. Import uses `paginate: false`,
`renderWhenEmpty: true`, and `scrollable: true`; its picker, validation summary,
row preview, submit state, and retry/reconciliation feedback render within the
view rather than using the list pager.

Country Import uses Expo's native document picker and cache-safe file access. It
accepts only `.xlsx` files up to 5 MiB, requires the exact headers
`nameAr,nameEn,alpha2Code,alpha3Code,phoneCode,currencyCode`, and rejects a file
with more than 100 data rows before a request. Local validation normalizes the
same request fields as the form and identifies field-scoped, case-insensitive
duplicates before submit. Pending valid rows are sent once as
`POST countries/bulk` with `{ countries: CountryRequest[] }`; the API batch is
atomic. Picker cancellation leaves the view usable without an error. A timeout or
ambiguous transport result is shown as `uncertain`, preserves the preview, and
requires canonical-list reconciliation before a user can resubmit the source.
Import visibility and its direct submit handler require `Countries:Create`; tenant
read-only is checked first. A successful response invalidates `countryKeys.all`.

Chart rendering composes the shared `src/shared/components/charts` primitives;
Countries owns only the series transformations in
`components/chart-view/country-chart-data.ts`. Color is supplemented by visible
labels/values and accessible row/distribution summaries. Pure tests cover Arabic
names, deterministic sorting, coverage, currencies, invalid dates, and summary
totals.
The selected shapes are semantic: long country names stay in horizontal bars,
the two-part with/without coverage uses a ring, and short currency/month labels
use vertical bars. Do not replace them with one repeated chart shape or add a
page-scoped Line chart that implies a complete global timeline.
On phone widths, the five reserved view positions use one full-width row of
equally distributed icon-only buttons with localized accessibility labels, so
Report and Import do not wrap or overflow below Chart.

Pull-to-refresh refetches the current query key without clearing criteria.
Initial loading uses a full state view; list failure is persistent and retryable;
empty state is localized; background fetching retains current rows.

## 9. Form and Validation Contract

`CountryForm` uses `useZodForm`, React Hook Form `Controller`, `AppFormSection`
and shared fields. In development, the shared `AppForm` footer can fill an
internally consistent Country sample without submitting it; the action is absent
from production builds.

| Field | Rule | Request normalization |
|---|---|---|
| `nameAr` | 2-100 printable Unicode characters; spaces, digits, and punctuation allowed; no script-only rule | trim |
| `nameEn` | 2-100 printable Unicode characters; spaces, digits, and punctuation allowed; no script-only rule | trim |
| `alpha2Code` | blank or exactly two English letters | trim; blank -> `null` |
| `alpha3Code` | blank or exactly three English letters | trim; blank -> `null` |
| `phoneCode` | blank or optional `+` plus up to ten digits | trim; blank -> `null` |
| `currencyCode` | blank or exactly three ASCII letters | trim; blank -> `null` |

`currencyCode` is an optional ISO integration value. The Currency master belongs
to Accounting; this mobile feature does not create or own a Currency entity.

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
Report Manager through the shared `src/platform/reporting` boundary; see the
[Crystal Report Manager Integration Guide](../../../reporting/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md)
for the canonical contract. Feature-specific behavior:

- The Platform geography catalog comes from
  `crystalReportsApi.listGlobal('countries')` and is stale for five minutes
  under one language-independent query key. This is a global managed report
  surface and does not query tenant Reporting entitlement.
- The geographic Report mode is available to the Platform Super Admin through
  the global Crystal catalog/render boundary. Tenant `CrystalReports:View` is not
  used for Countries. The report
  component repeats that authorization check before mounting its catalog query
  and renders a localized forbidden state if it is composed elsewhere.
- Catalog failure shows a localized warning with Retry; a loaded-but-empty
  catalog shows a localized info state. There is no static default report.
- Arabic selects `summaryTitle`, English selects `summarySubject`, both falling
  back to `displayName`.
- Report filters are Arabic/English country names with draft/apply/clear state;
  only trimmed non-empty values are sent as `NameAr`/`NameEn`.
- Rendering sends the selected global source ID, entity key, expected SHA-256,
  `ar`/`en`, and those filters to `crystalReportsApi.renderGlobal`; the call
  remains within the global report boundary and is not downgraded to a tenant
  report when the user is in a tenant read-only context.
- The response must be a non-trivial PDF validated by size and `%PDF-`
  signature.
- Native platforms write to sensitive temporary cache, print/preview through
  Expo Print, share through Expo Sharing and dispose the file best-effort.
- Web builds use an object URL, browser open/download and URL revocation.

The legacy `report/info`, `report/generate`, `X-ApiKey` header and
`EXPO_PUBLIC_REPORT_API_URL` are not part of this feature anymore. Mobile
environment configuration exposes only the authenticated ERP API URL for managed
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
   If Chart is Required, compose shared chart primitives and document whether its
   series are page-scoped or backed by a dedicated aggregate endpoint.
9. Add permission/read-only/lifecycle guards to visibility and handlers.
10. Build full-screen create/edit/view form with dirty and busy protection.
11. Add confirmations, pull-to-refresh and explicit state/retry feedback.
12. Add optional report/import/media workflows only from an explicit contract.
13. Add EN/AR, RTL, safe-area, keyboard, touch and responsive behavior.
14. Register realtime invalidation and notification route mapping.
15. Add API, state, route, permission, mutation and representative screen tests.
16. If offline read is explicitly required, add a feature policy, scoped local data
    source, freshness rule, visible connection/last-update state, and restart/offline tests.
17. Run the full mobile quality gate and manual device matrix.

## 14. Resolved Review Findings

Angular D29–D32 bounded consumer correction Verified: one-column shared Add/Edit/counter badges and shared edited active flash, predecessor after archive and keyboard navigation. Current evidence platform/angular-countries-edit-workflow/verification/FORM_RECORD_ACCEPTANCE.md. API/entity/schema/Next/native unchanged, migration N/A. Full Countries views/source/host gates remain Required.

Angular D28 bounded context filter/icons is Verified separately in platform/angular-grid-capabilities/verification/CELL_CONTEXT_ACCEPTANCE.md. Countries exposes raw status/date values through shared filterValue; reset replaces optional structured criteria. No API/Next/native runtime change. Prior owner evidence and full-pilot limitations remain.

Angular consumer handoff2026-10-30: bounded Create/Edit and archive/restore/bulk are Verified in the separate migration features angular-countries-edit-workflow and angular-countries-lifecycle under documentation/modules/platform/features/. Their CURRENT_EDIT_ACCEPTANCE.md/CURRENT_LIFECYCLE_ACCEPTANCE.md own executed Angular evidence. API contracts/entity/schema and existing Next/native consumers remain unchanged; no host business-write or full Countries pilot claim. Shared success Toast/general error Modal, translated pinned Actions header/cells and current-page native selection are Angular presentation capabilities. Required Chart/managed Crystal-PDF/Import/full-pilot children remain queued or preflight-only.

| ID | Resolution | Reusable rule |
|---|---|---|
| C-M01 | Removed unexposed `currencyCode`/`hasStates` filter state and serialization from the mobile screen contract. | Every active criterion must have a visible control; otherwise omit it from presented state. |
| C-M02 | Removed the unused detail hook/key because the list row includes every mutable Country form field. | Fetch detail only when the list is not authoritative, and block unsafe edit on detail failure. |
| C-M03 | Added Countries screen composition/action/permission coverage and mutation transport/invalidation tests. | Pair boundary tests with representative screen and mutation-hook integration coverage. |
| C-M04 | Replaced the legacy Countries API/query/type facades with domain/application/data/presentation/composition and a narrow public `useCountryLookup`. | Cross-feature consumers use curated public contracts only. |
| C-M05 | Added opt-in 24-hour scoped SQLite reads while keeping all writes online-authoritative. | Offline capability is an explicit per-feature policy, not a transport fallback. |

### S3-A5 verified Angular charts — 2026-10-31

Phase06 Verified on 2026-10-31 for exact S3-A5 and requester Cards refinements.
Full npm run check passed: 75 files/417 tests, 4 configuration/12 architecture,
types/catalog/tokens/fonts and production build. Initial498.98kB/130.00kB estimated
transfer; unchanged500kB warning budget. Chart renderer212.09kB/63.63kB remains lazy.
Actual authenticated shell browser40 passed five palettes × light/dark × EN/AR ×
390×780/1440×1050. Native canvases painted, source data/counts/zeroes/UTC timeline,
theme/locale repaint without GET, reduced motion, text alternatives, first-page
reset with criteria, retry, stale authority mask and destruction verified. Native
scroll reaches the lower plots; desktop chart rows fill the available viewport.
Current Next source8 comparisons and fresh command/form/record regressions8 pass.
See verification/CURRENT_CHART_ACCEPTANCE.md and durable JSON/screenshots/logs.
No hosted business writes/deployment, schema/migration, native-device or full-pilot
acceptance. PROD-019/023, S1-A14/FOLLOW-016 and remaining pilot children stay open.

P-001 Countries collection with embedded Chart; current Next Chart source is the
reviewed baseline. Verified same four plot semantics/order, summary metrics,
font/title16px/600, card padding8px/radius16px, theme palette, source captions and
contained responsive scroll. Native PrimeNG Chart/Chart.js replaces Recharts; tick
placement, bar sizing and pie geometry follow that engine and are not certified as
pixel-identical plot internals. Full five-view visual acceptance remains S3-A8.
Requester D33 explicitly removes Chart toolbar/header Filter and scope paragraph;
Chart inherits Grid/Cards criteria and resets page1. Cards retains one shared
single-row toolbar/toggle, short accessible arrow+Asc/Desc, Search max400px and
Sort By220px. Narrow viewports scroll the toolbar internally. No feature-local shell.

Canonical Angular proof: documentation/modules/platform/features/angular-countries-chart-view/verification/CURRENT_CHART_ACCEPTANCE.md. Existing API/native runtime unchanged; no domain/schema migration. Native rendering remains retained, new native work Excluded.

### S3-A6 Countries Report — 2026-10-31

Phase06 Verified2026-10-31 for exact S3-A6 Countries managed Crystal/PDF integration.
Full npm run check:75files/422tests,4configuration/12architecture,types/catalog/
tokens/fonts/build passed; initial499.84kB/130.16kB estimated transfer, unchanged
500kB budget. Entry437recipes/planning passed before application edits.
Actual authenticated Countries Report40 palette/mode/EN-AR/390×780/1440×1050 cases,
focused failure/authority/mobile-PDF-fallback8, current Next source8, retained command8,
Chart8 and standalone Reporting8 passed. Durable JSON/logs/screenshots are in verification/.
No live hosted render/business write, actual Crystal engine/RPT output, native device,
schema/migration, full five-view pixel acceptance or production release claim.

Countries consumes GlobalReportView and globalReportAllowed through Reporting's
public API, lazy inside the existing collection workspace. Exact Countries:View
workspace authority and super_admin + GlobalCrystalReports:View gate visible/direct
Report entry; current read-only actors may render. Losing authority destroys the
embedded report and falls back to Grid. Header Refresh reloads report catalog/source
and regenerates; other views keep existing refresh. Header Filter controls report
criteria without discarding form/selection or rerendering. No nested PageHeader.
Reporting keeps existing catalog/service/PDF validation/cancellation. Applied filters
and selected report now belong to the immutable actor; replacement clears them and
draft fields. Explicit reload regenerates even if source/hash is unchanged. Shared
ReportWorkspace reference appearance uses280px sidebar/gap64 and contained scrolling;
FormContainer sidebar appearance keeps Search/Reset full width; PdfViewer fill mode
retains safe open/download, capability fallback, lease cleanup and finite inline area.
Existing standalone report defaults remain compatible; no new package or translation key.

Current source CountryReportPage/ManagedCrystalReportView/ReportViewer was rendered
at identical viewports/locales/modes with the same synthetic report catalog and PDF.
Verified independent NameAr/NameEn criteria, report selector, first catalog report,
source SHA256 request, desktop280px sidebar/gap64, compact stacked layout and global
permission rule. Source fixture lacks the report grant, so browser interception adds
GlobalCrystalReports:View to that fixture session only; no real permission is changed.
Retain the approved S3-A0 draft/applied correction: language/selection uses applied
values; Reset clears and applies once. Angular uses the existing shared labeled fields,
validation/counters, native PrimeNG controls and explicit safe PDF Open/Download bar;
Next uses its MUI field/iframe presentation. Label/input heights and button styling
are not certified pixel-identical; remaining source visual reconciliation is S3-A8,
not implicitly closed by bounded Report behavior acceptance. Native browser PDF
internals are opaque: iframe assignment is not proof that an RPT engine rendered.
PDF-disabled cases prove fallback/download bytes; valid synthetic PDF is not real RPT output.

Canonical proof: documentation/modules/platform/features/angular-countries-report-view/verification/CURRENT_REPORT_ACCEPTANCE.md. New native UI Excluded; current native retained.

## 15. Verification

Existing focused evidence:

- `src/modules/reference-data/geography/countries/data/remote/__tests__/country-remote-boundary.test.ts`;
- `src/modules/reference-data/geography/countries/data/remote/__tests__/country-bulk-remote.test.ts`;
- `src/modules/reference-data/geography/countries/data/repositories/default-country-repository.test.ts`;
- `src/modules/reference-data/geography/countries/application/country-use-cases.test.ts`;
- `src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.test.tsx`;
- `src/modules/reference-data/geography/countries/presentation/components/chart-view/country-chart-data.test.ts`;
- `src/modules/reference-data/geography/countries/presentation/components/import-data/country-import.test.ts`;
- `src/shared/importing/native-spreadsheet.test.ts`;
- `src/modules/reference-data/geography/countries/presentation/queries/use-countries.test.ts`;
- `src/core/preferences/OfflineReadPreferencesProvider.test.tsx`;
- `src/core/offline/offline-read-policy.test.ts`;
- `src/platform/reporting/data/remote/crystal-report-remote-data-source.test.ts`;
- `src/shared/listing/__tests__/useServerListState.test.ts`;
- `src/platform/auth/presentation/rbac/__tests__/route-access.test.ts`;
- `src/platform/realtime/application/realtime-query-registry.test.ts`;
- architecture and localization parity tests in the full suite.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run check:architecture
npm.cmd test -- --runTestsByPath src/modules/reference-data/geography/countries/data/remote/__tests__/country-remote-boundary.test.ts
npm.cmd run check
```

Manual verification must include direct route access, phone/tablet,
portrait/landscape, EN/AR, LTR/RTL, light/dark/system, text scaling, keyboard,
safe areas, list state transitions, pull-to-refresh, permissions, read-only,
archive/restore/bulk behavior, dirty/busy form exits, report unavailable/error,
PDF preview/share, Chart internal scrolling, visible and screen-reader Chart
summaries, no-series states, and realtime refresh. Import verification includes
picker cancellation, wrong extension/MIME, oversized/corrupt/header-invalid files,
101 rows, row-level validation/duplicates, preview scrolling, atomic success,
conflict, uncertain reconciliation, Create/read-only guards, EN/AR/RTL labels,
screen-reader status summaries, and cache/realtime refresh.


## Native advanced column-filter extension — 2026-10-30

Authorized owner change: extend existing global Countries list CQRS/read-store with
optional typed bounded per-column filters and a POST /api/v1/countries/query read
endpoint. Full frozen rules, actor/permission, compatibility, validation/edge and
impact/verification matrices are in the migration child's
ADVANCED_FILTER_CONTRACT.md. No entity/schema/write/lifecycle changes. Existing
GET/Next/native clients stay compatible; new native advanced-filter UI is Excluded
from Angular migration. Angular menu uses real AND/OR criteria before count/paging;
no current-page emulation. Source implementation/verification is in progress, not
hosted publication or complete Countries acceptance. FOLLOW-016/PROD-019 own the
remaining combined-query and deployed catalog integration.
