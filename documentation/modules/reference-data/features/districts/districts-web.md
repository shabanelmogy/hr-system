# Districts Next.js Implementation Reference

## 1. Scope

The Districts browser feature is a State-dependent reference-data implementation
using the approved Grid, Cards, Chart, Report, and Import views. Its Report is a
global managed Crystal view and requires `super_admin` plus
`GlobalCrystalReports:View`; it has no tenant Reporting entitlement query.

Angular client2026-11-06: the complete canonical District workspace now composes
existing Shared owners with four-field State-aware native Signal Forms and all five
source views. Complete acceptance/limits are in documentation/modules/platform/
features/angular-districts-workspace/DISTRICTS_WORKSPACE_2026-11-06.md. API/Next/native
business rules are retained; this migration does not change database/schema.

## 2. Route and composition

The thin app route at `app/(main)/super-admin/(reference-data)/geography/districts/page.tsx` renders `DistrictsPage`; it is `super_admin` only. The page owns dialogs and delegates all list behavior to `useDistrictGridLogic` and `DistrictsMultiView`.

## 3. Transport and types

`basicData.ts`, `types.ts`, `District.ts`, and `districtService.ts` match the District API page, lookup, detail, address-detail, lifecycle, named bulk-create, and bulk-archive contracts exactly.

The shared name schema accepts 2-100 printable Unicode characters, including
spaces, digits, punctuation, and mixed scripts, and rejects control characters
and line breaks. District codes remain 2-10 ASCII letters, digits, or hyphens.

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

The form resolves active States only while open. In development, its shared `MyForm` footer can fill a domain-owned District sample and an active State; it never submits automatically and is disabled until the parent lookup is ready. The State selector uses the domain-scoped `districts.state` label and `districts.selectState` placeholder keys so English and Arabic labels remain correct. Create/edit/view, archive, restore, and bulk archive use shared dialog patterns, permission gating, error feedback, and query invalidation.

## 10. Realtime and routing

The feature registers the `districts` realtime key and the canonical `/super-admin/geography/districts` route. Notification routes target that Platform page; Expo maps it to its guarded native catalog route.

## 11. Localization, RTL, and accessibility

English and Arabic translation blocks include feature-owned field, lifecycle, filter, chart, report, import, lookup, and feedback strings. Reuse shared RTL behavior and accessible names instead of hand-rolled DOM props.

## 12. Import view

Import is visible only with `Districts:Create` and submits only while the user also has `States:View`, the active State lookup is ready, and shared read-only mode permits mutation. The client accepts the first worksheet of a maximum 5 MiB XLSX with exact headers `nameAr,nameEn,code,stateName` and at most 100 rows, resolves English/Arabic State names, validates and previews every row, rejects same-field case-insensitive duplicates within State, then posts `{ districts: [...] }` once to `/districts/bulk`. A no-response/5xx result becomes a locked uncertain state until the user reconciles the District list.

## 13. Report view

Districts owns a reachable `DistrictReportPage` composition and focused policy
tests. The Report option is hidden when denied and an active Report view falls
back to Grid if the session changes. Older tenant ActiveReports/report-data
references are a separate capability.

## 14. Verification

Run typecheck, strict typecheck, lint, tests, production build, architecture check, locale JSON parse, and manual desktop/tablet/mobile/RTL visual tests.

## 15. Change checklist

When adding a field or view, update API projection/contracts first, then transport/runtime types, list criteria, all approved views, locales, realtime impact, required-file manifest, and this profile before regenerating phase packets.


## Manual global reporting View adapter — 2026-11-02

Reporting GCT-1 now consumes IReferenceDataPublicViewSource through public Contracts. ReferenceData owns schema-bound SQL View metadata/dependency checks and bounded parameterized reads; direct dependencies are restricted to approved global Countries/States/Districts tables. Tenant/company tables and raw arbitrary SQL are excluded. Existing geographical CRUD/list/client forms are unchanged. Angular report administration is Required in Reporting; Next/Mobile administration remains Excluded. The actual SQL integration test validates filtering, injection rejection, unsupported dependencies, immutable binding and definition changes. Owning workflow/evidence: `documentation/plans/business/global-crystal-template-management/MANUAL_VIEW_IMPLEMENTATION_2026-11-02.md`; FOLLOW-024/PROD-028 remain open and Builder work is DEF-027.


## Prepared global reporting Views — 2026-11-02

GCT-1 now discovers eligible metadata and creates three reviewed all-column,
schema-bound ref.vw_Countries/ref.vw_States/ref.vw_Districts Views through the
ReferenceData-owned migration20261102143015. LEFT JOIN follows Countries→States,
States→Country and Districts→State→Country; related fields are prefixed and deleted
rows excluded without turning the join into an inner join. No company Address
table enters global SQL. ReferenceData computes the district address count using
trusted company/tenant filters during report execution. Reporting projects only
approved native fields. Existing geographical CRUD and Next/Mobile forms remain
unchanged. Future physical column changes need an explicit View migration because
of SCHEMABINDING. Current evidence and 5-point platform audit are in Reporting GCT-1
section22 and DATABASE_VIEW_IMPLEMENTATION_2026-11-02.md; FOLLOW-024 remains Open.
