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
import { AppCard, AppIcon, AppIconButton, AppStatusBadge, AppText } from '@/src/shared/components';

export function FeatureCard({ item, canEdit, canDelete, onEdit, onArchive, onRestore, onView }) {
  const archived = item.isDeleted;
  return (
    <AppCard padding="sm">
      <View style={styles.header}>
        <AppIcon ... />
        <View style={styles.name}>
          <AppText variant="label">{item.nameEn}</AppText>
          <AppText color="muted" variant="bodySmall">{item.nameAr}</AppText>
        </View>
        <AppStatusBadge color={archived ? theme.colors.warning : theme.colors.success} label={...} />
      </View>
      <View style={styles.actions}>
        <AppIconButton icon="eye-outline" onPress={() => onView(item)} />
        {canEdit && !archived ? <AppIconButton icon="create-outline" onPress={() => onEdit(item)} /> : null}
        {canDelete ? <AppIconButton icon={archived ? 'refresh-outline' : 'archive-outline'} onPress={() => archived ? onRestore(item) : onArchive(item)} /> : null}
      </View>
    </AppCard>
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
  AppButton, AppDataTable, AppIconButton, AppListScreen,
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
| `AppDataTable` | Sortable table with server pagination |
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
- [ ] Invalidating mutation wrapper
- [ ] Card component with actions gated by permissions + isDeleted
- [ ] Form component with AppForm + AppFormSection + useZodForm + Controller
- [ ] Screen uses `useServerListState` with initial sort/filters/pageSize
- [ ] Screen uses `AppListScreen` with:
  - [ ] `serverPagination` prop
  - [ ] `filter` prop
  - [ ] `searchValue` + `onSearchChange` (controlled)
  - [ ] `isFetching` for background loading indicator
  - [ ] `showViewLabels`
  - [ ] Table view with `AppDataTable` + `serverState`
  - [ ] Cards view with `scrollable: true` + `defaultPageSize: 3`
  - [ ] Report view decision recorded as Required/Deferred/Excluded
  - [ ] Required Managed Crystal view uses manager catalog/render by `entityKey`
  - [ ] Report view uses `paginate: false` + `renderWhenEmpty: true` and no pager
- [ ] Bulk selection cleared on search/page/filter changes
- [ ] Archive/restore gated by `isReadOnly` + `notifyBlockedAction`
- [ ] `ConfirmationDialog` for archive + bulk archive
- [ ] `showToast` for success/error feedback
- [ ] Translations (both languages)
- [ ] App Router page file with `RouteGuard`
- [ ] `_layout.tsx` (Stack) in the route directory (prevents drawer leak)
- [ ] Public exports in `index.ts`

---

## 7. Anti-Patterns (Do Not)

- Do not use `response.blob()` without explicit type — use Zod validation on JSON responses
- Do not omit `placeholderData` on list queries — causes blank views on view switch
- Do not manage page/search/sort with individual `useState` — use `useServerListState`
- Do not call API directly from components — use the api module + query hooks
- Do not skip Zod validation — parse every response
- Do not put form logic in the screen — extract to a Form component with `useZodForm`
- Do not forget `clearBulkSelection` when changing search/page/filters
- Do not forget `_layout.tsx` in nested route directories — causes drawer item leak
- Do not use `toolbarContent` on `AppMultiView` directly — use `AppListScreen` which wraps it
- Do not hardcode strings — use `useTranslation()`
- Do not call the Crystal host directly or treat a deployed `.rpt` as published —
  consume only the HR API Report Manager catalog/render contract
