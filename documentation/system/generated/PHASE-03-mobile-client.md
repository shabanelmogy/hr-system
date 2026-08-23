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
| master | 3 | `b0ae30454b32e1209cd9b74f1bc82d45e58ae969a61381a25c64c86db7b09dfc` |
| master | 4 | `b23b2333eb1c612669ddd269677711f77cebee002628a2903f3e10262a5184f3` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| master | 7 | `8c0ba157ab3e6ca7bfa97bd23bdd022523f69dc7ac4386e25462b7ad667ba74b` |
| mobile | 1 | `bf4af029074342fb9fc3f65bb2b6318e9d0c43f6ffd1402c2002116b569d0673` |
| mobile | 2 | `21269af699d3bfad64b852c262d640017d620ac4165fa112561ef66626153552` |
| mobile | 3 | `05c43121f9e201c08aa8356ed711924ff1a91a038db3ddf633796c8835702c87` |
| mobile | 4 | `f5ce92dbb6d17898546916a7c8e3977026115f190308dae9a28027f426395172` |
| mobile | 5 | `a8862d47b1bee84a02c6caa4838feefa79fde5a6cdee50e824d60a8b0f3b1ca1` |
| mobile | 6 | `21ec930f0a14a154b337a7688f5fcf841ce5ced6dbea9395d75ee560cdece341` |
| mobile | 7 | `0387a7c2b9f4764d575babd630579dec932625fe36a0d8fc9e989947a6c60da3` |
| mobile | 8 | `24c1f8dd3b00a3f16ac296456dc540f466ff6b9427c91872a2cb8f493b1ccd61` |
| mobile | 9 | `5ef93ec2560d73ca4fd0f404d414633343637e2b68174c82c86c059bc49493da` |
| mobile | 10 | `7d90a6bd3148af61cc84222408c9349630432fd3c40780d755e1212ac0e76171` |
| mobile | 11 | `6713a595a06dae100c2d8f6e08528cf24699bc5a12d243524b2c02d8a5d837e3` |
| mobile | 12 | `0f0448cb6bfbd6c14def633a07bb9148564323efd7e372d4f678a2a9f8d41153` |
| mobile | 13 | `1f0f8b7b8c92b9369e959b65efe432990dd4c7061eee4d9eb6aa27905bd575c0` |
| mobile | 14 | `b15ec26feac731016fd8046fd86d415a59c3a77bee168ed75179ae98b1b28e3d` |
| mobile | 15 | `ce8ca1b504d5ecd725af6094f99b0eb4d45aac0bb272157ad9698c3fc3c6d549` |
