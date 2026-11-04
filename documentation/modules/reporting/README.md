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


## Manual global reporting View adapter — 2026-11-02

Reporting GCT-1 now consumes IReferenceDataPublicViewSource through public Contracts. ReferenceData owns schema-bound SQL View metadata/dependency checks and bounded parameterized reads; direct dependencies are restricted to approved global Countries/States/Districts tables. Tenant/company tables and raw arbitrary SQL are excluded. Existing geographical CRUD/list/client forms are unchanged. Angular report administration is Required in Reporting; Next/Mobile administration remains Excluded. The actual SQL integration test validates filtering, injection rejection, unsupported dependencies, immutable binding and definition changes. Owning workflow/evidence: `documentation/plans/business/global-crystal-template-management/MANUAL_VIEW_IMPLEMENTATION_2026-11-02.md`; FOLLOW-024/PROD-028 remain open and Builder work is DEF-027.


## Prepared global reporting Views — 2026-11-02

GCT-1 now discovers eligible metadata and creates three reviewed all-column,
schema-bound ref.vw_Countries/ref.vw_States/ref.vw_Districts Views through the
ReferenceData-owned migration20261102143015. LEFT JOIN follows Countries→States,
States→Country and Districts→State→Country; related fields are prefixed and deleted
rows excluded without turning the join into an inner join. No company Address
table enters global SQL. ReferenceData computes the district address count using
trusted company/tenant filters during report execution. Reporting projects only
approved native fields. Existing geographical CRUD and Next/Mobile forms remain
unchanged. Future physical column changes need an explicit View migration because
of SCHEMABINDING. Current evidence and 5-point platform audit are in Reporting GCT-1
section22 and DATABASE_VIEW_IMPLEMENTATION_2026-11-02.md; FOLLOW-024 remains Open.
