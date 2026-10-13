# Reporting architecture

The module is a bounded context composed through `ErpSystem.Modules.Reporting.ReportingModule`.
The host references only the bootstrap. Contracts are the only supported
cross-module dependency; do not add cross-module EF navigations, foreign keys,
or direct infrastructure calls.

## Runtime ownership

- Schema: `rpt` (one module-owned schema and migrations history table).
- Layers: Contracts, Domain, Application, Infrastructure, Presentation, and
  the bootstrap composition root.
- Integrations: stable identifiers, transport-neutral Contracts, and explicit
  events/handlers at module boundaries.

Verified symbols (2026-10-13): `ReportingDbContext` (schema `rpt`) maps
CrystalReports, CrystalReportVersions, CrystalReportRoleGrants, ReportsCategories,
ReportMasters, ReportsDetails, ReportTemplates, and ReportTemplateRevisions;
migrations `20260914181153_InitialReporting` and
`20260927154405_AddManagedCrystalTemplateValidation`. Submodules: `analytics` and
`global-geography-reports` (global access mode). Reporting owns the Syncfusion
license registration and reads other modules only through their reporting
Contracts (`IReferenceDataReportingSource`, `IAccountingReportingSource`).

Reuse-first is part of the module workflow: search shared BuildingBlocks and
local abstractions before creating a new piece, and keep domain logic local.