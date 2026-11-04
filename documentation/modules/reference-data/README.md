# ReferenceData module

This package is the documentation ownership boundary for the **ReferenceData**
module. It summarizes the current module and points to the feature-specific
books that remain authoritative for contracts, platform parity, and evidence.
Shared ERP rules stay in `documentation/system/` and are linked rather than
copied here.

## Current status

- Lifecycle: active, default modular-monolith module, version `1.0.0`.
- Runtime: six production projects plus a module-owned test project, composed by
  `ErpSystem.Modules.ReferenceData.ReferenceDataModule`.
- Persistence: `ReferenceDataDbContext`, the module-owned `ref` schema, a
  module-specific migrations history table, and an idempotent Egypt geography
  seed after migration.
- Capability boundaries: `geography` is global Platform reference data;
  `addresses` is the tenant-entitlement submodule granted to new tenants.
- Applied cross-platform features: Countries, States, Districts, and Address
  Types have API, Next.js, Expo, tests, and canonical evidence.
- Applied API foundation: Address has company-scoped CQRS and persistence, while
  owner-link commands and standalone Web/Mobile Address experiences remain
  deferred under the canonical Address books and central notes.

The module is therefore **not scaffold-only**. Start with
[ARCHITECTURE.md](ARCHITECTURE.md), use the
[feature catalog](features/README.md) to select a capability, and follow the
linked project/API/Web/Mobile profiles rather than treating this overview as a
replacement for them.

Platform entry points are summarized under [api/](api/README.md),
[web-next/](web-next/README.md), and [mobile-react/](mobile-react/README.md);
the phase index is [phases/](phases/README.md).
Delivery status and deferrals are in
[DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md).

Before changing a component, service, or Contract, inventory shared
BuildingBlocks and module-local reusable pieces. Reuse or extend compatible
abstractions, keep business rules in the owning module, and update the affected
canonical feature books and required-file manifest in the same change.

## Domain guide

[GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md](GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md) — geography and address domain rules.


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
