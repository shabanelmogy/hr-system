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
- Infrastructure owns Platform persistence that has been safely separated,
  token/authorization implementation, and direct legacy-HR read sources where
  the Platform side can read compatibility tables without referencing HR.
- Compatibility-sensitive writes or physical tables that have not moved remain
  behind narrow HR adapters. For Files, HR retains the historical `UploadedFile`
  persistence, protected filesystem layout, and realtime transport adapter while
  Platform owns the generic workflow. For Notifications, Platform owns publication
  and inbox lifecycle orchestration while HR retains the historical `Notifications`
  table, Identity-backed recipient/permission resolution, SignalR delivery, and
  legacy HTTP/DTO facade. These are explicit storage/transport compatibility
  boundaries, not permission for Platform to depend on HR or for new platform
  policy to be added to HR.
- Platform Presentation owns technical endpoints such as the tenant-visible
  module catalog surface. Existing legacy HTTP routes may remain in HR only when
  wire compatibility is intentionally preserved and covered by tests.

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

RBAC mutations in the HR compatibility boundary (`RoleService`) use
`ApplicationDbContext.ExecuteAtomicallyAsync` on SQL Server. The lock resource is
derived from the tenant plus the normalized role name for creation, or the role
identifier for an existing role, and is hashed to a bounded value before being
passed to `sp_getapplock`. Role writes, claim changes, affected-user security
stamp/refresh-token changes, and their `SecurityAuditEvent` are committed as one
unit. Realtime notifications and session-revocation jobs are queued only after
the transaction commits, so a failed audit or Identity operation cannot publish
an event for a mutation that was rolled back. These non-critical post-commit
notifications are best-effort and logged if delivery fails; any future critical
external effect must use a transactional outbox instead.

Tenant creation remains exposed through the existing HR HTTP compatibility route
and Platform administration orchestrator. Its HR persistence adapter now uses
`ApplicationDbContext.ExecuteAtomicallyAsync` with a bounded SHA-256 lock derived
from the normalized tenant identifier. One transaction and one `SaveChangesAsync`
create the tenant, its `DEFAULT` company, module entitlements, and the
`TenantCreated` security audit. Realtime refresh is dispatched only after commit
and is logged as a best-effort failure. This is the atomic persistence foundation;
initial-admin invitation, baseline tenant settings, an explicit idempotency/replay
contract, provisioning status, and recoverable external delivery remain separate
planned capabilities.

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
