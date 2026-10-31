<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Managed reporting adapter preparation Phase 00 - Implementation Preflight

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

- **Managed reporting adapter preparation cross-platform master review:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-review.md` sections 1, 2, 5, 8, 9
- **Managed reporting adapter preparation API implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-api.md` sections 1, 10, 11
- **Managed reporting adapter preparation Next.js implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-web.md` sections 1, 2, 12, 13
- **Managed reporting adapter preparation Expo implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-managed-reporting-adapter-master | 1 | `700d6af9c12803135af2dc8f08b8123b1a97dc3ffde723af1b3995a8004092a3` |
| angular-managed-reporting-adapter-master | 2 | `bfad8afecaea948e75f03de736c5379d100b426827cb85889e5f14898235baae` |
| angular-managed-reporting-adapter-master | 5 | `6241b5fb0db88e111491eed08e0dcb92e8386fe3b26867510d4cd5f29f7d3d2b` |
| angular-managed-reporting-adapter-master | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-master | 9 | `134f6c9e94fe56442f0bda990b5c3b4f33cdaf72115b8973b40c9ebec4fc79fa` |
| angular-managed-reporting-adapter-api | 1 | `700d6af9c12803135af2dc8f08b8123b1a97dc3ffde723af1b3995a8004092a3` |
| angular-managed-reporting-adapter-api | 10 | `36f180ef4c51ad92659ec0c8848c07e2636ccbb9bb6c3b1f12d982b41b09d353` |
| angular-managed-reporting-adapter-api | 11 | `93a24091f3b77bb5313d74a69e82a8bf121d35d9a343c8278f1ff6ba6c4715ad` |
| angular-managed-reporting-adapter-web | 1 | `700d6af9c12803135af2dc8f08b8123b1a97dc3ffde723af1b3995a8004092a3` |
| angular-managed-reporting-adapter-web | 2 | `bfad8afecaea948e75f03de736c5379d100b426827cb85889e5f14898235baae` |
| angular-managed-reporting-adapter-web | 12 | `f1a8ba2d63f73fe51ffa57f075322ec2a4b498d29271bc027422f993541bbdda` |
| angular-managed-reporting-adapter-web | 13 | `8a83e45d2d2ea70f6e4e9f34106b8ce0f8347ca89327a8b1c7a85bd7eab05d39` |
| angular-managed-reporting-adapter-mobile | 1 | `700d6af9c12803135af2dc8f08b8123b1a97dc3ffde723af1b3995a8004092a3` |
| angular-managed-reporting-adapter-mobile | 14 | `8b5301fd892df0cfd9a06d653ba6e2b0a955b5093b7e5f480ed32f1644684847` |
| angular-managed-reporting-adapter-mobile | 15 | `6b4f9dac35863f1038ce7d76086bddc0e118956ed9b494644efecc95b5df8065` |
