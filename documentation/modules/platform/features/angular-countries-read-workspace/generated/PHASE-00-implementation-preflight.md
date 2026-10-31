<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Countries read workspace Phase 00 - Implementation Preflight

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

- **Countries read workspace cross-platform master review:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-review.md` sections 1, 2, 5, 8, 9
- **Countries read workspace API implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-api.md` sections 1, 10, 11
- **Countries read workspace Next.js implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-web.md` sections 1, 2, 12, 13
- **Countries read workspace Expo implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-read-workspace-master | 1 | `b5f697f101f4ffcc3964a2bdf2f34aad6a9afdf2f2ef8e519d939ab62aab7b03` |
| angular-countries-read-workspace-master | 2 | `51f1e1d285b87461fffb80a80d433a26b836b3b254d99b2ede854d698aa9cc1e` |
| angular-countries-read-workspace-master | 5 | `3704acfa0146fdc1b48ca9f3465476082e5cce31454a7ab150b2149b60faf524` |
| angular-countries-read-workspace-master | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-master | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-api | 1 | `b5f697f101f4ffcc3964a2bdf2f34aad6a9afdf2f2ef8e519d939ab62aab7b03` |
| angular-countries-read-workspace-api | 10 | `351549c64b8a2862ebda6e01484037ddf3730522101fa8d1379a763aceb43ac9` |
| angular-countries-read-workspace-api | 11 | `66b7842c53fe3f6e2ca4d73e4eb31426c01e65b6f00d8e86203decd1cb992e3f` |
| angular-countries-read-workspace-web | 1 | `b5f697f101f4ffcc3964a2bdf2f34aad6a9afdf2f2ef8e519d939ab62aab7b03` |
| angular-countries-read-workspace-web | 2 | `51f1e1d285b87461fffb80a80d433a26b836b3b254d99b2ede854d698aa9cc1e` |
| angular-countries-read-workspace-web | 12 | `1cc54745e63db3c14506da98e699afb0791a712984bb578523300f0d20e5fd06` |
| angular-countries-read-workspace-web | 13 | `a8e9fd7982be74fdc8e110741f94b12dc5c62d1d09f8ee17bb693688ff380700` |
| angular-countries-read-workspace-mobile | 1 | `b5f697f101f4ffcc3964a2bdf2f34aad6a9afdf2f2ef8e519d939ab62aab7b03` |
| angular-countries-read-workspace-mobile | 14 | `69bab3d27082fe90f41a65d4b499af46527332ceeb501fc864030b62e433a43c` |
| angular-countries-read-workspace-mobile | 15 | `4233fa4c8da11c5f8abde54a33d133420fdeb7db0319db79f6e379c4f5acf39a` |
