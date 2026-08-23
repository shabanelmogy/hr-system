<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `features/<feature>/<FEATURE>-REVIEW-ARTIFACTS.md`.
2. Record the operating mode (`new feature`, `existing-feature review`, or `existing-feature change`) and the selected applied reference with a reason.
3. For a new feature, create `features/<feature>/required-files.draft.json`; do not register it while declared runtime files are missing. For an existing review, start from its final `required-files.json`.
4. Before final registration, replace the draft with `required-files.json` containing only existing repository-relative paths and evidence-based source-collection minimums.
5. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
6. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
7. Record tests that prove each contract rather than only naming test folders.

## Discovery checklist

- [ ] Domain entity, persistence mapping, and migration impact identified.
- [ ] Controller, CQRS messages, handlers, stores, validators, jobs, and dependency injection identified.
- [ ] Web route, feature boundary, query state, views, forms, permissions, realtime, translations, and shared UI identified.
- [ ] Mobile route, feature boundary, server-list state, forms, permissions, realtime, translations, responsive layout, RTL, and shared UI identified.
- [ ] Shared HTTP field names, nullability, paging base, sort tokens, filters, errors, and lifecycle actions frozen.
- [ ] Known gaps are listed as findings and excluded from the copy baseline.
- [ ] The generated phase packets and fingerprints belong to this feature, not to an unscoped reference output.

## Approved references

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 1, 10, 11
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 1, 2, 12, 13
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 1 | `e0bdf1b56463e315f8026f3cc34150ade7ff7ad459b39b929a080021715cf766` |
| master | 2 | `e8b7af8c80e80ab94dbbc0b987e511012d04403e23c172f1372d8ed04f87125d` |
| master | 5 | `2cdbe8144a3a162b37b15d5ab908390ccf64c964ac18cc1808813d84d45fc994` |
| master | 8 | `0249a7c61a24b0331816644cdbbcd3369b27e8945293b4dbd0e2766a8d375cc2` |
| master | 9 | `abba6bf0a3940b1b8b716d85be4964c054059387ffe9897256bd60f0093d141d` |
| api | 1 | `32d383dbea72903c12b0dd2d1b90c2ba6a10d6621ed91ae24f466af2563cd9c7` |
| api | 10 | `227e13a27928f6d22c69cfa2b190b987539127edff9229588fc481c425639ef3` |
| api | 11 | `08b1f7e6b6ab5d9689bb020043c482e6c97e7f233e44fb535ff39881070075b3` |
| web | 1 | `66a9531a90a5b8e58c45035848107d5c0dd756d800a174869bafef93437a7715` |
| web | 2 | `07678043219ba47afeeb50860fd12813f00028c7ec72cca8630d3671314b8d32` |
| web | 12 | `7f655066219089b3a56fe9c1d009830d6f176e529de009bd3c577aacc357a84e` |
| web | 13 | `3d4ffdea15ae5bd3fde84ac212722f02339bd44568b04ac1b5f2041e24b61700` |
| mobile | 1 | `bf4af029074342fb9fc3f65bb2b6318e9d0c43f6ffd1402c2002116b569d0673` |
| mobile | 14 | `b15ec26feac731016fd8046fd86d415a59c3a77bee168ed75179ae98b1b28e3d` |
| mobile | 15 | `ce8ca1b504d5ecd725af6094f99b0eb4d45aac0bb272157ad9698c3fc3c6d549` |
