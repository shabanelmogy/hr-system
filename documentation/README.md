# HR Management System Documentation

This directory is the single home for project-owned documentation. Product source code stays in `api/`, `web-next/`, `mobile-react/`, and `web/`; documentation and implementation evidence stay here.

## Directory map

| Directory | Purpose |
| --- | --- |
| `project/` | Cross-project architecture, reviews, roadmaps, and operational notes |
| `api/` | Backend architecture, controller contracts, user stories, database assets, and API guides |
| `web-next/` | Canonical Next.js architecture and feature guides |
| `mobile-react/` | Expo architecture, style, and feature guides |
| `legacy-web/` | Archived guidance from the legacy `web/` client; reference-only |
| `system/` | Reusable documentation recipes, manifests, generated phase packets, and feature review artifacts |

Repository and subproject `README.md`, `AGENTS.md`, and `CLAUDE.md` files remain beside their projects because development tools discover them there. They link back to this directory for the canonical documentation.

## Start here

- Three-project Countries review: [`project/COUNTRIES_FEATURE_FULL_REVIEW.md`](project/COUNTRIES_FEATURE_FULL_REVIEW.md)
- API Countries profile: [`api/Countries_API_Implementation_Profile.md`](api/Countries_API_Implementation_Profile.md)
- Web Countries profile: [`web-next/features/countries-frontend-reference.md`](web-next/features/countries-frontend-reference.md)
- Mobile Countries profile: [`mobile-react/countries-mobile-reference.md`](mobile-react/countries-mobile-reference.md)
- Three-project States review: [`project/STATES_FEATURE_FULL_REVIEW.md`](project/STATES_FEATURE_FULL_REVIEW.md)
- API States profile: [`api/States_API_Implementation_Profile.md`](api/States_API_Implementation_Profile.md)
- Web States profile: [`web-next/features/states-frontend-reference.md`](web-next/features/states-frontend-reference.md)
- Mobile States profile: [`mobile-react/states-mobile-reference.md`](mobile-react/states-mobile-reference.md)
- Reusable documentation workflow: [`system/README.md`](system/README.md)

## Organization rules

1. Put new shared documentation in this directory, under the owning project or concern.
2. Do not create new `docs/`, `Docs/`, or `doc/` trees inside application projects.
3. Keep source-owned configuration files such as `AGENTS.md` at their required scope and link them to this directory.
4. Treat `legacy-web/` as historical evidence, not as an implementation target.
5. Do not edit files under `system/generated/` directly. Update canonical guides, the recipe manifest, or templates and regenerate them.
6. Run `./documentation/system/Generate-Documentation.ps1 -Check` before handing off a documentation-system change.

## Adding a new feature review

Choose the closest applied reference: Countries for a flat global reference-data lifecycle, or States for a parent-dependent reference-data lifecycle. Neither is an ownership template for tenant/company HR aggregates.

Create the draft evidence workspace first:

```powershell
./documentation/system/New-FeatureDocumentation.ps1 `
  -FeatureId employees `
  -FeatureName "Employees" `
  -ReferenceFeature countries
```

The scaffold creates an evidence artifact, `required-files.draft.json`, and a feature-scoped `recipe-registration.draft.json`; it does not weaken the global documentation check by registering paths that do not exist yet. After the implementation sources and four canonical profiles exist, replace the required-file draft with `required-files.json`, merge the reviewed registration draft into `system/recipe-manifest.json`, generate `system/generated/<feature>/PHASE-00` through `PHASE-06`, and finish the mandatory reconciliation phase.
