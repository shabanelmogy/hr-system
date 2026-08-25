# Districts Expo Implementation Reference

## 1. Scope

Districts is an approved mobile Table/Cards/Chart/Report/Import feature under an active State. Mobile and web expose the same five capabilities; only the platform-native Grid versus Table presentation differs.

## 2. Guarded route

`app/(main)/basic-data/geographical-information/districts.tsx` uses `RouteGuard` with `ROUTES.basicData.districts`; the geographical overview exposes it only with `Districts:View`.

## 3. Runtime boundary

`district-endpoints.ts`, `district-api.ts`, and Zod schemas match the current API. URL serialization includes only bounded query fields and optional State/address-presence filters. Atomic import uses `POST districts/bulk` with exactly `{ districts: [...] }` and parses `{ createdCount }`.

## 4. Domain types

District list rows contain State and `addressesCount`. Detail and address-detail shapes are separate; Address fields are not represented as State-style child Districts. Import rows contain display-only `stateName` only until it resolves to `stateId`.

## 5. Query keys and mutations

`districtKeys` owns list, lookup, address-detail, and managed-report catalog cache keys. Mutations invalidate the District root after create/update/archive/restore/bulk archive/bulk create. Report catalog uses a stable five-minute query independently from the server list page.

## 6. Server-managed list

`DistrictsScreen` uses `useServerListState` and converts its zero-based page with `toApiPageNumber`. Search, sort, status, and pagination always request server data. Report and Import are independent views with `paginate: false` and `renderWhenEmpty: true`.

## 7. Mobile filters

The inline search field is paired with `DistrictFilterButton`; column, condition, and status controls live in the shared filter modal, not beside the mobile search field. Report owns separate bounded Arabic/English District and State filters and never derives them from the current list page.

## 8. Responsive views

The screen registers Table, Cards, Chart, Report, and permission-guarded Import. The table uses supported sorting; cards allow archive selection; charts use the current loaded page and identify State/Address metrics. The five compact selectors fill one touch-safe row on phone widths and retain localized accessibility labels.

## 9. Forms

`DistrictForm` loads active States through the States lookup key/API only while the form is visible. Its controls respect read-only mode and use the shared full-screen mobile form.

## 10. Lifecycle actions

View is always available with permission. Edit applies to active rows; archive/restore and bulk archive require `Districts:Delete`. API dependency errors are preserved in toast feedback.

## 11. Native Import

`DistrictImportView` uses the shared Expo document picker, bounded spreadsheet parser, template generator, and import-state UI. It accepts one `.xlsx` up to 5 MiB, requires exactly `nameAr,nameEn,code,stateName`, rejects formulas and more than 100 nonblank rows, and previews row results. Each row resolves an authorized active State by normalized English or Arabic name; unknown, inactive, or ambiguous names stay local errors. Same-file Arabic name, English name, and code duplicates are checked independently and case-insensitively within `StateId`.

Import requires `Districts:Create` and `States:View` and checks global read-only mode in direct handlers. Ready rows submit once as `{ districts: [...] }`; confirmed success invalidates `districtKeys.all`. An ambiguous timeout/transport outcome keeps the preview, marks submitted rows uncertain, blocks automatic retry, and requires canonical-list reconciliation.

## 12. Managed Report

`DistrictReportView` requires `CrystalReports:View`, lists only runnable published reports for entity key `districts`, and localizes catalog names from SummaryInfo Title/Subject with the manager display-name fallback. It renders only the selected report ID, `ar|en`, and nonblank approved filters `NameAr`, `NameEn`, `StateAr`, and `StateEn` through the authenticated HR API.

The returned PDF is signature-checked, written to the sensitive preview cache, opened through native print/PDF handling, shared through Expo Sharing, and disposed when replaced or the view unmounts. Loading, denied, empty, catalog error/retry, render error, sharing-unavailable, generated, open, and share states are localized. The mobile app never receives a Crystal path, filename, connection string, tenant ID, or company ID.

## 13. Accessibility, RTL, and responsive behavior

Cards and table actions have translated labels, controls meet shared touch target rules, translations exist in both languages, and app-level RTL layout remains authoritative. Import row status is text-labeled, not color-only. Report filters use shared accessible modal fields and generated PDF actions use labeled native controls.

## 14. Realtime

`districts` is a registered realtime prefix. Notifications with `/basic-data/districts` resolve to the direct Districts route. Confirmed bulk import invalidates the same root; uncertain import reconciles that root before retry.

## 15. Verification

Run mobile typecheck, lint, architecture check, Jest tests, translation parity, and direct route-policy checks after District changes. Manually test phone/tablet portrait and landscape, EN/AR and RTL, text scaling, light/dark, all permissions, read-only behavior, Import picker cancellation/file/header/formula/row/dependency/conflict/uncertain states, and Report permission/catalog/render/open/print/share/cache-cleanup states.
