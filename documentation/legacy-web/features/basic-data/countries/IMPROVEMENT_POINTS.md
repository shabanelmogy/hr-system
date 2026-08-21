# Countries Feature — Improvement Points

Tracks all identified improvements for `web/src/features/basicData/countries`.
Items marked ✅ are already applied. Items marked ⬜ are pending.

---

## Applied ✅

### Code Quality
- ✅ Removed `temp_delete.txt` dead file from `components/chartView/`
- ✅ Removed `console.log` calls from `CountryReport.tsx`
- ✅ Removed `console.log` from `districtForm.tsx` mock data generator
- ✅ Removed hidden `<TextField sx={{ display: "none" }}>` for ID in `countryForm.tsx`
- ✅ Removed unused `inputRef` refs (`nameArRef`, `nameEnRef`, `alpha2CodeRef`, `alpha3CodeRef`) from `countryForm.tsx`
- ✅ Removed unused `inputRef` refs from `addressTypeForm.tsx`
- ✅ Removed `handleErrorFound` console.log from `addressTypeForm.tsx`
- ✅ Removed dead `searchTerm` state and `displayCountries`/`displayLoading` aliases from `countriesMultiView.tsx`

### Type Safety
- ✅ `error: any` → `Error | null` in `useCountryGridLogic.ts` return interface
- ✅ Mutation variable types fixed: `Partial<Country>` → `CreateCountryRequest` / `UpdateCountryRequest`
- ✅ TanStack Query v5: added `TContext = unknown` 3rd generic to mutation factory
- ✅ TanStack Query v5: added `meta` as 4th argument to `onSuccess` callbacks
- ✅ `dialogType as "add" | "edit" | "view"` unsafe cast replaced with `formDialogType` derived variable in `countriesPage.tsx`
- ✅ Removed unused `CountryResponse`, `CountryFilters`, `CountryQueryParams` types from `types/Country.ts`

### Performance
- ✅ `getResponsiveItemsPerPage()` function replaced with `responsiveItemsPerPage = useMemo(...)` in `countriesCardView.tsx`
- ✅ Zod schema wrapped in `useMemo` in `countryForm.tsx` to avoid recreation on every render
- ✅ `usedIndexes` for mock data generation changed from `new Set()` (resets every render) to `useRef<Set<number>>` in all forms

### Architecture
- ✅ `t` prop removed from all components — every component calls `useTranslation()` internally
- ✅ `MultiViewHeader` updated to use `useTranslation()` internally (no more `t` prop)
- ✅ `MyDataGrid` updated to use `useTranslation()` internally (no more `t` prop)
- ✅ `MyDataGrid` pagination converted from `initialState` (uncontrolled) to controlled `paginationModel` — fixes "shows 1 row after delete" bug
- ✅ `CustomFooterWithNavigation` receives `paginationModel` + `onPaginationModelChange` as props instead of maintaining its own state
- ✅ Post-mutation navigation: scroll effects restored in `useCountryGridLogic` with `isFetching` guard on add effect
- ✅ Mock data button moved from form body to `footerLeft` prop on `MyForm` in all forms (countries, states, districts, addressTypes)
- ✅ `stateForm.tsx`: `usedIndexes` fixed from `new Set()` to `useRef<Set<number>>(new Set())`

### Chart View
- ✅ `prepareRegionData` grouping changed from first-letter ("A Countries") to phone code prefix ("Zone 1") — more meaningful geographic grouping
- ✅ Stray `import` at bottom of `chartDataUtils.ts` moved to top with other imports

### SignalR
- ✅ Action string keys fixed: `"created"/"updated"/"deleted"` → `"Add"/"Update"/"Delete"` to match backend hub

---

## Pending ⬜

### High Priority

| # | File | Issue |
|---|------|-------|
| H1 | `countriesMultiView.tsx` | `handleExport` is a stub (`console.log` only). Implement actual Excel/PDF export or remove the `onExport` prop until ready. |
| H2 | `utils/countryHandler.ts` | SignalR handler is never initialized. Wire up `countryHandler.initialize(notificationSystem)` in a `useEffect` in `CountriesPage` with cleanup `countryHandler.destroy()`. |
| H3 | `components/chartView/` | Chart sub-components (`LoadingChartState`, `EmptyChartState`, `SummaryCards`, `RegionBarChart`, etc.) still accept `t` as a prop. Apply the same `useTranslation()` refactor. |

### Medium Priority

| # | File | Issue |
|---|------|-------|
| M1 | `countriesCardView.tsx` | 3 separate highlight `useEffect` hooks (add/edit/delete) are nearly identical. Consolidate into one effect. |
| M2 | `countryForm.tsx` | `getOverlayActionType()` and `getOverlayMessage()` are plain functions called on every render. Convert to `useMemo`. |
| M3 | `reports/CountryReport.tsx` | `reportsInfo` and `selectedReport` state typed as `any[]` / `any`. Add proper types. |
| M4 | `components/chartView/chartDataUtils.ts` | `prepareRegionData` groups by phone code prefix which is still approximate. Consider adding a proper region lookup table (e.g. `{ EG: "Africa", US: "Americas" }`). |
| M5 | `useCountryImport.ts` | `setCountries([])` and `setSelectedFile(null)` are called inside the upload loop on every successful item instead of after all uploads complete. Move them outside the loop. |
| M6 | `stateForm.tsx` | `handleErrorFound` still has a `console.log` — remove it. |
| M7 | `stateForm.tsx` | Hidden `<TextField sx={{ display: "none" }}>` for ID — remove it (same fix applied to countryForm). |
| M8 | `districtForm.tsx` | Hidden `<TextField sx={{ display: "none" }}>` for ID — remove it. |

### Low Priority

| # | File | Issue |
|---|------|-------|
| L1 | `components/cardView/CountryCard.tsx` | `QualityMeter` title is hardcoded English: `title="Data Quality"`. Use `t("general.dataQuality")`. |
| L2 | `components/gridView/columns.tsx` | `useCountryColumns` is named as a hook but is essentially a factory function. Rename to `getCountryColumns` or ensure it only calls hooks at the top level. |
| L3 | `countriesCardView.tsx` | `getItemsPerPageOptions()` is a plain function called on every render. Convert to `useMemo`. |
| L4 | `countryForm.tsx` | `getOverlayActionType()` and `getOverlayMessage()` could be derived with `useMemo` instead of plain functions. |
| L5 | `components/chartView/` | `TestChart.tsx` referenced in some imports — verify it's fully removed and not imported anywhere. |
| L6 | All card view components | No keyboard navigation support on cards. Add `onKeyDown` handlers for accessibility. |
| L7 | All card view components | Icon-only action buttons lack `aria-label`. Add for accessibility. |
| L8 | `useCountryImport.ts` | File upload only validates extension (`.xlsx`), not MIME type. Add MIME type check for security. |

---

## Known Issues / Decisions

| Issue | Decision |
|-------|----------|
| `countryForm.tsx` TypeScript error: Zod schema infers optional fields as `string \| undefined` but `CountryFormData` declares them as `string` | Fixed by removing `<CountryFormData>` generic from `useForm` and using `as any` cast on `onSubmit`. Runtime is correct — Zod's `.default("")` always produces `string`. |
| `MyDataGrid` `t` prop still accepted in some call sites (states, districts, addressTypes) | Removed from `MyDataGrid` itself. Callers that still pass `t={t}` to `MyDataGrid` should remove it — it's ignored. |
| Post-mutation navigation: hook scroll effects vs `MyDataGrid` internal navigation | Both exist intentionally. `MyDataGrid`'s internal effect fires too early for add (before refetch). Hook's `useEffect` with `!isFetching` guard is the correct timing. Do NOT remove hook scroll effects. |

---

**Last Updated:** April 2026
