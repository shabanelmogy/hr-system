<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Angular shared collection foundation Phase 03 - Expo Mobile Client

## Purpose

Implement the Expo client as a native presentation of the shared contract, using the same server-list and lifecycle semantics as web.

Execution reference: `documentation/guides/mobile/MOBILE_FEATURE_GUIDE.md`.

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

- **Angular shared collection foundation cross-platform master review:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-review.md` sections 3, 4, 6, 7
- **Angular shared collection foundation Expo implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-foundation-master | 3 | `bdac0a1efba83f9b9d2427afe0d8495ba77c34ff3774897c9e6c43ed082a5dfa` |
| angular-collection-foundation-master | 4 | `3846922f56bb2f0dd5bc8f55b5c64f733b425d1ea2943bd56ea4c708751fc849` |
| angular-collection-foundation-master | 6 | `983ed69fcd0a2160a70725c73120734deec395f8025415ca5e46661d4fec6f25` |
| angular-collection-foundation-master | 7 | `5641f423c2c6f22020977d5980a19cea09f05fc56824c8f37a5db50819dfc9a1` |
| angular-collection-foundation-mobile | 1 | `a9babd7b0386fa829ac02d973057e96ab29761c7cde3a2f73806ca5da3a0a77a` |
| angular-collection-foundation-mobile | 2 | `ab50d090b58609d2bd08a52ba5b40d1e7769f63398e9370d31c02347f9a60078` |
| angular-collection-foundation-mobile | 3 | `bdac0a1efba83f9b9d2427afe0d8495ba77c34ff3774897c9e6c43ed082a5dfa` |
| angular-collection-foundation-mobile | 4 | `3846922f56bb2f0dd5bc8f55b5c64f733b425d1ea2943bd56ea4c708751fc849` |
| angular-collection-foundation-mobile | 5 | `eb41e60b3ccb7bff3e9779fbd2fae7ffbb4abe217a04bb29cd5b42cbcf12b7f1` |
| angular-collection-foundation-mobile | 6 | `983ed69fcd0a2160a70725c73120734deec395f8025415ca5e46661d4fec6f25` |
| angular-collection-foundation-mobile | 7 | `5641f423c2c6f22020977d5980a19cea09f05fc56824c8f37a5db50819dfc9a1` |
| angular-collection-foundation-mobile | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-mobile | 9 | `72b4e325040d35ad3426bf2fc0686fa85b299e5f2e349735a570c0cd93a88e25` |
| angular-collection-foundation-mobile | 10 | `7653f373d77818eab834faf40a1877d9492456d68d7394c81de97df13dc9c17b` |
| angular-collection-foundation-mobile | 11 | `900f3d8706f3bbad21a81d915d3c5e875b5862f8c4f8df0f37d9834504346239` |
| angular-collection-foundation-mobile | 12 | `01f711480bf46a59884a1c0ef5ecf9efadacc73f531d0c69236f14d5b91e43e9` |
| angular-collection-foundation-mobile | 13 | `22c80fdb52fd1cf880f807ef351f9851f394bfa956c756b6ec4e84e9e22128a1` |
| angular-collection-foundation-mobile | 14 | `2495418f57ef4e931d5971a7f5cf495934d28d1da4b34398894c657e7853a3fc` |
| angular-collection-foundation-mobile | 15 | `9088a7ed9203940469f0bda4a96bae95ef7ff7144ef4d527d137fe7d1ce09932` |
