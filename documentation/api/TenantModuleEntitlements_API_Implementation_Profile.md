# Tenant module entitlements API implementation profile

## 1. API responsibility

The HR module exposes the installed and accessible catalogs and owns tenant
entitlement persistence. Module implementations own only their definitions.

## 2. Installed catalog endpoint

GET /api/v1/modules/installed requires super_admin and returns module code,
name, isDefault, submodules, required permissions, and entry paths.

## 3. Accessible catalog endpoint

GET /api/v1/modules/accessible requires an authenticated user with tenant
context. It intersects stored tenant grants with the user's database-backed
role permissions and returns only reachable modules and submodules.

## 4. Tenant request contract

Create and update accept entitlements: [{ moduleCode, submoduleCodes }].
Codes must be unique, lower-case catalog identifiers. Unknown modules or
submodules fail validation.

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

## 6. Domain and validation

Domain constructors require non-empty tenant and capability codes and normalize
codes to lower case. FluentValidation checks code syntax, maximum length, and
duplicate module or submodule entries before the service validates catalog
membership.

## 7. Persistence algorithm

TenantModuleEntitlementService.ApplyAsync calculates the desired set, removes
only missing rows, and inserts only new rows. This prevents the previous
delete-all/reinsert behavior and preserves unrelated HR submodules when
Accounting is added.

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

Migration 20260909122310_AddTenantModuleEntitlements creates both tables in
hr, seeds existing tenants with all current HR submodules, and uses cascading
foreign keys. It was applied through ApplicationDbContext.

## 10. Tests and diagnostics

TenantUserFoundationTests verifies that adding Accounting alongside HR
preserves HR submodule rows. ModuleSchemaTests distinguishes tables created
after the schema-move migration from tables that migration had to move.

## 11. Extension rule

New modules register a ModuleDefinition; no central switch is needed. Marking a
module IsDefault affects new-tenant defaults only. New tenant permissions must
map to exactly one submodule so enforcement remains deterministic.
