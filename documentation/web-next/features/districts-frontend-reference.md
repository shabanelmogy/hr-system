# Districts Next.js Implementation Reference

## 1. Scope

The Districts browser feature is a State-dependent reference-data implementation using the approved Grid, Cards, Chart, Report, and Import views.

## 2. Route and composition

The thin app route at `app/(main)/super-admin/geography/districts/page.tsx` renders `DistrictsPage`; it is `super_admin` only. The page owns dialogs and delegates all list behavior to `useDistrictGridLogic` and `DistrictsMultiView`.

## 3. Transport and types

`basicData.ts`, `types.ts`, `District.ts`, and `districtService.ts` match the District API page, lookup, detail, address-detail, lifecycle, named bulk-create, and bulk-archive contracts exactly.

## 4. Server list state

`districtPageQuery.ts` converts one-based API pages and serializes criteria. `useDistrictQueries.ts` holds page/detail/lookup keys and root invalidation; client-side filtering or fabricated totals are prohibited.

## 5. Shared controls

Use the shared header, compact breadcrumb, filter visibility toggle, toolbar, Grid Options, aligned search-field/search-condition/search/reset row, data grid, card pagination, forms, and dialogs. Grid Options is last in the row and contains status and bulk archive.

## 6. Grid view

The grid uses server paging/sort, only API-supported sort columns, State parent display, Address count, lifecycle actions, and selection limited to active Districts.

## 7. Card view

Cards use the same server criteria and shared toolbar. Their internal scroll area keeps pagination pinned at the bottom of the view rather than pushing page-level content. Cards display State and Address count, not State-specific District count wording.

## 8. Chart view

Charts use only the loaded page and show server total separately. Metrics are Districts, distinct States, and Address count; no global aggregate is implied.

## 9. Forms and lifecycle dialogs

The form resolves active States only while open. Create/edit/view, archive, restore, and bulk archive use shared dialog patterns, permission gating, error feedback, and query invalidation.

## 10. Realtime and routing

The feature registers the `districts` realtime key and the canonical `/super-admin/geography/districts` route. Notification routes target that Platform page; Expo maps it to its guarded native catalog route.

## 11. Localization, RTL, and accessibility

English and Arabic translation blocks include feature-owned field, lifecycle, filter, chart, report, import, lookup, and feedback strings. Reuse shared RTL behavior and accessible names instead of hand-rolled DOM props.

## 12. Import view

Import is visible only with `Districts:Create` and submits only while the user also has `States:View`, the active State lookup is ready, and shared read-only mode permits mutation. The client accepts the first worksheet of a maximum 5 MiB XLSX with exact headers `nameAr,nameEn,code,stateName` and at most 100 rows, resolves English/Arabic State names, validates and previews every row, rejects same-field case-insensitive duplicates within State, then posts `{ districts: [...] }` once to `/districts/bulk`. A no-response/5xx result becomes a locked uncertain state until the user reconciles the District list.

## 13. Report view

Report uses `crystalReportService.listPublished("districts")`, stable key `["crystal-reports", "published", "districts"]`, managed report IDs, and the shared `ReportViewer`. It sends `ar|en` plus only nonblank `NameAr`, `NameEn`, `StateAr`, and `StateEn` filters. Loading, unavailable, catalog-error/retry, localized selection, rendering, download, and print behavior stay in the managed reporting boundary.

## 14. Verification

Run typecheck, strict typecheck, lint, tests, production build, architecture check, locale JSON parse, and manual desktop/tablet/mobile/RTL visual tests.

## 15. Change checklist

When adding a field or view, update API projection/contracts first, then transport/runtime types, list criteria, all approved views, locales, realtime impact, required-file manifest, and this profile before regenerating phase packets.
