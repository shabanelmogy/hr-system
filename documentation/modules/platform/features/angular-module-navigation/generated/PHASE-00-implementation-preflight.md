<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Module Navigation Phase 00 - Implementation Preflight

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

- **Angular Module Navigation cross-platform master review:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-review.md` sections 1, 2, 5, 8, 9
- **Angular Module Navigation API implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-api.md` sections 1, 10, 11
- **Angular Module Navigation Angular web implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-web.md` sections 1, 2, 12, 13
- **Angular Module Navigation Expo implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-navigation-master | 1 | `6eeb04af3afc06c72b55828c7f764d7c0b33f24ab866cca1a75b71c2b9b360bb` |
| angular-module-navigation-master | 2 | `666b864631d96453655347da71a1b8b875e31e8fca1fc4333ff4bc694d7ac355` |
| angular-module-navigation-master | 5 | `f7b8352d8da1f0dac5d2ab4775b2fd706ef6fe6962a70ea9710449ba67d0af7d` |
| angular-module-navigation-master | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-master | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-api | 1 | `6eeb04af3afc06c72b55828c7f764d7c0b33f24ab866cca1a75b71c2b9b360bb` |
| angular-module-navigation-api | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-api | 11 | `b4c289942920da35fc175c9081cb5d577f732a62a5ed72c8877847cdbaef54f8` |
| angular-module-navigation-web | 1 | `6eeb04af3afc06c72b55828c7f764d7c0b33f24ab866cca1a75b71c2b9b360bb` |
| angular-module-navigation-web | 2 | `666b864631d96453655347da71a1b8b875e31e8fca1fc4333ff4bc694d7ac355` |
| angular-module-navigation-web | 12 | `322cb4f8bacc05c7ffa8fdcd53bdbe483e44414b260b25f91f248729033fe297` |
| angular-module-navigation-web | 13 | `9ece4d0a3c48dc7b34f4a00ff0a152ddbb883467ee696490e4852b490d3cdffa` |
| angular-module-navigation-mobile | 1 | `6eeb04af3afc06c72b55828c7f764d7c0b33f24ab866cca1a75b71c2b9b360bb` |
| angular-module-navigation-mobile | 14 | `fa17e0400b75d5bbbcf658b7e28fb037f01bf4988b758143b59ae0884f064283` |
| angular-module-navigation-mobile | 15 | `452488eaf324f65f31839480b064e4bd2f7e3c44ca780f6e7856e7a7ab924c0e` |
