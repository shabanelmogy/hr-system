# Reporting module

This package is the documentation ownership boundary for the **Reporting** module.
It describes the module's verified runtime foundation and records decisions for
future capabilities. Shared ERP rules remain in `documentation/system/` and are
linked rather than copied here.

## Current status

- Lifecycle: active modular-monolith module.
- Runtime foundation: six projects, a module bootstrap, and an EF Core context
  using the `rpt` schema.
- Crystal Reports is an implemented Reporting vertical slice with domain/API
  behavior and an active Next.js management surface. Additional Reporting
  capabilities require their own verified contracts and tests.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then record delivery decisions
in [DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md). Platform entry points are kept
under [api/](api/README.md), [web-next/](web-next/README.md), and
[mobile-react/](mobile-react/README.md).

Before adding a component, service, or Contract, inventory shared BuildingBlocks
and module-local reusable pieces. Reuse or extend compatible abstractions and
record the decision in the feature book. Start new behavior module-local and
promote it only when it is domain-neutral and used by multiple modules.
