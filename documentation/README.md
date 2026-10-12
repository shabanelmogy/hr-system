# ERP System Documentation

This directory is the single home for project-owned documentation. Product source code stays in `api/`, `web-next/`, and `mobile-react/`; documentation and implementation evidence stay here.

## Directory map

| Directory | Purpose |
| --- | --- |
| [`project/`](project/README.md) | Cross-project architecture, reviews, roadmaps, and operational notes |
| [`api/`](api/README.md) | Backend architecture, controller contracts, database assets, and API guides |
| [`web-next/`](web-next/README.md) | Canonical Next.js architecture and feature guides |
| [`mobile-react/`](mobile-react/README.md) | Expo architecture, style, and feature guides |
| [`modules/`](modules/README.md) | Module-owned documentation packages and ownership indexes |
| [`system/`](system/README.md) | Reusable documentation recipes, manifests, generated phase packets, and feature review artifacts |
| [`plans/`](plans/README.md) | Canonical business-planning standard, plan registry, production/deferred notes, risks, and cross-platform planning gates |

Repository and subproject `README.md`, `AGENTS.md`, and `CLAUDE.md` files remain beside their projects because development tools discover them there. They link back to this directory for the canonical documentation.

## Start here

There is one way in. Follow these three pages in order:

1. [`plans/README.md`](plans/README.md) — decide **what** to build: discovery,
   evidence, decisions, and the plan for a business capability.
2. [`system/README.md`](system/README.md) — build and verify **how**: Phase 00
   preflight through Phase 07 closure, with the generated phase packets.
3. `modules/<slug>/README.md` — the owning module's page (see
   [`modules/README.md`](modules/README.md)); it links that module's feature
   catalog and platform notes.

Every other document is a reference that one of those three pages links when
it is needed. The ones used most often:

| Need | Reference |
| --- | --- |
| Ownership and reuse rules | [`project/ERP_DOCUMENTATION_GUIDE_AR.md`](project/ERP_DOCUMENTATION_GUIDE_AR.md), [`project/SHARED_REUSE_CATALOG.md`](project/SHARED_REUSE_CATALOG.md) |
| API work | [`api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`](api/API_FEATURE_DEVELOPMENT_WORKFLOW.md), [`api/ERP_ARCHITECTURE_CONSTITUTION.md`](api/ERP_ARCHITECTURE_CONSTITUTION.md), [`api/MODULAR_MONOLITH_ARCHITECTURE.md`](api/MODULAR_MONOLITH_ARCHITECTURE.md), [`api/adr/README.md`](api/adr/README.md) |
| Worked reference feature | Countries: [review](project/COUNTRIES_FEATURE_FULL_REVIEW.md) · [API](api/Countries_API_Implementation_Profile.md) · [web](web-next/features/countries-frontend-reference.md) · [mobile](mobile-react/countries-mobile-reference.md) |
| Production and open items | [`api/PRODUCTION_DEPLOYMENT_RUNBOOK.md`](api/PRODUCTION_DEPLOYMENT_RUNBOOK.md), [`plans/notes/README.md`](plans/notes/README.md) |

## Organization rules

1. Put new shared documentation in this directory, under the owning project or concern.
2. Do not create new `docs/`, `Docs/`, or `doc/` trees inside application projects.
3. Keep source-owned configuration files such as `AGENTS.md` at their required scope and link them to this directory.
4. Do not edit files under `system/generated/` directly. Update canonical guides, the recipe manifest, or templates and regenerate them.
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

The scaffold creates a copy-ready `IMPLEMENTATION-REQUEST.md`, an evidence
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

- [Web/API readiness review](web-next/WEB_API_READINESS_REVIEW.md)
- [Frontend architecture reference](web-next/architecture/frontend-architecture-reference.md)

## Mobile client readiness

- [Mobile/API readiness review](mobile-react/MOBILE_API_READINESS_REVIEW.md)
- [Mobile architecture guide](mobile-react/MOBILE_ARCHITECTURE.md)
- [Mobile feature guide](mobile-react/MOBILE_FEATURE_GUIDE.md)

## Product expansion

- [Omnichannel ERP product blueprint](project/OMNICHANNEL_ERP_PRODUCT_BLUEPRINT.md)
- [Van Sales product plan](project/VAN_SALES_PRODUCT_PLAN.md)
- [Enterprise SaaS core roadmap](project/ENTERPRISE_SAAS_CORE_ROADMAP.md)
- [API architecture decisions](api/adr/README.md)
