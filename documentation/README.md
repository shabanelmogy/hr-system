# ERP System Documentation

This directory is the single home for project-owned documentation. Product source code stays in `api/`, `web-next/`, and `mobile-react/`; documentation and implementation evidence stay here.

## Directory map

```text
documentation/
├── plans/      what to build: discovery, plans, decisions, notes, product direction
├── guides/     how we build: rules that apply to every module
│   ├── shared/   ownership, reuse, screen patterns, permissions
│   ├── api/      backend architecture, workflow, ADRs, migrations, deployment
│   ├── web/      Next.js architecture and rules
│   └── mobile/   Expo architecture and rules
├── modules/    what exists: one folder per module
│   └── <module>/
│       ├── README.md, ARCHITECTURE.md, DELIVERY-ROADMAP.md, module.json
│       └── features/<feature>/   every file of one feature in one place
│           ├── <feature>-review.md     cross-platform review (the master book)
│           ├── <feature>-api.md        API implementation profile
│           ├── <feature>-web.md        Next.js implementation profile
│           ├── <feature>-mobile.md     Expo implementation profile
│           ├── <feature>-request.md    frozen implementation request
│           ├── <feature>-evidence.md   review evidence and decisions
│           ├── required-files.json     files the generator fingerprints
│           └── generated/              phase packets (never edited by hand)
└── system/     the documentation machine: templates, manifest, generator scripts
```

| Directory | Purpose |
| --- | --- |
| [`plans/`](plans/README.md) | Business planning standard, plan registry, central notes, product direction |
| [`guides/`](guides/README.md) | Cross-module rules for shared, API, web, and mobile work |
| [`modules/`](modules/README.md) | One package per module with its feature folders |
| [`system/`](system/README.md) | Templates, recipe manifest, and the generator scripts |

Repository and subproject `README.md`, `AGENTS.md`, and `CLAUDE.md` files remain beside their projects because development tools discover them there. They link back to this directory for the canonical documentation.

## Start here

There is one way in. Follow these three pages in order:

1. [`plans/README.md`](plans/README.md) — decide **what** to build: discovery,
   evidence, decisions, and the plan for a business capability.
2. [`system/README.md`](system/README.md) — build and verify **how**: Phase 00
   preflight through Phase 07 closure, with the generated phase packets.
3. `modules/<module>/README.md` — the owning module's page (see
   [`modules/README.md`](modules/README.md)); its feature catalog links every
   feature folder.

The most used references:

| Need | Reference |
| --- | --- |
| Ownership and reuse rules | [`guides/shared/ERP_DOCUMENTATION_GUIDE_AR.md`](guides/shared/ERP_DOCUMENTATION_GUIDE_AR.md), [`guides/shared/SHARED_REUSE_CATALOG.md`](guides/shared/SHARED_REUSE_CATALOG.md) |
| API work | [`guides/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`](guides/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md), [`guides/api/ERP_ARCHITECTURE_CONSTITUTION.md`](guides/api/ERP_ARCHITECTURE_CONSTITUTION.md), [`guides/api/MODULAR_MONOLITH_ARCHITECTURE.md`](guides/api/MODULAR_MONOLITH_ARCHITECTURE.md) |
| Migrations | [`guides/api/MIGRATIONS_COMMANDS_AR.md`](guides/api/MIGRATIONS_COMMANDS_AR.md) |
| Audit trail (record history) | [`guides/api/AUDIT_TRAIL.md`](guides/api/AUDIT_TRAIL.md) |
| Worked reference feature | [Countries folder](modules/reference-data/features/countries/countries-review.md) |
| Production and open items | [`guides/api/PRODUCTION_DEPLOYMENT_RUNBOOK.md`](guides/api/PRODUCTION_DEPLOYMENT_RUNBOOK.md), [`plans/notes/README.md`](plans/notes/README.md) |

## Organization rules

1. Feature documentation goes in its module's `modules/<module>/features/<feature>/` folder; a rule that applies to every module goes in `guides/`.
2. Do not create new `docs/`, `Docs/`, or `doc/` trees inside application projects.
3. Keep source-owned configuration files such as `AGENTS.md` at their required scope and link them to this directory.
4. Do not edit files under `modules/*/features/*/generated/` directly. Update canonical guides, the recipe manifest, or templates and regenerate them.
5. Run `./documentation/system/Generate-Documentation.ps1 -Check` before handing off a documentation-system change.
6. Every code change must update the canonical documentation for the affected domain in the same change. Record platform differences explicitly instead of leaving an undocumented gap.
7. Before creating a component, service, or contract, inventory shared
   BuildingBlocks and existing module-local abstractions. Reuse or extend a
   compatible piece and record the decision in the owning module book. Start
   new pieces module-local; promote them to shared only when they are genuinely
   domain-neutral and used by multiple modules. Never put HR or Accounting
   domain logic in shared code or copy/paste a shared capability.
8. New business build plans start in `plans/` and must pass the planning quality
   gates before implementation begins. Production-only checks, deferred work,
   known risks, follow-ups, and open decisions use stable IDs under
   `plans/notes/` instead of being left only in chat history or scattered TODOs.
9. Run `./documentation/plans/Check-Planning.ps1` after changing the planning
   system, plan registry, business-plan folders, or central note registries.
10. Delete superseded documentation instead of archiving it in the tree; git
    history keeps it. Do not commit empty boilerplate READMEs.

## Adding a new feature review

Choose the closest applied reference: Countries for a flat global reference-data lifecycle, or States for a parent-dependent reference-data lifecycle. Neither is an ownership template for tenant/company HR aggregates.

Create the draft evidence workspace first:

```powershell
./documentation/system/New-FeatureDocumentation.ps1 `
  -FeatureId accounting-ledger-setup `
  -FeatureName "Accounting Ledger Setup" `
  -PlanId accounting-core-gl `
  -SliceId "Slice 1 — Ledger setup spine" `
  -Module accounting
```

The scaffold creates a copy-ready `<feature>-request.md`, an evidence
artifact, `required-files.draft.json`, and a feature-scoped
`recipe-registration.draft.json`. For planned work it also binds the implementation
to the canonical Plan ID and exact authorized Slice ID. Complete Phase 00
Implementation Preflight before runtime work. The scaffold does not weaken the
global documentation check by registering paths that do not exist yet.

After implementation sources and canonical applied profiles exist, finalize the
manifest/recipe registration. Phase 06 must end `Verified` before Phase 07 creates
or finalizes customer education/video material. Customer-visible work is `Closed`
only after that verified education closure.

## Web client readiness

- [Web/API readiness review](guides/web/WEB_API_READINESS_REVIEW.md)
- [Frontend architecture reference](guides/web/architecture/frontend-architecture-reference.md)

## Mobile client readiness

- [Mobile/API readiness review](guides/mobile/MOBILE_API_READINESS_REVIEW.md)
- [Mobile architecture guide](guides/mobile/MOBILE_ARCHITECTURE.md)
- [Mobile feature guide](guides/mobile/MOBILE_FEATURE_GUIDE.md)

## Product expansion

- [Omnichannel ERP product blueprint](plans/product/OMNICHANNEL_ERP_PRODUCT_BLUEPRINT.md)
- [Van Sales product plan](plans/product/VAN_SALES_PRODUCT_PLAN.md)
- [Enterprise SaaS core roadmap](plans/product/ENTERPRISE_SAAS_CORE_ROADMAP.md)
- [API architecture decisions](guides/api/adr/README.md)
