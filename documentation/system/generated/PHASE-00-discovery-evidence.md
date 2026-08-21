<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `features/<feature>/<FEATURE>-REVIEW-ARTIFACTS.md`.
2. Create `features/<feature>/required-files.json` using repository-relative paths.
3. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
4. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
5. Record tests that prove each contract rather than only naming test folders.

## Discovery checklist

- [ ] Domain entity, persistence mapping, and migration impact identified.
- [ ] Controller, CQRS messages, handlers, stores, validators, jobs, and dependency injection identified.
- [ ] Web route, feature boundary, query state, views, forms, permissions, realtime, translations, and shared UI identified.
- [ ] Mobile route, feature boundary, server-list state, forms, permissions, realtime, translations, responsive layout, RTL, and shared UI identified.
- [ ] Shared HTTP field names, nullability, paging base, sort tokens, filters, errors, and lifecycle actions frozen.
- [ ] Known gaps are listed as findings and excluded from the copy baseline.

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
| master | 5 | `4b5e21317ec85f4069a90ae400241c3669950251d859d6d30258815b66f476d9` |
| master | 8 | `3a46a1a850e082e79228d9471dad600b673f71194b1aaf0156a0828f07f7ba8e` |
| master | 9 | `abba6bf0a3940b1b8b716d85be4964c054059387ffe9897256bd60f0093d141d` |
| api | 1 | `32d383dbea72903c12b0dd2d1b90c2ba6a10d6621ed91ae24f466af2563cd9c7` |
| api | 10 | `6267cad08ac31db9d3fefbf5abda40d64d5be3e91d08b0eb42495ebd14b40aba` |
| api | 11 | `8cf8721b54c7ec180a44474d9f751d095233c9ab7496926de2a18a5d14f5abb4` |
| web | 1 | `064ed098ebe189727d7f97d579f6dacb34044372cda60ab6f67d1e7943386bf9` |
| web | 2 | `129f961feb274ccfa5b9c458008df1d43a3435a13001fcd9a06937d1bcf53ed8` |
| web | 12 | `7f655066219089b3a56fe9c1d009830d6f176e529de009bd3c577aacc357a84e` |
| web | 13 | `10a6cf1f7b73698bd57e74ccbcbe1b5a50fa96af854189b82ba63e75543e6f88` |
| mobile | 1 | `3908ad84e0021b6aa47e39548ddf2e6304b14ae22b26209f1e9841d26856fbe3` |
| mobile | 14 | `b15ec26feac731016fd8046fd86d415a59c3a77bee168ed75179ae98b1b28e3d` |
| mobile | 15 | `1f4ec4134d0b95a3e858a7ad3c3c2457d03d0db1b92f97e8f885b56021174164` |
