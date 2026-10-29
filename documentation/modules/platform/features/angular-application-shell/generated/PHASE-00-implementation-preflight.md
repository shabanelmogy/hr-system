<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Application Shell Phase 00 - Implementation Preflight

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

- **Angular Application Shell cross-platform master review:** `../modules/platform/features/angular-application-shell/angular-application-shell-review.md` sections 1, 2, 5, 8, 9
- **Angular Application Shell API implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-api.md` sections 1, 10, 11
- **Angular Application Shell Angular web implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-web.md` sections 1, 2, 12, 13
- **Angular Application Shell Expo implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-application-shell-master | 1 | `8420f91086a38d7869bb125bbf216e4334ec46e04700b4dfe8662f2e77609f95` |
| angular-application-shell-master | 2 | `832cb5332e6be88662481f48f16fdc3a2fa6b0c2b135e9ed874308ded3bf9051` |
| angular-application-shell-master | 5 | `37689c61ee256203558078245aefc583e90e595faf6b21072222d367bc563cdd` |
| angular-application-shell-master | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-master | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-api | 1 | `8420f91086a38d7869bb125bbf216e4334ec46e04700b4dfe8662f2e77609f95` |
| angular-application-shell-api | 10 | `99e22673f4a63eb2aa922a85364d71c0c32f7b06bf02467ab629acd0288e8de1` |
| angular-application-shell-api | 11 | `4afad814fac09a3ae3647a6a443a6ee3d0a50162a0a2ca29ddaff98d0e28120f` |
| angular-application-shell-web | 1 | `8420f91086a38d7869bb125bbf216e4334ec46e04700b4dfe8662f2e77609f95` |
| angular-application-shell-web | 2 | `832cb5332e6be88662481f48f16fdc3a2fa6b0c2b135e9ed874308ded3bf9051` |
| angular-application-shell-web | 12 | `148e66f157845465d73081eb09cd5b24e8a38d6978de8c68df5626ffe4449a18` |
| angular-application-shell-web | 13 | `0f31d57c1a04f5819829d63ecd548287884d582fa148b1f26eaee0f86a906590` |
| angular-application-shell-mobile | 1 | `8420f91086a38d7869bb125bbf216e4334ec46e04700b4dfe8662f2e77609f95` |
| angular-application-shell-mobile | 14 | `e71f5d6a2e12eb1fea6e3129fcdfbab05769cb4275c95c14a1e9d2888d88e057` |
| angular-application-shell-mobile | 15 | `9decaf031292c3b4e868f05781846b96c45f7443d62d9fa6fd25d4e7cc89e431` |
