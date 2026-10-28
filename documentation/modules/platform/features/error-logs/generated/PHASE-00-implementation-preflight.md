<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Error Logs Phase 00 - Implementation Preflight

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

- **Error Logs cross-platform master review:** `../modules/platform/features/error-logs/error-logs-review.md` sections 1, 2, 5, 8, 9
- **Error Logs API implementation profile:** `../modules/platform/features/error-logs/error-logs-api.md` sections 1, 10, 11
- **Error Logs Next.js implementation profile:** `../modules/platform/features/error-logs/error-logs-web.md` sections 1, 2, 12, 13
- **Error Logs Expo implementation profile:** `../modules/platform/features/error-logs/error-logs-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| error-logs-master | 1 | `b028a200383383205fa0f1084ede5f3627b935924bc48546110363fac76a1316` |
| error-logs-master | 2 | `b871cc29b6f8049d53458dc1c3b80cf869b442f66a10d04f623410c99c161ba9` |
| error-logs-master | 5 | `7a33d78dc7db935d033562e6979e33656e4139b190e036ee794f86c105724d84` |
| error-logs-master | 8 | `6198b523cd843d366cf4b6582c4b83da22776b83808018b1b5ee1d89d444fdc1` |
| error-logs-master | 9 | `a312c0d75748613e1211c45ca12f36b9301da6351b767a155842e4d3805fdde2` |
| error-logs-api | 1 | `079dcd93c42cd7bfdf7c6af8e9bf62d872d1a2980a475ca393331b917e61ba6d` |
| error-logs-api | 10 | `d16950140d836904e3957898dce0e346d653d0e2d56d96ead2dce8e7b8441deb` |
| error-logs-api | 11 | `71fdd008873d4a6fa5dd4da5e6ce574b5b3e0752ec4fa9841ad354b0e11b5a23` |
| error-logs-web | 1 | `58a749ee8493ea100cb27ccba9ac7a4b2e4807479b654e697a985d1f3da0cb79` |
| error-logs-web | 2 | `20079269bbcb2f990124a677949580a25b2d2e10f503bc4561e8e068cabc6427` |
| error-logs-web | 12 | `92499981aa16c216649f7a08374e66c7cda1c48746fc2bbdff5f578f0bb942a1` |
| error-logs-web | 13 | `70c1d560d59f053e995f7ba8763d983b27add4a4f2c7f1f8f958e70a96aeba68` |
| error-logs-mobile | 1 | `ab31fbd5d9b06b4ca593e6c149dbe2279292960513695dd90346b3b848b87976` |
| error-logs-mobile | 14 | `90dbdb0a1fd3326752e2dc7abd7f269fe828dac47b00c4e66e92668421c263a6` |
| error-logs-mobile | 15 | `a2c02fdf982479cc77b45557380f82360d5b03c62029674e8fdf45ff9efa005e` |
