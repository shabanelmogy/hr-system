<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Tenant module entitlements Phase 00 - Discovery and Evidence

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

- **Tenant module entitlements cross-platform master review:** `../project/TENANT_MODULE_ENTITLEMENTS_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Tenant module entitlements API implementation profile:** `../api/TenantModuleEntitlements_API_Implementation_Profile.md` sections 1, 10, 11
- **Tenant module entitlements Next.js implementation profile:** `../web-next/features/tenant-module-entitlements-frontend-reference.md` sections 1, 2, 12, 13
- **Tenant module entitlements Expo implementation profile:** `../mobile-react/tenant-module-entitlements-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| tenant-module-entitlements-master | 1 | `7a1664dc8692c84e5f0d34ce051180c314ed505deafeefab8a059c6fc68126c3` |
| tenant-module-entitlements-master | 2 | `2e7b60ecd221f14bb754a9726ee770020e87de7cf5f79b4a518fc80165a6696e` |
| tenant-module-entitlements-master | 5 | `33487ff92f7cbe8016aefa881fa307cdd8cd24645d06255261b68bcdcf41b1c9` |
| tenant-module-entitlements-master | 8 | `9e8b5674dbf4c97a1895c5d66c203aa67822631d4a66c0fc6db7f1af3d97aafe` |
| tenant-module-entitlements-master | 9 | `60c69fc638e2b14a82907e3c7d6c6a9b1df99042b776f0ba848ff33754256bfe` |
| tenant-module-entitlements-api | 1 | `040a7eab03d342360325a061f06bf27f1b2c9cacc8559af835b40daf87950528` |
| tenant-module-entitlements-api | 10 | `479d38c1e960adbe09bc5ce6f8690f88f99ada41c5d71bdc25a8197d56d9913e` |
| tenant-module-entitlements-api | 11 | `2a6817fbd4f4f819446478653927804e26295f987e42cfd9a22c7b13a30074f0` |
| tenant-module-entitlements-web | 1 | `92537e75c7e2394ffe61cb474399c65abd0606a68251ac628ab549ef8182397a` |
| tenant-module-entitlements-web | 2 | `f244e2800352bed39f0e4db75904dbdde70021e3ff14b2ac7f483256503e7687` |
| tenant-module-entitlements-web | 12 | `e78b2a2fdec5376b2db3df3a3445f1a1540910ebb1a87b98bb58214ec3561493` |
| tenant-module-entitlements-web | 13 | `8d4e22b075f697513becfe7f146ec4fa5f7448c429f001a46927bb8b448c0529` |
| tenant-module-entitlements-mobile | 1 | `dac449024ffa05afd4c86f4dca97b17ef88bcbb19f9786faa0702c25233b035c` |
| tenant-module-entitlements-mobile | 14 | `ad56df437717354886dddec6587c7b805f7e2e539e5f767b81c01b85629aa8dc` |
| tenant-module-entitlements-mobile | 15 | `32851ba2d1639f1c905ebf6269b6f55623aa6856171421fed3edd2ce5034715c` |
