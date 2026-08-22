# States Expo Mobile Reference

Status: applied Expo server-managed feature profile. Requires Expo SDK 54 conventions.

## 1. Source inventory

The physical route is `app/(main)/basic-data/geographical-information/states.tsx`. The feature owns `src/features/basic-data/states/{api,queries,types,components,screens,index.ts}` and uses only shared mobile primitives plus Countries’ deliberate public API for parent lookup.

## 2. Route and policy

`RouteGuard(ROUTES.basicData.states)` enforces `States:View`. Typed route constants, the route policy, geographical navigation item, realtime registry, and notification action mapper are registered together.

## 3. Runtime contract

Zod parses page, detail, relation, lookup, and bulk response shapes. State list rows include the active District count and parent Country. Requests contain only name Arabic/English, code, and CountryId.

## 4. Endpoints

The API wrapper owns `states`, lookup, compatibility by-country lookup, details, State-with-Districts relation, create/update/archive, restore, and bulk archive endpoints. Query serialization always sends page/status/sort/search field/search condition and omits empty optional criteria.

## 5. Query keys and mutations

`stateKeys` provides list, lookup, detail, and relation prefixes. List uses prior-page placeholder data. Save selects create/update; lifecycle mutations invalidate `stateKeys.all`; realtime uses the same stable prefix without importing private hooks.

## 6. Controlled list state

`StatesScreen` owns a single zero-based `useServerListState`. It converts page number with `toApiPageNumber`, debounces search through the shared hook, resets page on search/status/sort/field/operator changes, and clears bulk selection on criteria/page changes. Current page rows are not client-filtered, sorted, or sliced.

## 7. Search and filters

The shared search field drives server search. The main toolbar keeps only that
field and one Filter button. Its feature-owned modal applies active/archived/all,
all/name Arabic/name English/code/country, and all six API operators together
through `AppListScreen.filterControl` and the shared `AppSearchFilterControls`.
Controls use direction-aware, accessible shared select modals.

## 8. Views

Table and Cards share rows, criteria, total, controlled pagination, actions, and pull-to-refresh. Report mode currently renders a truthful current-server-page list with its current-row/total scope. No chart or import is offered. Browser Crystal reporting is intentionally separate until Expo has a Crystal PDF viewer/download/share design.

## 9. Form

The full-screen State form uses React Hook Form/Zod, validates State-specific fields, loads active Countries through the Countries public API, normalizes code, supports create/edit/view, and uses shared keyboard/safe-area/dirty/busy handling. The list row contains all State form fields, so no redundant detail hydration is required for edit.

## 10. Permissions and lifecycle

Route/view uses `States:View`; create/edit/archive/restore recheck permission and read-only state in direct handlers. Active cards can be selected for bulk archive. Archived cards offer restore. The API remains authoritative for Country-active and District-dependency validation.

## 11. Report decision

The browser State report catalog and generation contract are ready, but Expo deliberately keeps a current-page summary. It is not a PDF/export workflow until device file download, viewing, sharing, error handling, and permissions are designed and implemented against that existing report contract.

## 12. RTL, responsive, and accessibility

Paired Arabic/English resources, live localization direction, shared AppScreen safe areas, full-screen form, horizontal table overflow, responsive multi-view, 44px shared controls, icon labels, status badges, and device-friendly cards are used. Verify orientation, text scale, color mode, and keyboard behavior on real devices.

## 13. Notifications and realtime

The `states` realtime resource invalidates `['states']`. `/basic-data/states` notification actions map to the direct States Expo route, so notifications and realtime point to the same feature.

## 14. Tests

Feature API tests cover serialization/runtime schemas. Shared route, server-list, realtime, localization, and architecture tests cover common behavior. Add a representative State screen/form/lifecycle integration suite when test render fixtures are available.

## 15. Verification

Run `npm.cmd run typecheck`, lint, architecture check, Jest, and full `npm.cmd run check`; then manually test direct route access, phone/tablet portrait/landscape, EN/AR, RTL, text scaling, read-only, permissions, archive/restore/bulk errors, Country selector, offline/error/empty/retry, and realtime refresh.
