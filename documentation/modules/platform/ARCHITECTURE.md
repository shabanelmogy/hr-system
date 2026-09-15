# Platform architecture

The module is a bounded context composed through `ErpSystem.Modules.Platform.PlatformModule`.
The host references only the bootstrap. Contracts are the only supported
cross-module dependency; do not add cross-module EF navigations, foreign keys,
or direct infrastructure calls.

## Runtime ownership

- Schema: `platform` (one module-owned schema and migrations history table).
- Module metadata keeps technical dependency/lifecycle concerns separate from
  tenant entitlements, user authorization, and launcher visibility.
- Platform is hidden from tenant-facing module catalog APIs and cannot be
  granted as a tenant module entitlement.
- Layers: Contracts, Domain, Application, Infrastructure, Presentation, and
  the bootstrap composition root.
- Integrations: stable identifiers, transport-neutral Contracts, and explicit
  events/handlers at module boundaries.
- Application/Contracts own reusable authentication/session orchestration,
  tenant/company access policy, entitlements, module catalog policy, generic
  file workflow/orchestration and storage policy, localization policy,
  notifications, security-audit write policy, and offline-operations policy.
- Infrastructure owns Platform persistence and token/authorization implementation
  through `PlatformDbContext` and the `platform` schema. Identity, tenants,
  companies, memberships, entitlements, files, notifications, audit records,
  API keys, and authentication challenges are Platform-owned tables.
- Cross-module reads and writes use public Contracts. ReferenceData supplies the
  global geographic catalog to Platform company-scope workflows; business
  modules store only scalar tenant/company identifiers and never import Platform
  Infrastructure or EF types.
- Platform Presentation owns tenant, company, entitlement, authentication, and
  technical module-catalog endpoints. A route can remain at its historical URL
  only when the wire contract is deliberately preserved and covered by tests;
  that does not move its persistence ownership back to HR.

## Authorization and execution scope

`TenantMember` is a fail-closed Platform policy. An authenticated principal must
not be `super_admin`, must carry the `admin` or `user` role, and must contain
non-empty `NameIdentifier`, `tenant_id`, `sid`, and `security_stamp` claims plus
a positive `company_id`. Bearer `OnTokenValidated` performs the live session,
security-stamp, tenant membership/subscription, and company-access checks before
the policy runs; the policy still validates the complete scope for principals
created by another authentication path.

Permissions resolved by `ModuleCatalog` require the permission claim, non-empty
user and tenant claims, a positive company scope, a non-super-admin principal,
the current database role permission, and the tenant submodule entitlement.
Platform permissions remain claim-only after authentication and are never gated
by tenant entitlements. Unknown permissions fail closed.

RBAC mutations in Platform (`RoleService`) use
`PlatformDbContext.ExecuteAtomicallyAsync` on SQL Server. The lock resource is
derived from the tenant plus the normalized role name for creation, or the role
identifier for an existing role, and is hashed to a bounded value before being
passed to `sp_getapplock`. Role writes, claim changes, affected-user security
stamp/refresh-token changes, and their `SecurityAuditEvent` are committed as one
unit. Realtime notifications and session-revocation jobs are queued only after
the transaction commits, so a failed audit or Identity operation cannot publish
an event for a mutation that was rolled back. These non-critical post-commit
notifications are best-effort and logged if delivery fails; any future critical
external effect must use a transactional outbox instead.

Tenant creation is exposed by the Platform administration endpoints and uses
`PlatformDbContext.ExecuteAtomicallyAsync` with a bounded SHA-256 lock derived
from the normalized tenant identifier. One transaction and one `SaveChangesAsync`
create the tenant, its `DEFAULT` company, module entitlements, and the
`TenantCreated` security audit. Realtime refresh is dispatched only after commit
and is logged as a best-effort failure. Initial-admin invitation, provisioning
status, request-replay idempotency, tenant settings, and recoverable external
delivery remain separate capabilities.

Reuse-first is part of the module workflow: search shared BuildingBlocks and
local abstractions before creating a new piece, and keep domain logic local.

## Deployment configuration security

The host owns deployment preflight, while Platform owns token configuration and
authorization implementation. `HostDeploymentConfigurationValidator` runs
before module services are registered. It requires an effective connection
string for every installed module and Hangfire, and never writes configuration
values into validation errors. In production it requires explicit non-loopback
hosts and HTTPS browser origins, rejects unencrypted or unverified SQL Server
connections, requires JWT and SMTP secrets from the deployment secret store,
and prevents startup migrations or seed writes. Google OAuth is either fully
disabled or configured with both credentials.

Development uses the existing user-secrets/development signing-key fallback.
Live `appsettings.json` and `appsettings.Development.json` files are gitignored;
the checked-in example contains placeholders and no JWT signing material.
Migrations are executed by the operator script as a release action. The API CI
workflow scans the current checkout with pinned Gitleaks rules and does not
allow source configuration files to bypass detection.
