<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Shared form close and discard protection preparation Phase 00 - Implementation Preflight

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

- **Shared form close and discard protection preparation cross-platform master review:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-review.md` sections 1, 2, 5, 8, 9
- **Shared form close and discard protection preparation API implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-api.md` sections 1, 10, 11
- **Shared form close and discard protection preparation Next.js implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-web.md` sections 1, 2, 12, 13
- **Shared form close and discard protection preparation Expo implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-close-foundation-master | 1 | `8f37c3f747e5d56ad0333f8861db30a5e7f82e557335bc8a8df1d8266454f67f` |
| angular-form-close-foundation-master | 2 | `4ab0b42bd0b34312c2e638a081f2d521b5b832d980c26ca738ff6c3c0421da13` |
| angular-form-close-foundation-master | 5 | `9ff921df4fc4987bf8c7a0eeb12c2ad7d91105c91a00c35f6240c4efe1ebfdcc` |
| angular-form-close-foundation-master | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-master | 9 | `002c5fe15f5407d5954a85ce70ef6911009c88295b1c3e9a446352e1ab1b54b3` |
| angular-form-close-foundation-api | 1 | `8f37c3f747e5d56ad0333f8861db30a5e7f82e557335bc8a8df1d8266454f67f` |
| angular-form-close-foundation-api | 10 | `64ded57526a8d16ecde8062de57ffe03d672821496b2b90463c0ad414b8c6d58` |
| angular-form-close-foundation-api | 11 | `010af5b5f1816905cc3eab29abd889a2eace387f4e457e73a24eae4fd88f464d` |
| angular-form-close-foundation-web | 1 | `8f37c3f747e5d56ad0333f8861db30a5e7f82e557335bc8a8df1d8266454f67f` |
| angular-form-close-foundation-web | 2 | `4ab0b42bd0b34312c2e638a081f2d521b5b832d980c26ca738ff6c3c0421da13` |
| angular-form-close-foundation-web | 12 | `3fc2e5d7e403b7d8d34c7e223add6ab92e092acbcd49957be85122e47b9c57e5` |
| angular-form-close-foundation-web | 13 | `e50853d075d6599db13a62e17466aceb8a03922b0075831025dc7600a97ab461` |
| angular-form-close-foundation-mobile | 1 | `8f37c3f747e5d56ad0333f8861db30a5e7f82e557335bc8a8df1d8266454f67f` |
| angular-form-close-foundation-mobile | 14 | `0e0479a88af45e8fdad3c6e9d45d980aff52425b37fe385f664b9098f29422e6` |
| angular-form-close-foundation-mobile | 15 | `a0a6f1ba19e837a1de59300f14235daf86d940a40c79ac144f52cf4cd5f1e4c4` |
