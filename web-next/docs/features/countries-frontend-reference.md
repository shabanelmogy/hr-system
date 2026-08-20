# Countries Applied Feature Profile

Status: Applied example for the [Server-Managed Feature Frontend Reference](server-managed-feature-reference.md).

This document records only the Countries-specific contract and decisions. The
general architecture, implementation sequence, state rules, error behavior,
accessibility requirements, and test matrix live in the general reference and
must not be duplicated here.

## Feature Profile

| Decision | Countries value |
|---|---|
| Owner | `basic-data/geographical-information/countries` |
| Public route | `/basic-data/countries` |
| Identifier | integer `id` |
| Permission resource | Countries |
| Lifecycle | active, archived, restore supported |
| Default page | zero-based UI page `0` |
| Default page size | `10` |
| Default sort | `createdOn DESC` |
| Default status | `active` |
| Required view | Grid |
| Optional views | Cards, page-scoped Chart, Report, Import |
| Cross-feature consumer | States uses the active-country lookup |

`createdOn DESC` deliberately places a newly created country at the top after
the mutation invalidates the feature query and the server list refetches. Reset
restores this same order. Users can still change the sort from Grid or Card
controls.

## HTTP Contract

The list request supports:

- `pageNumber` and `pageSize`;
- debounced `search`;
- `status`: `active`, `archived`, or `all`;
- exact, normalized `currencyCode` when it contains three letters;
- optional `hasStates`;
- allow-listed `sortBy` and `sortDirection`.

Country transport types remain separate:

- `CountryListItem` for paged list rows, including `statesCount`;
- `CountryDetail` for view/edit;
- `CountryLookup` for active selectors;
- `CreateCountryRequest` for create/update bodies without route IDs;
- `CountryPageQuery` and `CountryPageResponse` for the server list boundary.

Supported lifecycle operations are create, update, archive, bulk archive, and restore.
Import uses the atomic bulk-create endpoint. Grid bulk archive sends only explicitly
selected active IDs to `POST /countries/bulk-archive`; selection is limited to the
loaded page and is cleared after success or a criteria/page change. Successful mutations invalidate the
Countries query-key prefix so list, details, and lookup data remain coherent.

## Countries-Specific Rules

- Empty optional form codes are normalized to `null` at the service boundary.
- Country codes and currency codes are trimmed and uppercased once.
- A one- or two-letter currency filter stays visible in the UI but is not sent
  until it is exactly three letters.
- Archived countries cannot be edited or archived again; they may be viewed or
  restored with the required permission.
- States imports Countries only through its deliberate public API and consumes
  the active lookup, not internal feature modules.
- Chart data describes only the loaded server page. Global analytics require a
  dedicated aggregate endpoint.
- Report criteria are independent unless the report API explicitly supports the
  same list filters.
- Mock form values are development-only and never auto-submit.

## Permission Matrix

| Action | Permission | Record state | Allowed in read-only mode |
|---|---|---|---|
| View | `Countries:View` | active or archived | yes |
| Create | `Countries:Create` | n/a | no |
| Edit | `Countries:Edit` | active | no |
| Archive | `Countries:Delete` | active | no |
| Bulk archive | `Countries:Delete` | explicitly selected active rows | no |
| Restore | `Countries:Delete` | archived | no |
| Import | `Countries:Create` | n/a | no |

Authorization and application read-only state are checked separately in direct
handlers. The API remains the final authorization boundary.

## Relevant Implementation Files

- `hooks/useCountryGridLogic.ts`: feature controller and configured list defaults;
- `hooks/useCountryQueries.ts`: query keys, queries, mutations, invalidation;
- `services/countryService.ts`: HTTP boundary and request normalization;
- `utils/countryPageQuery.ts`: UI-state to HTTP-query mapping;
- `utils/countryPermissions.ts`: permission and lifecycle rules;
- `types/Country.ts`: transport, form, and list types;
- `components/`: Grid, Cards, optional views, forms, and dialogs.

When building the next feature, start from the general reference. Use this file
only to see one completed configuration, not as a reason to copy Countries-only
filters, optional views, permissions, or routes.
