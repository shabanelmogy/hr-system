<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Angular Company Context Phase 00 - Implementation Preflight

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

- **Angular Company Context cross-platform master review:** `../modules/platform/features/angular-company-context/angular-company-context-review.md` sections 1, 2, 5, 8, 9
- **Angular Company Context API implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-api.md` sections 1, 10, 11
- **Angular Company Context Angular web implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-web.md` sections 1, 2, 12, 13
- **Angular Company Context Expo implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-company-context-master | 1 | `15a926ff18ed519b273cbeea7f89d121bee414d9b8dbabd7ad78a4ba1a20d72e` |
| angular-company-context-master | 2 | `f5cb088c899901db4325210a2618ebbd13cf9309cd6f9c102d5449f54d6d6e38` |
| angular-company-context-master | 5 | `96f6a5e9a4801d5701a98c5751a4d6ff78f89023a355368a6af7ad50c4601a18` |
| angular-company-context-master | 8 | `834ac0a66a13b464cf0ec1dcde0d92abbe02ed2eeb9ac63a7b438ba6203fd389` |
| angular-company-context-master | 9 | `d132938c99a9616bfa53df535c2a6fd45aff5a6ad81fa0d6f3f921758a806f08` |
| angular-company-context-api | 1 | `15a926ff18ed519b273cbeea7f89d121bee414d9b8dbabd7ad78a4ba1a20d72e` |
| angular-company-context-api | 10 | `2dc6d4c18f56599e8f391bb6e5b7e07352be81e8ebeb0028b9e0917e3cb86c4e` |
| angular-company-context-api | 11 | `1143b113c8297b174b9d634a216df28433520c46a609679ab3f798c7c9c6a9ad` |
| angular-company-context-web | 1 | `15a926ff18ed519b273cbeea7f89d121bee414d9b8dbabd7ad78a4ba1a20d72e` |
| angular-company-context-web | 2 | `f5cb088c899901db4325210a2618ebbd13cf9309cd6f9c102d5449f54d6d6e38` |
| angular-company-context-web | 12 | `c22e835b038d8a04dcc0fb1af7298a14be4d399cf9bcac423b889f80fd2f0937` |
| angular-company-context-web | 13 | `b3b5c35ad2ec7169cce70d7c8b4cb6c3a5f176100ac79557040078938853f35a` |
| angular-company-context-mobile | 1 | `15a926ff18ed519b273cbeea7f89d121bee414d9b8dbabd7ad78a4ba1a20d72e` |
| angular-company-context-mobile | 14 | `8d79eb0ecdd585e6a103175fe0e9875fb60d1086f1e3a8104921a66a52b76b89` |
| angular-company-context-mobile | 15 | `ddefe8da934c11cc2f7075936e63a14ee1f13b937a68344cabdf32bde2099780` |
