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
- Sort cycles natural -> ascending -> descending -> natural through `cycleSort`.
- The API receives a one-based page; UI components remain zero-based.
- When a view renders `AppDataTable` inside `AppMultiView`, disable the table's local pagination. For a standalone table, pass its controlled `serverState`.

## 7. Forms and mutations

- Use React Hook Form and Zod through `zodResolver`.
- Map domain data to form defaults and form values to API requests in named feature functions.
- Disable submit while pending and prevent duplicate submissions.
- Preserve entered data after recoverable errors.
- Check tenant read-only before permission denial so the user receives the correct explanation.
- Guard direct mutation handlers as well as hiding/disabling buttons.
- Confirmation dialogs stay open when the mutation fails.

## 8. UI and styles

- Compose shared fields, buttons, cards, feedback and pagination before creating a new primitive.
- For server lists that support a search column and condition, keep the main toolbar to the search field and one filter button. Pass a feature-owned `AppFilterFormButton` through `AppListScreen.filterControl`; its modal contains Status, Column, and Condition together. Do not render those selectors in a separate toolbar row.
- Feature-specific styles stay beside their component.
- Extract to `Component.styles.ts` only when the component style map obscures behavior or is intentionally shared locally.
- Add a theme token only after it has independent application-wide use.
- Follow [MOBILE_STYLE_GUIDE.md](MOBILE_STYLE_GUIDE.md) for RTL, safe areas, touch targets and contrast.

## 9. Localization and accessibility

- Add the EN and AR namespace together.
- Put the keys in the matching paired resource modules under `core/localization/translations`; keep `en.ts` and `ar.ts` composition-only.
- Localize labels, errors, empty/loading states, confirmation text and accessibility labels.
- Use semantic accessibility roles/states and at least 44x44 touch targets.
- Verify dynamic text, long Arabic labels and screen-reader order.

## 10. Tests and definition of done

Minimum tests for a business feature:

- API parsing and request/query mapping;
- list reducer/query parameters, including page conversion;
- permission and tenant read-only matrices;
- mutation invalidation;
- one representative loading/error/empty/success screen test;
- route policy for every physical protected route;
- realtime mapping when the resource publishes changes.

Before handoff:

- `npm run check` passes;
- no architecture boundary exception was added without documentation;
- routes work by direct navigation and from module navigation;
- phone/tablet, EN/AR, LTR/RTL and light/dark are reviewed;
- network, empty, validation, permission and read-only states are visible and actionable;
- no feature-specific value was added to global shared styles.
