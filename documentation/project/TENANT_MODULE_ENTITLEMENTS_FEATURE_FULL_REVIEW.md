# Tenant module entitlements cross-platform master review

## 1. Purpose

The feature separates the commercial subscription from operational RBAC. A
tenant buys modules and submodules; a user still needs the corresponding role
permission. The effective access set is the intersection of both.

## 2. Scope and ownership

Entitlements are tenant-owned because the subscription is sold to the tenant.
The selected company remains data scope only. Tenancy and identity currently
belong to HR, so persistence lives in the short hr schema.

## 3. Stable catalog

Every runtime module implements IModule.Definition. Codes are lower-case,
stable identifiers. HR uses hr; Accounting uses acc. The catalog validates
module names, unique codes, submodule metadata, entry paths, and one-to-one
permission ownership.

## 4. Persistence contract

hr.TenantModuleEntitlements owns module grants and
hr.TenantSubmoduleEntitlements owns submodule grants. Composite primary keys
prevent duplicates, and tenant-to-module-to-submodule foreign keys cascade.
The migration grants all current HR submodules to existing tenants.

## 5. Authentication and selection flow

The invariant is `credentials -> explicit tenant -> explicit company -> module
launcher -> module -> submodule`. Credentials or external login never select a
tenant automatically: every non-empty tenant list produces a tenant challenge,
including a one-tenant list. After the tenant is selected, every non-empty
company list produces a company challenge, including a one-company list. No
first option is preselected and no session is issued until `SelectCompany`
validates and consumes the single-use challenge. The launcher never changes
tenant or company context.

## 6. Authorization model

`TenantMember` is the shared tenant endpoint invariant. The principal must be
authenticated, must carry the `admin` or `user` role, must not be
`super_admin`, and must include non-empty `NameIdentifier`, `tenant_id`, `sid`,
and `security_stamp` claims with a positive `company_id`. JWT bearer validation
also checks the session, security stamp, tenant membership/subscription, and
company access against the live store, so a stale or cross-scope session is
rejected before the endpoint runs.

Catalog-resolved tenant permissions require the permission claim, non-empty user
and tenant claims, a positive company scope, a current matching database role
permission, and a matching tenant submodule grant. Platform permissions retain
claim-only behavior after authentication and are not tenant-entitlement gated.
Unknown permissions fail closed. Super administrators use platform routes and do
not receive tenant data access through the tenant permission handler.

Role and permission mutations use the HR module's SQL Server transaction boundary:
the role/claims, affected-user security-stamp and refresh-token invalidation,
and the security-audit record are committed together under a bounded hashed
tenant/role application lock. Realtime refreshes and session-revocation
Hangfire jobs are post-commit effects and are not emitted when the mutation or
its audit fails. Realtime and revocation delivery is best-effort after commit
and failures are logged; a transactional outbox remains required before adding
any critical external effect.

## 7. Client behavior

Web and mobile render an Odoo-inspired centered application grid using shared
components, localized names, stable codes, and themed icons. Module and
submodule route guards consume the accessible catalog. A submodule entry route
redirects to the first screen permitted by RBAC or shows a truthful empty state.
Launcher tiles keep their icon boxes top-aligned while labels wrap below them;
the primary application icons may use a larger glyph without changing the
shared tile baseline. The web top bar also exposes a shared, keyboard-accessible
application switcher beside the company switcher on desktop and as a compact
icon-only control on small screens. It always includes the applications
overview and only modules returned by the tenant-scoped accessible catalog.

## 8. Entitlement editing rules

A new tenant receives catalog-defined default modules; HR is currently the only
default. An explicit create list is authoritative. On update, omission preserves
stored entitlements, while an explicit list replaces them. Selecting Accounting
in either client preserves the existing HR entry and all selected HR submodules.

## 9. Verification evidence

The API solution builds with zero warnings, focused web and mobile entitlement
tests cover the HR-plus-Accounting regression, and both clients type-check.
The full API suite includes catalog, schema, and entitlement persistence checks.
Exact release-gate results are recorded in the feature review artifact.

## 10. Handoff decision

The entitlement foundation is ready for modular-monolith expansion. Accounting
is intentionally cataloged with no fabricated business submodules. Future POS,
CRM, and Inventory modules should register their own definitions and schema,
then reuse this catalog, entitlement contract, launchers, and guards.
