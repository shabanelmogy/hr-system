<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Platform Browser Authentication Phase 00 - Implementation Preflight

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

- **Platform Browser Authentication cross-platform master review:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-review.md` sections 1, 2, 5, 8, 9
- **Platform Browser Authentication API implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-api.md` sections 1, 10, 11
- **Platform Browser Authentication Next.js implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-web.md` sections 1, 2, 12, 13
- **Platform Browser Authentication Expo implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-browser-authentication-master | 1 | `7f5f7c10efabb580d16a194f27e322f6268a5612b63c56b9c4d175552865cfea` |
| platform-browser-authentication-master | 2 | `77e8d3baaee1119d47696e2d7b10059b5c0848578430b444f237a5f1f3ef42b0` |
| platform-browser-authentication-master | 5 | `59011011d1ce9fdaa6364cb22876b53a5304d6e465050642503a7adf35d9c778` |
| platform-browser-authentication-master | 8 | `337efcf914ffbb3bf125b9eaebfeee31f1e1f3fddd41b636684f13739eb950c2` |
| platform-browser-authentication-master | 9 | `1afc5c27ab83a56e4dcac5787ce062c0090cb10f3b3cd9d26d2df47262b1ed6c` |
| platform-browser-authentication-api | 1 | `ae3f47594eb5c38ab7ef48648472b2b48001d38e679966e085d1651070578ee0` |
| platform-browser-authentication-api | 10 | `0e4108d4382344db7c74d76883a2e1b7804947764162e3298fbd32e9cf365e67` |
| platform-browser-authentication-api | 11 | `bd5f4185028ebf42e040f53b76f7240ec8b113147c3c47f1d58f1a2552220195` |
| platform-browser-authentication-web | 1 | `9e6c23fbd4c467e8da42449b3c36fe12367ad493ac99d7605dc39987334dae0b` |
| platform-browser-authentication-web | 2 | `11c48756ab1c34db8854d3ce5bd16ec445574bbb18fe20133a749b246fb70f1b` |
| platform-browser-authentication-web | 12 | `7575dd3727ecb36dc30f9d167594024d153a27123c5b3dc803d15cf0a1c6bc81` |
| platform-browser-authentication-web | 13 | `1cfcfab5d3d3a982db267aaca6a4e6496779a4db82205c9bf95516df07040f0d` |
| platform-browser-authentication-mobile | 1 | `58e42733026b5e36bbdd0667a33b854c4f2444ecba6daaae604c768274be6232` |
| platform-browser-authentication-mobile | 14 | `85d161dbab052e01a1f442c1a697e2ade09ba3b4db08264aa940953cd598fd45` |
| platform-browser-authentication-mobile | 15 | `8af0ef3df801ece28afe0c2530e18328fe178388112421d98303da529229d8ee` |
