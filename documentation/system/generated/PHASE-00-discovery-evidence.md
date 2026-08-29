<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

Use `documentation/system/templates/FEATURE-IMPLEMENTATION-REQUEST.template.md`
as the copy-ready scope contract and the review artifact as the evidence ledger.
`Required` means current-release and gated, `Deferred` requires an owner/trigger,
and `Excluded` means no runtime surface.

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

## Approved references

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 1, 10, 11
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 1, 2, 12, 13
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 1 | `940a6d02fc22cc3fe9a81143c5965727e6c191a22f83172574ccfac68485dcda` |
| master | 2 | `0794481a43aa54cb296072e5a337fa49921243fe72d47443f2e40af16c493a1d` |
| master | 5 | `bc5395fc0e8362797211912f6e6b9fa911c2e97797953a9effe73f2adff5a228` |
| master | 8 | `a108ec6b97e876d70a3958b477a3e44dccfbb7e78698a236224a91f36ec2db6b` |
| master | 9 | `abba6bf0a3940b1b8b716d85be4964c054059387ffe9897256bd60f0093d141d` |
| api | 1 | `32d383dbea72903c12b0dd2d1b90c2ba6a10d6621ed91ae24f466af2563cd9c7` |
| api | 10 | `4a41ffbc7aa486b4e9401a2ede459b9e1a905fa44b64c4fa765bc431341b8f84` |
| api | 11 | `ef12f7d3abd1205116e4563b99891e78af2bbe1d1f3a0e8f957465618e814b9a` |
| web | 1 | `379e8685bd53e584670fec8f36c9e7dd3cfa12238c6466320347a7f00cfc6fdc` |
| web | 2 | `07678043219ba47afeeb50860fd12813f00028c7ec72cca8630d3671314b8d32` |
| web | 12 | `7e1719746bfe470e8b8e620c2aa6ae5618be17d388c4a6fdb1a58f9aa7d72ae8` |
| web | 13 | `3a78555f943e8934b512813fb738bb774d429bbc68dff3ad58a9da46199f55fc` |
| mobile | 1 | `bf4af029074342fb9fc3f65bb2b6318e9d0c43f6ffd1402c2002116b569d0673` |
| mobile | 14 | `72286a76f99d350c43eb2cc1645ac0aa89055b23b096e9d8af98bc4935c85430` |
| mobile | 15 | `504bef869eafe4d776837ca41e9160b58a5e45439b85cb6a79c8e340f736b967` |
