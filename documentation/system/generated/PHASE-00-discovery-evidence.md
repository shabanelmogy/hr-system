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
| master | 5 | `cb24f80f1db88436a8b59d0e32c44919af1c1aa66d7ca6f5ad280c4b496ba13d` |
| master | 8 | `eff03df20ff236d1351d1fe9db02a020b6bc12d5b91d415a6479e24ce9551b36` |
| master | 9 | `abba6bf0a3940b1b8b716d85be4964c054059387ffe9897256bd60f0093d141d` |
| api | 1 | `32d383dbea72903c12b0dd2d1b90c2ba6a10d6621ed91ae24f466af2563cd9c7` |
| api | 10 | `6267cad08ac31db9d3fefbf5abda40d64d5be3e91d08b0eb42495ebd14b40aba` |
| api | 11 | `8cf8721b54c7ec180a44474d9f751d095233c9ab7496926de2a18a5d14f5abb4` |
| web | 1 | `afc59d65a8209bc14b5d4becb81030171dbc8aeeac493cd921050b09f0a0b032` |
| web | 2 | `f166702ae5adff37b4063db6252f37dcc48b77f592200cebae0774a8a0e62fe9` |
| web | 12 | `7f655066219089b3a56fe9c1d009830d6f176e529de009bd3c577aacc357a84e` |
| web | 13 | `3091b276da25c62120d28b1d3fefcf7b11059b4c2e37cf887f144c218ef60316` |
| mobile | 1 | `3908ad84e0021b6aa47e39548ddf2e6304b14ae22b26209f1e9841d26856fbe3` |
| mobile | 14 | `b15ec26feac731016fd8046fd86d415a59c3a77bee168ed75179ae98b1b28e3d` |
| mobile | 15 | `1f4ec4134d0b95a3e858a7ad3c3c2457d03d0db1b92f97e8f885b56021174164` |
