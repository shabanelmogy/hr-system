<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Accounting Working Fiscal Year Context Phase 00 - Implementation Preflight

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

- **Angular Accounting Working Fiscal Year Context cross-platform master review:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-review.md` sections 1, 2, 5, 8, 9
- **Angular Accounting Working Fiscal Year Context API implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-api.md` sections 1, 10, 11
- **Angular Accounting Working Fiscal Year Context Angular web implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-web.md` sections 1, 2, 12, 13
- **Angular Accounting Working Fiscal Year Context Expo implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-fiscal-year-context-master | 1 | `38809e7e4b45b59fcb39b5a816a361876064ca0e2b3b1fd927bf5366096c84f7` |
| angular-fiscal-year-context-master | 2 | `5234c2c14b64c208b69e9e7173adb27a26c5c6f53b270bcb0ab6d943175fc5fa` |
| angular-fiscal-year-context-master | 5 | `759abf819f4a0722c3de342678debdce87e27ea63ae80cd8742619a7fa87fb41` |
| angular-fiscal-year-context-master | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-master | 9 | `936948f2cf78578f94106ac5f860f87c2fe4e4986e3740c23f1dc37963f132f1` |
| angular-fiscal-year-context-api | 1 | `38809e7e4b45b59fcb39b5a816a361876064ca0e2b3b1fd927bf5366096c84f7` |
| angular-fiscal-year-context-api | 10 | `bb2941ee2b55b076a6ff92db814d6388a469f272b33c66f16346b1c6b2fa8ead` |
| angular-fiscal-year-context-api | 11 | `a4f449a68c7398071ffa4f5a1ae79dac8ca0f517dddebd5d5b9db07e333ca92d` |
| angular-fiscal-year-context-web | 1 | `38809e7e4b45b59fcb39b5a816a361876064ca0e2b3b1fd927bf5366096c84f7` |
| angular-fiscal-year-context-web | 2 | `5234c2c14b64c208b69e9e7173adb27a26c5c6f53b270bcb0ab6d943175fc5fa` |
| angular-fiscal-year-context-web | 12 | `21e42d8f39ad9083f19d1006eec45d703fbe8f2ce4cb6ba12ae12632c7da363d` |
| angular-fiscal-year-context-web | 13 | `829ca6778f3847d87c18fe252e7c87b921a06c00d5ef65b64a7ff4e19796505f` |
| angular-fiscal-year-context-mobile | 1 | `38809e7e4b45b59fcb39b5a816a361876064ca0e2b3b1fd927bf5366096c84f7` |
| angular-fiscal-year-context-mobile | 14 | `84f0ac93a5568b5278702ae5e4344a27313a3d0d30d5044cc960a5a16f9dca87` |
| angular-fiscal-year-context-mobile | 15 | `47a8fa354fec8bbce2ddc352b56c2a75c017f8aecda7be4a33fa9c1b735031b7` |
