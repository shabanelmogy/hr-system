<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# System Error Logs managed reports Phase 00 - Implementation Preflight

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

- **System Error Logs managed reports cross-platform master review:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-review.md` sections 1, 2, 5, 8, 9
- **System Error Logs managed reports API implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-api.md` sections 1, 10, 11
- **System Error Logs managed reports Next.js implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-web.md` sections 1, 2, 12, 13
- **System Error Logs managed reports Expo implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-log-reports-master | 1 | `f7cd7664118897df3aaa7c45aeea2ed29157b85da2bb5f846db5b5ff413aa3bc` |
| angular-system-error-log-reports-master | 2 | `acb734f7fe636701495dc27f6aefd8f51be19fad48557bb58dc1bb66567cc219` |
| angular-system-error-log-reports-master | 5 | `3e6d9e67aea112290c14f307c982dc4422ce1797a871b9b987994981f78d8723` |
| angular-system-error-log-reports-master | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-master | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-api | 1 | `f7cd7664118897df3aaa7c45aeea2ed29157b85da2bb5f846db5b5ff413aa3bc` |
| angular-system-error-log-reports-api | 10 | `bdfecdeaebe5da652531314b0993ce8305ec61732bb2a9c3bc48a95a44ad8702` |
| angular-system-error-log-reports-api | 11 | `aae000f51a6f9b0334a5a5aa321b6e2c6b76c49ea421e9a824f371f1dfee332b` |
| angular-system-error-log-reports-web | 1 | `f7cd7664118897df3aaa7c45aeea2ed29157b85da2bb5f846db5b5ff413aa3bc` |
| angular-system-error-log-reports-web | 2 | `acb734f7fe636701495dc27f6aefd8f51be19fad48557bb58dc1bb66567cc219` |
| angular-system-error-log-reports-web | 12 | `8125463a4a9faf6d1eeda71c0caf1abc750b8a0a9afd80a5440f652e90100fb5` |
| angular-system-error-log-reports-web | 13 | `08f6995929a83ec1ac6c34252634c5243c37e8604893f55ed49a6bc07618bd82` |
| angular-system-error-log-reports-mobile | 1 | `f7cd7664118897df3aaa7c45aeea2ed29157b85da2bb5f846db5b5ff413aa3bc` |
| angular-system-error-log-reports-mobile | 14 | `8b59218e61eeb3245be416d8587e27993a11d382de227f9eb4259bb6d4074b22` |
| angular-system-error-log-reports-mobile | 15 | `0f99b0d679a29e602977f35588d63f7879a3936a7fa55b7684ea56bb09879e3e` |
