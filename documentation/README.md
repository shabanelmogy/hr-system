# ERP System Documentation

This directory is the single home for project-owned documentation. Product source code stays in `api/`, `web-next/`, and `mobile-react/`; documentation and implementation evidence stay here.

## Directory map

| Directory | Purpose |
| --- | --- |
| `project/` | Cross-project architecture, reviews, roadmaps, and operational notes |
| `api/` | Backend architecture, controller contracts, user stories, database assets, and API guides |
| `web-next/` | Canonical Next.js architecture and feature guides |
| `mobile-react/` | Expo architecture, style, and feature guides |
| `modules/` | Module-owned documentation packages and ownership indexes |
| `system/` | Reusable documentation recipes, manifests, generated phase packets, and feature review artifacts |
| `plans/` | Canonical business-planning standard, plan registry, production/deferred notes, risks, and cross-platform planning gates |
| `old files/` | Historical archive only; never an active planning/implementation authority or recipe dependency |

Repository and subproject `README.md`, `AGENTS.md`, and `CLAUDE.md` files remain beside their projects because development tools discover them there. They link back to this directory for the canonical documentation.

## Start here

- General ERP documentation guide: [`project/ERP_DOCUMENTATION_GUIDE_AR.md`](project/ERP_DOCUMENTATION_GUIDE_AR.md)
- Shared reuse catalog: [`project/SHARED_REUSE_CATALOG.md`](project/SHARED_REUSE_CATALOG.md)
- API feature development workflow: [`api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`](api/API_FEATURE_DEVELOPMENT_WORKFLOW.md)
- API architecture constitution: [`api/ERP_ARCHITECTURE_CONSTITUTION.md`](api/ERP_ARCHITECTURE_CONSTITUTION.md)
- Cross-platform CQRS/web reference: [`project/CORE_FEATURE_CQRS_WEB_GUIDE.md`](project/CORE_FEATURE_CQRS_WEB_GUIDE.md)
- Managed Crystal reporting integration: [`project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md`](project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md)
- Three-project Countries review: [`project/COUNTRIES_FEATURE_FULL_REVIEW.md`](project/COUNTRIES_FEATURE_FULL_REVIEW.md)
- API Countries profile: [`api/Countries_API_Implementation_Profile.md`](api/Countries_API_Implementation_Profile.md)
- Web Countries profile: [`web-next/features/countries-frontend-reference.md`](web-next/features/countries-frontend-reference.md)
- Mobile Countries profile: [`mobile-react/countries-mobile-reference.md`](mobile-react/countries-mobile-reference.md)
- Three-project States review: [`project/STATES_FEATURE_FULL_REVIEW.md`](project/STATES_FEATURE_FULL_REVIEW.md)
- API States profile: [`api/States_API_Implementation_Profile.md`](api/States_API_Implementation_Profile.md)
- Web States profile: [`web-next/features/states-frontend-reference.md`](web-next/features/states-frontend-reference.md)
- Mobile States profile: [`mobile-react/states-mobile-reference.md`](mobile-react/states-mobile-reference.md)
- Reusable documentation workflow: [`system/README.md`](system/README.md)
- Module documentation ownership: [`modules/README.md`](modules/README.md)
- Geographical information domain guide: [`project/GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md`](project/GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md)
- Addresses domain review: [`project/ADDRESSES_DOMAIN_FULL_REVIEW.md`](project/ADDRESSES_DOMAIN_FULL_REVIEW.md)
- Modular monolith architecture: [`api/MODULAR_MONOLITH_ARCHITECTURE.md`](api/MODULAR_MONOLITH_ARCHITECTURE.md)
- API production deployment runbook: [`api/PRODUCTION_DEPLOYMENT_RUNBOOK.md`](api/PRODUCTION_DEPLOYMENT_RUNBOOK.md)
- Foundation closure matrix: [`api/FOUNDATION_CLOSURE_MATRIX.md`](api/FOUNDATION_CLOSURE_MATRIX.md)
- API architecture decisions: [`api/adr/README.md`](api/adr/README.md)
- ERP planning system: [`plans/README.md`](plans/README.md)
- Business plan quality gate: [`plans/PLAN_QUALITY_GATE.md`](plans/PLAN_QUALITY_GATE.md)
- Central production/deferred notes: [`plans/notes/README.md`](plans/notes/README.md)

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
10. Keep superseded/high-confidence stale documentation under `old files/` only
    when historical retention is useful. Active guides/manifests/recipes must not
    reference that archive.

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
