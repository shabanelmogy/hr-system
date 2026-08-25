# Mobile feature guide

Use this guide for every new HR module. The goal is consistent ownership and predictable behavior, not identical folder counts. Small features may omit folders they do not need.

## 1. Define the boundary first

Write down the business capability and actor, API resources and permissions, tenant/company ownership, read-only behavior, list/filter/sort requirements, workflows, and realtime/offline expectations.

Do not place unrelated work in an existing miscellaneous feature. Create a stable business boundary such as `employees`, `leave`, `attendance`, or `organization`.

## 2. Target structure

```text
src/features/employees/
├── api/
│   ├── employee-api.ts
│   ├── employee-endpoints.ts
│   └── employee-schemas.ts
├── components/
├── hooks/
├── queries/
│   ├── employee-keys.ts
│   └── use-employees.ts
├── screens/
├── types/
├── validation/
├── navigation/
│   └── employee-route-manifest.ts
└── index.ts
```

- `api` owns transport DTOs, runtime schemas, endpoint mapping and normalization.
- `queries` owns React Query keys/hooks and invalidation.
- `validation` owns form schemas, not API response schemas.
- `screens` orchestrate feature behavior; reusable business UI stays in feature components.
- `navigation` exists only when the feature has multiple screens or module navigation.
- `index.ts` exports only what external consumers need.

Avoid broad `export *` for APIs and implementation hooks. A public API is a compatibility contract.

## 3. Routes and navigation

- Add the physical Expo Router file first, then its typed `ROUTES` entry.
- A route imports a feature root/subdomain public API and renders a screen or feature-owned layout.
- Add the access policy to `auth/rbac/route-manifest.ts`.
- Main drawer metadata belongs in the same manifest so visibility and authorization cannot drift.
- Add every direct route to `AppBreadcrumbs` with its complete parent chain. Breadcrumb overflow stays anchored at the logical Home item (left in LTR, right in RTL), while later items remain horizontally swipeable; re-evaluate that position after route, language, orientation, and width changes.
- Keep `RouteGuard` in routed pages even when a navigation item is hidden.
- Use a module Drawer for a large module; reserve main tabs for a few frequent destinations.

## 4. API boundary

```ts
const employeeSchema = z.object({
  id: z.string().uuid(),
  employeeNumber: z.string().min(1),
  displayName: z.string().min(1),
});

export async function getEmployee(id: string) {
  const response = await apiService.get<unknown>(employeeEndpoints.byId(id));
  return employeeSchema.parse(response);
}
```

- Accept `unknown` from transport and parse it before returning domain data.
- Normalize query/body values once at the API boundary.
- Do not hide missing required fields with empty strings or zero.
- Keep optional/backward-compatible fallbacks explicit in the schema.
- Do not put endpoint behavior into a screen.

## 5. Query ownership

```ts
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (query: EmployeeQuery) => [...employeeKeys.lists(), query] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};
```

- Keys are feature-owned, serializable, and stable.
- Mutations invalidate the narrowest correct prefix.
- Realtime registers stable public prefixes, not imports from private hook files.
- Session/company changes remain responsible for clearing cross-tenant caches.

## 6. Server-managed list reference

`src/features/basic-data/countries` is the first implemented mobile reference for
this pattern. It demonstrates a feature-owned endpoint/schema boundary, stable query
keys, one server list state shared by table and card views, table page size 5,
card page size 3,
Created On descending order, permission and tenant read-only guards, archive/restore,
and atomic bulk archive. Copy the pattern, not Countries' global-data ownership;
tenant/company HR features must add their own trusted scope rules in the API.

```tsx
const list = useServerListState<EmployeeSortColumn, EmployeeFilters>({
  initialPageSize: 5,
  initialFilters: { status: 'active' },
  initialSort: { columnId: 'createdOn', direction: 'descending' },
});

const query = useEmployees({
  pageNumber: toApiPageNumber(list.state.page),
  pageSize: list.state.pageSize,
  search: list.state.search,
  sortBy: list.state.sort?.columnId,
  sortDirection: list.state.sort?.direction,
  ...list.state.filters,
});

<AppListScreen
  items={query.data?.items ?? []}
  views={views}
  searchValue={list.searchInput}
  onSearchChange={list.setSearchInput}
  isFetching={query.isFetching}
  serverPagination={{
    page: list.state.page,
    pageSize: list.state.pageSize,
    totalItems: query.data?.metaData.totalCount ?? 0,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  }}
/>
```

- Search is debounced by the shared hook.
- Search, filters, sort and page-size changes reset to page zero.
- Every criterion copied into the server query must have a visible control and reset path. Do not retain API-capable but unexposed filter state.
- Sort cycles natural -> ascending -> descending -> natural through `cycleSort`.
- The API receives a one-based page; UI components remain zero-based.
- When a view renders `AppDataTable` inside `AppMultiView`, disable the table's local pagination. For a standalone table, pass its controlled `serverState`.
- When a table needs multi-row selection, use the optional controlled
  `AppDataTable.rowSelection` contract instead of rebuilding checkbox cells.
  The feature owns selected IDs and their lifecycle across search/page changes,
  while the shared table owns the accessible selection column and touch target.

### Chart view contract

Record Chart as Required, Deferred, or Excluded. Countries and States are the
implemented list-backed reference: Chart summarizes the current loaded server
page, shows the authoritative matching total separately, owns no pager, and uses
an internal vertical scroll for compact chart cards.

```tsx
{
  value: 'chart',
  icon: 'stats-chart-outline',
  paginate: false,
  renderWhenEmpty: true,
  scrollable: true,
  render: (items) => <FeatureChartView items={items} totalCount={totalCount} />,
}
```

- Use shared primitives from `src/shared/components/charts` for card framing,
  summaries, horizontal bars, vertical bars, rings, compact distributions,
  theme, RTL, and accessibility. Feature code prepares business series and
  composes these primitives; it must not redraw equivalent charts locally.
- Choose the shape by meaning, not decoration: horizontal bars compare ranked
  values with long labels; vertical bars compare a small set of short categories
  or a compact ordered timeline; rings show part-to-whole proportions with a
  bounded category count (normally two to five); the compact distribution bar is
  the dense proportional fallback. A reference Chart view should intentionally
  mix suitable shapes instead of rendering every series as the same bar type.
- Keep vertical categories to a readable phone-width set (at most ten short
  labels). Use horizontal bars for long Arabic/English names. Do not squeeze
  labels, hide values, or make horizontal scrolling the only way to understand a
  chart.
- Use a Line/Area chart only for a complete ordered series with explicit missing
  buckets and a defensible time axis. A sparse current server page is not a line
  series; add a dedicated aggregate endpoint/query before presenting it as one.
- Keep domain aggregation and labels feature-owned and cover them with pure tests.
- State visibly that list-backed values describe the loaded page. Never present
  them as global analytics; use a dedicated aggregate endpoint/query for that.
- Chart reuses the list's server filters and sort. It must not fetch all rows,
  locally re-filter the server page, or add its own pagination.
- Provide explicit empty/no-series states and meaning in text; color is never the
  only signal.
- Verify phone/tablet, orientation, text scaling, EN/AR, RTL, all theme palettes,
  light/dark, and screen-reader summaries.
- With four or more compact views below 600px, `AppMultiView` hides visible
  option labels. Screens that pass `fillViewSelector` distribute the icon buttons
  equally across the full toolbar width. Localized accessibility labels remain;
  Report/Import must never wrap or overflow.
- Do not add a scope paragraph directly below the view buttons. Distinguish
  authoritative matching totals from loaded-page metrics in the summary labels.

For advanced Line/Pie interactions beyond the shared vertical/ring primitives, the preferred
external candidate is
[`react-native-gifted-charts`](https://www.npmjs.com/package/react-native-gifted-charts),
because it supports Bar/Line/Pie and documents Expo installation with
`react-native-svg`. Install native dependencies through Expo and keep the package
behind the shared chart boundary. Do not add Victory Native/Skia only for basic
administration charts.

## 7. Forms and mutations

- Use React Hook Form and Zod through `zodResolver`.
- Map domain data to form defaults and form values to API requests in named feature functions.
- Reuse a list row for view/edit only when it contains every mutable form field. Otherwise fetch detail, show explicit loading/error state, and block unsafe edit; do not retain an unused detail hook/key.
- Disable submit while pending and prevent duplicate submissions.
- Preserve entered data after recoverable errors.
- Check tenant read-only before permission denial so the user receives the correct explanation.
- Guard direct mutation handlers as well as hiding/disabling buttons.
- Confirmation dialogs stay open when the mutation fails.

### Native Import decision

Classify mobile Import as `Required`, `Deferred`, or `Excluded` independently from
web. `Required` means the current release includes native runtime, localization,
tests, and device evidence. `Deferred` needs an owner and reopening trigger with no
reachable placeholder. `Excluded` needs a product reason and no Import route or UI.

When mobile Import is Required:

- use Expo/native document-picker and file-system APIs; do not copy a browser file
  input, drag/drop component, `FileReader`, DOM API, or browser workbook worker;
- accept only the approved `.xlsx` format, reject a source over 5 MiB, require the
  feature's exact headers, and reject more than 100 data rows before submission;
- enforce the approved extension/MIME and file-size bounds before parsing, process
  value data only, and use a bounded parser that does not evaluate macros/formulas;
- use the same exact API envelope, permissions, batch limits, normalization,
  field/scope duplicate rules, dependency behavior, atomicity, stable errors, and
  side-effect contract as other clients;
- expose explicit picking, parsing, preview, submitting, success, failure,
  cancellation, and uncertain-network states without losing actionable row errors;
- avoid holding multiple full workbook copies in memory and define background,
  interruption, and retry behavior for the supported devices;
- localize EN/AR status/error text and verify RTL order, screen-reader labels,
  focus, safe areas, orientation, and at least 44x44 touch targets;
- test picker cancellation, unsupported/oversized/corrupt files, headers, row
  validation, exact request serialization, dependency failure, API conflict,
  timeout/retry, invalidation, and permission/read-only behavior.

If the API instead owns multipart parsing, document upload progress, operation
status polling, retention/cleanup, authentication refresh, cancellation, and safe
recovery after the app is backgrounded. Do not silently mix native parsing with a
server-job contract. When the documented endpoint is an atomic JSON bulk-create
endpoint, parse locally and submit its exact JSON envelope instead of uploading the
workbook as multipart. An ambiguous timeout or transport failure is `uncertain`:
reconcile the canonical list before allowing a new submission; never retry it
automatically.

Countries and States use the required native XLSX workflow in their Import view.
The view is not server-paginated (`paginate: false`), renders the picker/preview
when the list is empty, and scrolls its preview internally. Countries submit at
most 100 validated rows to `POST countries/bulk` as `{ countries: [...] }`.
States submit `{ states: [...] }` to `POST states/bulk`, resolving each required
`countryName` through the authorized active-Countries lookup before submission.
State Import therefore requires both `States:Create` and Countries lookup/View
access; both direct handlers check tenant read-only before permission denial.

## 8. UI and styles

- Compose shared fields, buttons, cards, feedback and pagination before creating a new primitive.
- For server lists that support a search column and condition, keep the main toolbar
  to the search field, one filter button, and at most one permission-guarded primary
  icon action. Pass the feature filter through `AppListScreen.filterControl` and the
  primary action through `AppListScreen.searchActions`; the filter modal contains
  Status, Column, and Condition together. Do not render those selectors in a
  separate toolbar row.
- When the navigation App Header already identifies the route, do not repeat the
  page title/subtitle in an `AppPageHeader` inside the content. Selection-dependent
  text actions such as Bulk Archive belong in `aboveViews`; do not squeeze them
  beside Search, Filter, and Add.
- Feature-specific styles stay beside their component.
- Extract to `Component.styles.ts` only when the component style map obscures behavior or is intentionally shared locally.
- Add a theme token only after it has independent application-wide use.
- Follow [MOBILE_STYLE_GUIDE.md](MOBILE_STYLE_GUIDE.md) for RTL, safe areas, touch targets and contrast.

## 9. Localization and accessibility

- Add the EN and AR namespace together.
- Put the keys in the matching paired resource modules under `core/localization/translations`; keep `en.ts` and `ar.ts` composition-only.
- Localize labels, errors, empty/loading states, confirmation text and accessibility labels.
- Shared components must use the shared `feedback` namespace for generic loading,
  empty, error, and not-found states. Feature namespaces are only for messages
  that name or describe that feature; never make a reusable screen render
  `states.*`, `countries.*`, or another feature's text as a fallback.
- Every literal `t('namespace.key')` in `app/` and `src/` must resolve in both
  EN and AR. Keep the source-usage translation test green so a missing key can
  never reach a device as its raw dotted identifier.
- Use semantic accessibility roles/states and at least 44x44 touch targets.
- Verify dynamic text, long Arabic labels and screen-reader order.

### Managed Crystal reports

Record every Report view as Required, Deferred, or Excluded. When Managed Crystal
is Required, follow the cross-project
[Crystal Report Manager Feature Integration Guide](../project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md).

Mobile uses the same HR API catalog and render endpoints as web. The feature owns
its stable `entityKey`, localized selector, allowed filters, and PDF
open/share/error experience; shared reporting infrastructure owns the typed
service, Zod parsing, query keys, and viewer primitives after the first mobile
consumer is implemented.

- list published, permitted reports with
  `GET /api/v1/crystal-reports?entityKey={entityKey}`;
- display SummaryInfo Title in Arabic and Subject in English, with the documented
  manager fallback;
- render with `POST /api/v1/crystal-reports/{reportId}/render`, sending only report
  ID, `ar`/`en`, and approved bounded filters;
- keep Report independent from table/card pagination. In `AppMultiView`, use
  `paginate: false` and `renderWhenEmpty: true`;
- never call the Crystal host directly or send paths, filenames, SQL, connection
  strings, tenant IDs, or company IDs.

## 10. Tests and definition of done

Minimum tests for a business feature:

- API parsing and request/query mapping;
- list reducer/query parameters, including page conversion;
- permission and tenant read-only matrices;
- mutation transport plus root invalidation for create/update/lifecycle/bulk paths;
- representative loading/error/empty/success and screen-composition tests covering filters/views, form entry, lifecycle/bulk actions, and permission/read-only visibility;
- route policy for every physical protected route;
- realtime mapping when the resource publishes changes.
- required Managed Crystal reporting: entity catalog key, localized report names,
  approved render payload, no pagination, and catalog/render failure states.

Before handoff:

- `npm run check` passes;
- no architecture boundary exception was added without documentation;
- routes work by direct navigation and from module navigation;
- phone/tablet, EN/AR, LTR/RTL and light/dark are reviewed;
- network, empty, validation, permission and read-only states are visible and actionable;
- no feature-specific value was added to global shared styles.
