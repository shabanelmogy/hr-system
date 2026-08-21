<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Phase 03 - Expo Mobile Client

## Purpose

Implement the Expo client as a native presentation of the shared contract, using the same server-list and lifecycle semantics as web.

## Required structure

- Thin Expo Router file and a typed route constant.
- Route-manifest permission guard and navigation entry.
- Feature public API plus feature-owned schemas, endpoint wrappers, query keys, hooks, screen, cards, form, report, and tests.
- Shared list state, data table, form, screen, header, feedback, and responsive primitives.

## Read and interaction checks

- [ ] Zero-based device state converts to one-based API paging once.
- [ ] Search, filters, sort, page, page size, and selection have one owner.
- [ ] Search or filter changes clear stale bulk selection and reset paging.
- [ ] Table and card modes consume the same page and server total.
- [ ] Compact widths, touch targets, safe areas, keyboard avoidance, and orientation changes are verified.
- [ ] English, Arabic, RTL ordering, labels, validation, and screen-reader names are verified.
- [ ] Read-only mode and permissions disable every mutation entry point.
- [ ] Archive, restore, bulk, report, notification deep link, and realtime refresh behavior match the API.

## Mobile-specific decisions

Record whether detail requires a dedicated query, whether reports open or share locally, which filters are exposed on compact screens, and how forms handle offline or retry states. These decisions may differ from web but must be explicit.

## Approved references

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `92135fc9b114e7094a6b019dbd6d9ee5c3a33641c4586487689d2b8f65255a5a` |
| master | 4 | `d37a682ba9744f70bdcbcc638c1e4478487a97d079da7960b292ae7746c784bd` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| master | 7 | `a569747a5ae09a0eb3f1619080e56572e4f79a0c722408583485e404f2654f8a` |
| mobile | 1 | `3908ad84e0021b6aa47e39548ddf2e6304b14ae22b26209f1e9841d26856fbe3` |
| mobile | 2 | `21269af699d3bfad64b852c262d640017d620ac4165fa112561ef66626153552` |
| mobile | 3 | `01e73f1b2e5f96346140b0e92cf9e7764f40491ca271649ab37cec2fe46bf0c0` |
| mobile | 4 | `16b53e928be0b38fb1ee88edef09621f89fa4684bc459606463551fb7db14a8c` |
| mobile | 5 | `40d2317a787c592dd818b87d6d27fc59a20635e1b116638256ff81c6d05249b6` |
| mobile | 6 | `91055a37370ebc99d087aeeda98208fc27a0488ab87f9bca8774e6dd861ff6a2` |
| mobile | 7 | `07bcdd9eb483215a63cbe28b2fce794dd8b8b40c738f90bcd64f0ebb75bda548` |
| mobile | 8 | `24c1f8dd3b00a3f16ac296456dc540f466ff6b9427c91872a2cb8f493b1ccd61` |
| mobile | 9 | `5ef93ec2560d73ca4fd0f404d414633343637e2b68174c82c86c059bc49493da` |
| mobile | 10 | `7d90a6bd3148af61cc84222408c9349630432fd3c40780d755e1212ac0e76171` |
| mobile | 11 | `c40a360cd02c08732fae89e680c641e2a251a818b9e84456a47e618f84c7b8e5` |
| mobile | 12 | `0f0448cb6bfbd6c14def633a07bb9148564323efd7e372d4f678a2a9f8d41153` |
| mobile | 13 | `1f0f8b7b8c92b9369e959b65efe432990dd4c7061eee4d9eb6aa27905bd575c0` |
| mobile | 14 | `b15ec26feac731016fd8046fd86d415a59c3a77bee168ed75179ae98b1b28e3d` |
| mobile | 15 | `1f4ec4134d0b95a3e858a7ad3c3c2457d03d0db1b92f97e8f885b56021174164` |
