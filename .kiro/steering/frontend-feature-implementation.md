# Frontend Feature Implementation Guide (HrManagementSystem)

When building a new feature module in the React frontend, follow this guide. Use the `countries` feature (`web/src/features/basicData/countries`) as the reference throughout.

---

## Project Conventions

- **State management:** TanStack Query for all server state. No Redux or Context for API data.
- **Forms:** React Hook Form + Zod validation. Never use uncontrolled inputs directly.
- **UI library:** Material UI (MUI). Use shared components from `@/shared/components` before writing new ones.
- **Translations:** All user-facing strings go through `useTranslation()` / `t("key")`. No hardcoded strings.
- **Permissions:** Every action (add, edit, delete, view) must be gated by a permission check via `usePermissions`.
- **Bilingual fields:** Entities with display names always have `nameAr` + `nameEn`. Both are required in forms and shown in UI.
- **Soft delete:** `isDeleted` flag — filter it out in the service layer (`getAll` returns only non-deleted).
- **Error handling:** Use `extractErrorMessage(error)` + `showToast.error(...)`. Never show raw error objects.
- **API calls:** All HTTP calls go through `apiService` from `@/shared/services`. Never use `fetch` or `axios` directly.
- **Routes:** API route strings live in `apiRoutes` from `@/routes`. Never hardcode URLs in components or services.
- **`index.ts` exports:** Types must be exported from `types/{EntityName}.ts`, not from the service file. Only export hooks that actually exist in `useCountryQueries.ts`.
- **Mock data generation:** Use `useRef<Set<number>>` (not a plain `new Set()`) to track used indexes across renders. Reset the set when exhausted.
- **SignalR action strings:** Match exactly what the backend hub sends — `"Add"`, `"Update"`, `"Delete"` (capitalized). Do not use `"created"/"updated"/"deleted"`.
- **`valueGetter` in MUI DataGrid v6+:** Receives the cell value directly, not a `params` object. Name the parameter `value`, not `params`.
- **Shared components must use `useTranslation()` internally.** Never accept `t` as a prop in shared/reusable components (`MultiViewHeader`, `MyDataGrid`, `MyCustomToolbar`, `MyForm`, etc.). If a shared component currently has `t = (key) => key` as a default prop, replace it with `const { t } = useTranslation()` inside the component body. Callers must never pass `t={t}` to shared components.

---

## Folder Structure

Create a folder at `web/src/features/{module}/{featureName}/` with this structure:

```
{featureName}/
├── index.ts                          ← public API exports
├── {FeatureName}Page.tsx             ← main page component
├── types/
│   └── {EntityName}.ts               ← all TypeScript interfaces
├── services/
│   └── {entityName}Service.ts        ← API calls (static class)
├── hooks/
│   ├── use{EntityName}Queries.ts     ← TanStack Query hooks + query keys
│   └── use{EntityName}GridLogic.ts   ← business logic orchestration hook
├── utils/
│   ├── validation.ts                 ← Zod schemas
│   ├── {entityName}Handler.ts        ← SignalR real-time handler (if needed)
│   ├── statesUtils.ts                ← entity-specific utility functions
│   └── fakeData.ts                   ← mock data for dev/testing
├── components/
│   ├── {entityName}Form.tsx          ← create/edit/view dialog form
│   ├── {entityName}DeleteDialog.tsx  ← delete confirmation dialog
│   ├── {entityName}sMultiView.tsx    ← view switcher (grid/cards/chart/report/import)
│   ├── gridView/
│   │   ├── {entityName}sDataGrid.tsx ← MUI DataGrid wrapper
│   │   ├── columns.tsx               ← column definitions hook
│   │   └── gridActions.tsx           ← action buttons factory
│   ├── cardView/
│   │   ├── {EntityName}Card.tsx      ← individual card
│   │   ├── CardViewHeader.tsx        ← search/sort/filter bar
│   │   ├── CardViewPagination.tsx    ← pagination
│   │   └── {EntityName}CardUtils.ts  ← quality score helpers
│   ├── chartView/
│   │   ├── SummaryCards.tsx          ← metric cards row
│   │   ├── chartDataUtils.ts         ← data preparation functions
│   │   └── *.tsx                     ← individual chart components
│   └── importData/
│       ├── Import{EntityName}s.tsx   ← main import component
│       ├── use{EntityName}Import.ts  ← import logic hook
│       ├── UploadSection.tsx         ← file upload UI
│       └── {EntityName}DataTable.tsx ← preview table
└── reports/
    └── {EntityName}Report.tsx        ← Crystal Reports viewer
```

---

## Step 01 — Types

**Location:** `types/{EntityName}.ts`

Define all interfaces in one file. Always separate the entity shape, request shapes, form data, and component props.

```typescript
// The entity as returned by the API
export interface Country {
  id: string | number;
  nameAr: string;
  nameEn: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string | null;
  states?: SimpleState[];
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
  [key: string]: any; // allow dynamic field access
}

// Nested entity
export interface SimpleState {
  id: string | number;
  nameAr: string;
  nameEn: string;
  code?: string;
  isDeleted: boolean;
}

// Create request — no id
export interface CreateCountryRequest {
  nameEn: string;
  nameAr: string;
  alpha2Code?: string | null;
  alpha3Code?: string | null;
  phoneCode?: string | null;
  currencyCode?: string | null;
}

// Update request — extends create with id
export interface UpdateCountryRequest extends CreateCountryRequest {
  id: string | number;
}

// Form data — all strings (controlled inputs)
export interface CountryFormData {
  nameAr: string;
  nameEn: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string;
}

// Form component props — no t prop, component calls useTranslation() internally
export interface CountryFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedCountry?: Country | null;
  onClose: () => void;
  onSubmit: (data: CountryFormData) => void;
  loading: boolean;
}
```

---

## Step 02 — Service

**Location:** `services/{entityName}Service.ts`

Static class. All methods are `async`. Use `apiService` and `apiRoutes`. Filter `isDeleted` in `getAll`.

```typescript
import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import { Country, CreateCountryRequest, UpdateCountryRequest } from "../types/Country";

export class CountryService {
  static async getAll(): Promise<Country[]> {
    const response = await apiService.get(apiRoutes.countries.getAll);
    const countries = extractValues<Country>(response);
    return countries.filter((c) => !c.isDeleted);
  }

  static async getById(id: string | number): Promise<Country> {
    const response = await apiService.get(apiRoutes.countries.getById(id));
    return extractValue<Country>(response);
  }

  static async create(data: CreateCountryRequest): Promise<Country> {
    const response = await apiService.post(apiRoutes.countries.add, data);
    return extractValue<Country>(response);
  }

  static async update(data: UpdateCountryRequest): Promise<Country> {
    const response = await apiService.put(apiRoutes.countries.update, data);
    return extractValue<Country>(response);
  }

  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.countries.delete(id));
    return id;
  }

  // Client-side search across all relevant fields including nested entities
  static searchCountries(countries: Country[], searchTerm: string): Country[] {
    if (!searchTerm.trim()) return countries;
    const term = searchTerm.toLowerCase().trim();
    return countries.filter((c) => {
      if (!c || c.isDeleted) return false;
      return (
        c.nameEn?.toLowerCase().includes(term) ||
        c.nameAr?.includes(term) ||
        c.alpha2Code?.toLowerCase().includes(term) ||
        c.states?.some(
          (s) => !s.isDeleted && (
            s.nameEn?.toLowerCase().includes(term) ||
            s.nameAr?.includes(term)
          )
        )
      );
    });
  }
}

export default CountryService;
```

---

## Step 03 — TanStack Query Hooks

**Location:** `hooks/use{EntityName}Queries.ts`

Use a **query keys factory** object. One generic mutation factory to avoid repeating `invalidateQueries`. Export individual named hooks.

```typescript
import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import CountryService from "../services/countryService";
import { Country } from "../types/Country";

// Query keys factory — always use this, never hardcode strings
export const countryKeys = {
  all: ["countries"] as const,
  list: () => [...countryKeys.all, "list"] as const,
  detail: (id: string | number) => [...countryKeys.all, "detail", id] as const,
};

// List query
export const useCountries = (options?: UseQueryOptions<Country[], Error>) =>
  useQuery({
    queryKey: countryKeys.list(),
    queryFn: CountryService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

// Single item query — disabled when id is null/undefined
export const useCountry = (id: string | number | null | undefined, options?: UseQueryOptions<Country, Error>) =>
  useQuery({
    queryKey: countryKeys.detail(id!),
    queryFn: () => CountryService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

// Client-side search — derived from existing data, no API call
export const useCountrySearch = (searchTerm: string, existingCountries: Country[] = []) =>
  useMemo(() => {
    if (!searchTerm.trim()) return existingCountries;
    return CountryService.searchCountries(existingCountries, searchTerm);
  }, [searchTerm, existingCountries]);

// Generic mutation factory — invalidates all country queries on success
// TContext = unknown is required for TanStack Query v5 onSuccess signature
function useCountryMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all });
      options?.onSuccess?.(data, variables, context, meta);
    },
  });
}

// ✅ Correct — use exact request types, not Partial<Country>
export const useCreateCountry = (options?: UseMutationOptions<Country, Error, CreateCountryRequest>) =>
  useCountryMutation<Country, CreateCountryRequest>(CountryService.create, options);

export const useUpdateCountry = (options?: UseMutationOptions<Country, Error, UpdateCountryRequest>) =>
  useCountryMutation<Country, UpdateCountryRequest>(CountryService.update, options);

export const useDeleteCountry = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useCountryMutation<string | number, string | number>(CountryService.delete, options);

export const useInvalidateCountries = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: countryKeys.all });
};
```

---

## Step 04 — Grid Logic Hook

**Location:** `hooks/use{EntityName}GridLogic.ts`

Single hook that owns all page-level state: dialog type, selected entity, mutation calls, navigation/highlight state after CRUD. The page component only calls this hook and passes results down.

Key responsibilities:
- Dialog open/close state (`"add" | "edit" | "view" | "delete" | null`)
- `handleFormSubmit` — routes to create or update based on `dialogType`
- `handleDelete` — calls delete mutation, records the deleted row's index for post-delete grid navigation
- `lastAddedId`, `lastEditedId`, `lastDeletedIndex` — passed to `MyDataGrid` via the data grid wrapper for scroll-to and highlight
- Grid `apiRef` for programmatic scroll/selection

**Rules:**
- The hook **must** keep the 3 scroll `useEffect` hooks (one per action type). Do NOT remove them.
- The add effect must guard on `!isFetching` — the new row only exists in `countries` after `invalidateQueries` refetch completes. Without this guard the scroll fires before the row exists and does nothing.
- Use a shared `scrollGridToRow` helper — do not duplicate page + select + scroll logic.
- Never use `useMemo` to wrap a value that is returned unchanged (`useMemo(() => x, [x])` is a no-op — remove it).
- Never call `apiRef.current.setPage()` to fix pagination after delete. Page clamping is handled inside `MyDataGrid` via controlled `paginationModel` state.
- Remove all `console.log` calls before committing.
- Empty `catch` blocks are fine when the mutation's `onError` already handles the error.

> ⚠️ **Why the hook needs scroll effects even though `MyDataGrid` also has `lastAddedId` prop:**
> `MyDataGrid`'s internal `selectAndScroll` fires immediately when `lastAddedId` changes — before `invalidateQueries` refetch completes and the new row appears in `rows`. The hook's `useEffect` with `isFetching` guard is the only place that can wait for the refetch to finish before scrolling.

```typescript
// Shared helper — use this in all three scroll effects
function scrollGridToRow(
  apiRef: React.MutableRefObject<GridApiCommon>,
  rows: Entity[],
  rowId: number | null
) {
  if (!rowId || !apiRef.current || rows.length === 0) return;
  const index = rows.findIndex((r) => r.id === rowId);
  if (index < 0) return;
  const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
  apiRef.current.setPage(Math.floor(index / pageSize));
  apiRef.current.setRowSelectionModel([rowId]);
  setTimeout(() => {
    apiRef.current?.scrollToIndexes({ rowIndex: index, colIndex: 0 });
  }, 300);
}

// ✅ Add: wait for isFetching=false so the new row is in `rows` before scrolling
useEffect(() => {
  if (!lastAddedRowId || loading || isFetching || countries.length === 0) return;
  scrollGridToRow(apiRef, countries, lastAddedRowId);
  const timer = setTimeout(() => setLastAddedRowId(null), 4000);
  return () => clearTimeout(timer);
}, [lastAddedRowId, countries, loading, isFetching]);

// Edit: row already exists, no isFetching guard needed
useEffect(() => {
  if (!lastEditedRowId || loading || countries.length === 0) return;
  scrollGridToRow(apiRef, countries, lastEditedRowId);
  const timer = setTimeout(() => setLastEditedRowId(null), 4000);
  return () => clearTimeout(timer);
}, [lastEditedRowId, countries, loading]);

// Delete: scroll to the row before the deleted one
useEffect(() => {
  if (lastDeletedRowIndex === null || loading || countries.length === 0) return;
  const prevIndex = Math.max(0, Math.min(lastDeletedRowIndex - 1, countries.length - 1));
  const prevId = countries[prevIndex]?.id;
  if (prevId == null) return;
  const numericId = typeof prevId === "string" ? parseInt(prevId, 10) : prevId;
  scrollGridToRow(apiRef, countries, numericId);
  const timer = setTimeout(() => setLastDeletedRowIndex(null), 4000);
  return () => clearTimeout(timer);
}, [lastDeletedRowIndex, countries, loading]);
```

---

## Step 05 — Zod Validation Schema

**Location:** `utils/validation.ts`

Use Zod. Accept `t` as a parameter so error messages are localized. Use shared regex constants from `@/constants` for Arabic/English validation.

```typescript
import { arabicOnly, englishOnly, uppercaseCode, flexNumber } from "@/constants";
import { z } from "zod";

export const getCountryValidationSchema = (t: any) =>
  z.object({
    nameAr: z.string()
      .trim()
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(arabicOnly, t("validation.invalidArabicName")),

    nameEn: z.string()
      .trim()
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 }))
      .regex(englishOnly, t("validation.invalidEnglishName")),

    // Optional fields: transform empty string to "" then validate only if non-empty
    alpha2Code: z.string().optional()
      .transform((val) => val ? val.toUpperCase() : "")
      .refine((val) => !val || uppercaseCode(2).test(val), {
        message: t("countries.invalidAlpha2Code"),
      }),

    currencyCode: z.string().optional()
      .transform((val) => val ? val.toUpperCase() : "")
      .refine((val) => !val || uppercaseCode(3).test(val), {
        message: t("countries.invalidCurrency"),
      }),
  });
```

---

## Step 06 — Form Component

**Location:** `components/{entityName}Form.tsx`

Use `MyForm` + `MyTextField` from `@/shared/components`. Use `useForm` with `zodResolver`. Reset form on open/close. Support three modes: `"add"`, `"edit"`, `"view"` (view = read-only, no submit button).

Key patterns:
- Call `useTranslation()` inside the component — never accept `t` as a prop
- Wrap the Zod schema in `useMemo` so it is not recreated on every render
- `useEffect` on `[open, dialogType, selectedEntity]` to reset form values
- `isViewMode` disables all fields and hides footer
- Pass `errors` as `Record<string, string>` to `MyForm`
- Do **not** add a hidden `<TextField>` for the ID — the ID is already in `selectedEntity`
- Do **not** create `useRef` for input elements unless you actually call `.focus()` or another imperative method on them
- Include a **Generate Mock Data** button (using Faker.js + `useRef<Set<number>>`) in add/edit modes for development

```typescript
const CountryForm = ({ open, dialogType, selectedCountry, onClose, onSubmit, loading }: CountryFormProps) => {
  const { t } = useTranslation();                          // ← useTranslation, not t prop
  const usedIndexes = useRef<Set<number>>(new Set());      // ← useRef for mock data Set

  const isViewMode = dialogType === "view";
  const isEditMode = dialogType === "edit";

  // ← useMemo so schema is not recreated on every render
  const schema = useMemo(() => getCountryValidationSchema(t), [t]);

  const { handleSubmit, reset, control, setValue, formState: { errors } } =
    useForm<CountryFormData>({
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: { nameAr: "", nameEn: "", alpha2Code: "", alpha3Code: "", phoneCode: "", currencyCode: "" },
    });

  useEffect(() => {
    if (open) {
      reset({
        nameAr: (isEditMode || isViewMode) ? selectedCountry?.nameAr || "" : "",
        nameEn: (isEditMode || isViewMode) ? selectedCountry?.nameEn || "" : "",
        // ... other fields
      });
    }
  }, [open, dialogType, selectedCountry]);

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={isViewMode ? t("countries.view") : isEditMode ? t("countries.edit") : t("countries.add")}
      onSubmit={isViewMode ? undefined : handleSubmit(onSubmit)}
      isSubmitting={loading}
      hideFooter={isViewMode}
      errors={/* convert errors to Record<string, string> */}
    >
      {/* No hidden ID field — ID is in selectedCountry */}
      <MyTextField fieldName="nameAr" labelKey={t("general.nameAr")} control={control} errors={errors} readOnly={isViewMode} />
      <MyTextField fieldName="nameEn" labelKey={t("general.nameEn")} control={control} errors={errors} readOnly={isViewMode} />
      {/* optional fields — no inputRef unless you need imperative focus */}
    </MyForm>
  );
};
```

---

## Step 07 — Delete Dialog

**Location:** `components/{entityName}DeleteDialog.tsx`

Use the shared `MyDeleteConfirmation` component. Build the display name from both bilingual fields.
No `t` prop — call `useTranslation()` internally if any translated strings are needed.

```typescript
const CountryDeleteDialog = ({ open, onClose, onConfirm, selectedCountry, loading }) => {
  // No t prop needed — MyDeleteConfirmation handles its own translations
  const deletedField = selectedCountry
    ? `${selectedCountry.nameEn} (${selectedCountry.nameAr || selectedCountry.nameEn})`
    : "";

  return (
    <MyDeleteConfirmation
      open={open}
      onClose={onClose}
      deletedField={deletedField}
      handleDelete={onConfirm}
      loading={loading}
    />
  );
};
```

---

## Step 08 — Grid View

**Location:** `components/gridView/`

Three files: the grid wrapper, the columns hook, and the actions factory.

**`gridActions.tsx`** — pure factory function, no hooks:
```typescript
export const makeCountryActions = ({ t, permissions, onView, onEdit, onDelete }) =>
  (params: { row: Country }) => {
    const actions = [];
    if (permissions.canView) actions.push(<GridActionsCellItem icon={<Visibility />} onClick={() => onView(params.row)} />);
    if (permissions.canEdit) actions.push(<GridActionsCellItem icon={<Edit />} onClick={() => onEdit(params.row)} />);
    if (permissions.canDelete) actions.push(<GridActionsCellItem icon={<Delete />} onClick={() => onDelete(params.row)} />);
    return actions;
  };
```

**`columns.tsx`** — hook returning `GridColDef[]`. Use shared cell renderers from `@/shared/components`. Only add the `actions` column if any permission is true.

`valueGetter` in MUI DataGrid v6+ receives the **cell value directly** — name the parameter `value`, not `params`:
```typescript
valueGetter: (value: SimpleState[]) => {
  return Array.isArray(value)
    ? value.filter((s) => !s.isDeleted).map((s) => s.nameEn)
    : [];
},
```

**`{entityName}sDataGrid.tsx`** — wraps `MyDataGrid`. Pass `isFetching` so the grid shows a loading indicator during background refetches:

```typescript
<MyDataGrid
  rows={countries}
  columns={columns}
  loading={loading || isFetching}   // ← include isFetching
  apiRef={apiRef}
  filterMode="client"
  ...
/>
```

**Pagination after delete — handled by `MyDataGrid` automatically.** `MyDataGrid` uses controlled `paginationModel` state internally and clamps the page whenever `rows.length` shrinks. You do not need to call `apiRef.current.setPage()` from the feature's hook or data grid wrapper.

---

## Step 09 — Card View

**Location:** `components/cardView/`

**`{EntityName}Card.tsx`** — uses the shared `CardView` component. Compose it with:
- `topRightBadge` — quality score percentage badge
- `leftBadge` — "New" / "Edited" highlight badge
- `title` / `subtitle` — `nameEn` / `nameAr`
- `chips` — alpha codes, phone code, currency
- `content` — details section + states section + quality meter + created date
- `footer` — action buttons (view/edit/delete) gated by permissions

**Quality score pattern:**
```typescript
export const getQualityScore = (entity: Country): number => {
  let score = 50; // base
  if (entity.nameEn) score += 15;
  if (entity.nameAr) score += 15;
  if (entity.alpha2Code) score += 5;
  // ... optional fields add smaller increments
  return Math.min(score, 100);
};
```

**`countriesCardView.tsx`** — manages local state: `searchTerm`, `sortBy`, `sortOrder`, `filterBy`, `page`, `rowsPerPage`. Uses `useMemo` for filtered/sorted data. Handles `lastAddedId`/`lastEditedId`/`lastDeletedIndex` to auto-navigate and highlight the affected card.

---

## Step 10 — Chart View

**Location:** `components/chartView/`

**`chartDataUtils.ts`** — pure functions that transform `Country[]` into chart-ready arrays. One function per chart. Export from an `index.ts` barrel.

**Chart components** — thin wrappers around shared chart primitives (`BarChart`, `AreaChart`, `PieChart` from `@/shared/components/charts`). Accept `data` + `t` props only.

**`SummaryCards.tsx`** — row of `MetricCard` components showing totals (count, states, regions, currencies).

**`countriesChartView.tsx`** — orchestrator: calls all `prepare*Data()` functions, renders `SummaryCards` + `Grid` of chart components. Shows `LoadingChartState` / `EmptyChartState` from shared components.

---

## Step 11 — Import View

**Location:** `components/importData/`

**`useCountryImport.ts`** — hook managing: file selection, Excel parsing, upload progress, elapsed timer, snackbar feedback. Excel column order must be documented in a comment at the top of the import component.

**Excel column order (document this):**
```
// Excel expected columns: [nameAr, nameEn, alpha2Code, alpha3Code, phoneCode, currencyCode]
// Row 0 is the header row — skip it
```

**Upload strategy:** Sequential POST per row (not bulk) so partial failures are handled gracefully. Show progress as `n/total uploaded`.

**`ImportCountries.tsx`** — composes `UploadSection` + `LoadingAlert` + `CountryDataTable` (preview) + `NoDataMessage`.

---

## Step 12 — Multi-View Switcher

**Location:** `components/{entityName}sMultiView.tsx`

Uses `MultiViewHeader` from `@/shared/components`. Manages `currentViewType` state. Renders the correct view component via a `switch`. Available views: `"grid" | "cards" | "chart" | "report" | "import"`.

Store the selected view in `localStorage` via `storageKey` prop on `MultiViewHeader` so it persists across page visits.

```typescript
<MultiViewHeader
  storageKey="countries-view-layout"
  defaultView="grid"
  availableViews={["grid", "cards", "chart", "report", "import"]}
  onAdd={onAdd}
  dataCount={countries.length}
  showActions={{ add: true, refresh: true, export: false, filter: false }}
/>
```

---

## Step 13 — Main Page Component

**Location:** `{featureName}Page.tsx`

Thin orchestrator. Calls `use{EntityName}GridLogic()`, renders `{EntityName}sMultiView` + `{EntityName}Form` + `{EntityName}DeleteDialog`. Handles the error state with a retry button.

**Dialog type safety:** Never cast `dialogType` directly to the form's union type. Derive a type-safe variable first so TypeScript can narrow it correctly and the form never receives `"delete"` or `null` as its `dialogType` prop.

```typescript
const CountriesPage = () => {
  const { t } = useTranslation();
  const { countries, loading, error, dialogType, selectedCountry, ... } = useCountryGridLogic();

  // ✅ Type-safe derivation — null when form should not be open
  const formDialogType =
    dialogType === "add" || dialogType === "edit" || dialogType === "view"
      ? dialogType
      : null;

  // ❌ Unsafe cast — silently passes "delete" or null to the form
  // dialogType as "add" | "edit" | "view"

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button onClick={handleRefresh}>{t("common.retry")}</Button>}>
          {error.message || t("countries.errorMessage")}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <CountriesMultiView countries={countries} loading={loading} ... />

      <CountryForm
        open={formDialogType !== null}
        dialogType={formDialogType ?? "add"}   // ← safe fallback, never reached when open=false
        selectedCountry={selectedCountry}
        ...
      />

      <CountryDeleteDialog open={dialogType === "delete"} ... />
    </>
  );
};
```

---

## Step 14 — SignalR Real-Time Handler (optional)

**Location:** `utils/{entityName}Handler.ts`

Singleton class. Call `initialize(notificationSystem)` once on mount. Listens to a SignalR event and dispatches notifications.

**Action string keys must match exactly what the backend hub sends.** The backend uses `"Add"`, `"Update"`, `"Delete"` (capitalized). Do not use `"created"/"updated"/"deleted"`.

```typescript
class CountryHandler {
  initialize(notificationSystem): void {
    signalRService.on("ReceiveCountryUpdate", (data) => this.handleUpdate(data));
  }

  private handleUpdate({ count, country, action }): void {
    const name = country.nameAr || country.nameEn || "Unknown";
    // Keys match backend hub: "Add" | "Update" | "Delete"
    const messages = {
      Add: `New country "${name}" added (Total: ${count})`,
      Update: `Country "${name}" updated`,
      Delete: `Country "${name}" deleted`,
    };
    this.notificationSystem.addNotification(messages[action] || action, this.getType(action));
  }

  private getType(action: string): "success" | "info" | "warning" {
    const types: Record<string, "success" | "info" | "warning"> = {
      Add: "success",
      Update: "info",
      Delete: "warning",
    };
    return types[action] || "info";
  }

  destroy(): void {
    signalRService.off("ReceiveCountryUpdate");
  }
}

export default new CountryHandler(); // singleton
```

---

## Step 15 — Public Exports

**Location:** `index.ts`

Export everything the rest of the app needs. Keep internal implementation files private.

**Types must be exported from `types/{EntityName}.ts`**, not from the service file. Only export hooks that actually exist in the queries file.

```typescript
// Main page
export { default as CountriesPage } from './countriesPage';

// Components
export { default as CountriesMultiView } from './components/countriesMultiView';
export { default as CountryForm } from './components/countryForm';
export { default as CountryDeleteDialog } from './components/countryDeleteDialog';

// Service
export { default as CountryService } from './services/countryService';

// Hooks
export { default as useCountryGridLogic } from './hooks/useCountryGridLogic';
export { useCountries, useCreateCountry, useUpdateCountry, useDeleteCountry, countryKeys } from './hooks/useCountryQueries';

// Types — always from types/, never from services/
// Only export types that are actually used — remove unused interfaces
export type {
  Country,
  SimpleState,
  CreateCountryRequest,
  UpdateCountryRequest,
  CountryFormData,
  CountryFormProps,
} from './types/Country';
// ❌ Do NOT export: CountryResponse (duplicates Country), CountryFilters, CountryQueryParams (unused)
```

---

## MyDataGrid — Shared Component Behaviour

**Location:** `web/src/shared/components/common/datagrid/myDataGrid.jsx`

`MyDataGrid` wraps MUI `DataGrid` with controlled pagination, a custom footer with record navigation, toolbar with export, and RTL support.

### Controlled pagination (important)

`MyDataGrid` owns a controlled `paginationModel` state (`{ page, pageSize }`). This means:

- **Do not pass `initialState.pagination`** — it is ignored. Pagination starts at `page: 0, pageSize: 5`.
- **Do not call `apiRef.current.setPage()`** to fix pagination after a delete. `MyDataGrid` automatically clamps the page to the last valid page whenever `rows.length` shrinks.
- **Do not add controlled `paginationModel` in the feature's data grid wrapper** — `MyDataGrid` already manages it internally.

### Post-mutation navigation ownership

`MyDataGrid` accepts `lastAddedId`, `lastEditedId`, and `lastDeletedIndex` props and has an internal `selectAndScroll` effect. However, **the feature hook must also keep its own scroll `useEffect` hooks** — they are not redundant.

**Why both are needed:**

`MyDataGrid`'s internal effect fires immediately when `lastAddedId` changes. For **add**, this is too early — `invalidateQueries` triggers a refetch and the new row doesn't exist in `rows` yet. The hook's effect guards on `!isFetching`, ensuring it only runs after the refetch completes and the row is present.

```
Mutation onSuccess (hook)
  → set lastAddedRowId
  → invalidateQueries triggers refetch (isFetching = true)
  → MyDataGrid fires selectAndScroll immediately → row not found → does nothing ❌
  → refetch completes (isFetching = false)
  → hook's useEffect fires (guarded by !isFetching) → row found → scrolls ✅
```

**Correct pattern — keep scroll effects in the hook:**
```typescript
// Add: MUST guard on isFetching — new row only exists after refetch
useEffect(() => {
  if (!lastAddedRowId || loading || isFetching || countries.length === 0) return;
  scrollGridToRow(apiRef, countries, lastAddedRowId);
  const timer = setTimeout(() => setLastAddedRowId(null), 4000);
  return () => clearTimeout(timer);
}, [lastAddedRowId, countries, loading, isFetching]);
```

**Wrong pattern — removing scroll effects from the hook:**
```typescript
// ❌ Do NOT do this — MyDataGrid fires too early for add operations
// The hook must keep its scroll effects.
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `any[]` | `[]` | Row data |
| `columns` | `GridColDef[]` | `[]` | Column definitions |
| `loading` | `boolean` | `false` | Shows loading overlay. Pass `loading \|\| isFetching` to also show during background refetches |
| `apiRef` | `GridApiRef` | `null` | MUI grid API ref for programmatic control |
| `sortModel` | `GridSortModel` | `[{ field: "id", sort: "asc" }]` | Initial sort |
| `filterMode` | `"client" \| "server"` | `"client"` | Filter mode |
| `addNewRow` | `() => void` | `() => {}` | Called when the add button is clicked |
| `fileName` | `string` | — | Used for Excel/PDF export filename |
| `lastAddedId` | `number \| null` | `null` | Grid scrolls to and selects this row after add |
| `lastEditedId` | `number \| null` | `null` | Grid scrolls to and selects this row after edit |
| `lastDeletedIndex` | `number \| null` | `null` | Grid scrolls to the row at this index after delete |
| `showNavigationButtons` | `boolean` | `true` | Show/hide the record navigation footer |

### Footer navigation

The custom footer shows `current / total` record counter and first/prev/next/last buttons. Navigation calls `onPaginationModelChange` (not `apiRef.setPage`) so it stays in sync with the controlled pagination state.

### Page clamp after delete

```jsx
// Inside MyDataGrid — runs whenever rows.length changes
React.useEffect(() => {
  if (rows.length === 0) return;
  const lastValidPage = Math.max(
    0,
    Math.ceil(rows.length / paginationModel.pageSize) - 1
  );
  if (paginationModel.page > lastValidPage) {
    setPaginationModel((prev) => ({ ...prev, page: lastValidPage }));
  }
}, [rows.length, paginationModel.pageSize, paginationModel.page]);
```

This is the single fix for the "shows only 1 row after delete" bug. It works because `paginationModel` is React state — the clamp happens in the same render cycle as the new rows, before MUI renders the ghost page.

---

## Checklist

- [ ] Step 01: Types defined (`{EntityName}.ts`)
- [ ] Step 02: Service class created (`{entityName}Service.ts`)
- [ ] Step 03: TanStack Query hooks created with query keys factory
- [ ] Step 04: Grid logic hook created (`use{EntityName}GridLogic.ts`)
- [ ] Step 05: Zod validation schema created (`utils/validation.ts`)
- [ ] Step 06: Form component created (add/edit/view modes)
- [ ] Step 07: Delete dialog created using `MyDeleteConfirmation`
- [ ] Step 08: Grid view created (grid + columns hook + actions factory)
- [ ] Step 09: Card view created (card + header + pagination + quality score)
- [ ] Step 10: Chart view created (summary cards + chart components + data utils)
- [ ] Step 11: Import view created (upload + parse + preview + sequential upload)
- [ ] Step 12: Multi-view switcher created with `MultiViewHeader`
- [ ] Step 13: Main page component created (thin orchestrator)
- [ ] Step 14: SignalR handler created (if real-time updates needed)
- [ ] Step 15: `index.ts` public exports defined

---

## Translation Pattern — `useTranslation()` vs `t` prop

### Rule: never pass `t` as a prop

Every component — feature-level or shared — must call `useTranslation()` internally. Passing `t` as a prop is an anti-pattern because:

- It breaks if the parent's language context differs
- It pollutes every component interface with a non-data prop
- Shared components with `t = (key) => key` as a default silently fall back to returning the key string when the caller forgets to pass `t`

```tsx
// ✅ Correct — every component owns its own t
const CountryForm = ({ open, dialogType, selectedCountry, onClose, onSubmit, loading }) => {
  const { t } = useTranslation();
  // ...
};

// ❌ Wrong — t passed as prop
const CountryForm = ({ open, ..., t }) => { ... };
```

### Shared components

Shared components (`MultiViewHeader`, `MyDataGrid`, `MyCustomToolbar`, `MyForm`, etc.) must **never** accept `t` as a prop. If you find a shared component with `t = (key) => key` as a default prop, replace it:

```jsx
// ✅ Correct
const MultiViewHeader = ({ title, onAdd, ... }) => {
  const { t } = useTranslation();
  // t("actions.add") now works in all languages
};

// ❌ Wrong — silent fallback returns the key string when t is not passed
const MultiViewHeader = ({ title, onAdd, t = (key) => key, ... }) => { ... };
```

### Checklist when removing `t` prop from a component

1. Add `const { t } = useTranslation()` at the top of the component
2. Remove `t` from the props interface / destructuring
3. Remove `t={t}` from every call site
4. Check all **child components** rendered by that component — they may also still accept `t` as a prop and need the same fix (e.g. `CountryStatesSection`, `CountryCardFooter`, `CountryCard`)
5. Check **shared components** used by that component (e.g. `MultiViewHeader`) — if they have `t = (key) => key` as default, fix them too

### Translation JSON completeness

When adding a new key in `en/translation.json`, always add the matching key in `ar/translation.json` in the same commit. Missing Arabic keys cause i18next to fall back to the key string for the entire namespace object in some configurations, which can break other keys in the same section.

```json
// en/translation.json
"actions": {
  "add": "Add",
  "exporting": "Exporting",   ← add here
  "submitting": "Submitting"  ← and here
}

// ar/translation.json — must stay in sync
"actions": {
  "add": "اضافة",
  "exporting": "جارى التصدير",   ← must exist
  "submitting": "جارى الإرسال ..." ← must exist
}
```

### Mutation variable types — use exact request types, not Partial<Entity>

```typescript
// ✅ Correct — typed to the actual request shape the service accepts
export const useCreateCountry = (options?: UseMutationOptions<Country, Error, CreateCountryRequest>) =>
  useCountryMutation<Country, CreateCountryRequest>(CountryService.create, options);

export const useUpdateCountry = (options?: UseMutationOptions<Country, Error, UpdateCountryRequest>) =>
  useCountryMutation<Country, UpdateCountryRequest>(CountryService.update, options);

// ❌ Wrong — Partial<Country> loses type safety (allows missing required fields)
export const useCreateCountry = (options?: UseMutationOptions<Country, Error, Partial<Country>>) => ...
```

TanStack Query v5 requires `TContext = unknown` as a 3rd generic on the factory, and `meta` as the 4th argument to `onSuccess`:

```typescript
function useEntityMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables, TContext>
) {
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, meta) => {   // ← 4 args in v5
      queryClient.invalidateQueries({ queryKey: entityKeys.all });
      options?.onSuccess?.(data, variables, context, meta);
    },
  });
}
```

### Form — dead code to avoid

```typescript
// ❌ Hidden ID field — ID is already in selectedEntity, this serves no purpose
{(isEditMode || isViewMode) && (
  <TextField sx={{ display: "none" }} value={selectedEntity?.id || ""} />
)}

// ❌ Unused inputRef — only create useRef for inputs you actually call .focus() on
const nameArRef = useRef<HTMLInputElement>(null);
<MyTextField inputRef={nameArRef} ... />  // never used imperatively

// ❌ Schema recreated every render
const schema = getValidationSchema(t);    // inside component body, no memo

// ✅ Correct
const schema = useMemo(() => getValidationSchema(t), [t]);
```

### Dialog state type
```typescript
type DialogType = "add" | "edit" | "view" | "delete" | null;
```

### Safe form dialog type derivation

Never cast `dialogType` to the form's union type — derive it with a type guard instead:

```typescript
// ✅ Correct — TypeScript narrows the type, form never receives "delete" or null
const formDialogType =
  dialogType === "add" || dialogType === "edit" || dialogType === "view"
    ? dialogType
    : null;

<EntityForm
  open={formDialogType !== null}
  dialogType={formDialogType ?? "add"}  // fallback never reached when open=false
  ...
/>

// ❌ Wrong — cast silently passes "delete" or null to the form
<EntityForm
  open={["edit", "add", "view"].includes(dialogType)}
  dialogType={dialogType as "add" | "edit" | "view"}
  ...
/>
```

### Form reset on open
```typescript
useEffect(() => {
  if (open && (dialogType === "add" || selectedEntity)) {
    reset({ field: isEditMode ? selectedEntity?.field || "" : "" });
  }
}, [open, dialogType, selectedEntity]);
```

### Mock data generation — useRef for Set persistence
```typescript
// ✅ Correct — persists across renders
const usedIndexes = useRef<Set<number>>(new Set());

const generateMockData = () => {
  const used = usedIndexes.current;
  if (used.size === items.length) used.clear(); // reset when exhausted
  let index: number;
  do { index = Math.floor(Math.random() * items.length); } while (used.has(index));
  used.add(index);
  // ... fill form
};

// ❌ Wrong — resets on every render
const usedIndexes = new Set<number>();
```

### Post-mutation highlight (card view)
```typescript
useEffect(() => {
  if (lastAddedId && processedItems.length > 0) {
    const idx = processedItems.findIndex((c) => c.id === lastAddedId);
    if (idx !== -1) {
      setPage(Math.floor(idx / rowsPerPage));
      setHighlightedCard(lastAddedId);
      setTimeout(() => setHighlightedCard(null), 5000);
    }
  }
}, [lastAddedId, processedItems, rowsPerPage]);
```

### Client-side search with useMemo
```typescript
const searchedItems = useMemo(() => {
  if (!searchTerm.trim()) return items;
  return EntityService.search(items, searchTerm);
}, [searchTerm, items]);
```

### Permission-gated actions
```typescript
const permissions = useCountriesPermissions(); // from @/shared/hooks/usePermissions
// then: permissions.canCreate, permissions.canEdit, permissions.canDelete, permissions.canView
```

### valueGetter in MUI DataGrid v6+
```typescript
// ✅ Correct — receives cell value directly
valueGetter: (value: SimpleState[]) => {
  return Array.isArray(value) ? value.filter((s) => !s.isDeleted).map((s) => s.nameEn) : [];
},

// ❌ Wrong — v5 style, params is not an array
valueGetter: (params: any) => {
  return Array.isArray(params) ? params.filter(...) : [];
},
```

### MultiView — no dead state
```typescript
// ✅ Correct — no unused searchTerm state in the multi-view switcher
const CountriesMultiView = ({ countries, loading, isFetching, ... }) => {
  const [currentViewType, setCurrentViewType] = useState("grid");
  // pass isFetching down to the grid wrapper
};

// ❌ Wrong — searchTerm declared but never updated
const [searchTerm] = useState("");
const displayCountries = countries; // pointless alias
```
