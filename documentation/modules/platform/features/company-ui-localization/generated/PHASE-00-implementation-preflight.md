<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Company UI localization Phase 00 - Implementation Preflight

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

- **Company UI localization cross-platform master review:** `../modules/platform/features/company-ui-localization/company-ui-localization-review.md` sections 1, 2, 5, 8, 9
- **Company UI localization API implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-api.md` sections 1, 10, 11
- **Company UI localization Next.js implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-web.md` sections 1, 2, 12, 13
- **Company UI localization Expo implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-ui-localization-master | 1 | `747b14ffed772620634bba957fdfeddd48eace8eb33d7f62306b558d1f714f0a` |
| company-ui-localization-master | 2 | `1b6214681f55cf3113ce5cb5d9a8afc3eac7edc760b627e22c081598e9570fea` |
| company-ui-localization-master | 5 | `88ec13b2db18aca4ed531791eb3053318767fd3766c760f9158e250160093e24` |
| company-ui-localization-master | 8 | `5160fa6f53e6af0ebc984c515f094804b3ceb46dae4e94867f9d3966a3f4e32a` |
| company-ui-localization-master | 9 | `63b51c88d8a5d88a50e30ccc350a867f17af354c861fdd25adf44fbb52a11be2` |
| company-ui-localization-api | 1 | `49b818f2f04e8a7633267cb7b4775d22a8cc8b3be175a0184a1779eceaaa253e` |
| company-ui-localization-api | 10 | `b5f6e14b9b81bf8ac113a69cab0f7b7f88e7eb976b9e25abb54acb9638961531` |
| company-ui-localization-api | 11 | `fcd94fd891ee1b70ec15e7d307e138643b8b8fb068ec3c4560ed6869532fa372` |
| company-ui-localization-web | 1 | `b5db634f12bcc5e992444e51e739d46130454a655564f77b6c1b31f0d04b8334` |
| company-ui-localization-web | 2 | `1a037bc7662e9749a4d6ee9a9dd6a710ee083ac790f90a7837f8a2eac1194ea4` |
| company-ui-localization-web | 12 | `04a29c8dee8ffb8fecfa36c1a9c56ce5e121f6938204c92b8612b86495c316fb` |
| company-ui-localization-web | 13 | `aa6304c75e09579546d9af39a377e27ab6cc2e8e10604f1533a6a92ed64f97d4` |
| company-ui-localization-mobile | 1 | `737545a8ec9a6caad29ddccf0bb834e52fbf4018e1be3f5c1c3112140b30c263` |
| company-ui-localization-mobile | 14 | `1970d14f7733bc4a36b1dfd8d4fa8174672cffe378f7d44341b67f6e5884b0bb` |
| company-ui-localization-mobile | 15 | `abdd7be309129ae44f826a2ef3210c9d6c4ef5ec58e8a4deae184a8d239fd0db` |
