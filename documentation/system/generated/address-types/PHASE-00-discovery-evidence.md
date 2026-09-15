<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Address Types Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

Use `documentation/system/templates/FEATURE-IMPLEMENTATION-REQUEST.template.md`
as the copy-ready scope contract and the review artifact as the evidence ledger.
`Required` means current-release and gated, `Deferred` requires an owner/trigger,
and `Excluded` means no runtime surface.

For any API work, also follow
`documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`. Phase 00 cannot close and
runtime implementation cannot begin until the Existing-System Relationship Review
and all three Business Readiness matrices in `IMPLEMENTATION-REQUEST.md` are
complete for the known scope. Every Edge Cases & Validation category must contain
scenarios or an explicit `N/A` with a reason.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `features/<feature>/<FEATURE>-REVIEW-ARTIFACTS.md`.
2. Record the operating mode (`new feature`, `existing-feature review`, or `existing-feature change`) and the selected applied reference with a reason.
3. For a new feature, create `features/<feature>/required-files.draft.json`; do not register it while declared runtime files are missing. For an existing review, start from its final `required-files.json`.
4. Before final registration, replace the draft with `required-files.json` containing only existing repository-relative paths and evidence-based source-collection minimums.
5. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
6. Classify Import independently for web and mobile as `Required`, `Deferred`, or
   `Excluded`. Record the accepted format, data scope, dependency lookups, and the
   reason for every platform difference.
7. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
8. Record tests that prove each contract rather than only naming test folders.
9. Complete the Business Rules Matrix, Edge Cases & Validation Matrix, and Impact
   Matrix in `IMPLEMENTATION-REQUEST.md`; update them when discovery changes scope.

## Discovery checklist

- [ ] Domain entity, persistence mapping, and migration impact identified.
- [ ] Controller, CQRS messages, handlers, stores, validators, jobs, and dependency injection identified.
- [ ] Web route, feature boundary, query state, views, forms, permissions, realtime, translations, and shared UI identified.
- [ ] Mobile route, feature boundary, server-list state, forms, permissions, realtime, translations, responsive layout, RTL, and shared UI identified.
- [ ] Shared HTTP field names, nullability, paging base, sort tokens, filters, errors, and lifecycle actions frozen.
- [ ] Import is explicitly classified per client, and every Required Import path
      has a named format, permission, bulk endpoint, and dependency source.
- [ ] Known gaps are listed as findings and excluded from the copy baseline.
- [ ] The generated phase packets and fingerprints belong to this feature, not to an unscoped reference output.
- [ ] Every optional capability has one platform decision, data scope, reason, and
      evidence path; no decision is inferred from the selected reference.
- [ ] Verification gates are identified before coding, including manual and
      environment-dependent checks.
- [ ] Existing-System Relationship Review is complete and the owning capability is
      resolved; no parallel/workaround owner is being introduced.
- [ ] Business Rules Matrix records every known rule with one primary owner,
      stable outcome/error, and required test.
- [ ] Every Edge Cases & Validation category is covered by scenarios or explicitly
      marked `N/A` with a reason and has an enforcement layer plus required test.
- [ ] Impact Matrix classifies Domain, CQRS, persistence, API, security/scope,
      migration/data, integrations/runtime effects, tests, clients, and docs as
      `Reuse`, `Extend`, `Change`, `Add`, or reasoned `N/A`.
- [ ] No unresolved ownership, matrix placeholder, or unclassified edge-case row
      remains before Phase 00 is closed.

## Approved references

- **Address Types cross-platform master review:** `../project/ADDRESS_TYPES_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Address Types API implementation profile:** `../api/AddressTypes_API_Implementation_Profile.md` sections 1, 10, 11
- **Address Types Next.js implementation profile:** `../web-next/features/address-types-frontend-reference.md` sections 1, 2, 12, 13
- **Address Types Expo implementation profile:** `../mobile-react/address-types-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| address-types-master | 1 | `34423c0d5966193b3fe39f7c51d906efeed561273804061940fffab0d58715f8` |
| address-types-master | 2 | `48a0e4532c4f21d1a84d293b2089aca0d66a68888d892ae5c357ab58135b2989` |
| address-types-master | 5 | `ccb14984128ac28dfb8f9a04adaa8b43aa73931d1240318268eca4ab25452ba3` |
| address-types-master | 8 | `d644b335ee5a2463885136b0a10c31dc4dd5af695866e6a2bbb825356a29fcfa` |
| address-types-master | 9 | `7600fe70c892d1e5b846ec248fa105756c3b54bf86e3d51b2ade23f848b9fe89` |
| address-types-api | 1 | `a89af44849dac3d3d1cfa2eca1a0fda8d2484642a726a9b1bf1f84ca0a58a05d` |
| address-types-api | 10 | `a6b047ce552f06a101f0d842e1d2a5073f8422c48228f4a1f548e88a7a481079` |
| address-types-api | 11 | `12fedea5d53799940a3d74558d235c8e70543d220aa2c651dfb8f0da1123a1cb` |
| address-types-web | 1 | `b3020d62bc94049712c0a2f15d7435292ce16aaa254409856a6bf7c7405cc499` |
| address-types-web | 2 | `566c1bb2e2d57ebcaf5853637d29939bf6c53061d7ddff9fdb92740ec3ae4f66` |
| address-types-web | 12 | `79c8b65d2b3da2c9f670533292936c9cc7c268333fc03488b6e3f321ea75e4da` |
| address-types-web | 13 | `2bd84244023861a16a3969ed4ce8128912ee46de5ae8b9cf76fe928dd7480d5f` |
| address-types-mobile | 1 | `638b28e532a39d37667bbc8fe949baebd73954e99acd2d6cfc6c1f6d52d2837e` |
| address-types-mobile | 14 | `b38f608a88bd0703b059047dbd8102d44f80b028d6959f2fc9d0b2dc69d2b4aa` |
| address-types-mobile | 15 | `22bf074cab1a83481fef4c63b81aaa5747d0fc1f013506c2e02e2c2cc1ba7f7f` |
