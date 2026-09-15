<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Phase 00 - Discovery and Evidence

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

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 1, 10, 11
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 1, 2, 12, 13
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 1 | `798b69347ec7d57ac0316410cacf60d22b6c36e611f001e8a9c46528bfa58a1f` |
| master | 2 | `0794481a43aa54cb296072e5a337fa49921243fe72d47443f2e40af16c493a1d` |
| master | 5 | `d1ce57b8f419de334ddea6c04f0bb927922654de3f2fc5f6093e5d8c40f83495` |
| master | 8 | `f29c1f43d4c99ad67f8520f2bd4f2bc1af0abc7b40c7a9ab14e84c7d188f9952` |
| master | 9 | `a4ffe5ca7864d7fa197622257f5d2459398648d8ec1f3d60f0ce0c56f78b4766` |
| api | 1 | `a0977b60e2a09823da430522f9939915d8529c5c078859a35c5c4f6125dff514` |
| api | 10 | `1101f8462765ca7e0bfd63c534f2bed36aa85d10a528bc168655e1774e01d2fc` |
| api | 11 | `059fff9e1378472918ee0a64ec018e379c25eaa0484a4f2aa51bfe6e6ab6e266` |
| web | 1 | `7f43439bc1ffeab6c2042b322ac8bef67dbac2763e12a128700ee9d5e2c3ce5e` |
| web | 2 | `a7dfd543a71ab0f53cc6de56e289e80fcc53265de11e68ae456b437f528e1323` |
| web | 12 | `7e1719746bfe470e8b8e620c2aa6ae5618be17d388c4a6fdb1a58f9aa7d72ae8` |
| web | 13 | `925292683f8fed347b4aa5f9293d3efa108806abd4dd474df7d04a02c0fefb14` |
| mobile | 1 | `74f9d7542b03da6ef4970fc1de160f5e7deeb10f9865621b1e00d3d91b9defe1` |
| mobile | 14 | `08cb057f3997117b0ae4d276616cec02b645fa8bfdff10907253644d7360112a` |
| mobile | 15 | `7fd51151939907e42eeda66b24dcbcefc87b13a2563a2e8ee45715b98f02b0fb` |
