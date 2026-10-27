<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Platform Settings Phase 00 - Implementation Preflight

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

- **Platform Settings cross-platform master review:** `../modules/platform/features/platform-settings/platform-settings-review.md` sections 1, 2, 5, 8, 9
- **Platform Settings API implementation profile:** `../modules/platform/features/platform-settings/platform-settings-api.md` sections 1, 10, 11
- **Platform Settings Next.js implementation profile:** `../modules/platform/features/platform-settings/platform-settings-web.md` sections 1, 2, 12, 13
- **Platform Settings Expo implementation profile:** `../modules/platform/features/platform-settings/platform-settings-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-settings-master | 1 | `4716489434204b082559e80613d15882799f8331fd19fd4c75809685a4bba3da` |
| platform-settings-master | 2 | `5129632bac215d0b9651223dab02b47b81a2f09a99af785a044f93eec5075efb` |
| platform-settings-master | 5 | `08772127320e7828195f1e636236d2314b72787ec5aaf1c20160b18d42d4ebd5` |
| platform-settings-master | 8 | `b207c71783596108ff37a3faafaaa2b24852fc948f10c0fd6ea3920f6dd1ab0d` |
| platform-settings-master | 9 | `80b504af5387ba895ab9d9516770efe5f4fd3f590a8fe0b8fe05ae9495c205c3` |
| platform-settings-api | 1 | `e7cf42bc512ac24ee8f5ee3dc9f777f895f8bde639a1c3c6c89f8afb047daba0` |
| platform-settings-api | 10 | `b8d7735a0908620b69365d6a702eb28f9dfc25f1784676ef7668c14b98eb47aa` |
| platform-settings-api | 11 | `4dc30299ccee38fbad7f95327e406f9211ec6954bdd421cd0ad5261536cfb44a` |
| platform-settings-web | 1 | `e3a13cfa13d276c8425b02919e79d54db7855138388d42d45a1135e979ca37c2` |
| platform-settings-web | 2 | `917cfd2f1b687eeb6dbf87ae07051003ee6cbc57393e43cf920d1ff95bfd9422` |
| platform-settings-web | 12 | `6a94f05b02cc736a1b83b0dc4bd782135f09b5835b4c532d7b6e09461a26146a` |
| platform-settings-web | 13 | `b38008cd6444388773fd216d85e9ad3ccd41eba03d5566b5d47e0ad4bcb51e87` |
| platform-settings-mobile | 1 | `e3a13cfa13d276c8425b02919e79d54db7855138388d42d45a1135e979ca37c2` |
| platform-settings-mobile | 14 | `182b5133e68570c9349272fc7dcd15b528723e7908f9f8f33fae1388493b0e49` |
| platform-settings-mobile | 15 | `b64bc8a323caaa8c4135b08246c9cd791f1dbc8f4d2429624db41fccb99cd8ef` |
