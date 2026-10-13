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
  behavior and an active Next.js management surface (`/administration/crystal-reports`).
- Other implemented API surfaces: `report-templates` (RDLX templates with
  revisions, used by `web-next/src/shared/reporting`), `global-crystal-reports`
  (global geography reports), and legacy `Dashboard`, `Export`, `ExportPdf`,
  `ReportsCategories`, and `Views` controllers (`Views` is development-only and
  guarded by `DatabaseViews:*`). The legacy controllers have no feature book yet.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then record delivery decisions
in [DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md). Web notes are in
[web-next/](web-next/README.md). Mobile has no Reporting administration surface;
managed report consumption uses the shared `mobile-react/src/platform/reporting` boundary.

Before adding a component, service, or Contract, inventory shared BuildingBlocks
and module-local reusable pieces. Reuse or extend compatible abstractions and
record the decision in the feature book. Start new behavior module-local and
promote it only when it is domain-neutral and used by multiple modules.

## Feature catalog and guide

- [Feature catalog](features/README.md)
- [CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md](CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md) — managed Crystal reporting integration.
