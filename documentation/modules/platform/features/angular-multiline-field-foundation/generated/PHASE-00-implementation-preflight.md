<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Shared multiline text preparation Phase 00 - Implementation Preflight

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

- **Shared multiline text preparation cross-platform master review:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-review.md` sections 1, 2, 5, 8, 9
- **Shared multiline text preparation API implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-api.md` sections 1, 10, 11
- **Shared multiline text preparation Next.js implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-web.md` sections 1, 2, 12, 13
- **Shared multiline text preparation Expo implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-multiline-field-foundation-master | 1 | `5cbc31b352b000fa2f346045417f1a0ce8f47768f1f705abfed3436ce76c2c58` |
| angular-multiline-field-foundation-master | 2 | `2d110f0724d2e90bec139e2abead3e0e19dc19d2f9901387038a9a79a683afea` |
| angular-multiline-field-foundation-master | 5 | `55d7a670d6c8ab06524dc4d9145f2d376f88128ea78329ba8259df6add6962ca` |
| angular-multiline-field-foundation-master | 8 | `a148c7cf56651c9ef62b377bd197760bbb7386b6f0fd40c1c5324e7e9fe6f4c2` |
| angular-multiline-field-foundation-master | 9 | `30a38aa4bc0500dd5b8495ee79bdada7874c3c8253df3f0b847d1f8862420a5f` |
| angular-multiline-field-foundation-api | 1 | `5cbc31b352b000fa2f346045417f1a0ce8f47768f1f705abfed3436ce76c2c58` |
| angular-multiline-field-foundation-api | 10 | `b66b763d995638f3eda95a48835de6684c52f9e16efbcf70322c0d8c6197556b` |
| angular-multiline-field-foundation-api | 11 | `6dd85e6c3efefb21e7a22deae56561fc17b1867f21faa8ac3d7ec3bb59eb8a73` |
| angular-multiline-field-foundation-web | 1 | `5cbc31b352b000fa2f346045417f1a0ce8f47768f1f705abfed3436ce76c2c58` |
| angular-multiline-field-foundation-web | 2 | `2d110f0724d2e90bec139e2abead3e0e19dc19d2f9901387038a9a79a683afea` |
| angular-multiline-field-foundation-web | 12 | `19cc3e3ce022cf4146582f55c84897e61dd06af122c086fc853ff16fd265ebf1` |
| angular-multiline-field-foundation-web | 13 | `83eb1b4d450eb4f632c16b978a8e024efb58c522331894786037b5d3d37ac26b` |
| angular-multiline-field-foundation-mobile | 1 | `5cbc31b352b000fa2f346045417f1a0ce8f47768f1f705abfed3436ce76c2c58` |
| angular-multiline-field-foundation-mobile | 14 | `9e128974be2de74bd5c3963e8ca17ef570ee4aa068d54f4e4ff55b8a2b9b9e92` |
| angular-multiline-field-foundation-mobile | 15 | `57a711ce0f151c35d096c9ec0ede86a98ae004c61c36dde0f9dfe278fc473fc7` |
