# Company Geographic Scope API Implementation Profile

## 1. Exact Source Inventory

The slice lives under `OrganizationalStructure/CompanyGeographicScope` in Application, Infrastructure, and API. Its domain link is `CompanyCountry`, its EF configuration is `CompanyCountryConfiguration`, and the current checked-in schema source is `20260826095902_createdatabase`.

## 2. Domain Contract

`CompanyCountry` inherits `CompanyAuditableEntity` and owns `CountryId` plus `IsDefault`. Construction requires a positive Country ID. Activation restores a historical soft-deleted link; removal is represented by soft deletion.

## 3. Persistence Contract

`CompanyCountries` has a restrictive Country FK, a unique `(TenantId, CompanyId, CountryId)` index, and a filtered unique active-default index on `(TenantId, CompanyId)`. Standard company and tenant query filters provide isolation.

## 4. Read Contract

`GetCompanyGeographicScopeQuery` requires a trusted current tenant and company. The store loads all active global Countries ordered by English name then ID and overlays current-company `IsSelected` and `IsDefault` flags.

## 5. Write Contract

`UpdateCompanyGeographicScopeCommand` accepts 1-100 distinct positive Country IDs and one selected default. The handler validates the actor context and every Country before mutation.

## 6. Atomicity and Concurrency

The handler uses the application lock `company-geographic-scope:{tenantId}:{companyId}`. It clears the old default and saves before replacement so the filtered unique index remains valid, then replaces links and saves within the command transaction.

## 7. Validation and Errors

Missing actor company context fails closed with the stable forbidden error. Missing/inactive Country IDs return a stable conflict. FluentValidation rejects empty, excessive, duplicate, non-positive, or inconsistent default selections with localized EN/AR messages.

## 8. HTTP and Authorization

The versioned controller exposes GET and PUT at `/api/v1/company-geographic-scope`, requires an active tenant member, and applies `CompanyGeographicScope:View` or `CompanyGeographicScope:Manage`. It accepts no tenant/company route, query, or body field. Read-only middleware blocks PUT.

## 9. Composition and Migration

`ApplicationDbContext` exposes `CompanyCountries`; `EntitiesService` registers
`ICompanyGeographicScopeStore`, and `ErrorsService` registers
`CompanyGeographicScopeErrors` for both MediatR handlers. The additive migration
contains the table/indexes in the current development schema. A dedicated
additive backfill/permission migration is not present in this checkout; any
production rollout must create and review that migration before enabling the
feature for existing databases.

## 10. Verification

No dedicated `CompanyGeographicScopeTests` or Platform authorization test file
is present in this checkout. The feature remains covered by source-level API
and client checks only; dedicated handler, migration, and authorization tests
are an explicit remaining verification gap before production.

## 11. Consumer Rules

Operating-address consumers query this aggregate. A Branch may choose any enabled Country and any valid child State/District independently of other branches. Nationality consumers must query the global active Country catalog instead. Server-side Branch/Address validation is required when those workflows are added.

Global Country/State/District CRUD is not a tenant capability. Those controllers
require the `super_admin` role plus their action permission. Permission ownership
transfer must be delivered as a reviewed additive migration before production.
