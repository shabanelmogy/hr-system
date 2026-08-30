# Districts Feature — Full Cross-Platform Review

## 1. Purpose and scope

Districts is global Platform geographical reference data below an active State and is managed only by `super_admin` with the applicable District permission. It is implemented in the API, Next.js, and Expo clients. Its fields are `NameAr`, `NameEn`, `Code`, and required `StateId`; it is not a copy of Countries or States and has no country, currency, or telephone fields. Web and mobile imports resolve the parent from a `stateName` spreadsheet column without adding that display-only field to the domain.

## 2. Audited baseline

The pre-refactor API used `IDistrictService` with an unpaged controller. The browser list filtered and sorted local data, and Expo had no Districts route or feature. The refactor moves current paths to feature-owned CQRS reads/writes, server-managed lists, lifecycle actions, and a direct mobile route. The old service is retained only as unused compatibility code pending a separately audited removal.

## 3. Domain and ownership decisions

Districts are global data. Create, update, and restore require an active parent State. Names are trimmed printable Unicode display names of 2-100 characters; spaces, digits, and punctuation are allowed, while control characters and line breaks are rejected. Code is normalized (trimmed; uppercased), restricted to 2-10 ASCII letters, digits, or hyphens, and all three values are unique within `StateId`. An active Address blocks archive and bulk archive. A same-parent rename/code edit is allowed, but moving a District to another State is rejected while it has an active Address. Reparenting locks both old and requested State resources and retries if the parent changes while locks are acquired. The State lifecycle resource is locked by all participating District lifecycle mutations to prevent parent/child races. Address may reference a District optionally, and the API validates the complete Country -> State -> District relationship when it is supplied.

## 4. API contract

`/api/v1/districts` provides paged reads, lookup and by-state lookup, detail, addresses detail, create, atomic bulk create, update, archive, bulk archive, and restore. `POST /bulk` accepts the named `{ districts: [...] }` envelope under `Districts:Create`, validates at most 100 rows, active parent States, and field-scoped case-insensitive uniqueness within State, then returns `201 { createdCount }`. Reads accept bounded paging, District-only search fields (`all`, Arabic name, English name, code, State), six search operators, `active|archived|all`, State and address-presence filters, and allow-listed sorting. Mutation commands validate permissions, persistence conflicts, audit records, post-commit notifications, and SignalR `districts` invalidation. Managed Crystal reporting owns the District dataset; no legacy District report endpoint is added.

## 5. Browser implementation

The canonical browser route is `/super-admin/geography/districts`.

The Next.js route composes one server-list controller with the shared feature header, breadcrumb, aligned toolbar, Grid Options, Grid/Card/Chart/Report/Import modes, form, archive/restore/bulk dialogs, pagination, and current-page charts. The Add/Edit District State selector uses the localized `districts.state` and `districts.selectState` keys in both English and Arabic. Development forms can use the shared mock-data footer action to fill a District sample with an active State without submitting. Import parses a bounded XLSX locally, resolves active State names through the public States lookup, previews row status, and sends one atomic named JSON request. Report selects runnable published `districts` catalog entries and renders them through the shared managed Crystal viewer with bounded District/State filters.

## 6. Mobile implementation

Expo has a guarded `/basic-data/geographical-information/districts` route. It uses runtime-validated API transport, the shared server list state, native Table/Cards/Chart/Report/Import views, a modal filter button for column/condition/status, State lookup form, permissions/read-only controls, archive/restore/bulk actions, translations, RTL, realtime cache invalidation, and notification deep links. Its development form can use the shared non-submitting mock-data action, enabled only after the active State lookup is ready. Import uses the shared bounded native XLSX picker/parser and State lookup before the same atomic `{ districts }` request. Report uses the shared managed catalog/render client and securely cached PDF open/print/share behavior.

## 7. Intentional platform differences

Both clients support five views: desktop uses Grid, Cards, Chart, Report, and Import; mobile uses Table, Cards, Chart, Report, and Import. Grid versus Table is the intentional platform-native presentation difference. Both chart visualizations use the loaded server page and display the server total separately. Both Import views enforce the same headers, limits, dependency resolution, duplicate scope, permissions, atomic envelope, and uncertain-result reconciliation; both Report views use the same managed `districts` catalog, localized names, approved filters, and render endpoint.

## 8. Accessibility, localization, and responsiveness

All interactive actions use shared labeled controls and dialogs. The browser retains responsive Grid/Card layouts, keyboard-operable menu controls, focus-safe dialogs, and RTL translations. The mobile screen uses semantic labels on row/card actions, touch-sized controls, the shared filter modal, and English/Arabic translation parity.

## 9. Evidence and required files

The final evidence surface is `documentation/system/features/districts/required-files.json`. It names API contracts, CQRS handlers/stores/controller/job/tests, Next.js transport/list/UI/locales, Expo route/transport/screen/locales, shared integration registries, and the four Districts canonical profiles.

## 10. Handoff and remaining decisions

Required runtime work implements the approved Import and Report contracts on web and mobile and remains subject to the manual gates recorded in the review artifact. Deployment must still upload/publish a compatible District `.rpt` version and grant managed Run access before either client can receive a runnable catalog item.
