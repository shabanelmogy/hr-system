<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Districts Phase 03 - Expo Mobile Client

## Purpose

Implement the Expo client as a native presentation of the shared contract, using the same server-list and lifecycle semantics as web.

Execution reference: `documentation/mobile-react/MOBILE_FEATURE_GUIDE.md`.

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

Record whether detail requires a dedicated query, whether reports open or share
locally, which filters are exposed on compact screens, and how forms handle
offline or retry states. Classify mobile Import as `Required`, `Deferred`, or
`Excluded` independently from web and record the reason. These decisions may
differ from web but must be explicit.

When mobile Import is Required:

- use a platform-safe document picker and storage API instead of copying browser
  file-input or workbook code;
- consume the same documented API envelope, limits, duplicate rules, dependency
  lookups, atomicity, and stable errors as web;
- provide native loading, preview, permission/read-only, retry, localization, RTL,
  accessibility, and post-success invalidation behavior;
- test picker cancellation, unsupported and oversized files, parsing, exact
  request body, dependency failure, API conflict, retry, and cache refresh.

When mobile Import is Deferred or Excluded, keep the decision in the feature
profile and do not leave an unreachable route, component, or translation surface.

## Evidence to capture

- Physical route, typed route, route-manifest, navigation, endpoint, query-key,
  realtime, notification deep-link, and localization registrations.
- Runtime schema parsing and exact request/query serialization tests.
- Phone/tablet, orientation, safe-area, keyboard, EN/AR, RTL, touch-target,
  screen-reader, permission/read-only, network, retry, and empty-state evidence.

## Approved references

- **Districts cross-platform master review:** `../project/DISTRICTS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Districts Expo implementation profile:** `../mobile-react/districts-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| districts-master | 3 | `923f376df8ba9dd4929c902b64805c838c20cc2ee6eafb6961157cb4484e8e8b` |
| districts-master | 4 | `73edb563ff159ccd70caafab0275db68887f98c3c3f22ecdfaaea7ee41b4fb2e` |
| districts-master | 6 | `bc842f66c8ecdd4133ee9a86a1901d41047bc8cc48ec01e8a302ca6ab510da07` |
| districts-master | 7 | `b4ca77c0fab6365d8f5202566b41f614348b21781231cb9bc97e4bd62aa9cd4f` |
| districts-mobile | 1 | `682435c23634ea28fe064a96e876c6289a69fe969be5a2aac50a1e81fe8c2730` |
| districts-mobile | 2 | `18881b6d1d70c7f055fc22edb5d5f998d3c3b2bbdb15dbc4393d5b5266205b41` |
| districts-mobile | 3 | `942b617b6013612afde2d0cf47558d52481c8c518bfde5751c25ab94b19eed23` |
| districts-mobile | 4 | `c195e9f9248eba06fb34dd1615ef030597c98981636d159e1b97b7d7859b8a28` |
| districts-mobile | 5 | `b13aa56cf4b6243b8d5799ec474bf9bdb535f4298c88cbff3ee699fcbd704f53` |
| districts-mobile | 6 | `8d13ce29304767bf2868f8b32f94b3d33330679070905d19b5ec19adf93cf970` |
| districts-mobile | 7 | `2be837354f30ae72b204813e842b35f21fea71a79bb04c82f506ead28a6dba32` |
| districts-mobile | 8 | `eeedb85840a48747919c76734ec36088419126e0adfed2245b2679505ddef39a` |
| districts-mobile | 9 | `c82f2ab7f567f35bc32da44ef6df42890e5b33628ddd5a0e0d48bd1e78b514bc` |
| districts-mobile | 10 | `34dd3fbd9e9adf72dd8ca8bfeb06bbfb6b6128192838fd704c4ee7a04d2703d7` |
| districts-mobile | 11 | `2168087827d6275ad0b45dc263ca1d342db0be761e705bdd276c7283ee141b88` |
| districts-mobile | 12 | `63cbda4a0deb59685dde71fa74036a1d7da9385f1b8b5a8013690deed266cc04` |
| districts-mobile | 13 | `f4c7bbf286b77d37b7e8cd6b91a2769da03afc1bfcf123d6e9aec6c322474461` |
| districts-mobile | 14 | `485ff7dc418e59ff8e15ebe9d20da50d60f68cfe972d1386d0984a047f3487f5` |
| districts-mobile | 15 | `659b10d4561775eeb6d72d7acce06a4515644958840ec7820f9097e7a1826050` |
