# Company Geographic Scope API Implementation Profile

## 1. Exact Source Inventory

The slice lives under `OrganizationalStructure/CompanyGeographicScope` in Application, Infrastructure, and API. Its domain link is `CompanyCountry`, its EF configuration is `CompanyCountryConfiguration`, and the current checked-in schema source is `20260826095902_createdatabase`.

## 2. Domain Contract

`CompanyCountry` inherits `CompanyAuditableEntity` and owns `CountryId` plus `IsDefault`. Construction requires a positive Country ID. Activation restores a historical soft-deleted link; removal is represented by soft deletion. `Company.RegistrationCountryId` independently references the global Country catalog and represents legal registration rather than an operating default.

## 3. Persistence Contract

`CompanyCountries` has a restrictive Country FK, a unique `(TenantId, CompanyId, CountryId)` index, and a filtered unique active-default index on `(TenantId, CompanyId)`. `Companies.RegistrationCountryId` has its own restrictive Country FK and lookup index. Standard company and tenant query filters provide isolation.

## 4. Read Contract

`GetCompanyGeographicScopeQuery` requires a trusted current tenant and company. The store loads the current Company's nullable `RegistrationCountryId`, loads all active global Countries ordered by English name then ID, and overlays current-company `IsSelected`, `IsRegistrationCountry`, and `IsDefault` flags.

## 5. Write Contract

`UpdateCompanyGeographicScopeCommand` accepts 1-100 distinct positive Country IDs, one selected legal registration Country, and one selected default operating Country. The handler validates the actor context, requires both special Countries to be members of the selection, and validates every Country is active before mutation.

## 6. Atomicity and Concurrency

The handler uses the application lock `company-geographic-scope:{tenantId}:{companyId}`. Under that lock it rejects a proposed selection that excludes a Country used by any active Address in the current company. It then clears the old default and saves before replacement so the filtered unique index remains valid, replaces links, updates `Company.RegistrationCountryId`, and saves within the command transaction. Address create/update/restore acquire the same scope resource, preventing a concurrent address write from escaping this check.

## 7. Validation and Errors

Missing actor company context fails closed with the stable forbidden error. Missing/inactive Country IDs and removal of a Country used by an active company Address return stable conflicts. FluentValidation rejects empty, excessive, duplicate, non-positive, or inconsistent registration/default selections with localized EN/AR messages.

## 8. HTTP and Authorization

The versioned controller exposes GET and PUT at `/api/v1/company-geographic-scope`, requires an active tenant member, and applies `CompanyGeographicScope:View` or `CompanyGeographicScope:Manage`. It accepts no tenant/company route, query, or body field. Read-only middleware blocks PUT.

## 9. Composition and Migration

`ApplicationDbContext` exposes `Companies` and `CompanyCountries`; `EntitiesService` registers
`ICompanyGeographicScopeStore`, and `ErrorsService` registers
`CompanyGeographicScopeErrors` for both MediatR handlers. The additive migration
contains the table/indexes in the current development schema. A dedicated
additive migration adds nullable `Companies.RegistrationCountryId`, a restrictive
Country FK/index, and a deterministic backfill from the active default
CompanyCountry only. Rows without a defensible active default remain null until
the first authorized scope save; runtime writes require the field.

## 10. Verification

`CompanyGeographicScopeTests` covers registration membership validation, exact
controller command forwarding, separate registration/default persistence and
projection, restrictive FK/index metadata, safe migration backfill SQL,
Country lifecycle dependency detection, and active-Address scope-removal
protection. Existing Platform authorization and
controller contract suites retain the route/permission boundary.

## 11. Consumer Rules

Operating-address consumers query this aggregate. A Branch may choose any enabled Country and any valid child State/District independently of other branches. Company statutory consumers use `RegistrationCountryId`; operating-address defaults use `DefaultCountryId`. Nationality consumers must query the global active Country catalog instead. The shared Address write boundary already enforces active operating scope and geographic hierarchy; future owner-link workflows add ownership and purpose policy rather than reimplementing those checks.

Standalone Work Location, branch/location target-population authorization, and
effective-dated CompanyCountry/BranchAddress assignments remain Deferred until an
owned runtime workflow exists. Branch already has independent lifecycle dates and
Address ownership links, so no unused placeholder aggregate is introduced.

Global Country/State/District CRUD is not a tenant capability. Those controllers
require the `super_admin` role plus their action permission. Permission ownership
transfer must be delivered as a reviewed additive migration before production.
