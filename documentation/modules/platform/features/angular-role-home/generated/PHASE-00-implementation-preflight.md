<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Role Home Phase 00 - Implementation Preflight

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

- **Angular Role Home cross-platform master review:** `../modules/platform/features/angular-role-home/angular-role-home-review.md` sections 1, 2, 5, 8, 9
- **Angular Role Home API implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-api.md` sections 1, 10, 11
- **Angular Role Home Angular web implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-web.md` sections 1, 2, 12, 13
- **Angular Role Home Expo implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-role-home-master | 1 | `f984be175a16c176b96a040e2653b65d903c05bee762fe5a3c150470c6a97bb5` |
| angular-role-home-master | 2 | `b897606c0ca6644b476e0d49a4efb8d0c00b2b42c1b37d8f6282224dcb9ad071` |
| angular-role-home-master | 5 | `563cf43ec82636430fe4e20f38f8398ba1e21e6344b16f5d7af85ccd4943fec2` |
| angular-role-home-master | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-master | 9 | `60f9c606d5d26a6f8a4c4dc82559183bcd0269bd903190817574405dbd36670f` |
| angular-role-home-api | 1 | `f984be175a16c176b96a040e2653b65d903c05bee762fe5a3c150470c6a97bb5` |
| angular-role-home-api | 10 | `1c839c0e89ee2594c02d7b00912de2fcf2e0690ef23d50b52255e5491a33fe20` |
| angular-role-home-api | 11 | `091fbcbc24ef465bd0fa7e2e1b02611b0ddaca9d52a29c2deb40c8220573e104` |
| angular-role-home-web | 1 | `f984be175a16c176b96a040e2653b65d903c05bee762fe5a3c150470c6a97bb5` |
| angular-role-home-web | 2 | `b897606c0ca6644b476e0d49a4efb8d0c00b2b42c1b37d8f6282224dcb9ad071` |
| angular-role-home-web | 12 | `61c9f87d0e0bbe8f149e1ec5f4dd673d136de6fe271eed0177c4ef0c3e7055c4` |
| angular-role-home-web | 13 | `e55af14d30d5c713f1629c69ece73be17f6f6f02273c21e4a7c067af65869cdc` |
| angular-role-home-mobile | 1 | `f984be175a16c176b96a040e2653b65d903c05bee762fe5a3c150470c6a97bb5` |
| angular-role-home-mobile | 14 | `1d027bc20ed0bcbe5fb1530e64bdab6f6dfee98c396873ba3fc376bf8a5f2005` |
| angular-role-home-mobile | 15 | `c6bf374dca3c2400696af77c01651f9e70a902b88b301dceb41b665744807628` |
