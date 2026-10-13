# HR module

HR is the employee, organization, and workforce bounded context in the ERP
System modular monolith. This package is its ownership index. Shared workflow
rules live in [`../../system/README.md`](../../system/README.md); they are not
copied here.

## Verified foundation

- The runtime module is under `api/Modules/HR` and follows the canonical
  Contracts, Domain, Application, Infrastructure, Presentation, and bootstrap
  shape.
- The module owns the `hr` SQL schema, its DbContext, migrations history, and
  schema bootstrap.
- Host composition is explicit through `ErpModuleRegistry` and `HRModule`.

## Feature books

HR owns Organizational structure, Workforce planning, Recruitment, and
Attendance devices. The [feature catalog](features/README.md) links each one's
review and API/web/mobile profiles, each kept in its own folder under
`features/<feature>/`. Geography and addresses belong to General Data
([reference-data](../reference-data/README.md)), not HR.

These links are a catalog, not a claim that every HR capability is implemented
on every platform. Check each book and its required-file manifest for evidence.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), [DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md),
the notes under [api/](api/README.md) and [web-next/](web-next/README.md), and
the [phase index](phases/README.md). Each feature's `-mobile.md` book records its
Expo behavior.

## Domain guide

[CORE_HR_DOMAIN_DESIGN_GUIDE.md](CORE_HR_DOMAIN_DESIGN_GUIDE.md) — HR functional data model.
