# Mobile Feature Implementation Guide

Status: Canonical guide for building list/management features in the React Native mobile app.
Reference: `features/basic-data/countries/`
Cross-platform review: [Countries Feature Full Review](../project/COUNTRIES_FEATURE_FULL_REVIEW.md)
Applied mobile profile: [Countries Mobile Applied Feature Profile](countries-mobile-reference.md)

Use this when building a new feature that manages a server collection. It documents
the exact patterns from the Countries feature. Do not invent new ones.

---

## 1. Folder Structure

```
src/features/<domain>/<feature>/
├── index.ts                         ← Public exports
├── api/
│   ├── {feature}-endpoints.ts       ← URL path constants
│   ├── {feature}-schemas.ts         ← Zod response schemas
│   ├── {feature}-api.ts             ← API functions (fetch + validate)
│   └── {feature}-report-api.ts      ← Report API (if reports exist)
├── types/
│   └── {feature}.ts                 ← All TypeScript interfaces
├── queries/
│   ├── {feature}-keys.ts            ← Query key factory
│   ├── use-{features}.ts            ← TanStack Query hooks + mutations
│   └── use-{feature}-reports.ts     ← Report catalog query (if reports exist)
├── components/
│   ├── {Feature}Card.tsx            ← Card view item
│   ├── {Feature}Form.tsx            ← Create/edit/view form (AppForm)
│   └── {Feature}ReportView.tsx      ← Report viewer (if reports exist)
└── screens/
    └── {Feature}Screen.tsx          ← Main screen (uses AppListScreen)
```

---

## 2. Implementation Steps

### Step 1 — Types (`types/{feature}.ts`)

```ts
export type FeatureStatus = 'active' | 'archived' | 'all';

export type FeatureSortColumn = 'nameEn' | 'nameAr' | 'createdOn' | /* ... */;

export interface Feature {
  id: number;
  nameAr: string;
  nameEn: string;
  // ... entity fields
  createdOn: string;
  updatedOn: string | null;
  isDeleted: boolean;
}

export interface FeatureRequest {
  nameAr: string;
  nameEn: string;
  // ... mutable fields (no id)
}

export interface FeatureFilters {
  status: FeatureStatus;
  // ... feature-specific filters
}

export interface FeaturePageQuery extends FeatureFilters {
  pageNumber: number;
  pageSize: number;
  search: string;
  sortBy: FeatureSortColumn;
  sortDirection: 'asc' | 'desc';
}
```

### Step 2 — Endpoints (`api/{feature}-endpoints.ts`)

```ts
export const featureEndpoints = {
  base: 'features',
  lookup: 'features/lookup',
  byId: (id: number) => `features/${id}`,
  restore: (id: number) => `features/${id}/restore`,
  bulkArchive: 'features/bulk-archive',
} as const;
```

### Step 3 — Zod Schemas (`api/{feature}-schemas.ts`)

Validate every API response with Zod schemas matching the types:

```ts
import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';

export const featureSchema = z.object({
  id: z.number().int().positive(),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  // ... all fields
  createdOn: z.string().min(1),
  updatedOn: z.string().nullable(),
  isDeleted: z.boolean(),
});

export const featurePageSchema = z.object({
  items: z.array(featureSchema),
  metaData: pageMetadataSchema,
});
```

### Step 4 — API Functions (`api/{feature}-api.ts`)

Use `apiService` from `@/src/core/api`. Parse every response with Zod. Build query strings manually:

```ts
import { apiService, type PageResponse } from '@/src/core/api';
import { featureEndpoints } from './{feature}-endpoints';
import { featurePageSchema, featureDetailSchema } from './{feature}-schemas';

function toQueryString(query: FeaturePageQuery): string {
  const params = new URLSearchParams({
    pageNumber: String(query.pageNumber),
    pageSize: String(query.pageSize),
    status: query.status,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  });
  if (query.search.trim()) params.set('search', query.search.trim());
  // ... feature-specific filters
  return params.toString();
}

export const featureApi = {
  async getPage(query: FeaturePageQuery): Promise<PageResponse<Feature>> {
    return featurePageSchema.parse(
      await apiService.get<unknown>(`${featureEndpoints.base}?${toQueryString(query)}`),
    );
  },
  async getById(id: number) {
    return featureDetailSchema.parse(await apiService.get<unknown>(featureEndpoints.byId(id)));
  },
  async create(request: FeatureRequest) {
    return featureDetailSchema.parse(
      await apiService.post<unknown, FeatureRequest>(featureEndpoints.base, request),
    );
  },
  async update(id: number, request: FeatureRequest) {
    return featureDetailSchema.parse(
      await apiService.put<unknown, FeatureRequest>(featureEndpoints.byId(id), request),
    );
  },
  async archive(id: number): Promise<void> {
    await apiService.delete<unknown>(featureEndpoints.byId(id));
  },
  async restore(id: number): Promise<void> {
    await apiService.post<unknown, undefined>(featureEndpoints.restore(id), undefined);
  },
  async bulkArchive(ids: readonly number[]) {
    return bulkArchiveSchema.parse(
      await apiService.post<unknown, { ids: readonly number[] }>(featureEndpoints.bulkArchive, { ids }),
    );
  },
};
```

### Step 5 — Query Keys (`queries/{feature}-keys.ts`)

```ts
export const featureKeys = {
  all: ['features'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  list: (query: FeaturePageQuery) => [...featureKeys.lists(), query] as const,
  lookup: () => [...featureKeys.all, 'lookup'] as const,
  detail: (id: number) => [...featureKeys.all, 'detail', id] as const,
};
```

### Step 6 — Query Hooks (`queries/use-{features}.ts`)

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useFeatures(query: FeaturePageQuery) {
  return useQuery({
    queryKey: featureKeys.list(query),
    queryFn: () => featureApi.getPage(query),
    placeholderData: (previous) => previous,  // ← CRITICAL: keeps data during view switches
  });
}

// Generic invalidation wrapper for all mutations
function useInvalidatingMutation<TVariables, TResult = unknown>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: featureKeys.all }),
  });
}

export function useSaveFeature() {
  return useInvalidatingMutation(({ id, request }: { id: number | null; request: FeatureRequest }) =>
    id === null ? featureApi.create(request) : featureApi.update(id, request));
}

export function useArchiveFeature() {
  return useInvalidatingMutation((id: number) => featureApi.archive(id));
}

export function useRestoreFeature() {
  return useInvalidatingMutation((id: number) => featureApi.restore(id));
}

export function useBulkArchiveFeatures() {
  return useInvalidatingMutation((ids: number[]) => featureApi.bulkArchive(ids));
}
```

### Step 7 — Card Component (`components/{Feature}Card.tsx`)

```tsx
import { AppDataCard, AppIcon, AppIconButton, AppStatusBadge, AppText } from '@/src/shared/components';

export function FeatureCard({ item, active, canEdit, canDelete, selected, flash, flashToken, onEdit, onArchive, onRestore, onToggleSelection, onView }) {
  const archived = item.isDeleted;
  return (
    <AppDataCard active={active} flash={flash} flashToken={flashToken} padding="sm" selected={selected}>
      <View style={styles.header}>
        <AppIcon ... />
        <View style={styles.name}>
          <AppText variant="label">{item.nameEn}</AppText>
          <AppText color="muted" variant="bodySmall">{item.nameAr}</AppText>
        </View>
        <AppStatusBadge color={archived ? theme.colors.warning : theme.colors.success} label={...} />
      </View>
      <View style={styles.actions}>
        {canDelete && !archived ? <AppIconButton accessibilityState={{ selected }} color={selected ? theme.colors.accent : undefined} icon={selected ? 'checkbox' : 'square-outline'} onPress={() => onToggleSelection(item)} /> : null}
        <AppIconButton icon="eye-outline" onPress={() => onView(item)} />
        {canEdit && !archived ? <AppIconButton icon="create-outline" onPress={() => onEdit(item)} /> : null}
        {canDelete ? <AppIconButton icon={archived ? 'refresh-outline' : 'archive-outline'} onPress={() => archived ? onRestore(item) : onArchive(item)} /> : null}
      </View>
    </AppDataCard>
  );
}
```

### Step 8 — Form Component (`components/{Feature}Form.tsx`)

Uses `AppForm` + `AppFormSection` + `Controller` from react-hook-form + Zod:

```tsx
import { Controller } from 'react-hook-form';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppForm, AppFormSection, AppTextField } from '@/src/shared/components';

export function FeatureForm({ entity, loading, mode, onClose, onSave }) {
  const { t } = useTranslation();
  const schema = useMemo(() => z.object({ ... }), [t]);
  const { clearErrors, control, handleSubmit, formState: { errors, isDirty, isSubmitting } } =
    useZodForm(schema, { defaultValues: { ... } });
  const readOnly = mode === 'view';

  return (
    <AppForm
      errors={toFormErrorMap(errors)}
      icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'}
      isDirty={isDirty}
      onCancel={onClose}
      onClearFieldError={(name) => clearErrors(name)}
      onSubmit={readOnly ? undefined : handleSubmit(submit)}
      presentation="fullScreen"
      submitting={loading || isSubmitting}
      submitLabel={t('feature.save')}
      title={t(readOnly ? 'feature.view' : mode === 'create' ? 'feature.add' : 'feature.edit')}
      visible>
      <AppFormSection icon="..." title={t('feature.section1')}>
        <Controller control={control} name="nameEn" render={({ field }) =>
          <AppTextField editable={!readOnly && !loading} label={t('...')} ... />
        } />
      </AppFormSection>
    </AppForm>
  );
}
```

Development forms may opt into the shared `AppForm` `mockDataAction`. It renders
the localized Generate Mock Data action in the modal footer only when the
feature passes a domain-owned generator. The action fills values for review,
marks the form dirty, never submits or persists data, is disabled while the form
or required parent lookup is unavailable, and must be gated with `__DEV__`.
Samples and parent relationships remain feature-owned; do not generate an
arbitrary generic object or use mock generation as a production seed path.

### Step 9 — Screen (`screens/{Feature}Screen.tsx`)

The screen uses:
- `useServerListState` from `@/src/shared/listing`
- `AppListScreen` from `@/src/shared/components`
- `AppDataTable` for table view
- Feature card component for cards view
- `ConfirmationDialog` for archive/bulk actions
- Feature form for create/edit/view

```tsx
import { toApiPageNumber, useServerListState } from '@/src/shared/listing';
import {
  AppButton, AppDataTable, type AppDataTableFlash, AppIconButton, AppListScreen,
  AppPageHeader, AppScreen, AppStateView, ConfirmationDialog, showToast,
} from '@/src/shared/components';

const initialFilters: FeatureFilters = { status: 'active' };

export function FeatureScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  // Permissions
  const { allowed: canCreate } = useAuthorization({ requiredPermissions: [...] });
  const { allowed: canEdit } = useAuthorization({ requiredPermissions: [...] });
  const { allowed: canDelete } = useAuthorization({ requiredPermissions: [...] });

  // Server list state (page, search, sort, filters)
  const list = useServerListState<FeatureSortColumn, FeatureFilters>({
    initialFilters,
    initialPageSize: 5,
    initialSort: { columnId: 'createdOn', direction: 'descending' },
  });

  // Query
  const query = useFeatures({
    pageNumber: toApiPageNumber(list.state.page),
    pageSize: list.state.pageSize,
    search: list.state.search,
    status: list.state.filters.status,
    sortBy: list.state.sort?.columnId ?? 'nameEn',
    sortDirection: list.state.sort?.direction === 'descending' ? 'desc' : 'asc',
  });

  // Mutations
  const saveMutation = useSaveFeature();
  const archiveMutation = useArchiveFeature();
  const restoreMutation = useRestoreFeature();
  const bulkArchiveMutation = useBulkArchiveFeatures();

  // UI state
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selected, setSelected] = useState<Feature | null>(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const rows = query.data?.items ?? [];

  // Handlers (check isReadOnly + notifyBlockedAction before mutations)
  // ...

  // Render
  return (
    <AppScreen refreshControl={<RefreshControl ... />}>
      <AppPageHeader action={...} title={...} />

      <AppListScreen<Feature, 'table' | 'cards' | 'report'>
        defaultView="table"
        emptyContent={<AppStateView message={...} state="empty" />}
        filter={{ modalTitle: ..., onChange: ..., options: ..., values: ... }}
        isFetching={query.isFetching}
        items={rows}
        onSearchChange={changeSearch}
        searchPlaceholder={...}
        searchValue={list.searchInput}
        serverPagination={{
          onPageChange: changePage,
          onPageSizeChange: changePageSize,
          page: list.state.page,
          pageSize: list.state.pageSize,
          pageSizeOptions: [3, 5, 10],
          totalItems: query.data?.metaData.totalCount ?? 0,
        }}
        showViewLabels
        views={[
          {
            value: 'table',
            icon: 'grid-outline',
            label: t('multiView.table'),
            defaultPageSize: 5,
            render: (items) => (
              <AppDataTable
                columns={columns}
                getRowKey={(item) => item.id}
                rows={items}
                showPagination={false}
                serverState={{
                  onPageChange: changePage,
                  onPageSizeChange: changePageSize,
                  onSortChange: changeSort,
                  page: list.state.page,
                  pageSize: list.state.pageSize,
                  sort: list.state.sort,
                  totalRows: query.data?.metaData.totalCount ?? 0,
                }}
              />
            ),
          },
          {
            value: 'cards',
            icon: 'albums-outline',
            label: t('multiView.cards'),
            defaultPageSize: 3,
            scrollable: true,
            render: (items) => (
              <View style={styles.cards}>
                {items.map((item) => (
                  <FeatureCard key={item.id} item={item} ... />
                ))}
              </View>
            ),
          },
          {
            value: 'report',
            icon: 'document-text-outline',
            label: t('feature.reportView'),
            paginate: false,
            renderWhenEmpty: true,
            render: () => <FeatureReportView />,
          },
        ]}
      />

      {/* Form */}
      {selected || formMode === 'create' ? <FeatureForm ... /> : null}

      {/* Confirmation */}
      <ConfirmationDialog ... />
    </AppScreen>
  );
}
```

---

## 3. Key Patterns

### Server Pagination

The screen passes `serverPagination` to `AppListScreen`. This makes `AppMultiView` delegate page/pageSize to the server instead of slicing items locally:

```tsx
serverPagination={{
  onPageChange: changePage,
  onPageSizeChange: changePageSize,
  page: list.state.page,
  pageSize: list.state.pageSize,
  pageSizeOptions: [3, 5, 10],
  totalItems: query.data?.metaData.totalCount ?? 0,
}}
```

### Table with Server Sort

`AppDataTable` receives `serverState` for server-side sorting and pagination:

```tsx
serverState={{
  onPageChange: changePage,
  onPageSizeChange: changePageSize,
  onSortChange: changeSort,
  page: list.state.page,
  pageSize: list.state.pageSize,
  sort: list.state.sort,
  totalRows: totalCount,
}}
```

### View-Specific Page Sizes

Each view can define its own `defaultPageSize`. When switching views, `AppMultiView` calls `onServerPageSizeChange` with the new view's page size:

```tsx
{ value: 'table', defaultPageSize: 5, ... }
{ value: 'cards', defaultPageSize: 3, ... }
```

### placeholderData (Critical)

Always add `placeholderData: (previous) => previous` to the list query. Without it, switching views creates a new query key (different pageSize) and data becomes `undefined` during the fetch — showing an empty view until the response arrives:

```tsx
export function useFeatures(query: FeaturePageQuery) {
  return useQuery({
    queryKey: featureKeys.list(query),
    queryFn: () => featureApi.getPage(query),
    placeholderData: (previous) => previous,  // ← KEEP OLD DATA WHILE FETCHING
  });
}
```

### Zod Schema Validation

Every API response is validated with Zod before being used. This catches backend contract changes early:

```tsx
async getPage(query) {
  return featurePageSchema.parse(await apiService.get<unknown>(...));
}
```

### Form with useZodForm

Forms use the shared `useZodForm` hook which combines react-hook-form + zodResolver:

```tsx
const { clearErrors, control, handleSubmit, formState } = useZodForm(schema, { defaultValues });
```

### Bulk Selection + Clearing

Bulk selection ids are cleared whenever search/page/filter changes:

```tsx
const clearBulkSelection = useCallback(() => { setSelectedIds([]); }, []);
const changeSearch = useCallback((value) => { clearBulkSelection(); setListSearchInput(value); }, [...]);
```

The shared table already provides the mobile equivalent of the web grid
selection model. Do not add bespoke checkbox columns in feature screens. Keep
the selected IDs controlled by the feature, disable rows that cannot participate
in the action, and render the bulk Archive button through `aboveViews` so the
same action is available from table and card views. Archive is the reversible
delete lifecycle used by the current API; a hard delete requires an explicit
API contract and separate authorization.

```tsx
const [selectedIds, setSelectedIds] = useState<number[]>([]);

<AppDataTable
  columns={columns}
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

### Edit Flash Feedback

After a successful edit, pass a new `AppDataTableFlash` token with the edited
row key. The token must change even when the same row is edited repeatedly.
`AppDataTable` and `AppDataCard` own the short animated success highlight and
resolve it from the active theme, so feature code must not create timers,
hard-coded colors, or duplicate row/card styling. Do not flash after a create
when the newly created row is not guaranteed to be present on the current
server page.

```tsx
const [flash, setFlash] = useState<AppDataTableFlash>();

const editingId = formMode === 'edit' ? selected?.id ?? null : null;
await saveMutation.mutateAsync({ id: editingId, request });
if (editingId !== null) {
  setFlash((current) => ({
    rowKey: editingId,
    token: (typeof current?.token === 'number' ? current.token : 0) + 1,
  }));
}
```

The selection and flash contracts are domain-neutral and exported from
`src/shared/components/data-table`; extend those contracts before creating a
feature-local table behavior.

### Active row and card selection

`AppDataTable` and `AppDataCard` deliberately separate three states:

- **Active:** the first visible record is highlighted with the secondary theme
  color (and a row/card accent). Touching a different record moves this visual
  focus. It is not selected.
- **Selected:** controlled by the feature's `selectedIds` and used by bulk
  actions. It has a distinct palette accent-color treatment (`theme.colors.accent`)
  and must not be inferred from the active record or hard-coded to blue/green.
- **Flashing:** a short success animation after an edit, driven by the shared
  `{ rowKey, token }` contract. Increment the token for repeated edits. A
  mounted view marks an existing token as seen, so switching between Grid and
  Cards never replays an old animation.

Card views must expose the same selection affordance as table views and use the
shared card surface rather than reimplementing colors or timers:

```tsx
{items.map((item, index) => (
  <FeatureCard
    key={item.id}
    active={index === 0}
    selected={selectedIds.includes(item.id)}
    flash={flash?.rowKey === item.id}
    flashToken={flash?.token}
    onToggleSelection={toggleSelection}
    item={item}
  />
))}
```

Do not auto-check the first row/card when bulk selection is enabled. This
prevents an accidental archive/delete operation while still giving the user a
clear current-record focus.

### Chart View

Use the shared `AppChartCard`, `AppChartSummary`, `AppHorizontalBarChart`, and
`AppDistributionChart` primitives. Keep feature-specific series preparation in a
feature-owned `chart-view/*-chart-data.ts` module with pure tests.

A list-backed Chart shows the current loaded server page, not global analytics.
Render the authoritative `totalCount` only with a distinct matching-total label,
name loaded-page metrics explicitly, remove list pagination, and use the view's
internal scroll. Do not add a scope paragraph below the MultiView buttons:

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

If the product needs global metrics, trends, or large categorical analysis, add a
dedicated aggregate API/query key instead of loading every list row. Advanced
chart types may use `react-native-gifted-charts`, installed through Expo and kept
behind the same shared boundary.

With four or more compact views below 600px, `AppMultiView` uses icon-only buttons.
Pass `fillViewSelector` when the product wants them distributed equally across the
full toolbar width. Do not solve Report/Import overflow by adding a wrapped second
toolbar row.

The temporary Countries/States Import reservation is disabled and renders
nothing. Do not enable it or add placeholder text until picking, validation,
preview, submission, permissions, and errors are implemented.

### Report View

First record the Report view as Required, Deferred, or Excluded and choose its
engine. Managed Crystal `.rpt` reports must follow the
[Crystal Report Manager Feature Integration Guide](../project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md);
do not mix them with ActiveReports/RDLX `ReportTemplates`.

For Managed Crystal, list the manager-owned published catalog with the feature's
stable `entityKey`, localize SummaryInfo Title for Arabic and Subject for English,
and render by report ID through the HR API. Send only `ar`/`en` and feature-approved
filters. Never call the Crystal host or pass its path, filename, connection string,
tenant ID, or company ID.

The report view uses `paginate: false` and `renderWhenEmpty: true` so it always
renders regardless of list data and never owns list pagination:

```tsx
{ value: 'report', paginate: false, renderWhenEmpty: true, render: () => <FeatureReportView /> }
```

---

## 4. Reusable Components Used

| Component | Purpose |
|-----------|---------|
| `AppScreen` | Screen wrapper with safe area + RefreshControl |
| `AppPageHeader` | Title + subtitle + action buttons |
| `AppListScreen` | Search + filter + multi-view (unified layout) |
| `AppDataTable` | Sortable table with server pagination, active-first-row focus, controlled row selection, eligible-row guards, and themed edit flash |
| `AppDataCard` | Shared card-view surface for active/selected states and the same themed edit flash |
| `AppChartCard` | Compact shared chart panel |
| `AppChartSummary` | Responsive page/global metric summary |
| `AppHorizontalBarChart` | Accessible categorical comparison |
| `AppDistributionChart` | Accessible part-to-whole distribution |
| `AppCard` | Card container |
| `AppForm` | Full-screen form dialog |
| `AppFormSection` | Form section with icon + title |
| `AppTextField` | Text input (standalone or with Controller) |
| `AppIconButton` | Icon-only action button |
| `AppButton` | Labeled action button |
| `AppStatusBadge` | Colored status label |
| `AppStateView` | Loading / error / empty states |
| `ConfirmationDialog` | Confirm destructive actions |
| `showToast` | Success/error toast |

---

## 5. Shared Hooks Used

| Hook | Import | Purpose |
|------|--------|---------|
| `useServerListState` | `@/src/shared/listing` | Page, search, sort, filters state |
| `toApiPageNumber` | `@/src/shared/listing` | Converts 0-based UI page to 1-based API page |
| `useAuthorization` | `@/src/features/auth` | Permission check |
| `useAppReadOnly` | `@/src/shared/contexts/AppReadOnlyContext` | Read-only mode guard |
| `useZodForm` | `@/src/core/validation` | react-hook-form + zod |
| `toFormErrorMap` | `@/src/core/validation` | Converts RHF errors to AppForm format |

---

## 6. Checklist

- [ ] Types defined (entity, request, filters, page query, sort columns)
- [ ] Endpoints constants defined
- [ ] Zod schemas for all API responses
- [ ] API functions with Zod validation
- [ ] Query keys factory
- [ ] Query hooks with `placeholderData: (previous) => previous`
- [ ] Detail query/key exists only when list rows are not authoritative for view/edit
- [ ] Invalidating mutation wrapper
- [ ] Card component with actions gated by permissions + isDeleted
- [ ] Card component uses `AppDataCard` with `active`, controlled `selected`, and
  the same edit `flash`/`flashToken` as the table; its checkbox is permission
  guarded and never auto-checked
- [ ] Form component with AppForm + AppFormSection + useZodForm + Controller
- [ ] Screen uses `useServerListState` with initial sort/filters/pageSize
- [ ] Screen uses `AppListScreen` with:
  - [ ] `serverPagination` prop
  - [ ] `filter` prop
  - [ ] `searchValue` + `onSearchChange` (controlled)
  - [ ] `isFetching` for background loading indicator
  - [ ] `showViewLabels`
  - [ ] `fillViewSelector` when all view buttons must share the full toolbar width
  - [ ] Table view with `AppDataTable` + `serverState`
  - [ ] Table bulk selection uses shared `rowSelection` (no local checkbox column)
  - [ ] `isRowSelectable` excludes archived/ineligible rows and selected IDs are type-normalized
  - [ ] Cards view with `scrollable: true` + `defaultPageSize: 3`
  - [ ] Chart decision recorded as Required/Deferred/Excluded
  - [ ] Required list-backed Chart labels loaded-page metrics and authoritative total separately
  - [ ] Chart uses shared primitives, `paginate: false`, `renderWhenEmpty: true`, and `scrollable: true`
  - [ ] Report view decision recorded as Required/Deferred/Excluded
  - [ ] Required Managed Crystal view uses manager catalog/render by `entityKey`
  - [ ] Report view uses `paginate: false` + `renderWhenEmpty: true` and no pager
- [ ] Bulk selection cleared on search/page/filter changes
- [ ] Bulk action is permission/read-only guarded and uses the shared confirmation path
- [ ] Successful edits pass a new `AppDataTableFlash` token; repeated edits flash again
- [ ] Switching between Grid and Cards does not replay an existing flash token
- [ ] Every serialized criterion has a visible control and reset path; no hidden filter state
- [ ] Archive/restore gated by `isReadOnly` + `notifyBlockedAction`
- [ ] `ConfirmationDialog` for archive + bulk archive
- [ ] `showToast` for success/error feedback
- [ ] Translations (both languages)
- [ ] App Router page file with `RouteGuard`
- [ ] `_layout.tsx` (Stack) in the route directory (prevents drawer leak)
- [ ] Public exports in `index.ts`
- [ ] Screen integration covers criteria/views, form entry, lifecycle/bulk actions, and permission/read-only visibility
- [ ] Mutation-hook tests prove exact transport and root invalidation

---

## 7. Anti-Patterns (Do Not)

- Do not use `response.blob()` without explicit type — use Zod validation on JSON responses
- Do not omit `placeholderData` on list queries — causes blank views on view switch
- Do not manage page/search/sort with individual `useState` — use `useServerListState`
- Do not call API directly from components — use the api module + query hooks
- Do not skip Zod validation — parse every response
- Do not put form logic in the screen — extract to a Form component with `useZodForm`
- Do not forget `clearBulkSelection` when changing search/page/filters
- Do not rebuild table checkbox columns or bulk-action selection locally; use
  `AppDataTable.rowSelection` and `isRowSelectable`
- Do not implement edit-flash timers or hard-coded row colors in feature code;
  pass an incrementing `AppDataTableFlash` token
- Do not keep API-supported criteria or detail hooks in client state when the current UI/runtime contract does not use them
- Do not forget `_layout.tsx` in nested route directories — causes drawer item leak
- Do not use `toolbarContent` on `AppMultiView` directly — use `AppListScreen` which wraps it
- Do not hardcode strings — use `useTranslation()`
- Do not label current-page Chart series as global analytics or load all rows to
  simulate an aggregate endpoint
- Do not import a chart package directly into business screens — wrap it in shared
  chart primitives and keep series preparation feature-owned
- Do not call the Crystal host directly or treat a deployed `.rpt` as published —
  consume only the HR API Report Manager catalog/render contract
