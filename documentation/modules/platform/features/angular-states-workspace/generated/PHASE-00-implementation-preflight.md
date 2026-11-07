<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# States complete Angular parity Phase 00 - Implementation Preflight

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

- **States complete Angular parity cross-platform master review:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-review.md` sections 1, 2, 5, 8, 9
- **States complete Angular parity API implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-api.md` sections 1, 10, 11
- **States complete Angular parity Next.js implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-web.md` sections 1, 2, 12, 13
- **States complete Angular parity Expo implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-states-workspace-master | 1 | `8e70cdaf13d3c0d7c05cb504b4296eee33b100ef636a040fd4520d6585e068fc` |
| angular-states-workspace-master | 2 | `36d44963ed8890b4bd9a92d54e4dad1a83c150ac561160dc51e0d4a288791a31` |
| angular-states-workspace-master | 5 | `658b5a249ccf0aab79700f4874f371d4aff3484f7b02ffbdaf51459bddf7b503` |
| angular-states-workspace-master | 8 | `a2711720a0f2987543734da15a69eb1eb2596157145afa8a1fc4e852ea8d6ab5` |
| angular-states-workspace-master | 9 | `a300cf55dc219cefbfc033db706b12fccb640c2805d7cd8e010ccea1c298a2bb` |
| angular-states-workspace-api | 1 | `8e70cdaf13d3c0d7c05cb504b4296eee33b100ef636a040fd4520d6585e068fc` |
| angular-states-workspace-api | 10 | `cfcb30676c9971033e8d24fc22f39d3237f9e9670bb15aaf3a663f2063d751ad` |
| angular-states-workspace-api | 11 | `98b658eb4d1191f2dac57864eb9a8bc49d409da4227e35893994fddfc9f71d45` |
| angular-states-workspace-web | 1 | `8e70cdaf13d3c0d7c05cb504b4296eee33b100ef636a040fd4520d6585e068fc` |
| angular-states-workspace-web | 2 | `36d44963ed8890b4bd9a92d54e4dad1a83c150ac561160dc51e0d4a288791a31` |
| angular-states-workspace-web | 12 | `b0ce98265d69ab51f50b51a1ebadab90756bb2d9c76733366e7e6ed8005a80e8` |
| angular-states-workspace-web | 13 | `b71d7912db56b4c105ebcb0adc758cdcde8b72a4d9845d43e9fbc9f75f1ad260` |
| angular-states-workspace-mobile | 1 | `8e70cdaf13d3c0d7c05cb504b4296eee33b100ef636a040fd4520d6585e068fc` |
| angular-states-workspace-mobile | 14 | `a1730524d70f99dcf826b8becb48de231bbcfe3c65511e73664fcc17627b587c` |
| angular-states-workspace-mobile | 15 | `857d073781337124f17a26cd4e96384186fe06ac15e2f6b485c160ebd606beb0` |
