# Countries Full-Stack Web and Mobile Implementation Profile

| Item | Value |
|---|---|
| Status | Applied reference with documented follow-up findings |
| Scope | Shared Countries API plus the `web-next` and `mobile-react` clients |
| Reviewed | 2026-08-23 |
| Web route | `/super-admin/geography/countries` |
| Mobile route | `/basic-data/geographical-information/countries` |
| Project master | [Countries Feature Full Review](../../project/COUNTRIES_FEATURE_FULL_REVIEW.md) |
| Web guide | [Server-Managed Feature Frontend Reference](server-managed-feature-reference.md) |
| Web architecture | [Frontend Architecture Reference](../architecture/frontend-architecture-reference.md) |
| Mobile profile/guides | [Countries profile](../../mobile-react/countries-mobile-reference.md), [architecture](../../mobile-react/MOBILE_ARCHITECTURE.md), [feature guide](../../mobile-react/MOBILE_FEATURE_GUIDE.md), [implementation guide](../../mobile-react/mobile-feature-implementation-guide.md), [style guide](../../mobile-react/MOBILE_STYLE_GUIDE.md) |
| Backend guide | [Feature Module Implementation Guide](../../api/Feature_Module_Implementation_Checklist.md) |
| API profile | [Countries API Implementation Profile](../../api/Countries_API_Implementation_Profile.md) |

This is the feature-specific review artifact for Countries. Its manifest,
explicit contracts, platform profiles, findings, and reconciliation checklist
let a developer or coding agent build the same capability for web and mobile
without guessing which behavior is shared and which behavior is client-specific.

The general guides remain authoritative. Countries is a concrete example, not
a template to copy blindly. Copy its ownership boundaries and data flow;
replace its fields, filters, permissions, lifecycle, routes, and optional views
with contracts from the new feature. Web and mobile must share domain and HTTP
semantics, but they do not need identical controls or screen composition.

## 1. Feature Review Manifest

| Item | Countries decision or evidence |
|---|---|
| Web feature owner | `web-next/src/features/basic-data/geographical-information/countries` |
| Mobile feature owner | `mobile-react/src/features/basic-data/countries` |
| Web route adapter | `web-next/src/app/(main)/basic-data/(geographical-information)/countries/page.tsx` |
| Mobile route adapter | `mobile-react/app/(main)/basic-data/geographical-information/countries.tsx` |
| Web primary UI shape | Server-managed Grid with modal create/edit/view workflows |
| Mobile primary UI shape | Responsive server-managed Table/Cards with a full-screen create/edit/view form |
| Web optional UI shapes | Cards, first-page-scoped Chart without pagination controls, independent Crystal Report, tenant-scoped ActiveReportsJS published viewer and permission-protected designer, XLSX Import |
| Mobile optional UI shape | Independent PDF Report with preview/share; no import or chart |
| Backend pattern | Global reference-data CQRS slice with explicit archive/restore |
| Identifier | Positive integer `id` |
| Scope | Global Platform reference data; API access requires `super_admin` plus action permission |
| Lifecycle | Active, archived, restore; no hard-delete UI |
| Web default list | UI page `0`, size `10`, `createdOn DESC`, status `active` |
| Mobile default list | UI page `0`, Table size `5`, Card size `3`, `createdOn DESC`, status `active` |
| Permissions | `Countries:View`, `Countries:Create`, `Countries:Edit`, `Countries:Delete` |
| Cross-feature consumers | States consumes the active-country lookup through the Countries public API |
| Web realtime consumers | Country changes invalidate Countries and States query prefixes |
| Mobile realtime consumers | Country changes invalidate the stable `['countries']` prefix |
| Web shared dependencies | server-list state, React Query, Data Grid, PageHeader, form/dialog primitives, read-only context, permission hooks, shared report-template repository/designer/viewer, ActiveReportsJS, Excel parser |
| Mobile shared dependencies | Expo Router, React Query, `AppListScreen`, `AppDataTable`, `AppForm`, read-only context, authorization hooks, localization/theme, Expo print/share |
| Working-tree note | This review describes the current working tree, including the compact shared multi-view/header changes |
| Explicit exclusions | Crystal Report service internals, server-side ActiveReportsJS rendering/export, generic notification infrastructure, offline write queues, and unrelated geographical features |

### Applicable review phases

| Phase | Scope in this profile |
|---|---|
| Discovery | Ownership, routes, views, permissions, API and cross-feature consumers |
| Read path | Web Grid/Cards/Chart and mobile Table/Cards, search, filters, sort, paging and refresh |
| Write path | Web detail-backed and mobile list-backed create/edit/view forms, validation and cache refresh |
| Domain actions | Archive, bulk archive, restore and import |
| Integration | Next/Expo routers, public APIs, API routes, React Query and realtime invalidation |
| Reconciliation | Frontend types and behavior checked against controller/CQRS contracts |

## 2. Source Map and Ownership

```text
Next App Router page
  -> CountriesPage
    -> useCountryGridLogic
      -> useServerListState
      -> toCountryPageQuery
      -> useCountryQueries
        -> CountryService
          -> apiRoutes.countries
            -> CountriesController / CQRS

Expo Router page + RouteGuard
  -> CountriesScreen
    -> useServerListState
    -> useCountries / mutations
      -> countryApi + Zod response schemas
        -> apiService
          -> CountriesController / CQRS
```

### Web source map

| Responsibility | Web source |
|---|---|
| Thin route adapter | `src/app/(main)/basic-data/(geographical-information)/countries/page.tsx` |
| Page composition and dialogs | `pages/CountriesPage.tsx` |
| Shared list/controller state | `hooks/useCountryGridLogic.ts` |
| Query keys, queries and mutations | `hooks/useCountryQueries.ts` |
| HTTP and request normalization | `services/countryService.ts` |
| Transport and form types | `types/Country.ts` |
| UI-state to HTTP query mapping | `utils/countryPageQuery.ts` |
| Permission/lifecycle predicate | `utils/countryPermissions.ts` |
| Form validation | `utils/validation.ts` |
| View composition | `components/CountriesMultiView.tsx` |
| Grid contract | `components/grid-view/` |
| Card presentation | `components/card-view/` and `components/CountriesCardView.tsx` |
| Page-scoped analytics | `components/chart-view/` and `components/CountriesChartView.tsx` |
| Submitted-batch import | `components/import-data/` |
| Domain report page | `reports/pages/CountryReportPage.tsx` |
| Browser report composition | `reports/components/CountryActiveReportsDesigner.tsx`, shared `features/reporting` designer/viewer/repository, and `public/reports/countries/countries-directory.rdlx-json` |
| Deliberate public API | `index.ts` |

The feature public API exports only the page, report page, lookup hook,
query-key prefix, and `CountryLookup`. States must not import Countries forms,
services, controller logic, or internal view components.

### Mobile source map

| Responsibility | Mobile source |
|---|---|
| Thin guarded route | `mobile-react/app/(main)/basic-data/geographical-information/countries.tsx` |
| Typed route constant | `mobile-react/src/core/constants/routes.ts` |
| Canonical route policy | `mobile-react/src/features/auth/rbac/route-manifest.ts` |
| Screen orchestration | `mobile-react/src/features/basic-data/countries/screens/CountriesScreen.tsx` |
| Endpoint constants | `mobile-react/src/features/basic-data/countries/api/country-endpoints.ts` |
| Runtime response validation | `mobile-react/src/features/basic-data/countries/api/country-schemas.ts` |
| HTTP and query serialization | `mobile-react/src/features/basic-data/countries/api/country-api.ts` |
| Transport and list types | `mobile-react/src/features/basic-data/countries/types/country.ts` |
| Query keys, queries and mutations | `mobile-react/src/features/basic-data/countries/queries/` |
| Card presentation | `mobile-react/src/features/basic-data/countries/components/CountryCard.tsx` |
| Full-screen form | `mobile-react/src/features/basic-data/countries/components/CountryForm.tsx` |
| Device report workflow | `mobile-react/src/features/basic-data/countries/components/CountryReportView.tsx` |
| Deliberate public API | `mobile-react/src/features/basic-data/countries/index.ts` |
| Shared list state | `mobile-react/src/shared/listing/useServerListState.ts` |
| Shared list composition | `mobile-react/src/shared/components/multi-view/AppListScreen.tsx` |

The Expo route imports `CountriesScreen` through the Basic Data public API and
wraps it in `RouteGuard`. Navigation visibility and direct-route access both
consume the route manifest; hiding a drawer item is never the authorization
boundary. The mobile feature validates every JSON response with Zod before
returning typed data to React Query.

## 3. Frozen HTTP Contract

The frontend route prefix is `/api/v1/countries`. The API controller uses
versioned routing and sends one CQRS request per action.

| Operation | Method and route | Permission | Success |
|---|---|---|---|
| Paged management list | `GET /api/v1/countries` | View | `200 PageResponse<CountryListItem>` |
| Active lookup | `GET /api/v1/countries/lookup` | View | `200 CountryLookup[]` |
| Detail, active or archived | `GET /api/v1/countries/{id}` | View | `200 CountryDetail` |
| Country with active states | `GET /api/v1/countries/{id}/states` | View | `200 CountryResponse` |
| Create | `POST /api/v1/countries` | Create | `201 CountryDetail` |
| Bulk create | `POST /api/v1/countries/bulk` | Create | `201 { createdCount }` |
| Update active country | `PUT /api/v1/countries/{id}` | Edit | `200 CountryDetail` |
| Archive | `DELETE /api/v1/countries/{id}` | Delete | `204` |
| Bulk archive | `POST /api/v1/countries/bulk-archive` | Delete | `200 { archivedCount }` |
| Restore | `POST /api/v1/countries/{id}/restore` | Delete | `204` |

The Crystal report view is intentionally independent. It uses the reporting
service and does not inherit the Countries list query unless a report contract
explicitly adds equivalent parameters. ActiveReportsJS has its own tenant-scoped
template contract under `/api/v1/report-templates`: published list/detail reads,
management list/detail reads, create/update, publish/unpublish, archive/restore,
Save As, and immutable revisions. The current authenticated tenant is derived by
the API and is never supplied by the browser.

The approved Countries source is discovered from the report-template data-source
catalog and resolves to `endpoint=/api/v1/countries/report-data`. It is a relative,
same-origin JSON endpoint protected by the existing tenant session and
`Countries:View`; it is not a database connection string. Stored definitions may
contain only this approved logical source and never contain a database credential,
token, absolute deployment host, arbitrary SQL, or an unauthorised endpoint.

### Transport types

| Type | Purpose | Important fields |
|---|---|---|
| `CountryListItem` | Grid/Card/Chart page row | country fields, `statesCount`, audit dates, `isDeleted` |
| `CountryDetail` | View/edit workflow | country fields, audit dates, `isDeleted`; no state collection |
| `CountryLookup` | Active selector | `id`, localized names, `isDeleted` |
| `CreateCountryRequest` | Create/update body | editable fields only; no route ID or audit fields |
| `CountryPageQuery` | Exact list query string | paging, search field/operator, status, filters, sort |
| `CountryPageResponse` | Server page | `items` and authoritative `metaData` |

Do not collapse these into one oversized DTO. A list count, detail relation, or
lookup label belongs only in the contract that consumes it.

Both clients consume the same JSON shape, but enforce it differently:

| Boundary | Web | Mobile |
|---|---|---|
| Endpoint prefix | Central `apiRoutes.countries` | Feature-local relative `countryEndpoints`; `apiService` owns the API base |
| Compile-time model | Separate list/detail/lookup/request/page types | Separate `Country`, `CountryDetail`, `CountryWithStates`, request and page-query types |
| Runtime response validation | Typed HTTP service contract | Zod parses page, detail, lookup, relation and bulk results |
| Request normalization | Service trims values, uppercases code fields and maps blank optional values to `null` | Form trims and maps blank optional values to `null`; API mapping uppercases currency filters; backend mapping is the final uppercase normalization boundary |
| Error boundary | Shared Problem Details helpers plus form-field mapping | Central `apiService`/`ApiError`, persistent list error with Retry and mutation toast |

A new feature should use the strongest established boundary in its client. For
mobile, accepting `unknown` and parsing with a feature-owned schema is required;
TypeScript assertions alone are not an API contract.

## 4. Read Path Contract

### Paging, sorting and refresh

| Event | Page behavior | Criteria behavior | Selection behavior | Refresh behavior |
|---|---|---|---|---|
| Initial load | UI page `0` -> API page `1` | Defaults applied | Empty | Query runs |
| Search text | Reset to `0` after input change | Debounced | Cleared | Query key changes |
| Search field/operator | Reset to `0` | Preserve other filters | Cleared | Query key changes |
| Filter change | Reset to `0` | Preserve unrelated criteria | Cleared | Query key changes |
| Sort change | Reset to `0` | Preserve search and filters | Cleared | Query key changes |
| Page-size change | Reset to `0` | Preserve criteria | Cleared | Query key changes |
| Page change | Requested zero-based page | Preserve criteria | Cleared | Query key changes |
| Manual refresh | Retain page and criteria | Retained | Retained unless rows no longer qualify | Refetch current key |
| Mutation success | Reconcile to valid page | Retained | Bulk success clears selection | Invalidate `countryKeys.all` |
| Total shrinks | Clamp to last valid page | Retained | Invalid IDs removed | Refetch valid page |

The frontend overrides the API's standalone `nameEn ASC` defaults by always
sending `createdOn DESC`. This places a newly created country near the top after
query invalidation. The backend adds `Id` as the deterministic secondary order.

### Search and filter contract

| UI control | Query key | Values or parser | Default/absence |
|---|---|---|---|
| Search input | `search` | Trimmed, debounced text; backend maximum 200 | Omitted when empty |
| Column dropdown | `searchField` | `all`, `nameAr`, `nameEn`, `alpha2Code`, `alpha3Code`, `phoneCode`, `currencyCode` | `all` |
| Condition dropdown | `searchOperator` | `contains`, `doesNotContain`, `equals`, `doesNotEqual`, `startsWith`, `endsWith` | `contains` |
| Status menu | `status` | `active`, `archived`, `all` | `active` |
| Currency filter | `currencyCode` | Trim and uppercase; send only exactly three letters | Omitted while incomplete |
| States filter | `hasStates` | `true` or `false` | Omitted for all |
| Sort | `sortBy` | `nameEn`, `nameAr`, `alpha2Code`, `alpha3Code`, `currencyCode`, `createdOn` | Frontend sends `createdOn` |
| Direction | `sortDirection` | `asc` or `desc` | Frontend sends `desc` |

For `all`, positive operators match any searchable field. Negative operators
require every searchable field not to match; nullable fields count as a
non-match. Field-specific searches evaluate only the selected property. Do not
replace this server behavior with client filtering over the loaded page.

### Grid column contract

| Column | Frontend field | Backend list field | Searchable | Sortable by API | Display |
|---|---|---|---|---|---|
| ID | `id` | `Id` | No | No | Centered integer |
| Arabic name | `nameAr` | `NameAr` | Yes | Yes | Localized flag/name renderer |
| English name | `nameEn` | `NameEn` | Yes | Yes | Localized flag/name renderer |
| Alpha-2 | `alpha2Code` | `Alpha2Code` | Yes | Yes | Code chip |
| Alpha-3 | `alpha3Code` | `Alpha3Code` | Yes | Yes | Code chip |
| Phone | `phoneCode` | `PhoneCode` | Yes | No | Phone renderer |
| Currency | `currencyCode` | `CurrencyCode` | Yes plus exact filter | Yes | Currency chip |
| States | `statesCount` | `StatesCount` | Boolean relation filter only | No | Count chip |
| Created | `createdOn` | `CreatedOn` | No | Yes | Localized date |
| Updated | `updatedOn` | `UpdatedOn` | No | No | Localized optional date |
| Status | `isDeleted` | `IsDeleted` | Status filter | No | Active/archived chip |
| Actions | derived | n/a | No | No | Permission and lifecycle actions |

The Grid toolbar order is part of the applied interaction contract:

1. search column dropdown;
2. search condition dropdown;
3. search input;
4. Reset button;
5. Grid Options as the final row item.

Grid Options owns shared Columns and Density entries. Countries contributes the
Status choices and permission-gated bulk Archive action. Currency and states
filters remain API-reserved criteria and are not exposed by the current Countries
UI. All visible criteria—search field, search condition, text, status, sort, page,
and page size—still come from one query state.

Only API allow-listed columns expose sorting. ID, Phone, States count, Updated,
Status, and Actions are explicitly non-sortable; the controlled handler remains a
second defensive allow-list. Bulk selection is normalized to eligible active IDs
and rejects more than the API maximum of 100 with localized feedback. It never
silently truncates a select-all result or sends a request the API must reject.

The multi-view header Filter button starts pressed and toggles criteria-bar
visibility without changing the controlled query. It opens or closes the Grid
toolbar in Grid, the shared Country criteria header in Cards and Chart, and the
independent Country Report parameters in Report. Import has no filter surface,
so the action is omitted there. The button exposes its pressed state for keyboard
and screen-reader users. This behavior is provided by shared `PageHeader` and
`HeaderActions`; future multi-view features reuse those props rather than adding
their own header toggle.

### Mobile list profile

Mobile uses the same backend page, sort and lifecycle semantics with a smaller
touch-first control surface.

| Concern | Mobile Countries contract |
|---|---|
| State owner | One `useServerListState<CountrySortColumn, CountryFilters>` instance in `CountriesScreen` |
| Search | One compact controlled input, 350 ms shared debounce, backend defaults to `searchField=all` and `searchOperator=contains` |
| Visible filter | Single-select status modal: active, archived or all |
| Reserved filters | `currencyCode` and `hasStates` exist in the query type/serializer but have no Countries screen controls and remain at defaults |
| Paging | Zero-based UI converted with `toApiPageNumber`; server metadata is authoritative |
| Page sizes | Table defaults to `5`, Cards to `3`; user options are `3`, `5`, `10` |
| Sort | Table sends only the `CountrySortColumn` allow-list; initial `createdOn DESC` |
| Refresh | Pull-to-refresh refetches the current key and keeps current criteria |
| Background fetch | Previous page remains visible and `isFetching` shows non-destructive progress |
| Selection | Card selection only; cleared by wrapped search, page, page-size, status and sort handlers |
| Loading/error/empty | Full loading state, persistent error with Retry, localized empty state |

The mobile search input is not a client-side filter. `AppListScreen` receives
the already paged server rows, controlled search and `serverPagination`, so it
must not slice or search the current page again. If a future mobile feature
needs field/operator search or extra filters, extend the shared controlled list
contract and serialize those choices; do not filter the visible page locally.

## 5. View Contract

| Platform/view | Data source and scope | Required behavior |
|---|---|---|
| Web Grid | Complete filtered/sorted result through 5000 rows; current authoritative server page above 5000 | One adaptive data strategy and the reusable `MyDataGrid` footer |
| Web Cards | Current display page from the same adaptive criteria/result | Same actions and pager; no second list state |
| Web Chart | First display page for the shared criteria plus authoritative total | Reset to page zero on entry, omit pagination controls, label metrics as page-scoped, and never imply global aggregation |
| Web Report | Crystal reporting API/catalog plus tenant-scoped ActiveReportsJS template API and approved Countries JSON data | Crystal remains default; published ActiveReports templates have a read-only viewer, while permission-protected authors use the reusable Designer with Save, Save As, drafts, publish, dirty guards, revisions, and RowVersion conflicts |
| Web Import | Local XLSX preview then bulk-create API | Create permission, local validation, submitted-batch atomicity and invalidation |
| Mobile Table | Current server page | Horizontally capable data table, API-supported sort columns and shared server pager |
| Mobile Cards | Same current server page and criteria | Touch-first names, codes, state count, status, selection and guarded actions |
| Mobile Report | Independent reporting API/catalog | Name filters, PDF validation, preview/print, device share/download and temporary-file cleanup |

The selected view is stored under `countries-view-layout`. Import is omitted and
forced back to Grid when the user lacks create permission.

Countries uses the shared global `views.*` labels rather than feature-owned
variants, so Grid, Cards, Chart, Report, and Import have the same names as every
other Multi View screen. The shared toggle owns its internal button padding;
the Chart root owns responsive content padding. Chart deliberately has no pager:
entering it resets the shared list page to zero, preserves the current criteria
and page size. Its summary labels, rather than a duplicate informational alert,
disclose that only the first display page supplies the chart derivations.

Countries does not own a Grid pager. It configures the shared
`MyDataGrid`/`GridFooter` in client mode only after the adaptive hook has loaded
the complete result at 5000 rows or fewer. Larger results use controlled server
pagination. Both modes keep the established reusable navigation behavior.
If the hosted API still enforces its earlier page-size cap, the adaptive hook
falls back to server pagination until the updated Countries API is deployed.

Optional views are not mandatory for the next feature. Add them only when the
product and API contracts justify them.

### Web Report engines

`CountryReportPage` renders an accessible exclusive engine selector. **Crystal
Reports** remains the default selection and retains the existing report catalog,
parameters, PDF generation, print, and export flow without modification.
**ActiveReportsJS Viewer** is available to users with `ReportTemplates:View` and
loads only published templates from the current tenant. **ActiveReportsJS
Designer** is available to non-read-only authors with View and Edit; create,
overwrite, publish, and future lifecycle controls are additionally guarded by
their explicit permissions.

Both ActiveReports controls are dynamically imported with `ssr: false` because
the vendor controls use browser APIs. The reusable reporting layer owns the
repository callbacks, published/management selectors, Save, Save As from the
current edited definition, dirty-switch guard, data-source descriptor validation,
and RowVersion conflict feedback. Countries supplies only feature vocabulary,
the starter template, approved dataset fields, and expected logical source key.

The starter contains the approved REST binding, not database access:
`DataProvider=JSON`, `ConnectString=endpoint=/api/v1/countries/report-data`, and
`jpath=$.[*]`. The API returns the stable active-country array. Local and hosted
deployments use the same stored template because the Next same-origin API proxy
derives the backend host and carries the authenticated session. Server-side
ActiveReports rendering/export remains a separate explicit product decision.

Mobile view switching is owned by `AppListScreen`/`AppMultiView`. Switching to
Table or Cards applies that view's server page size and returns to page zero;
Report declares `paginate: false` and `renderWhenEmpty: true`, so report access
does not depend on the current Countries page containing rows. Mobile has no
Chart or XLSX Import view. That is an explicit platform profile, not permission
to duplicate those operations with ad hoc components.

### Web Chart applied profile

`CountriesChartView` is a viewport-bounded flex column beneath
`CountriesMultiView`. The authoritative `totalCount` is labeled as matching
Countries; visible Countries, currencies, States, and timeline values are all
derived from the first loaded page. The previous page-scope alert was removed
because those localized summary labels already state the distinction. There is
no chart pager and no implication that these are global aggregates.

The Country chart root owns responsive inner padding and has `height: 100%`,
`minHeight: 0`, and hidden outer overflow. Its summary block does not shrink;
the remaining chart grid has the only vertical scroll region. The States by
Country, States Coverage, Currency, and optional Timeline panels each fill their
grid row. They use a 280px narrow-screen minimum height and stretch on desktop,
so the available view height is occupied without a blank area under the charts
or a vertical document scroll.

### Web Cards applied profile

Countries Cards use the same adaptive list criteria as Grid and Chart. The
shared card toolbar exposes the Countries search-column choices (`all`, Arabic
and English names, alpha codes, phone, and currency) and all six search
conditions before the search input; Reset follows the shared sort controls. Its
terminal Grid Options menu contains Status and the permission-gated bulk Archive action, while
the shared Columns and Density controls remain available in the matching Grid
toolbar. Shared sort-column and direction controls follow the search controls
and accept only the Countries server sort allow-list.

`CountriesCardView` renders a responsive `12 / 6 / 4 / 3` card grid
(`xs / sm / md / lg`) from the current page. Results at or below 5000 rows are
loaded once and paged on the client; larger results remain server-paged. It uses `EntityCard` for
the fixed visual scaffold, guarded active-row selection, lifecycle actions,
hover/reduced-motion treatment and a five-second create/edit highlight. Country
content remains feature-specific; Currency and States are not extra Card toolbar
filters.

The card grid owns vertical overflow. `CountryCardViewPagination` is the final
non-shrinking, pinned footer and delegates to shared `CardViewPagination` with
the Countries display page size options `5`, `10`, `25`, and `50`. The footer
shows a localized live range, page-size selector and responsive one-based page
navigation while the controller remains zero-based. The Basic Data shell is
viewport-bounded, so the document does not scroll to reach pagination; only the
card-grid region scrolls when the page of cards exceeds its available space.

Empty default results show the permitted Add path; filtered results show Clear
criteria and Refresh. Selection clears through the shared server-list transition
rules whenever criteria, page, or page size changes, and the archive menu action
remains disabled while no eligible item is selected or a bulk mutation is busy.
Initial loading may use the view skeleton/overlay; a later refetch keeps the
current rows/cards/charts mounted and shows only the non-destructive linear
progress indicator at the view boundary.

## 6. Detail and Write Contract

### Form fields and validation

| UI field | Request field | Required | Client/server rule | Normalization |
|---|---|---|---|---|
| Arabic name | `nameAr` | Yes | 2-100 Arabic letters/spaces | Trim |
| English name | `nameEn` | Yes | 2-100 English letters/spaces | Trim |
| Alpha-2 | `alpha2Code` | No | Exactly two ISO-style letters | Trim, uppercase, blank -> `null` |
| Alpha-3 | `alpha3Code` | No | Exactly three ISO-style letters | Trim, uppercase, blank -> `null` |
| Phone code | `phoneCode` | No | International phone-code pattern, max 10 | Trim, blank -> `null` |
| Currency | `currencyCode` | No | Exactly three currency-code letters | Trim, uppercase, blank -> `null` |

The server owns uniqueness for Arabic name, English name, Alpha-2 and Alpha-3.
The database reinforces these with unique indexes, including filtered indexes
for nullable alpha codes. `Country.Duplicated` maps back to the relevant form
fields; other business failures remain visible API errors.

### Mode and exit behavior

| Mode | Detail load | Editable | Primary action | Exit behavior |
|---|---|---|---|---|
| Add | No | Yes | Create | Dirty close opens discard confirmation |
| Edit | `GET /{id}` | Active record only | Update | Detail failure blocks submit and exposes Retry |
| View | `GET /{id}` | No | None | Close without mutation |
| Busy create/update | Existing state retained | Disabled by form controls | Duplicate submit blocked | Close ignored while pending |

The list row is not the authoritative edit contract. Edit and view load
`CountryDetail`; the form resets when the mode or selected country changes.
Development mock data may populate Add mode but never auto-submits and is absent
from production behavior.

That paragraph describes the web contract. Mobile intentionally passes the
selected `Country` list row into `CountryForm` because its list row contains every
editable field; the redundant detail hook/key were removed. A new feature whose
list and detail DTOs differ must fetch detail before view/edit and block unsafe
edit when detail loading fails.

Mobile presents the form through `AppForm` with `presentation="fullScreen"`.
The shared form/modal stack owns safe-area and keyboard behavior, initial/error
focus, next-field focus, dirty-exit confirmation and busy close protection.
View mode omits submit and disables fields. Create/edit submit through the same
mutation hook, which chooses POST or PUT from the nullable ID and invalidates
the Countries prefix on success.

## 7. Permission, Read-only and Action-State Contract

| Action | Permission | Record state | Additional server rule | Confirmation | Success refresh |
|---|---|---|---|---|---|
| View | `Countries:View` | Active or archived | Record exists | No | None |
| Create | `Countries:Create` | n/a | Unique valid fields | Form submit | Invalidate Countries prefix |
| Edit | `Countries:Edit` | Active | Unique valid fields | Form submit | Invalidate Countries prefix |
| Archive | `Countries:Delete` | Active | No active states | Warning dialog | Invalidate Countries prefix |
| Bulk archive | `Countries:Delete` | Selected active rows | 1-100 distinct IDs; every ID exists; no active states | Warning dialog | Clear selection and invalidate |
| Restore | `Countries:Delete` | Archived | Record exists | Success dialog | Invalidate Countries prefix |
| Import | `Countries:Create` | n/a | 1-100 submitted rows; no request/database duplicates | Upload action | Invalidate Countries prefix |

Read-only state and authorization are separate. Visible capability flags combine
them for presentation, while direct handlers check read-only first and then the
permission/lifecycle predicate. The API remains the final authorization and
invariant boundary.

On mobile, `RouteGuard` requires View permission, while `useAuthorization`
derives Create/Edit/Delete capabilities inside the screen. `canCreate`,
`canEdit`, and `canDelete` also require `!isReadOnly`; direct write handlers
recheck read-only first so the user receives the tenant read-only explanation.
Delete permission deliberately owns archive, bulk archive and restore on both
clients. Mobile bulk selection is exposed on active Cards only; Table does not
currently provide a selection column.

ActiveReports templates use a separate tenant-scoped permission family:
`ReportTemplates:View`, `ReportTemplates:Create`, `ReportTemplates:Edit`,
`ReportTemplates:Publish`, and `ReportTemplates:Delete`. Published list/detail
reads require View. Management catalog/detail and revision history require Edit;
create/Save As, overwrite, publication, and lifecycle actions use their matching
permissions. The current Countries UI exposes the published viewer to View users
and the Designer to non-read-only users with both View and Edit.

Archive and restore are idempotent on the server. Bulk archive is atomic: one
missing ID or one active-state dependency prevents every requested mutation.

## 8. Cache, Realtime and Cross-feature Consistency

The query-key hierarchy is:

```text
countries
  page + normalized CountryPageQuery
  lookup
  detail + id
  reports + catalog + language       # mobile report catalog
```

- List queries keep previous-page data and use a short stale time.
- Lookup and detail queries use longer stale times.
- Every successful local mutation invalidates `countryKeys.all`.
- The backend commits before scheduling the Countries change job.
- The job publishes permission-scoped notifications and a realtime entity event.
- The web realtime registry invalidates both `countryKeys.all` and
  `stateKeys.all` because Countries changes can affect state selectors and
  presentations.
- The mobile realtime registry maps the backend `countries` resource to the
  stable public prefix `['countries']`, which invalidates list, detail, lookup
  and report-catalog descendants without importing feature-private hooks.
- Session/company changes clear client caches so data cannot cross an
  authentication or tenant boundary.

When another feature consumes Countries, it must use the active lookup and
public API. It must not create a second Countries cache or duplicate the HTTP
contract.

The two clients do not share an in-memory cache. They share the naming and
invalidation contract: every local mutation and `countries` realtime event must
make the next read converge on committed API state.

## 9. Import Contract

The XLSX column order is:

```text
nameAr, nameEn, alpha2Code, alpha3Code, phoneCode, currencyCode
```

The first row is treated as the header. Rows are parsed into a preview, validated
with the same Zod schema as the form, and divided into local failures and valid
rows. The API call is atomic for the submitted valid rows; local-invalid rows are
not submitted. A server conflict marks the whole submitted batch failed.

The implemented browser preflight is deterministic:

- offer `countries-import-template.xlsx` with the canonical headers above;
- accept `.xlsx` with the canonical XLSX MIME, browser-empty MIME, or generic
  binary MIME, up to 5 MiB, and require a real XLSX ZIP container rather than a
  renamed text/CSV file;
- use only the first worksheet, require the exact case-sensitive header names in
  the documented order, and reject duplicate headers, unexpected value columns,
  formulas, a header-only workbook, or more than 100 non-empty data rows;
- preserve worksheet row numbers while ignoring wholly blank rows;
- apply form validation and field-scoped, case-insensitive duplicate checks for
  Arabic name, English name, Alpha-2, and Alpha-3; repeated blank optional alpha
  codes are allowed;
- show explicit `pending`, `invalid`, `submitted`, `uploaded`, `failed`, and
  `uncertain` row states with localized feedback.

`excelService.ts`, `SpreadsheetImportCard`, and its picker/feedback children own
the reusable file boundary. `countryImport.ts` owns the Countries headers,
row mapping, limits, template filename, and duplicate scope. The import hook owns
submission and invalidation. Do not copy these shared components into another
feature; provide a feature-owned adapter instead.

The bulk endpoint has no idempotency key. A no-response/timeout or 5xx after
submission therefore marks submitted rows `uncertain`, locks that preview, and
offers only a refreshed Grid reconciliation path. It never exposes “Retry failed”
for an uncertain batch. A stable 4xx conflict is `failed` and requires correction
or refresh before a new file is selected.

The Import view is permission-filtered, but visibility is not its mutation
boundary. `useCountryImport.uploadCountries` independently blocks tenant
read-only mode and requires `Countries:Create`; `SpreadsheetImportCard.canSubmit`
mirrors that decision for the button. Keep both checks for direct callbacks,
tests, and future composition changes.

Do not copy import into a feature unless its bulk endpoint defines maximum size,
duplicate behavior, transaction scope, error presentation and cache refresh.

Import is web-only in Countries. Mobile exposes neither document picking nor
bulk create for this feature. Add mobile import only from an explicit product
requirement and reuse platform-safe document/storage primitives; never assume a
browser XLSX workflow can be copied into React Native unchanged.

## 10. Localization, RTL and Accessibility

- Countries owns its English and Arabic keys under `countries`.
- Search column/operator labels, status choices, lifecycle dialogs, Retry,
  empty states, report errors and import feedback are localized.
- The Countries wrapper around ActiveReportsJS localizes its engine switcher,
  actions, guidance, errors, and outer responsive layout. Vendor-panel language
  packs and full RTL authoring remain a vendor integration decision; do not
  claim the internal designer chrome is localized until that configuration is
  supplied and manually verified.
- Theme direction controls layout; avoid hardcoded left/right positioning.
- Icon-only Grid actions have labels.
- Shared dialogs own focus trapping, dirty-exit confirmation and busy guards.
- Persistent list/detail failures expose Retry; mutation failures use transient
  feedback without duplicating the same list error.
- Mobile uses `AppScreen` safe-area edges, semantic theme tokens, a live
  localization `direction`, logical/direction-aware shared controls and compact
  `AppPageHeader`; it does not force RTL or reload when language changes.
- Mobile touch controls must remain at least 44x44, remain usable with text
  scaling and the keyboard, and be checked on phone/tablet portrait/landscape in
  light, dark and system themes.
- Mobile report output is validated as PDF, stored in sensitive temporary cache
  on native platforms, disposed on replacement/unmount and opened/shared through
  Expo platform APIs. Browser builds use object URLs and revoke them.

For a new feature, EN and AR keys are one implementation unit. Missing RTL,
keyboard, focus or error recovery behavior is incomplete work, even when the
happy path renders correctly.

## 11. Blueprint for the Next Feature

### Required decisions before coding

| Decision | Required answer |
|---|---|
| Owner and public route | |
| Required clients and physical route per client | |
| Identifier and scope | |
| List/detail/lookup/request types | |
| Page size, default sort and deterministic tie-break | |
| Search fields and operators | |
| Filters and exact serialization | |
| Permissions and read-only behavior | |
| Lifecycle and dependency rules | |
| Required Grid columns | |
| Optional Cards/Chart/Report/Import views | |
| Mobile Table/Card page sizes and touch interaction | |
| Mobile safe-area, keyboard, phone/tablet and offline expectations | |
| Cross-feature consumers | |
| Realtime invalidation dependencies | |
| Error codes and form-field mapping | |

An unknown answer is a contract gap. Do not infer it from Countries or from a
screenshot.

### Recommended feature shape

Web:

```text
web-next/src/features/<domain>/<feature>/
  pages/<Feature>Page.tsx
  components/
    <Feature>MultiView.tsx
    <Feature>Form.tsx
    <Feature>ArchiveDialog.tsx
    grid-view/
    card-view/                 # only when required
    chart-view/                # only when API scope is honest
    import-data/               # only with a bulk contract
  hooks/use<Feature>GridLogic.ts
  hooks/use<Feature>Queries.ts
  services/<feature>Service.ts
  types/<Feature>.ts
  utils/<feature>PageQuery.ts
  utils/<feature>Permissions.ts
  utils/validation.ts
  index.ts
```

Mobile:

```text
mobile-react/src/features/<domain>/<feature>/
  api/
    <feature>-endpoints.ts
    <feature>-schemas.ts
    <feature>-api.ts
    <feature>-report-api.ts       # only when required
  components/
    <Feature>Card.tsx
    <Feature>Form.tsx
    <Feature>ReportView.tsx       # only when required
  queries/
    <feature>-keys.ts
    use-<features>.ts
    use-<feature>-reports.ts      # only when required
  screens/<Feature>Screen.tsx
  types/<feature>.ts
  index.ts

mobile-react/app/(main)/<module>/<feature>.tsx
```

The mobile route remains a thin adapter. Add its typed `ROUTES` value and route
manifest policy with the physical route; export only the screen and deliberate
cross-feature contracts from the feature `index.ts`.

### Implementation order

1. Freeze one backend contract: routes, fields, nullability, errors, permissions,
   scope, lifecycle, limits and deterministic ordering.
2. Define separate list, detail, lookup, request, query and page types in each
   client; add mobile runtime response schemas.
3. Add backend routes plus the centralized web routes and typed Expo routes.
4. Implement pure request normalization/query serialization in each client and
   prove equivalent HTTP output with focused tests.
5. Add feature-owned HTTP services, hierarchical query keys and mutation
   invalidation in both clients.
6. Configure one `useServerListState` owner per client; keep UI pages zero-based
   and convert to one-based only at the API boundary.
7. Build the web Grid and mobile Table/Cards; explicitly disable unsupported
   sorting and never filter only the loaded server page.
8. Add route, permission, read-only and lifecycle guards at visibility and
   direct-handler levels.
9. Add Add/Edit/View forms, detail loading where required, dirty-exit protection,
   busy guards and lifecycle confirmation dialogs.
10. Add explicit loading, background fetching, error, Retry, empty and
    no-results states.
11. Add paired EN/AR resources, RTL, focus, keyboard, safe-area, touch-target and
    accessible-label behavior.
12. Add platform-appropriate optional views only after their scope and contract
    are frozen; web import and mobile device sharing are separate workflows.
13. Register realtime invalidation and expose only deliberate public APIs.
14. Test API mapping, list state, permissions/read-only, forms/mutations, routes,
    realtime and representative screens, then run web, mobile and backend gates.

### What to reuse and what to replace

Reuse domain-neutral components and hooks:

- `useServerListState`, Grid CRUD coordination and query invalidation patterns;
- `MyDataGrid`, toolbar/Grid Options, PageHeader and pagination primitives;
- forms, text fields, confirmation/discard dialogs and feedback states;
- permission, read-only, API-error, field-error and realtime infrastructure.
- on mobile, `AppScreen`, `AppPageHeader`, `AppListScreen`, `AppDataTable`,
  `AppCard`, `AppForm`, `AppStateView`, `ConfirmationDialog`, theme/localization
  providers and `useServerListState`;

Replace every Countries-owned contract:

- fields, DTOs, routes, query keys and page-query mapper;
- columns, search choices, filters and sort allow-list;
- validation, duplicate rules, lifecycle and dependency checks;
- permissions, cards, charts, reports, imports and notification text.
- Expo route files and route-policy entries, mobile Zod schemas, responsive
  composition, page-size choices and device report behavior.

## 12. Review Findings: Do Not Copy These Gaps

| ID | Priority | Finding | Required rule for the next feature |
|---|---|---|---|
| C-F01 | Resolved | ID, Phone, States count, Updated, Status, and Actions no longer expose sorting; State Country sorting is enabled because its API supports it. | Keep Grid affordances synchronized with the server sort allow-list and test both supported and unsupported columns. |
| C-F02 | Resolved | Cards and Chart expose the same search field, condition, text, status, and sort criteria as Grid; Currency/has-States remain API-reserved and are not silently active UI filters. | Every view must display or deliberately reset all active server criteria. |
| C-F03 | Resolved | Import now rejects more than 100 non-empty data rows during shared parsing and retains the API's authoritative 1-100 atomic bound. | Preserve the shared parser policy and API validation. |
| C-F06 | Resolved | Countries previously skipped row 1 without validating its schema and checked only the filename extension. | Preserve template download plus extension/MIME/size/first-sheet/exact-header/duplicate-header/empty/formula/unexpected-column preflight. |
| C-F07 | Resolved | Countries previously offered failed-row retry after an ambiguous network result. | Keep uncertain rows locked and reconcile the refreshed canonical list unless the API gains a reviewed idempotency contract. |
| C-F04 | Resolved | Page wiring now proves controller criteria, distinct initial/background loading, bulk action and form mutation composition; query-hook tests prove mutation invalidation order; services assert exact bulk envelopes. | Keep representative page/controller/mutation wiring tests beside pure adapters and component tests. |
| C-F08 | Resolved | Country archive could race a State create between dependency check and save. The API now shares transaction-owned Country lifecycle resources across both operations. | Every parent/child invariant needs one shared atomic lock or equivalent database guarantee used by all participating mutations. |
| C-F09 | Resolved | Adaptive selection could exceed the API's 100-ID archive contract. Shared normalization now rejects oversized eligible selections with localized feedback and direct-submit defense. | Client batch limits must mirror—but never replace—the authoritative API validator. |
| C-F10 | Resolved | Background refetch previously replaced current Grid/Card/Chart content with initial-loading UI. The view now preserves content and shows a non-destructive progress bar. | Model initial load and background fetching as distinct states. |
| C-F11 | Resolved | Import submit previously relied on the parent view being hidden. The button and direct handler now enforce read-only and `Countries:Create`. | Enforce mutation authorization inside every direct handler as well as in UI visibility. |
| C-M01 | Resolved | Mobile no longer models or serializes dedicated `currencyCode`/`hasStates` filters without visible controls; Currency remains an explicit search column. | Every active criterion needs a visible control and reset path. |
| C-M02 | Resolved | Mobile removed the unused detail hook/key because its list row contains every editable field. | Fetch and handle detail whenever list and form contracts differ. |
| C-M03 | Resolved | Mobile Countries/States now have screen criteria/view/form/action/permission tests plus mutation transport/invalidation tests. | Keep representative feature integration coverage beside boundary tests. |

Resolved findings remain recorded so future features preserve the correction
instead of recreating the original gap.

## 13. Verification Matrix

### Existing focused coverage

| Area | Evidence |
|---|---|
| Query serialization | `utils/countryPageQuery.test.ts` |
| Request normalization plus exact bulk create/archive bodies | `services/countryService.test.ts` |
| Permission/lifecycle predicate | `utils/countryPermissions.test.ts` |
| Development mock selection | `utils/countryMockData.test.ts` |
| Chart derivations and page scope | `components/chart-view/chartDataUtils.test.ts` |
| Cell formatting | `components/grid-view/CountryCellRenderers.test.tsx` |
| Grid sort affordances | `components/grid-view/Columns.test.tsx` |
| Page/controller/action wiring | `pages/CountriesPage.test.tsx` |
| Mutation invalidation order | `hooks/useCountryQueries.test.ts` |
| Shared bulk limit normalization | `shared/utils/bulkSelection.test.ts` |
| Shared XLSX safety contract | `shared/services/excelService.test.ts` |
| Countries Import duplicate scope | `components/import-data/countryImport.test.ts` |
| ActiveReportsJS templates | Shared service route tests, strict TypeScript compilation of SSR-safe Designer/Viewer wrappers, API safety/scope tests, and JSON parsing of the bound `public/reports/countries/countries-directory.rdlx-json` starter |
| Mobile endpoint/query and response schemas | `mobile-react/src/features/basic-data/countries/api/__tests__/country-api.test.ts` |
| Mobile shared list debounce/reset | `mobile-react/src/shared/listing/__tests__/useServerListState.test.ts` |
| Mobile route authorization | `mobile-react/src/features/auth/rbac/__tests__/route-access.test.ts` |
| Mobile realtime resource mapping | `mobile-react/src/features/realtime/__tests__/realtime-query-registry.test.ts` |
| CQRS handlers, validation and lifecycle | `api/HrManagementSystem.Tests/CountryCqrsHandlerTests.cs` |
| CQRS/controller architecture | `CountryCqrsArchitectureTests.cs`, `CountriesControllerCqrsTests.cs` |

### Required commands

From `web-next`:

```powershell
npm.cmd run check:architecture
npm.cmd run lint -- --quiet
npm.cmd run type-check
npm.cmd run type-check:strict
npm.cmd test -- --run
npm.cmd run build
```

From the repository root for focused backend verification:

```powershell
dotnet test api/HrManagementSystem.Tests/HrManagementSystem.Tests.csproj --filter CountryCqrs
```

From `mobile-react`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run check:architecture
npm.cmd test -- --runTestsByPath src/features/basic-data/countries/api/__tests__/country-api.test.ts
npm.cmd run check
```

Browser verification must cover English and Arabic, LTR and RTL, narrow and
desktop widths, permissions, read-only mode, active/archived/all status, every
search operator, empty/error/retry states, dirty close, busy protection, and
realtime refresh.

Mobile manual verification must cover iOS/Android where available plus the Expo
web target, phone/tablet, portrait/landscape, EN/AR, LTR/RTL, light/dark/system,
text scaling, keyboard avoidance, safe areas, pull-to-refresh, Table/Card page-
size changes, PDF preview/share, direct guarded navigation, permissions,
read-only mode, dirty close, busy protection and realtime refresh. Network,
empty, validation, archived, report-not-configured and Retry states must remain
visible and actionable.

## 14. Final Reconciliation Checklist

- [ ] Route adapter is thin and uses the feature public API.
- [ ] Next and Expo physical routes match their centralized route constants.
- [ ] Expo route and navigation visibility consume the canonical route policy.
- [ ] Frontend request/response types match API fields and nullability.
- [ ] Mobile accepts transport data as `unknown` and validates every response.
- [ ] UI pages are zero-based and API pages are one-based.
- [ ] Search fields/operators and sort columns are allow-listed on both layers.
- [ ] Unsupported Grid columns have `sortable: false`.
- [ ] Every view uses one normalized server-list state.
- [ ] Mobile controlled server pages are not searched, filtered or sliced again locally.
- [ ] Page-scoped metrics are labelled as page-scoped.
- [ ] Detail failure blocks unsafe editing and exposes Retry.
- [ ] Create/update requests omit IDs and server-owned audit fields.
- [ ] Permissions, read-only state and lifecycle checks fail closed.
- [ ] Archive dependencies and bulk atomicity are enforced by the API.
- [ ] Mutation and realtime invalidation cover direct and cross-feature caches.
- [ ] EN/AR, RTL, focus, keyboard and accessible labels are complete.
- [ ] Mobile safe-area, touch-target, text-scale, phone/tablet and theme checks are complete.
- [ ] Optional views are explicitly scoped per platform; absence is not silently replaced with a divergent workflow.
- [ ] Focused and full checks pass, or blockers are recorded with an owner.

Countries should be used as two traced client slices over one contract:

```text
Next route -> web controller -> normalized query -> web cache -> API
Expo route/guard -> mobile screen -> validated API boundary -> mobile cache -> API
API -> CQRS mutation -> commit -> notification/realtime -> client invalidation
```

Copying only JSX or React Native components produces similar screens, not the
same reliable cross-platform feature pattern.
