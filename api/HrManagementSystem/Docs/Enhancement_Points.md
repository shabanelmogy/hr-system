# Enhancement Points — HrManagementSystem

This document tracks all identified improvement opportunities across the backend and frontend. Items are grouped by area and prioritized.

---

## Backend

### Architecture

| # | File / Area | Issue | Priority |
|---|-------------|-------|----------|
| B1 | `Services/CountriesService/CountryService.cs` | Uses both `IMapper` (AutoMapper style) and `.Adapt<T>()` (Mapster) in the same service. Standardize on Mapster throughout. | High |
| B2 | `Services/*/` | Service folders are inconsistently located — some under `Services/BasicServices/`, others directly under `Services/`. Standardize to one pattern. | Medium |
| B3 | `Contracts/BasicContracts/` vs `Contracts/Countries/` | Two different contract folder conventions exist. Basic entities use `BasicContracts/{Entity}s/`, geographic entities use flat `Contracts/{Entity}s/`. Document and enforce one rule per module type. | Medium |
| B4 | `Errors/EntitiesErrors/` | Errors class injects `IStringLocalizer<CountryRequest>` (typed to the Request, not the Errors class). This is the real pattern — updated all 17 error classes: fixed localizer type to `IStringLocalizer<{Entity}Request>` and changed `public` fields to `private readonly`. | Done ✅ |

### Code Quality

| # | File | Issue | Priority |
|---|------|-------|----------|
| B5 | `Services/CountriesService/CountryService.cs` | `ToggleAsync` checks `isInState` before loading the entity — if entity is null, the business check still runs. Swap order: load entity first, return 404 if null, then check business constraints. | Done ✅ |
| B6 | `Controllers/V1/CountriesController.cs`, `StatesController.cs`, `DistrictsController.cs` | No Swagger XML doc comments or `[ProducesResponseType]` attributes on any action. Add as per the guide. | Done ✅ |
| B7 | `Services/CountriesService/CountryService.cs` | `GetAllAsync` uses `ProjectToType<CountryResponse>()` without `Where(!IsDeleted)`. If Mapster config doesn't filter deleted records, all deleted countries are returned. Add explicit filter. | High |
| B8 | All controllers | `[HasPermission]` is missing on `GetById` endpoints — they are publicly accessible to any authenticated user. Decide if this is intentional and document it. | Medium |
| B9 | `Mapping/MappingConfigurations.cs` | No mapping registered for `Country → CountryResponse` or `CountryRequest → Country`. Mapster uses convention-based mapping by default, but explicit registration should be added for clarity and to support custom mappings. | Medium |
| B10 | `Docs/Entity_Implementation_Guide.md` | Step numbers still say 13 steps but the guide now has content for 15 steps (Swagger docs + frontend docs added). Update the header count. | Low |

---

## Frontend

### Architecture

| # | File / Area | Issue | Priority |
|---|-------------|-------|----------|
| F1 | All features (states, districts, addressTypes) | `t` is still passed as a prop to components and shared components. Apply the same `useTranslation()` refactor done for countries to all other features. | Done ✅ |
| F2 | `statesMultiView.tsx`, `districtsMultiView.tsx`, `addressTypesMultiView.tsx` | Still pass `t={t}` to `MultiViewHeader`. Remove — `MultiViewHeader` now uses `useTranslation()` internally. | Done ✅ |
| F3 | `statesPage.tsx`, `districtsPage.tsx` | Still pass `t={t}` to form and delete dialog components. Remove and add `useTranslation()` to each component. | Done ✅ |
| F4 | `types/Country.ts` | `CountryResponse` interface duplicates `Country` and is never used. Remove it. | Done ✅ |
| F5 | `types/Country.ts` | `CountryQueryParams` interface is defined but never used (app uses client-side pagination). Remove it. | Done ✅ |
| F6 | `useCountryQueries.ts` | `useCreateCountry` and `useUpdateCountry` accept `Partial<Country>` as variable type. Should be `CreateCountryRequest` and `UpdateCountryRequest` respectively for proper type safety. | Done ✅ |
| F7 | `useCountryGridLogic.ts` | `handleFormSubmit` parameter is typed as `CreateCountryRequest` but the form submits `CountryFormData`. The hook should accept `CountryFormData` and map to the correct request type internally. | Medium |
| F8 | `useCountryGridLogic.ts` | `error` in the return interface is typed as `any`. Should be `Error \| null`. | Low |

### Code Quality

| # | File | Issue | Priority |
|---|------|-------|----------|
| F9 | `countryForm.tsx` | Hidden `<TextField sx={{ display: "none" }}>` for ID serves no purpose. The ID is already in `selectedCountry`. Remove it. | Done ✅ |
| F10 | `countryForm.tsx` | `nameArRef`, `nameEnRef`, `alpha2CodeRef`, `alpha3CodeRef` are created with `useRef` and passed as `inputRef` but never used for `.focus()` or any imperative action. Remove them. | Done ✅ |
| F11 | `columns.tsx` (`useCountryColumns`) | Named as a hook (`use*`) but only calls `useTheme()` — not a real hook with state or effects. Rename to `getCountryColumns` or lift `useTheme` out. | Low |
| F12 | `countriesCardView.tsx` | `getResponsiveItemsPerPage` is defined as a function inside the component and called in multiple places. It should be a `useMemo` or moved outside the component. | Low |
| F13 | `countriesCardView.tsx` | `getItemsPerPageOptions` calls `getResponsiveItemsPerPage()` internally, creating a dependency on the same breakpoint logic. Consolidate into one derived value. | Low |
| F14 | `countriesPage.tsx` | `dialogType as "add" \| "edit" \| "view"` cast is unsafe — silently passes `"delete"` or `null` if the `includes` check is wrong. Replace with a proper derived variable. | Done ✅ |

### Translation

| # | File | Issue | Priority |
|---|------|-------|----------|
| F15 | `ar/translation.json` | Several keys present in `en/translation.json` are missing in Arabic. Always keep both files in sync. Run a diff before each release. | High |
| F16 | All features | Hardcoded fallback strings like `\|\| "Add"`, `\|\| "Retry"`, `\|\| "No states"` exist throughout. These should be removed once translation keys are confirmed complete — they mask missing translation keys. | Low |

---

## Shared Components

| # | Component | Issue | Priority |
|---|-----------|-------|----------|
| S1 | `MultiViewHeader.jsx` | Previously accepted `t` as a prop with `t = (key) => key` fallback. Fixed — now uses `useTranslation()`. Any remaining callers passing `t={t}` should remove it. | Done ✅ |
| S2 | `MyDataGrid.jsx` | Previously used `initialState` for pagination (uncontrolled). Fixed — now uses controlled `paginationModel` with auto page-clamp on row count change. | Done ✅ |
| S3 | `MyCustomToolbar.jsx` | Already uses `useTranslation()` internally. No changes needed. | Done ✅ |
| S4 | `MyDataGrid.jsx` + `use{Entity}GridLogic` | `lastAddedId`, `lastEditedId`, `lastDeletedIndex` props exist on `MyDataGrid` but the feature hooks also managed their own scroll effects via `apiRef`. Duplicate logic. Fixed — `MyDataGrid` now owns all post-mutation navigation. Hook only sets state values in `onSuccess`, no scroll `useEffect` hooks needed. | Done ✅ |
| S5 | `CustomFooterWithNavigation` (inside `MyDataGrid`) | Footer previously had its own `paginationModel` state synced via `subscribeEvent`. Fixed — now receives `paginationModel` and `onPaginationModelChange` as props from `MyDataGrid`. | Done ✅ |

---

## Testing

| # | Area | Issue | Priority |
|---|------|-------|----------|
| T1 | All features | No unit tests for service classes (`CountryService`, etc.). Add tests for `getAll` (deleted filter), `create`, `update`, `delete`, `search`. | High |
| T2 | `useCountryGridLogic` | No tests for the grid logic hook. Add tests for dialog state transitions, form submit routing (add vs edit), and delete index tracking. | Medium |
| T3 | `validation.ts` | Zod schemas are not tested. Add unit tests for required field validation, optional field guards, and duplicate-check rules. | Medium |
| T4 | `myDataGrid.jsx` | Page-clamp behavior after delete is not tested. Add a test that verifies the page resets when `rows.length` drops below `page * pageSize`. | Medium |

---

## Documentation

| # | Area | Issue | Priority |
|---|------|-------|----------|
| D1 | `Docs/Controllers/` | No frontend integration docs exist yet for any controller. Create `Docs/Controllers/Geographic/CountriesController.md` as the first example. | Done ✅ |
| D2 | `Docs/User Stories/` | No user stories exist for geographic entities (Country, State, District). Create them following the guide template. | Low |
| D3 | `Entity_Implementation_Guide.md` | Examples in Steps 09–12 still reference KanbanBoard (old guide). Update to use Country as the reference example throughout (matching the steering file). | Low |

---

## Summary by Priority

### High (fix next)
- ~~F1–F3: Remove `t` prop from all remaining features~~ ✅ Done
- ~~F6–F7: Fix mutation variable types~~ — F6 Done ✅, F7 still pending
- B5: Fix `ToggleAsync` null check order
- B6: Add Swagger docs to controllers
- B7: Add `Where(!IsDeleted)` to `GetAllAsync`
- F15: Sync Arabic translation keys
- T1: Add service unit tests

### Medium (fix soon)
- B1: Standardize Mapster usage
- B2–B3: Standardize folder conventions
- F4–F5: Remove unused types
- F9–F10: Remove dead code in form
- ~~F14: Fix unsafe dialog type cast~~ ✅ Done
- ~~S4: Consolidate post-mutation navigation~~ ✅ Done
- T2–T4: Add hook and schema tests
- ~~D1: Create first controller frontend doc~~ ✅ Done

### Low (backlog)
- B4: Update error class localizer pattern~~ ✅ Done
- B8: Document permission decisions on GetById
- B9: Add explicit Mapster registrations
- B10: Fix guide step count
- F8: Type `error` as `Error | null`
- F11–F13: Minor code quality improvements
- F16: Remove hardcoded fallback strings
- D2–D3: Documentation updates

---

**Last Updated:** April 2026
**Author:** HR Management System Team
