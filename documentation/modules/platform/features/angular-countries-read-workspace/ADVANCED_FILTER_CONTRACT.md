# Countries native advanced column filters — authorized extension

Requester2026-10-30 requires the actual PrimeNG filter menu: opaque themed surface,
Match all/any, match mode per rule, Add rule, Clear and Apply. UI uses the native
ColumnFilter, not a parallel dialog. No current-page filtering or ignored conditions.

## Existing-system relationship and ownership

Extend ReferenceData Countries' existing CQRS list query/read store. Global data,
super_admin plus Countries:View; unchanged soft-delete/status policy, projection,
page limits, stable sort and total-before-paging semantics. No entity/schema/write,
tenant payload, permissions or lifecycle changes. Existing GET clients remain
compatible. Native clients retain their current GET workflow; the additional
Angular query surface does not require a new native editor or structured entity.

## Exact transport and rules

Add POST /api/v1/countries/query for read-only bounded structured criteria; GET
remains available. POST avoids IIS query-string length limits for combined rules.
Use the existing GetCountriesQuery through ISender and ICountryReadStore, with
optional typed filters. Maximum11 unique allowlisted fields and4 rules per field,
AND between fields, AND/OR within a field. No arbitrary nested expression or code.

Fields: id/statesCount integers; nameAr/nameEn/alpha2Code/alpha3Code/phoneCode/
currencyCode text (1..200 nonblank); createdOn/updatedOn ISO calendar dates;
isDeleted Boolean. Modes are type-appropriate native PrimeNG modes. Reject the
entire malformed/unknown/duplicate/type-mismatched/unbounded group with400.
Preserve false/zero. Match text case-insensitively and trim like existing search.
Date comparisons use whole UTC calendar-day boundaries, including nullable
updatedOn and maximum day. statesCount counts active child States only.

Legacy search/status/currency/hasStates criteria remain independent AND conditions.
Filters are applied before Count/Skip/Take in the owning EF query. Browser advanced
POST uses secure Cookies and existing CSRF transport, no bearer and no write replay.
No fallback that drops an unsupported structured filter. Hosted publication is a
separate required test-host integration step; local source is not host deployment.

## Edge/impact/verification matrix

Unknown field/mode, duplicate fields, >4 rules, wrong JSON value type, bad date,
oversized body, blank/overlength text, zero/false, nullable negatives, AND/OR and
combined paging/count must have executable proof. Keep role/permission attributes
and test controller dispatch. Verify SQL translation without constructing raw SQL.
Application owns validation, Infrastructure owns EF expressions, feature service
owns wire conversion, state owns query revision and cancellation; shared Grid
continues to own the native menu and generic typed callbacks only.

Update the canonical Countries API/review/Web/Mobile books and manifests, as well
as this migration child. Current Next/native GET consumers are intentionally
retained; native advanced-query UI is Excluded from Angular migration. No migration
is created because no persistence model changes. Full Countries acceptance still
requires all five Views/actions and actual deployed API/catalog verification.
