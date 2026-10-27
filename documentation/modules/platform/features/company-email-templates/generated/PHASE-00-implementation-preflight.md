<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Company email templates Phase 00 - Implementation Preflight

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

- **Company email templates cross-platform master review:** `../modules/platform/features/company-email-templates/company-email-templates-review.md` sections 1, 2, 5, 8, 9
- **Company email templates API implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-api.md` sections 1, 10, 11
- **Company email templates Next.js implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-web.md` sections 1, 2, 12, 13
- **Company email templates Expo implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-email-templates-master | 1 | `0714dbcf2e3b11fd3728efaa54ef0495b24cd487f51ef5d8ffba197018b11edf` |
| company-email-templates-master | 2 | `9b08429e9b1c894860fc42f7a7baae95600103f6128c77c982e2fde1a2396070` |
| company-email-templates-master | 5 | `2de0dd5d85a5dbfa19fbe1753d55bb85f5a952df818f401dde1a2d434286db00` |
| company-email-templates-master | 8 | `4a8da1af76e17ddb92272e724cc218650102217c7dc717446c4a20ac35976cd8` |
| company-email-templates-master | 9 | `dc8a0c48da6dff2cdbf7eb91e9650a8fc95b858a926dea30048c04c74abe1262` |
| company-email-templates-api | 1 | `4ed2b04e636f0249206e9cf9117415982d4bbd24b2939b7c21ecdb8664b89b07` |
| company-email-templates-api | 10 | `f96971b24f29c3303b7c8270d55f52d6ac4124567f0a7fcc359daf39688e313f` |
| company-email-templates-api | 11 | `708b0b68ed2f147e0cd48acbb55a15435a14be717673cab00753ea6fc4cc680a` |
| company-email-templates-web | 1 | `75e2e10c2f5c143dfe6ed638d0ebf38c8ed0b31ad7b05288d13bede82e41e47c` |
| company-email-templates-web | 2 | `1db225fcf0529b12d283cf2423e6f435aff26cd6cc895ccebb9c9c58c40b77da` |
| company-email-templates-web | 12 | `13bcc136704a2b02db0a639f0c9f6b6a62150e729f002ab0549ea6e0d10be9fa` |
| company-email-templates-web | 13 | `fb2dcbf05534e4901b95a48b0930b1fc695d12a4d55dd91f17ecb26ccdaa03c4` |
| company-email-templates-mobile | 1 | `6d92824ae35b2d4b9972b5915ab5e35da2802324578f529d3885db08bf1e79e1` |
| company-email-templates-mobile | 14 | `d1a123a663934fe7ed0c8e44b87e4acfe13d55094b5a947efd65f73ab481768d` |
| company-email-templates-mobile | 15 | `aaed8f6c9d9426c6042bbdb3d1d629e0a79c1365a5a67147547fbed445f269bb` |
