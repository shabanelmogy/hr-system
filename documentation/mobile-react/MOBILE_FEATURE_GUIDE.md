# Mobile feature guide

Use this guide for every new business feature inside a mobile ERP module. The goal is consistent ownership and predictable behavior, not identical folder counts. Small features may omit folders they do not need.

For a new business capability or substantial rebuild, start from the approved
central plan under `documentation/plans/`. The gates required by the exact
authorized implementation scope must be green before runtime implementation.
Overall `Implementation Ready` still requires G0-G4; a bounded slice may start
earlier only through the planning system's explicit slice-authorization rule when
remaining G4 findings are release-only. The plan must contain an explicit Mobile
Required/Deferred/Excluded decision for each optional capability; this guide then
defines how the Required Mobile surface is implemented.

Production-only device evidence, intentionally deferred Mobile capabilities,
known risks, and open decisions are centralized under
`documentation/plans/notes/` and indexed from `MOBILE_NOTES.md`. Do not leave a
material Mobile deferral only in a feature README or TODO.

## Screen pattern gate

Before implementing or rebuilding a Mobile screen, select a stable Pattern ID
from [SCREEN_PATTERN_CATALOG.md](../project/SCREEN_PATTERN_CATALOG.md) and inspect
the registered Web and Mobile sources for the same workflow:

- `P-001`: Countries server-managed Grid/CRUD; Mobile uses `CountriesScreen`
  with `AppListScreen`/`AppMultiView`/`AppDataTable` and the shared form shell.
- `P-002`: Cost Centers Tree + Master/Detail; Mobile uses `CostCentersScreen`
  through `OrganizationalStructureManagementScreen` and `AppHierarchicalTree`.
- `P-003`: Add Tenant multi-section form; Web is tabbed, while the current Mobile
  reference is an explicitly `Adapted` full-screen stacked `AppForm`. The shared
  `AppFormTabs` primitive remains available for future tabbed mobile forms, and
  both paths keep one validation context.

Record Mobile and Web as `Implemented`, `Adapted`, `Deferred`, or `Excluded` in
the owning feature profile. Platform ergonomics may change the composition, but
must not silently remove fields, validation, permissions, lifecycle actions,
dirty-state protection, or authoritative server errors. Offline remains a
feature-operation decision and is never inherited merely from the visual pattern.

When a repeated screen shape does not fit an existing Pattern ID, update the
central catalog, the Web and Mobile references, the shared reuse catalog, and
the affected feature profiles in the same change. Do not establish a Mobile-only
look-alike pattern without checking its Web counterpart, and do not claim a
Mobile implementation from types, routes, or an unused shared component.

## 1. Define the boundary first

Write down the business capability and actor, API resources and permissions, tenant/company ownership, read-only behavior, list/filter/sort requirements, workflows, and realtime/offline expectations.

Do not place unrelated work in an existing miscellaneous feature. Create a stable business boundary such as `employees`, `leave`, `attendance`, or `organization`.

## Module ownership before feature structure

Every business feature belongs to a user-facing ERP module under `src/modules/<module>`. Current mobile business owners are `hr` and `accounting`; cross-module technical capabilities belong under `src/platform`, and top-level composition belongs under `src/shell`.

When adding a completely new ERP module, create its `moduleDefinition.ts`, add its dependency policy in `scripts/module-boundaries.mjs`, and register it from `src/shell/module-registration.ts`. The server module catalog remains authoritative for enablement and entitlements; the mobile registry only filters that server catalog to modules/submodules implemented by this build.

Do not import another module's internals. Cross-owner dependencies use public `index.ts` APIs, and business modules must never depend on `src/shell`.
## 2. Target structure

```text
src/modules/hr/employees/
├── domain/
│   ├── entities/
│   ├── policies/
│   └── repositories/
│       └── employee-repository.ts
├── application/
│   ├── use-cases/
│   └── ports/
├── data/
│   ├── remote/
│   │   ├── employee-remote-data-source.ts
│   │   ├── employee-endpoints.ts
│   │   └── employee-schemas.ts
│   ├── local/
│   │   └── employee-local-data-source.ts
│   ├── mappers/
│   └── repositories/
│       └── offline-first-employee-repository.ts
├── presentation/
│   ├── components/
│   ├── hooks/
│   ├── queries/
│   │   ├── employee-keys.ts
│   │   └── use-employees.ts
│   └── screens/
├── validation/
├── navigation/
│   └── employee-route-manifest.ts
├── composition/
│   └── employee-dependencies.ts
└── index.ts
```

- `domain` owns pure business types, invariants and repository/clock/ID ports.
- `application` owns UI-neutral use cases and orchestration over domain ports.
- `data/remote` owns transport DTOs, runtime schemas, endpoint mapping and normalization.
- `data/local` owns SQLite persistence for this feature only.
- `data/repositories` implements repository ports and the feature's online/offline policy.
- `presentation/queries` owns React Query keys/controllers and invalidation; it calls application/repository boundaries rather than remote APIs directly.
- `presentation/screens` orchestrate feature UI; reusable business UI stays in `presentation/components`.
- `validation` owns form schemas, not API response schemas.
- `navigation` exists only when the feature has multiple screens or module navigation.
- `composition` is the only feature layer that wires concrete core/data implementations.
- `index.ts` exports only what external consumers need.

Avoid broad `export *` for APIs and implementation hooks. A public API is a compatibility contract.

The top-level module migration is complete: do not recreate `src/features` or `src/layouts`. Within an owning module, a feature may still be migrated incrementally from local legacy `api/queries/screens/components` folders toward the clean layers above, but new behavior must target the clean structure.

## 3. Routes and navigation

- Add the physical Expo Router file first, then its typed `ROUTES` entry.
- A route imports the owning module feature/subdomain public API and renders a screen or feature-owned layout.
- Add the access policy to `src/platform/auth/presentation/rbac/route-manifest.ts`.
- Main drawer metadata belongs in the same manifest so visibility and authorization cannot drift.
- Add every direct route to `AppBreadcrumbs` with its complete parent chain. Breadcrumb overflow stays anchored at the logical Home item (left in LTR, right in RTL), while later items remain horizontally swipeable; re-evaluate that position after route, language, orientation, and width changes.
- Keep `RouteGuard` in routed pages even when a navigation item is hidden.
- Use a module Drawer for a large module; reserve main tabs for a few frequent destinations.

After adding or moving an Expo route, run `npm run sync:contracts` from
`mobile-react`, then review the generated entry and run `npm run check:contracts`.
The compatibility matrix must contain every physical route and every endpoint
leaf. Generic resource transports may use reviewed helper functions, but the
matrix must record the concrete owner, scope, permission authority, HTTP verbs,
and non-test caller for each leaf. A `deferred`, `UNREVIEWED`, or `UNUSED`
entry is a contract failure and must be resolved before the feature is handed
to business implementation.

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
- Model response DTOs from the owning API contract, including every serialized nullable field; do not require stale web/mobile-only fields or hide drift behind generic DTO casts. Keep contract-shaped valid and malformed response fixtures beside the remote adapter tests.
- Normalize query/body values once at the API boundary.
- When a child resource is filtered by a parent ID, keep that parent ID as a
  list filter only. Use the selected child DTO's ID for child detail, scorecard,
  completion, and mutation endpoints; test the distinction with separate IDs.
- Do not hide missing required fields with empty strings or zero.
- Keep optional/backward-compatible fallbacks explicit in the schema.
- Do not put endpoint behavior into a screen.
- Remote data sources are infrastructure adapters. Application use cases and presentation code must not import them directly.

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
- For an offline-enabled feature the query function reads through the application/repository boundary. React Query may cache/project that result, but SQLite owns durable business data.

### Offline Operations Policy and repository rule

Every operation that may have offline behavior must first have a code-owned capability definition. The definition is the safety ceiling: administration can select a supported mode for a tenant/company but cannot invent support that the feature did not declare. The supported modes are:

- `online-only`: require a live server response and never synthesize success locally;
- `offline-read`: read scoped local data immediately and refresh remotely when possible;
- `offline-draft`: persist user-entered drafts locally but submit only while online;
- `offline-command`: update local state and atomically enqueue a replay-safe outbox command.

Unknown capabilities and missing, stale, malformed, wrong-scope, or unsupported policy values fail closed to `online-only`. A device preference may narrow the effective mode but must never expand it. The Platform API policy at `GET/PUT /api/v1/offline-operations/policy` is the tenant/company authority. Mobile may use a bounded cached copy only as a runtime fallback; cached or fail-closed policy is never editable authority.

Do not classify a mutation as `offline-command` merely because it is technically possible to save its payload. The API must provide safe replay semantics: an idempotency key for idempotent-key handlers, or a concurrency version plus deterministic GET reconciliation for row-versioned updates, together with aggregate concurrency, scope isolation, and interruption/restart recovery. Ambiguous submissions are `uncertain` and must reconcile rather than auto-retry. The normal React Query mutation path stays online-authoritative (`networkMode: 'always'`, no automatic replay); explicit persisted outbox commands are the only replay mechanism.

The current read reference is Countries. Code declares `countries.read` safe for
`online-only` and `offline-read`; the effective cached-read path additionally requires
the active tenant/company policy and the existing local user opt-in. Country cache rows
remain partitioned by `userId + tenantId + companyId`, have a 24-hour freshness limit,
and expose connection/source/last-update state. Enabling cached reads does not make any
mutation offline-capable.

The first certified mutation pilot is Workforce Plan draft update. The capability
`workforce-plan.update-draft` supports `online-only`, `offline-draft`, and
`offline-command`, while the tenant/company policy still defaults to `online-only` and
must explicitly opt in. Certification is backed by SQL Server aggregate-concurrency
coverage proving that child-only edits advance/check the parent rowVersion and stale
writers cannot overwrite newer lines. The mobile pilot atomically persists the scoped
draft plus row-versioned outbox command, reconciles ambiguous/409 outcomes against the
authoritative plan before retry, and stops on a concurrent server change.

## 6. Server-managed list reference

`src/modules/hr/basic-data/countries` is the first implemented mobile reference for
this pattern. It demonstrates a feature-owned endpoint/schema boundary, stable query
keys, one server list state shared by table and card views, table page size 5,
card page size 3,
Created On descending order, permission and tenant read-only guards, archive/restore,
atomic bulk archive, controlled table selection, and themed edit flash feedback.
Copy the pattern, not Countries' global-data ownership;
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
- Use `rowSelection.isRowSelectable` for lifecycle rules (for example, active
  rows can be archived while already archived rows are disabled). The bulk
  action belongs in `AppListScreen.aboveViews`, remains permission/read-only
  guarded, and must use the same confirmation and mutation path as the card
  view. In this application “delete” is the reversible Archive operation;
  do not introduce a hard-delete button unless the API contract explicitly
  supports one.
- Keep selection controlled by feature IDs, normalize table keys back to the
  feature ID type, and clear them whenever search, filter, sort, page, or page
  size changes. This prevents a bulk action from silently targeting rows that
  are no longer visible or eligible.
- `AppDataTable` highlights the first visible row with the themed secondary
  color and moves that active highlight when a row is touched. Active is a
  visual focus only; it must never pre-select a row for a destructive bulk
  action. Selected rows use `theme.colors.accent`, so the treatment follows the
  selected green/orange/blue/monochrome palette rather than a hard-coded color.
- Card views use the shared `AppDataCard`: pass `active={index === 0}` for the
  first visible card, `selected={selectedIds.includes(item.id)}` for controlled
  bulk selection, and the same `flash` key/token used by the table. This keeps
  table and card feedback consistent without feature-local timers or colors.
- A successful edit may highlight its row through the shared `flash` contract.
  Pass the edited row key and increment a numeric/string token for every save,
  including repeated saves of the same row. `AppDataTable` and `AppDataCard`
  own the transient themed animation; screens must not duplicate row/card
  background timers or use hard-coded colors. Existing flash state is marked as
  seen when a view is first mounted, so switching between Grid and Cards does
  not replay an old flash; only a new token (the edit event) starts it.

```tsx
const [flash, setFlash] = useState<AppDataTableFlash>();

// after a successful edit (not after create):
if (editingId !== null) {
  setFlash((current) => ({
    rowKey: editingId,
    token: (typeof current?.token === 'number' ? current.token : 0) + 1,
  }));
}

<AppDataTable
  columns={columns}
  flash={flash}
  getRowKey={(item) => item.id}
  rowSelection={canDelete ? {
    header: t('dataTable.select'),
    selectedRowKeys: selectedIds,
    isRowSelectable: (item) => !item.isDeleted,
    getAccessibilityLabel: (item) => t('feature.selectItem', { name: item.nameEn }),
    onSelectionChange: (keys) => setSelectedIds(
      keys.filter((key): key is number => typeof key === 'number'),
    ),
  } : undefined}
  rows={items}
  showPagination={false}
  serverState={serverState}
/>
```

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
- Use `t(...)` directly for all visible text; do not pass hardcoded fallback
  copy. The AST gate checks JSX text, visible props, nested option/action labels,
  conditional and template expressions, static keys, and catalog parity.
- `app/` and every presentation layer must not import `apiService` or
  `axiosClient`. Keep transport calls in owning `data/remote` adapters and parse
  responses from `unknown` there. `core` cannot depend on shared UI; compose
  hosts such as feedback at the root app boundary.
- Keep generic table labels such as `dataTable.select` in the paired shared
  translation resources; feature namespaces should contain only feature-specific
  accessibility wording (for example, which country or state is being selected).
- Use semantic accessibility roles/states and at least 44x44 touch targets.
- Verify dynamic text, long Arabic labels and screen-reader order.

### Managed Crystal reports

Record every Report view as Required, Deferred, or Excluded. When Managed Crystal
is Required, follow the cross-project
[Crystal Report Manager Feature Integration Guide](../project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md).

Mobile uses the same Reporting API catalog and render endpoints as web. Global
Reference Data reports and tenant-owned reports are separate scopes. Global
geography requires `super_admin` plus `GlobalCrystalReports:View` and does not
query tenant Reporting entitlement; tenant reports require `CrystalReports:View`
and an accessible Reporting module. The feature owns
its stable `entityKey`, localized selector, allowed filters, and PDF
open/share/error experience; shared reporting infrastructure owns the typed
service, Zod parsing, query keys, and viewer primitives after the first mobile
consumer is implemented.

- list tenant reports with `GET /api/v1/crystal-reports?entityKey={entityKey}`;
  global geography reports use `GET /api/v1/global-crystal-reports?entityKey={entityKey}`;
- display SummaryInfo Title in Arabic and Subject in English, with the documented
  manager fallback;
- render tenant reports with `POST /api/v1/crystal-reports/{reportId}/render`;
  global geography reports use `POST /api/v1/global-crystal-reports/{sourceId}/render`
  with the entity key, expected hash, `ar`/`en`, and approved bounded filters;
- keep Report independent from table/card pagination. In `AppMultiView`, use
  `paginate: false` and `renderWhenEmpty: true`;
- never call the Crystal host directly or send paths, filenames, SQL, connection
  strings, tenant IDs, or company IDs.

The Report option is hidden while the scope gate is loading or denied. A report
component repeats the gate before mounting a catalog query and returns to the
list view when a previously selected report loses access.

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
- `npm run check:expo` and `npm run check:export` pass;
- root `./documentation/system/Generate-Documentation.ps1 -Check` passes;
- no architecture boundary exception was added without documentation;
- routes work by direct navigation and from module navigation;
- phone/tablet, EN/AR, LTR/RTL and light/dark are reviewed;
- network, empty, validation, permission and read-only states are visible and actionable;
- no feature-specific value was added to global shared styles.
