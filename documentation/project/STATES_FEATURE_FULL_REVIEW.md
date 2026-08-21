# States Feature Full Review

Status: applied cross-platform implementation profile. Review date: 2026-08-21.

Countries is the architectural reference; States owns its own country and district rules.

## 1. Scope and ownership

States is geographical reference data owned by `GeographicalInformation/States` in the API, `basic-data/geographical-information/states` in Next.js, and `basic-data/states` in Expo. Its public routes are `/api/v1/states`, `/basic-data/states`, and `/basic-data/geographical-information/states`.

## 2. Discovery evidence

The prior API and browser feature were legacy service/client-list implementations. Expo had navigation permission text but no physical States route or feature. The completed feature uses the existing Countries server-list, permission, form, dialog, realtime, localization, and responsive primitives without copying Countries-only fields.

## 3. Domain rules

`State` requires Arabic name, English name, code, and a parent `CountryId`. Names are 2-100 language-constrained characters and code is 2-10 valid State-code characters. `(NameAr, CountryId)`, `(NameEn, CountryId)`, and `(Code, CountryId)` are unique. The parent country must be active for create, update, and restore. A State with an active District cannot be archived. Districts are State-owned dependents; they are not copied from Countries.

## 4. Lifecycle and authorization

View, create, edit, and archive use `States:View`, `States:Create`, `States:Edit`, and `States:Delete`. Create and edit apply only to active records. Archive is idempotent but validates active District dependencies. Restore uses Delete permission and requires the parent Country to remain active. Bulk archive accepts 1-100 distinct positive IDs, fails atomically for missing records or active Districts, and emits one post-commit change.

## 5. List contract

The API owns filtering, ordering, and paging. It accepts one-based page number (1-50 page size), `search`, `searchField` (`all`, `nameAr`, `nameEn`, `code`, `country`), six search operators, `status`, optional `countryId` and `hasDistricts`, and the documented sort allow-list (`nameEn`, `nameAr`, `code`, `country`, `createdOn`). Browser and mobile UI state is zero-based and converts only at the transport boundary. Every server sort has an Id tie-break.

## 6. API architecture

The versioned controller depends only on `ISender`. State read/write ports, Mapster configuration, CQRS commands/queries, audit trail, post-commit scheduler, notification/realtime job, stores, and focused controller/architecture tests live in feature-owned code. The compatibility lookup `by-country/{countryId}` remains for dependent District selectors; it returns active lookup data instead of a client-filtered list.

## 7. Client architecture

Next.js uses one `useServerListState` controller, React Query prefix invalidation, the shared aligned Grid toolbar, Grid Options at the end of the toolbar row, server Grid/Card/Report views, modal form/detail retrieval, lifecycle dialogs, and state-specific fields. Expo uses one controlled `useServerListState`, runtime Zod parsing, a guarded route, full-screen State form with an active Country selector, search-field/operator controls, status filter, table/cards/report modes, and touch-safe lifecycle actions.

## 8. Realtime, localization, RTL, and accessibility

The State change job schedules only after persistence succeeds, sends the `states` realtime resource, and uses `/basic-data/states` notification actions. Both clients invalidate the States prefix and the Expo notification mapper resolves the deep link to the States route. English and Arabic messages cover fields, validation, filters, lifecycle, empty/error/retry, report scope, and accessibility labels. Shared direction-aware layouts, safe areas, responsive cards, dialogs, tables, and labeled icon actions are used throughout.

## 9. State-specific report decision

No State report template or report-catalog endpoint exists in `CrystalReportGeneratorApi`; only Countries report assets are present. Therefore browser and mobile Report modes truthfully render the current server page and state its current-row/total scope. They do not pretend to produce a global or PDF report. Adding a State PDF/export report requires an explicit report-template and Report API contract.

## 10. Verification and remaining review work

Run API build/tests, web architecture/type/lint/test/build gates, mobile check, documentation check, link check, and `git diff --check`. Manual release verification still requires browser and device runs covering direct route navigation, phone/tablet, EN/AR, RTL/LTR, text scale, keyboard, permission/read-only, loading/error/empty, archive dependency errors, restore under archived parent, bulk actions, and realtime refresh.
