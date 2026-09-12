# Platform module

This package is the documentation ownership boundary for the **Platform** module.
It describes the module's verified runtime foundation and records decisions for
future capabilities. Shared ERP rules remain in `documentation/system/` and are
linked rather than copied here.

## Current status

- Lifecycle: active modular-monolith module.
- Classification: technical/internal module. It participates in host lifecycle
  and dependency ordering but is not a tenant-entitleable or launcher-visible
  application.
- Runtime foundation: six projects, a module bootstrap, and an EF Core context
  using the `platform` schema.
- Verified technical ownership includes authentication/session orchestration,
  tenant/company access policy, tenant module entitlements, module catalog
  policy, authorization infrastructure, offline-operations policy, generic file
  workflow/orchestration and storage policy, localization policy, notifications,
  and security-audit write policy.
- Compatibility-sensitive physical Identity/tenant/file/audit data may remain
  in the legacy `hr` schema behind explicit adapters. Platform does not reference
  HR, and those adapters do not make HR the owner of the reusable policy.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then record delivery decisions
in [DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md). Platform entry points are kept
under [api/](api/README.md), [web-next/](web-next/README.md), and
[mobile-react/](mobile-react/README.md).

Before adding a component, service, or Contract, inventory shared BuildingBlocks
and module-local reusable pieces. Reuse or extend compatible abstractions and
record the decision in the feature book. Start new behavior module-local and
promote it only when it is domain-neutral and used by multiple modules.
