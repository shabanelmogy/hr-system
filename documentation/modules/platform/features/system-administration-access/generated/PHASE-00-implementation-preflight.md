<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Global administration access Phase 00 - Implementation Preflight

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

- **Global administration access cross-platform master review:** `../modules/platform/features/system-administration-access/system-administration-access-review.md` sections 1, 2, 5, 8, 9
- **Global administration access API implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-api.md` sections 1, 10, 11
- **Global administration access Next.js implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-web.md` sections 1, 2, 12, 13
- **Global administration access Expo implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-administration-access-master | 1 | `672540d4adc62d3622a80f58d49e28f8d653ecadb376da59727566b2270e8358` |
| system-administration-access-master | 2 | `ad63af066c8d004e6c8bb5e73e66f44a8801d95b7577321e5b9f4da9b8b9320a` |
| system-administration-access-master | 5 | `bb1cd5d2d45a16f4e668fca2e890241a7bd57100a49f0f91df1fee7f32648be8` |
| system-administration-access-master | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-master | 9 | `ae2f25e0e91b95de952ee9b9e026c0ce3a0ed25ffcfb577a03bdc77728ce85ff` |
| system-administration-access-api | 1 | `672540d4adc62d3622a80f58d49e28f8d653ecadb376da59727566b2270e8358` |
| system-administration-access-api | 10 | `ebba736b456d2363c58da24a7d2cac79e48605c0f8ea29780d2f3c40f26c98a0` |
| system-administration-access-api | 11 | `27b43263e6a89be6211323dd828db1627d4e4b13981c9f76424aefb3e5d49a69` |
| system-administration-access-web | 1 | `672540d4adc62d3622a80f58d49e28f8d653ecadb376da59727566b2270e8358` |
| system-administration-access-web | 2 | `ad63af066c8d004e6c8bb5e73e66f44a8801d95b7577321e5b9f4da9b8b9320a` |
| system-administration-access-web | 12 | `c600d8df7d364e5b7d61ca358cf0cef1c7f4bbe58855120ac57189e131cda717` |
| system-administration-access-web | 13 | `bae17b25e79f16860f2e16ff91d0820faf9bc295439f430aa2a491853c65ac8f` |
| system-administration-access-mobile | 1 | `672540d4adc62d3622a80f58d49e28f8d653ecadb376da59727566b2270e8358` |
| system-administration-access-mobile | 14 | `24a04d4f722b63dc7741b03accd41c6bb44ba4f03b4c9ebe11999a22b630c7c6` |
| system-administration-access-mobile | 15 | `f233b4fde169c8c74f50ccd6753ab6cfd93bb3ac99c555f809954dac2e86403c` |
