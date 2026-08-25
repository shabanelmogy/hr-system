# Company Geographic Scope API Implementation Profile

## 1. Exact Source Inventory

The slice lives under `OrganizationalStructure/CompanyGeographicScope` in Application, Infrastructure, and API. Its domain link is `CompanyCountry`, its EF configuration is `CompanyCountryConfiguration`, and its migration is `20260825072312_AddCompanyGeographicScope`.

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
creates the table/indexes, backfills all active Countries for existing active
Companies without a default, and inserts both permissions for system Admin roles
idempotently. Applying the migration is an explicit deployment action.

## 10. Verification

`CompanyGeographicScopeTests` covers serialization/lock order,
validation-before-mutation, missing company context, validator rules, migration
backfill/permission SQL, reselecting a soft-deleted link without violating
uniqueness, and resolving the feature error dependency from the production DI
registration. Platform authorization tests cover role-plus-permission guards and
permission ownership. The API project builds successfully and the full API test
project passes 352/352.

## 11. Consumer Rules

Operating-address consumers query this aggregate. A Branch may choose any enabled Country and any valid child State/District independently of other branches. Nationality consumers must query the global active Country catalog instead. Server-side Branch/Address validation is required when those workflows are added.

Global Country/State/District CRUD is not a tenant capability. Those controllers
require the `super_admin` role plus their action permission; an idempotent data
migration owns transferring the catalog permission claims to that system role.
