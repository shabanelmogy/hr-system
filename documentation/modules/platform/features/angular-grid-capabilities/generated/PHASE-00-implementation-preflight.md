<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Complete shared PrimeNG Table capabilities Phase 00 - Implementation Preflight

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

- **Complete shared PrimeNG Table capabilities cross-platform master review:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-review.md` sections 1, 2, 5, 8, 9
- **Complete shared PrimeNG Table capabilities API implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-api.md` sections 1, 10, 11
- **Complete shared PrimeNG Table capabilities Next.js implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-web.md` sections 1, 2, 12, 13
- **Complete shared PrimeNG Table capabilities Expo implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-grid-capabilities-master | 1 | `f79cdcbdb88f39547cdb85ed96fb7e5509a4787d0720962d402601f5da4fc8ee` |
| angular-grid-capabilities-master | 2 | `69ef1b7a3274521368a20c0d398fd2b62edf04537bac39cee66099cccbac9eb6` |
| angular-grid-capabilities-master | 5 | `3472f547a2548a8a7dc7cf1a9793c19fe2af31f527680c4bf79cddde0fe01e8a` |
| angular-grid-capabilities-master | 8 | `1a88531afb53989d42a83368fed092db8cdb99fbb3802aad2dcee8d02f9c023a` |
| angular-grid-capabilities-master | 9 | `a1489c8330bd0c141667b8f5fa1740f2a3633e7102ab4687734ec2bf7725f178` |
| angular-grid-capabilities-api | 1 | `f79cdcbdb88f39547cdb85ed96fb7e5509a4787d0720962d402601f5da4fc8ee` |
| angular-grid-capabilities-api | 10 | `c0b63473188ac0d8bdf814240acb1887e8ec1b3b0b2a7ab8775bc40215b23d09` |
| angular-grid-capabilities-api | 11 | `c1ac27d24dc880a8c201595afe249db3a460bf6e78cfab9fb950431f422d680d` |
| angular-grid-capabilities-web | 1 | `f79cdcbdb88f39547cdb85ed96fb7e5509a4787d0720962d402601f5da4fc8ee` |
| angular-grid-capabilities-web | 2 | `69ef1b7a3274521368a20c0d398fd2b62edf04537bac39cee66099cccbac9eb6` |
| angular-grid-capabilities-web | 12 | `9df3455d6570e40575058a4d70a528cf4753094da862e7a76ce400c14db5f135` |
| angular-grid-capabilities-web | 13 | `a946e454093eb7a23819b4e291046f565fd1cd09dbc8916a3a484e6b2f1bb4c0` |
| angular-grid-capabilities-mobile | 1 | `f79cdcbdb88f39547cdb85ed96fb7e5509a4787d0720962d402601f5da4fc8ee` |
| angular-grid-capabilities-mobile | 14 | `8057071de15d9c55856a5b390cb1035d4c9938745599fb11dd6d862c574925c1` |
| angular-grid-capabilities-mobile | 15 | `2b9cd282459fbfcf5f93b5806a4f7f33e285118413b510e94f95555d92c506ce` |
