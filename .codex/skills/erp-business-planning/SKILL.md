---
name: erp-business-planning
description: Use at the start of any ERPSYSTEM work request to classify it (new product workspace, new module, new feature, change or refactor of an existing feature, corrective fix, research) and to drive the matching path through documentation/plans and documentation/system, including screen-pattern selection from SCREEN_PATTERN_CATALOG.md. Use before erp-api-development, erp-web-development, or erp-mobile-development when the request adds or reshapes business capability.
---

# ERPSYSTEM Business Planning

This skill is a navigation layer over the canonical planning and execution system. It
does not replace `documentation/plans/` or `documentation/system/`; it tells you which
of their steps apply to the request in front of you and in what order.

Discuss with the requester in their language (usually Arabic). Write plan files in the
language and format the templates use.

## 1. Classify the request first

Read `documentation/plans/PLAN_CREATION_PROTOCOL.md` P0, then choose exactly one path:

| Request | Path |
| --- | --- |
| A new product built from this platform | §2 New product workspace |
| A new business area that needs its own runtime module | §3 New module |
| A new capability inside an existing module | §4 New feature |
| A substantial rebuild of an existing capability | §4 New feature (full protocol) |
| A change or refactor of an existing feature | §5 Existing-feature change |
| A bug fix or maintenance change | §6 Corrective change |
| Bringing an external application or its data into ERP | Use `erp-legacy-migration`, then §3 or §4 |
| A question or decision only | Answer from evidence; record open decisions as `DEC-###` |

State the chosen path to the requester in one sentence before continuing.

## 2. New product workspace

1. Check `documentation/plans/business/erp-platform-template/PLAN.md` slice S5. If the
   workspace generator (`templates/New-ErpWorkspace.ps1`) does not exist yet, say so and
   stop; do not hand-copy the repository.
2. Once it exists: collect product name and module list, run it, run the generated
   workspace's CI commands, and register the product's first plan in its own
   `PLAN_REGISTRY.md`.

## 3. New module

1. Create and register a business plan: `./documentation/plans/New-BusinessPlan.ps1`.
2. Run the discovery interview with `documentation/plans/BUSINESS_DISCOVERY_INTERVIEW.md`
   (all 14 sections; ask, do not assume). Record answers in `DISCOVERY.md`.
3. Record current-system evidence in `EVIDENCE.md` with the five classifications.
   Decide ownership against existing modules (`documentation/modules/*/ARCHITECTURE.md`)
   before proposing a new module; many requests belong in an existing one.
4. Write `SPEC_SUMMARY.md`, get approval, then `PLAN.md` and `DECISIONS.md`.
5. After approval, scaffold with `api/scripts/New-ErpModule.ps1` (API + documentation
   package) and the web `generate:module`. The mobile module is created by hand until
   `erp-platform-template` S5.2 ships a scaffold.
6. Continue each capability through §4.

## 4. New feature (or substantial rebuild)

1. Plan: follow P0–P9 in `PLAN_CREATION_PROTOCOL.md` inside the owning plan folder.
2. Screens: for every Screen ID, on web and mobile separately, apply §7.
3. Permissions: fill the Permission Action Matrix per `documentation/system/PERMISSION_MODEL.md`
   (exact `Resource:Action`, no `Manage`).
4. Decompose the authorized slice with `documentation/plans/FEATURE_DECOMPOSITION_TEMPLATE.md`
   (version 2.0, UI Pattern Gate, one active feature step).
5. Pass the gates in `documentation/plans/PLAN_QUALITY_GATE.md` required for the exact scope.
6. Scaffold execution evidence:
   `./documentation/system/New-FeatureDocumentation.ps1 -FeatureId … -FeatureName … -PlanId … -SliceId … -Module …`.
7. Hand over to the platform skills (`erp-api-development`, then `erp-web-development`
   and `erp-mobile-development`) for phases 00–07.

## 5. Existing-feature change or refactor

1. Start from `documentation/system/features/<feature>/required-files.json` and the four
   applied books (domain review, API, web, mobile profiles).
2. Separate verified behavior, requested behavior, and intended platform differences.
3. If the change adds business capability, new lifecycle, new permissions, or new
   screens, it is a rebuild: go to §4.
4. Otherwise reuse the approved plan, apply §7 to any changed screen, and repeat only the
   phases listed in `documentation/system/README.md` for the kind of change (for example
   Import changes repeat phases 00–02 and 04–06).
5. Update the applied books, the required-file manifest, and generated packets in the
   same change.

## 6. Corrective change

Fix under the owning platform skill. Any new risk, deferred item, production check, or
open decision gets a central note ID under `documentation/plans/notes/`.

## 7. Screen pattern selection (every screen, every platform)

Open `documentation/project/SCREEN_PATTERN_CATALOG.md`:

1. Answer "قواعد اختيار النمط" in order; the first yes gives the main pattern.
2. Choose the form container with C-01 and the list presentation with C-02; apply
   C-03…C-11 as relevant.
3. Record in the feature contract: Screen ID (`<module>.<feature>.<screen>`), main
   pattern, embedded patterns, C-rule choices, reviewed reference source path, and
   platform status (`Implemented`, `Adapted`, `Deferred`, `Excluded`).
4. If the pattern is `Candidate`, UI implementation is blocked: either register its first
   reference in the catalog as part of this feature (with tests and a decision for the
   other platform) or pick an Active pattern that truly fits.
5. Reuse the shared components the catalog names; a missing component is built
   module-local first and promoted on its second consumer.

## Checks before handoff

- `./documentation/plans/Check-Planning.ps1`
- `./documentation/system/Generate-Documentation.ps1 -Check` when books, manifests, or
  recipes changed.
