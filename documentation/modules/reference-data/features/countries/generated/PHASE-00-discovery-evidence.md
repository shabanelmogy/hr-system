<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

Use `documentation/system/templates/FEATURE-IMPLEMENTATION-REQUEST.template.md`
as the copy-ready scope contract and the review artifact as the evidence ledger.
`Required` means current-release and gated, `Deferred` requires an owner/trigger,
and `Excluded` means no runtime surface.

For any API work, also follow
`documentation/guides/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`. Phase 00 cannot close and
runtime implementation cannot begin until the Existing-System Relationship Review
and all three Business Readiness matrices in `<feature>-request.md` are
complete for the known scope. Every Edge Cases & Validation category must contain
scenarios or an explicit `N/A` with a reason.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `documentation/modules/<module>/features/<feature>/<feature>-evidence.md`.
2. Record the operating mode (`new feature`, `existing-feature review`, or `existing-feature change`) and the selected applied reference with a reason.
3. For a new feature, create `documentation/modules/<module>/features/<feature>/required-files.draft.json`; do not register it while declared runtime files are missing. For an existing review, start from its final `required-files.json`.
4. Before final registration, replace the draft with `required-files.json` containing only existing repository-relative paths and evidence-based source-collection minimums.
5. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
6. Classify Import independently for web and mobile as `Required`, `Deferred`, or
   `Excluded`. Record the accepted format, data scope, dependency lookups, and the
   reason for every platform difference.
7. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
8. Record tests that prove each contract rather than only naming test folders.
9. Complete the Business Rules Matrix, Edge Cases & Validation Matrix, and Impact
   Matrix in `<feature>-request.md`; update them when discovery changes scope.

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

- **Countries cross-platform master review:** `../modules/reference-data/features/countries/countries-review.md` sections 1, 2, 5, 8, 9
- **Countries API implementation profile:** `../modules/reference-data/features/countries/countries-api.md` sections 1, 10, 11
- **Countries Next.js implementation profile:** `../modules/reference-data/features/countries/countries-web.md` sections 1, 2, 12, 13
- **Countries Expo implementation profile:** `../modules/reference-data/features/countries/countries-mobile.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 1 | `567bcbe8140a3780cad8a85d8c7666c6af5c668626b7c8863282dbdaead5af41` |
| master | 2 | `0794481a43aa54cb296072e5a337fa49921243fe72d47443f2e40af16c493a1d` |
| master | 5 | `c8c3b3bdf6614ff0b1275322bd5fdd5a96e55bb79a39c858e77805fe56d8ebf7` |
| master | 8 | `d984d8e0337d1a27f16371f454b72ff6911422bf8832f69f73e2139a49490e96` |
| master | 9 | `44596f3895251595f33c0bd7c652e16d184747f1daa7bb26e83654d378f71266` |
| api | 1 | `2e9e9761feebd4ef11aa7de428ee3050d31d7b13d2aea913052b3f29ab10122e` |
| api | 10 | `e77aa77e83c9fa0dafedf407d882c7567d9247d1bc71ff454e48eaca59dde75e` |
| api | 11 | `6d84c91a215869fec72ba6417807dd93cd296a61c118ace6429c3a0776378cc0` |
| web | 1 | `fd58f611647c37fd7220d81fed0778362b7aa7fc5ce6cf5d40c5347151bcba75` |
| web | 2 | `7918c07be1512c532f960cfdf0c1ff8af97542f1f3ceaf8e87a26eecb1accd08` |
| web | 12 | `86dfb0a78a771e2bd7e2c6f6ed760e7e143c70d2eed6cc0f4aebd272dcae7814` |
| web | 13 | `2cd09debee74a370deae0a9a1811b55a3b1bd8dd6fe2013b2fbc025b71766149` |
| mobile | 1 | `eae0a07946f3c480717b7c1fb31a153dbb821289c0467736ec5b4629f2dc6567` |
| mobile | 14 | `821155bfde49d32333e8fbece5e71af6ec9183a03ccc666245e97f44e582afd7` |
| mobile | 15 | `32d1f6ee2341d41982d3fa5530b5e1a450b8632602efd545f3c85a198cc222d0` |
