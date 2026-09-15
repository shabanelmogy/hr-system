# Tenant module entitlements API implementation profile

## 1. API responsibility

The Platform module exposes the installed and accessible catalogs and owns tenant
entitlement persistence in `PlatformDbContext` under the `platform` schema.
Module implementations own only their definitions and public Contracts.

## 2. Catalog endpoints

GET /api/v1/modules/installed requires super_admin and returns module code,
name, isDefault, submodules, required permissions, and entry paths.

GET /api/v1/modules/tenant-entitlements requires super_admin and is the only
catalog used by tenant administration. It returns only user-visible modules
that allow tenant entitlements and only submodules whose access mode is
TenantEntitlement. Global submodules such as reference-data:geography and
tenant-scoped Platform capabilities are excluded and cannot be submitted as
commercial tenant grants.

## 3. Accessible catalog endpoint

GET /api/v1/modules/accessible requires an authenticated user with tenant
context. It intersects stored tenant grants with the user's database-backed
role permissions and returns only reachable modules and submodules.

## 4. Tenant request contract

Create and update accept entitlements: [{ moduleCode, submoduleCodes }].
Codes must be unique, lower-case catalog identifiers. Unknown modules or
submodules fail validation. Installed but non-assignable Global/Tenant
submodules fail with Tenant.InvalidEntitlement; the server never relies on
client-side filtering for this invariant.

## 4.1. Explicit authentication scope sequence

Authentication follows `credentials -> explicit tenant -> explicit company ->
session -> module launcher`. A non-empty tenant list always returns a
tenant-selection challenge, and a non-empty company list after `SelectTenant`
always returns a company-selection challenge, even when each list has exactly
one option. The API does not preselect an option or issue a session from a
single-tenant/single-company shortcut; normal access and refresh tokens are
issued only by `SelectCompany` after the single-use challenge is consumed.

## 5. Compatibility semantics

On create, an omitted entitlement list uses catalog defaults. On update, an
omitted list preserves the current subscription. An explicit list, including an
empty list, is authoritative and supports deliberate commercial revocation.
The current catalog defaults are HR and ReferenceData `addresses`; the
ReferenceData `geography` submodule is global and is excluded from tenant
entitlements. The opt-in preview bootstrap merges these defaults with existing
demo grants case-insensitively and never removes explicit module or submodule
grants.

## 6. Domain and validation

Domain constructors require non-empty tenant and capability codes and normalize
codes to lower case. FluentValidation checks code syntax, maximum length, and
duplicate module or submodule entries before the service validates catalog
membership.

## 7. Persistence algorithm

`PlatformContractSource.ApplyAsync` calculates the desired set, removes
only missing rows, and inserts only new rows. This preserves unrelated module
grants when a tenant adds or removes a capability.

## 8. Permission enforcement

`TenantMember` requires an authenticated non-super-admin principal with the
`admin` or `user` role and a complete execution scope: non-empty
`NameIdentifier`, `tenant_id`, `sid`, and `security_stamp` claims plus a
positive `company_id`. Bearer validation has already checked the current session,
security stamp, tenant membership/subscription, and company access against the
live store; the endpoint policy remains fail-closed for any principal that lacks
one of those coordinates.

PermissionAuthorizationHandler keeps platform permission behavior intact:
platform permissions succeed from an authenticated permission claim without
tenant entitlement checks. For catalog-resolved tenant permissions it rejects
super-admin principals, requires non-empty user and tenant claims and a positive
company scope, re-reads the role permission from SQL, resolves the permission to
one submodule, and checks the tenant grant. Unknown permissions fail closed.

## 9. Database migration

The Platform-owned migration creates both tables in `platform` with tenant and
module composite keys. The exact migration name is deployment-owned because
the development database is being regenerated per module.

## 10. Tests and diagnostics

TenantUserFoundationTests and PlatformScopeIsolationTests verify entitlement
ownership, tenant/company filters, and scope-safe writes. ModuleSchemaTests
verifies module schema declarations independently.

## 11. Extension rule

New modules register a ModuleDefinition; no central switch is needed. Marking a
module IsDefault affects new-tenant defaults (and additive preview bootstrap
reconciliation). New tenant permissions must
map to exactly one submodule so enforcement remains deterministic. A submodule
appears in tenant administration only when its PermissionAccessMode is
TenantEntitlement.
