# States Feature Full Review

Status: applied cross-platform implementation profile. Review date: 2026-08-21.

Countries is the architectural reference; States owns its own country and district rules.

## 1. Scope and ownership

States is global Platform geographical reference data owned by `GeographicalInformation/States` in the API and reused by both clients. Its public routes are `/api/v1/states`, `/super-admin/geography/states` in Next.js, and `/basic-data/geographical-information/states` in Expo's super-admin-only geography module.

## 2. Discovery evidence

The prior API and browser feature were legacy service/client-list implementations. Expo had navigation permission text but no physical States route or feature. The completed feature uses the existing Countries server-list, permission, form, dialog, realtime, localization, and responsive primitives without copying Countries-only fields.

## 3. Domain rules

`State` requires Arabic name, English name, code, and a parent `CountryId`. Names are trimmed printable Unicode display names of 2-100 characters; spaces, digits, and punctuation are allowed, while control characters and line breaks are rejected. The API and clients do not impose an English-only or Arabic-only script rule. Code is 2-10 ASCII letters, digits, or hyphens. `(NameAr, CountryId)`, `(NameEn, CountryId)`, and `(Code, CountryId)` are unique. The parent country must be active for create, update, and restore. A State with an active District cannot be archived. Country-dependent State writes share transaction-owned Country lifecycle resources with Country archive; State archive and District create/update/restore share State lifecycle resources. Districts are State-owned dependents; they are not copied from Countries. An Address may reference a State only when it belongs to the selected Country.

## 4. Lifecycle and authorization

Every endpoint first requires `super_admin`; action permissions then control view,
create, edit, archive, restore, bulk actions, and Import.

View, create, edit, and archive use `States:View`, `States:Create`, `States:Edit`, and `States:Delete`. Create and edit apply only to active records. Archive is idempotent but validates active District and Address dependencies inside the shared State lock. Restore uses Delete permission and requires the parent Country to remain active inside the shared Country lock. Bulk archive accepts 1-100 distinct positive IDs, fails atomically for missing records or active Districts/Addresses, and emits one post-commit change. Web selection rejects more than 100 eligible IDs with localized feedback and the direct handler rechecks the bound. Web and mobile XLSX import use `States:Create` against `POST /api/v1/states/bulk` with the exact `{ "states": [...] }` envelope and also require `Countries:View` for their active parent lookup. The import submit callback independently enforces read-only and `States:Create`; lookup authorization remains a separate requirement. The shared parser enforces XLSX MIME/extension/container, 5 MiB, first worksheet, canonical ordered headers, no formulas/unexpected columns, non-empty data, and at most 100 non-empty rows before mapping. Rows that fail local validation stay unsubmitted, and valid rows persist atomically under one `BulkAdd` change. Arabic name, English name, and code duplicates are checked independently and case-insensitively within each Country; equal text in different fields is allowed. The bulk route has no idempotency key, so ambiguous submissions lock retry and reconcile through the refreshed list.

## 5. List contract

The API owns filtering, ordering, and paging. It accepts one-based page number (1-5000 page size for the bounded adaptive web read), `search`, `searchField` (`all`, `nameAr`, `nameEn`, `code`, `country`), six search operators, `status`, optional `countryId` and `hasDistricts`, and the documented sort allow-list (`nameEn`, `nameAr`, `code`, `country`, `createdOn`). Browser and mobile UI state is zero-based and converts only at the transport boundary. The web loads the complete result and uses client pagination through 5000 rows, then uses server pages above that boundary. Every server sort has an Id tie-break.

## 6. API architecture

The versioned controller depends only on `ISender`. State read/write ports, Mapster configuration, CQRS commands/queries, audit trail, post-commit scheduler, notification/realtime job, stores, and focused controller/architecture tests live in feature-owned code. The compatibility lookup `by-country/{countryId}` remains for dependent District selectors; it returns active lookup data instead of a client-filtered list.

## 7. Client architecture

Next.js uses one `useServerListState` criteria controller plus the shared adaptive pagination hook, React Query prefix invalidation, the shared aligned Grid toolbar, Grid Options at the end of the toolbar row, Grid/Card/Chart/Report/Import views, modal form/detail retrieval, lifecycle dialogs, and state-specific fields. The same `MyDataGrid` runs in client mode through 5000 complete rows and server mode above the boundary. Unsupported column sorting is disabled, while Country sorting remains enabled because the API supports it. Initial loading is distinct from background fetching, which preserves current content under a linear progress indicator. Standard Multi View names come from the shared global labels and the shared toggle owns consistent inner padding. Chart mode keeps the same criteria, resets to the first page when entered, omits pagination controls, labels its page scope, and is not global aggregate analytics. Development forms can use the shared mock-data footer action to fill a State sample with an active Country without submitting. Import composes the shared bounded XLSX parser/card with State-owned headers, mapping, duplicate scope, Country dependency state, exact envelope, and reconciliation. Expo uses one controlled `useServerListState`, runtime Zod parsing, a guarded route, full-screen State form with an active Country selector, search-field/operator controls, status filter, table/cards/report modes, and touch-safe lifecycle actions; its development form has the equivalent non-submitting mock action.

## 8. Realtime, localization, RTL, and accessibility

The canonical browser notification action is `/super-admin/geography/states`;
Expo maps that Platform action to its guarded native States route.

The State change job schedules only after persistence succeeds, sends the `states` realtime resource, and uses `/super-admin/geography/states` notification actions. Bulk create/archive select plural English/Arabic notification keys, while singular archive has its own localized key. Both clients invalidate the States prefix and the Expo notification mapper resolves the Platform deep link to the guarded native States route. English and Arabic messages cover fields, validation, filters, lifecycle, empty/error/retry, report scope, and accessibility labels. Shared direction-aware layouts, safe areas, responsive cards, dialogs, tables, and labeled icon actions are used throughout.

## 9. State-specific report decision

The browser Report mode uses the same Crystal viewer pattern as Countries, not a
local State table. `CrystalReportGeneratorApi` now has a States catalog slot,
the `V_AllStates` report dataset, and `report/states/generate` for State Arabic
and English name parameters. `Reports/States/.gitkeep` intentionally creates an
empty report location; no fake `.rpt` is generated. Until the owner adds a
valid State Crystal template, browser Report mode presents a localized
unavailable state and never calls report generation with a nonexistent file.
The template filename must contain `States` (for example, `States.rpt`) to meet
the existing report-catalog filter.

Expo retains its current-page report summary because it has no Crystal PDF
viewer/file-handling integration. This is an intentional platform difference,
not an indication that the browser should fall back to a local table. A future
mobile Crystal experience must reuse the States catalog and generation contract
and add explicit device PDF handling.

## 10. Verification and remaining review work

Run API build/tests, web architecture/type/lint/test/build gates, mobile check, documentation check, link check, and `git diff --check`. Manual release verification still requires browser and device runs covering direct route navigation, phone/tablet, EN/AR, RTL/LTR, text scale, keyboard, permission/read-only, loading/error/empty, archive dependency errors, restore under archived parent, bulk actions, and realtime refresh.
