<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Countries pilot preparation Phase 00 - Implementation Preflight

## Purpose

Translate an already approved plan/slice into an implementation execution packet.
This phase does **not** repeat product discovery or silently re-decide approved
business rules.

For new business capabilities or substantial rebuilds, the central plan under
`documentation/plans/` is the authority for product intent, scope, ownership,
business rules, and approved decisions. This phase verifies that the current
repository still matches the evidence used by that plan and maps the authorized
slice onto concrete runtime surfaces.

## Required outputs

1. Record the canonical Plan ID, plan path, authorized slice/phase, and current gate
   status.
2. Confirm the requested implementation is inside the authorized slice.
3. Confirm the plan's Feature Decomposition Gate binds this Feature ID to one
   coherent execution unit. When the slice is `Decompose`, read and verify the
   child Screen/Workflow Contract and reuse audit created from
   `documentation/plans/FEATURE_DECOMPOSITION_TEMPLATE.md`.
4. Inspect the current owning runtime capability and verify there has been no
   material drift since planning.
5. Complete the Existing-System Relationship Review and shared-reuse inventory.
6. Map each feature-unit requirement to Domain/Application/Infrastructure/Presentation,
   Web, Mobile, tests, migrations, integrations, and documentation as applicable.
7. Import approved business decisions from the plan into the implementation request;
   do not create a competing rule set.
8. Record any implementation-only detail that the plan intentionally left to the
   execution workflow.
9. Define the exact verification commands/evidence required before Phase 06 can
   return `Verified`.

## Drift rule

If current source contradicts a material planning assumption or implementation
discovers a new business decision that changes persisted meaning, lifecycle,
ownership, scope, security, or a Required customer journey:

1. stop the affected implementation work;
2. update/reopen the relevant central plan gate;
3. resolve the decision in the canonical plan/decision log;
4. resume only after the affected slice is authorized again.

Do not resolve material product ambiguity inside a handler, migration, UI component,
or feature-local document.

## Preflight checklist

- [ ] Canonical Plan ID/path and authorized slice are recorded, or this is explicitly
      classified as a small change inside an already approved capability.
- [ ] Current plan gate authorizes this implementation scope.
- [ ] Feature Decomposition Gate contains this exact Feature ID for the authorized
      slice; `Decompose` slices have at least two distinct child Feature IDs.
- [ ] For a decomposed slice, this child has a complete Screen/Workflow Contract:
      closest reference, exact reusable components, workspace/screens/journeys,
      typed transport/server criteria, states, permissions/read-only, concurrency,
      i18n/RTL/accessibility/responsive behavior, tests, and child exit gate.
- [ ] Current runtime was inspected for drift since planning.
- [ ] Owning module/capability and relationship classification are confirmed.
- [ ] No parallel/legacy/workaround owner is being introduced.
- [ ] Shared BuildingBlocks, module-local abstractions, Web shared components, and
      Mobile shared components were inventoried before adding new ones.
- [ ] Plan requirements are mapped to concrete implementation surfaces.
- [ ] Approved plan decisions are referenced rather than duplicated/re-decided.
- [ ] Any new material business decision was routed back to the plan before coding.
- [ ] API/Web/Mobile Required/Deferred/Excluded decisions match the authorized slice.
- [ ] Migration/data compatibility impact is known.
- [ ] Verification evidence required for Phase 06 is explicit.
- [ ] Customer Education Pack is classified `Required` or `N/A — reason`; a
      customer-visible slice must be `Required`.

## Approved references

- **Countries pilot preparation cross-platform master review:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-review.md` sections 1, 2, 5, 8, 9
- **Countries pilot preparation API implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-api.md` sections 1, 10, 11
- **Countries pilot preparation Next.js implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-web.md` sections 1, 2, 12, 13
- **Countries pilot preparation Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-preparation-master | 1 | `898dd20117fd133d99fd5362d06fb22e1cddec3df90c9eb782f01898d5440119` |
| angular-countries-pilot-preparation-master | 2 | `ef54c6e76fe4a7268ce85507ba52fa3ca1ab5d4a9903be2815811016b72a9ff2` |
| angular-countries-pilot-preparation-master | 5 | `d8bd919c83a5678c9ebdddfcf75f989e353d963870222c1a5f116e0f2b20fc5d` |
| angular-countries-pilot-preparation-master | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-master | 9 | `cf8e09d2816484ef5fe1b3d550ed61098cb7739b6e69934182c068724c7fab6b` |
| angular-countries-pilot-preparation-api | 1 | `898dd20117fd133d99fd5362d06fb22e1cddec3df90c9eb782f01898d5440119` |
| angular-countries-pilot-preparation-api | 10 | `99ebce40b5bf08863732dc80464d3f3199aa700b4358f38675af7ba7e1caf6f3` |
| angular-countries-pilot-preparation-api | 11 | `d76489077b244af829c6b552caf7e3b93e3292389e9991d164156b42530b0983` |
| angular-countries-pilot-preparation-web | 1 | `898dd20117fd133d99fd5362d06fb22e1cddec3df90c9eb782f01898d5440119` |
| angular-countries-pilot-preparation-web | 2 | `ef54c6e76fe4a7268ce85507ba52fa3ca1ab5d4a9903be2815811016b72a9ff2` |
| angular-countries-pilot-preparation-web | 12 | `a2d8cff8774ebb01edf2964ca642abaceb53663ba44331324393623d62edf1ba` |
| angular-countries-pilot-preparation-web | 13 | `416c59ea487734c49a1540d2ed034f83c46d37aa68e98c1c1de183b8d88b66c5` |
| angular-countries-pilot-preparation-mobile | 1 | `898dd20117fd133d99fd5362d06fb22e1cddec3df90c9eb782f01898d5440119` |
| angular-countries-pilot-preparation-mobile | 14 | `7496e9d4d4a7a142c3b65621b7c782cac6b2513f2f0e5a50c4d1b01df51e07e2` |
| angular-countries-pilot-preparation-mobile | 15 | `38375d4db92df52da4cf83a7118215da66b9480f25edf3ae999379a5b5d8f71e` |
