# CustomerRelationshipManagement module

This package is the documentation ownership boundary for the **CustomerRelationshipManagement** module.
It describes the module's verified runtime foundation and records decisions for
future capabilities. Shared ERP rules remain in `documentation/system/` and are
linked rather than copied here.

## Current status

- Lifecycle: active modular-monolith module.
- Runtime foundation: six projects, a module bootstrap, and an EF Core context
  using the `crm` schema.
- Appointments is an implemented CRM vertical slice: API `api/v1/Appointments`
  (`GetAll?rangeStart&rangeEnd`, `Add`, `Update`, `Delete?id=`) with
  `Appointments:View/Create/Edit/Delete` and `[TenantMember]`; web
  `/appointments` (`web-next/src/app/(main)/(modules)/(crm)/appointments/page.tsx`);
  mobile `/extras/appointments` (`mobile-react/src/modules/crm`). Changes are pushed
  through the `AppointmentChangedJob` Hangfire job and the `appointments` realtime
  resource. Other CRM capabilities remain feature-scoped work.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then record delivery decisions
in [DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md). Web notes are in
[web-next/](web-next/README.md).

Before adding a component, service, or Contract, inventory shared BuildingBlocks
and module-local reusable pieces. Reuse or extend compatible abstractions and
record the decision in the feature book. Start new behavior module-local and
promote it only when it is domain-neutral and used by multiple modules.
