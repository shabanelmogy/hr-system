<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Company Message Logs Phase 00 - Implementation Preflight

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

- **Company Message Logs cross-platform master review:** `../modules/platform/features/message-logs/message-logs-review.md` sections 1, 2, 5, 8, 9
- **Company Message Logs API implementation profile:** `../modules/platform/features/message-logs/message-logs-api.md` sections 1, 10, 11
- **Company Message Logs Next.js implementation profile:** `../modules/platform/features/message-logs/message-logs-web.md` sections 1, 2, 12, 13
- **Company Message Logs Expo implementation profile:** `../modules/platform/features/message-logs/message-logs-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| message-logs-master | 1 | `edec37193999b1d280c7d903ea5b70aba0392410c901cf911fc161359d9c585f` |
| message-logs-master | 2 | `295f3f14c5c4950da89bc793a71b086e1d4a8f8106973253d72cdb841d3bc744` |
| message-logs-master | 5 | `eb0d312929f6e5a4c1a25dd9d732dae2a1434d02918fb510bcd5686e61a124fd` |
| message-logs-master | 8 | `e63958910fe90bece7cc674cba33e0cf9d0a0ebe29081b87910f396b3c56a1a6` |
| message-logs-master | 9 | `2dd581785c8fc7d10c787d781962588c9752a37b8034a256090bde008fdc12f5` |
| message-logs-api | 1 | `dd2efcb3e1645a946de418bd58909c6cafad3c3cce45eb2ddc6865383c680812` |
| message-logs-api | 10 | `1cdf8f31874ed038d330d8aefd38069a233a89f69d727e89cc115081d845d75a` |
| message-logs-api | 11 | `420fd718a0c20f6a9fc9448179d47e6218407273f4a928852fa7f9d5efbb8320` |
| message-logs-web | 1 | `18db24592c6e8ac6785766b25ab95fde198a085d9225b5e7bfba8bcfdf570157` |
| message-logs-web | 2 | `7ee5ea55051246a983bb1032750aca8b771a6c12a0c91dbf1cf5aff3549009aa` |
| message-logs-web | 12 | `591971bd60501c7bdd2ff75a56a1debca9665196adf6c0494ad7072ce5dafb52` |
| message-logs-web | 13 | `5b04cbf049022f085f4c4bdaaf5986143fb13d35a0a6f99b92a4d3a771522c4b` |
| message-logs-mobile | 1 | `45def147c4ce9b1122b0ed19a0ad197628040d5663824be441a289fb1c27ace1` |
| message-logs-mobile | 14 | `f24247141fcfb43de48d5b6e5f1b18e097a9792be02e2bd06121f21de6058047` |
| message-logs-mobile | 15 | `390786de6f5bc765107f51cc571fd29e74a3259a4845c0010a5c4abd6699b0d9` |
