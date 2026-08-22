# Countries API — Canonical Frontend Contract

Countries is the reference implementation for basic-data modules that need CQRS, server-side lists, archive/restore, lookup endpoints, and permission-aware UI.

- Base URL: `/api/v1/countries`
- Authentication: JWT bearer token and active tenant membership
- Content type for writes: `application/json`
- IDs are integers
- Query validation failures return `400`
- Duplicate feature checks return `409` with code `Country.Duplicated`
- A database uniqueness race returns `409` with code `UniqueConstraintViolation`

## Permissions

| Operation | Permission |
| --- | --- |
| Read page, lookup, detail, states | `Countries:View` |
| Create and bulk create | `Countries:Create` |
| Update | `Countries:Edit` |
| Archive, bulk archive, and restore | `Countries:Delete` |

## Endpoints

| Method | Path | Success | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/countries` | `200` | Server-paged management list |
| `GET` | `/api/v1/countries/lookup` | `200` | Lightweight active-country selector data |
| `GET` | `/api/v1/countries/{id}` | `200` | Detail, including archived records, without states |
| `GET` | `/api/v1/countries/{id}/states` | `200` | Country with its active states |
| `POST` | `/api/v1/countries` | `201` | Create one country |
| `POST` | `/api/v1/countries/bulk` | `201` | Atomically create multiple countries |
| `PUT` | `/api/v1/countries/{id}` | `200` | Update one active country |
| `DELETE` | `/api/v1/countries/{id}` | `204` | Archive one active country |
| `POST` | `/api/v1/countries/bulk-archive` | `200` | Atomically archive up to 100 countries |
| `POST` | `/api/v1/countries/{id}/restore` | `204` | Restore one archived country |

There is deliberately no count endpoint and no toggle-delete operation. Page metadata contains `totalCount`, and lifecycle transitions are explicit archive/restore commands.

## Management page query

`GET /api/v1/countries`

| Query | Default | Rules |
| --- | --- | --- |
| `pageNumber` | `1` | Minimum `1` |
| `pageSize` | `10` | `1..5000`; values above normal UI page sizes support bounded adaptive client pagination |
| `search` | — | Optional; maximum 200 characters |
| `searchField` | `all` | `all`, `nameAr`, `nameEn`, `alpha2Code`, `alpha3Code`, `phoneCode`, or `currencyCode` |
| `searchOperator` | `contains` | `contains`, `doesNotContain`, `equals`, `doesNotEqual`, `startsWith`, or `endsWith` |
| `status` | `active` | `active`, `archived`, or `all` |
| `currencyCode` | — | Optional exact three-letter code; normalized uppercase |
| `hasStates` | — | Optional boolean; counts active states |
| `sortBy` | `nameEn` | `nameEn`, `nameAr`, `alpha2Code`, `alpha3Code`, `currencyCode`, or `createdOn` |
| `sortDirection` | `asc` | `asc` or `desc` |

Example:

```http
GET /api/v1/countries?pageNumber=1&pageSize=10&search=egy&searchField=nameEn&searchOperator=contains&status=active&currencyCode=EGP&hasStates=true&sortBy=nameEn&sortDirection=asc
```

```json
{
  "items": [
    {
      "id": 1,
      "nameAr": "مصر",
      "nameEn": "Egypt",
      "alpha2Code": "EG",
      "alpha3Code": "EGY",
      "phoneCode": "20",
      "currencyCode": "EGP",
      "statesCount": 2,
      "createdOn": "2026-08-19T10:00:00Z",
      "updatedOn": null,
      "isDeleted": false
    }
  ],
  "metaData": {
    "currentPage": 1,
    "totalPages": 1,
    "pageSize": 10,
    "pageNumber": 1,
    "totalCount": 1,
    "hasPrev": false,
    "hasNext": false
  }
}
```

Search is case-insensitive. With `searchField=all`, positive operators match
when any searchable field matches; negative operators match only when every
searchable field does not match. Null optional codes count as non-matches. A
field-specific search evaluates only the selected field. Search is always
executed by the server before count and paging.

## Lookup

`GET /api/v1/countries/lookup` returns active countries only and is the endpoint to use in selectors such as the State form.

```json
[
  { "id": 1, "nameAr": "مصر", "nameEn": "Egypt", "isDeleted": false }
]
```

Do not load the management page and reshape it client-side for a selector.

## Detail and states

`GET /api/v1/countries/{id}` returns `CountryDetailResponse`. It can return an archived record and does not load states.

`GET /api/v1/countries/{id}/states` returns `CountryResponse`. The country itself may be active or archived; its `states` array contains active states only.

Both return `404` with code `Country.CountryNotFound` when the requested resource is unavailable for that endpoint.

## Create and update body

Create and update use the same mutable fields, but remain separate transport contracts. The update ID belongs in the route, never in the JSON body.

```json
{
  "nameAr": "مصر",
  "nameEn": "Egypt",
  "alpha2Code": "EG",
  "alpha3Code": "EGY",
  "phoneCode": "20",
  "currencyCode": "EGP"
}
```

- `nameAr`: required, trimmed, 2–100 Arabic letters/spaces
- `nameEn`: required, trimmed, 2–100 English letters/spaces
- `alpha2Code`: optional, exactly 2 letters, stored uppercase
- `alpha3Code`: optional, exactly 3 letters, stored uppercase
- `phoneCode`: optional, 1–10 characters; digits with an optional leading `+`
- `currencyCode`: optional, exactly 3 letters, stored uppercase
- Empty optional strings are normalized to `null`
- Name and ISO-code uniqueness is checked before persistence; database constraints remain the final race-safe guard

Create returns `201 Created`, a `Location` header pointing to `GET /{id}`, and `CountryDetailResponse`. Update returns the same detail shape with `200 OK`.

## Bulk create

`POST /api/v1/countries/bulk`

```json
{
  "countries": [
    {
      "nameAr": "مصر",
      "nameEn": "Egypt",
      "alpha2Code": "EG",
      "alpha3Code": "EGY",
      "phoneCode": "20",
      "currencyCode": "EGP"
    }
  ]
}
```

Success is `201`:

```json
{ "createdCount": 1 }
```

The request accepts 1–100 countries. The command is atomic: validation or duplicate
failure prevents the whole batch from being committed.

## Archive and restore

- `DELETE /api/v1/countries/{id}` archives an active country and returns `204`.
- `POST /api/v1/countries/{id}/restore` restores an archived country and returns `204`.
- Archive returns `400` with code `Country.CountryInUseByState` if active state dependencies block it.
- Missing resources return `404` with code `Country.CountryNotFound`.
- The frontend must show archive and restore as separate, explicit actions; it must not infer a toggle.

### Bulk archive

`POST /api/v1/countries/bulk-archive`

```json
{ "ids": [1, 2, 3] }
```

The collection must contain 1–100 distinct positive IDs. Success is `200`:

```json
{ "archivedCount": 2 }
```

Bulk archive is all-or-nothing. A missing requested ID returns
`Country.CountryNotFound`; an active state dependency on any active requested
country returns `Country.CountryInUseByState`; neither failure changes any country.
Already archived requested countries are idempotent and are not included in
`archivedCount`. The API saves all active requested countries once and emits one
post-commit `BulkArchive` change event.

### Lifecycle matrix

| Operation | Active | Archived | Missing |
| --- | --- | --- | --- |
| Management page | Included by `active`/`all` | Included by `archived`/`all` | n/a |
| Lookup | Returned | Hidden | n/a |
| Detail / detail with states | Returned | Returned | `404` |
| Update | Updated | `404` | `404` |
| Archive / bulk archive | Archived | Idempotent | `404` |
| Restore | Idempotent | Restored | `404` |

## Frontend rules

1. Keep management lists server-paged, server-sorted, and server-filtered.
2. Use the page response `totalCount`; do not add a count request.
3. Use `/lookup` for selectors.
4. Use `/{id}` for view/edit hydration and `/{id}/states` only when the relation is needed.
5. After a mutation, invalidate/refetch the countries query family. Realtime is an invalidation hint, not an entity payload cache.
6. Enforce permissions in both visibility and direct event handlers.
7. Treat archived records as read-only except for restore.

## Stable error cases

| Status | Code | Meaning |
| --- | --- | --- |
| `400` | validation problem | Invalid query/body |
| `400` | `Country.NoCountriesProvided` | Empty bulk request |
| `400` | `Country.CountryInUseByState` | Archive blocked by active states |
| `400` | validation problem | Bulk IDs empty, non-positive, duplicated, or over 100 |
| `404` | `Country.CountryNotFound` | Country unavailable for the operation |
| `409` | `Country.Duplicated` | Feature-level duplicate detected |
| `409` | `UniqueConstraintViolation` | Database uniqueness race detected |
| `401` | — | Missing/invalid authentication |
| `403` | — | Tenant membership or permission denied |

## Reference source

- Controller: `api/HrManagementSystem.Api/Features/GeographicalInformation/Countries/V1/CountriesController.cs`
- Commands/queries: `api/HrManagementSystem.Application/Features/GeographicalInformation/Countries`
- Mapster configuration: `api/HrManagementSystem.Application/Features/GeographicalInformation/Countries/Mapping/CountryMappingConfig.cs`
- Web implementation: `web-next/src/features/basic-data/geographical-information/countries`
- Cross-feature guide: `documentation/project/CORE_FEATURE_CQRS_WEB_GUIDE.md`
- [Applied API implementation profile](../../Countries_API_Implementation_Profile.md)
- [Full API/web/mobile review](../../../project/COUNTRIES_FEATURE_FULL_REVIEW.md)
