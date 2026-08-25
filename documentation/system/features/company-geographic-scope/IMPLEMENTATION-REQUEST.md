# Company Geographic Scope Implementation Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Company Geographic Scope` (`company-geographic-scope`) |
| Operating mode | `new feature` |
| Applied reference | `countries` for verification discipline; ownership is re-decided as company scope |
| Request date | `2026-08-25` |
| Review artifact | `documentation/system/features/company-geographic-scope/COMPANY_GEOGRAPHIC_SCOPE-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/company-geographic-scope/required-files.json` |

## Execution request

Implement the first additive Company Geographic Scope slice across API, Next.js,
Expo, and the centralized documentation system. Preserve the global
Country -> State -> District catalog. Do not add `TenantId` or `CompanyId` to those
master entities and do not touch `graphify-out`.

The slice owns current-company allowed countries and one default country. State and
District availability is derived from each selected Country. Global Country, State,
and District catalog administration belongs exclusively to `super_admin` under
Platform routes; tenant administrators configure only the current company's scope.

This scope represents operating/address geography only. Employee nationality is a
separate global-reference concern and must continue to offer every active Country,
regardless of the current company's operating-country selection.

Each Branch owns its own Address and may select any State/District beneath any
Country enabled for the company. `DefaultCountryId` is only an initial-entry
convenience; it does not force all branches into one Country, State, or District.

## Frozen product decisions

| Concern | Required decision |
| --- | --- |
| Ownership and scope | Company-owned `CompanyCountry`; trusted `TenantId` and `CompanyId` come only from `ICurrentActor` and EF scope filters. Global geography remains unscoped. |
| Nationality boundary | Employee nationality is never filtered by `CompanyCountry`; it reads the complete active global Country catalog. |
| Branch boundary | Every Branch selects its own allowed address hierarchy. The company default Country is not a branch-location restriction. |
| Fields and relationships | `Id`, inherited tenant/company/audit fields, required `CountryId`, `IsDefault`; unique company/country link and at most one active default. |
| Permissions and read-only | `CompanyGeographicScope:View` and `CompanyGeographicScope:Manage`; tenant read-only blocks PUT before permission feedback. |
| Read contract | One aggregate, not a paged list: every active Country with `IsSelected`/`IsDefault`, sorted by English name then ID. |
| Write contract | Replace selected Country IDs atomically; 1-100 distinct active IDs; default is required and must be selected. No client-owned company or tenant ID. |
| Lifecycle | Link rows are activated/deactivated by replacement. There is no public archive/restore or bulk endpoint. Existing-company migration backfills every active Country without guessing a default. |
| Web views | Configuration form Required. Grid, Cards, Chart, Report, Import, and Export Excluded because this is not a collection-management feature. |
| Mobile views | Native configuration screen Required. Table, Cards, Chart, Report, Import, and Export Excluded for the same reason. |
| Reporting | Excluded; the feature configures visibility and owns no reportable business aggregate. |
| Import | Excluded on web and mobile; global master catalog Import remains owned by Countries/States. |
| Realtime and notifications | Notifications Excluded. Realtime Deferred until a second current-company consumer needs cross-session live refresh; save invalidates the feature query and company switching clears caches. |

## API wire contract

```http
GET /api/v1/company-geographic-scope
PUT /api/v1/company-geographic-scope
```

```json
{
  "countryIds": [65, 194],
  "defaultCountryId": 65
}
```

The response contains the current `companyId`, nullable `defaultCountryId`, and
all active global Countries with `id`, localized names/codes, `isSelected`, and
`isDefault`. PUT returns the saved aggregate. Validation failures are 400;
missing/inactive countries and concurrency conflicts are stable 409 responses.

## Required implementation

- API: company-owned entity/configuration, additive/backfill migration, CQRS
  query/command, application store contract, infrastructure store, thin
  versioned controller, permissions, stable errors, authorization, and tests.
- Next.js: thin route, runtime-safe service types, React Query hook, compact
  responsive selection form, permission/read-only guards, EN/AR, RTL, and tests.
- Expo: thin guarded route, Zod response schema, query/mutation hooks, native
  multi-select/default select screen, permission/read-only guards, EN/AR, RTL,
  accessibility, and tests.
- Platform catalog ownership: restrict Country/State/District APIs to `super_admin`
  plus their action permissions, transfer those permissions idempotently, expose
  Platform routes in both clients, and remove tenant catalog navigation/access.
- Documentation: four applied profiles, completed evidence ledger, final manifest,
  feature-scoped recipes and phases after runtime evidence exists.

## Verification and handoff

Run focused API tests plus solution build/test, web architecture/type/strict/lint/
tests/build, mobile `npm run check`, documentation generation/check, and
`git diff --check`. Record manual release checks separately. Apply the catalog
permission-transfer migration before using the new Platform routes, then refresh
the `super_admin` session claims.
