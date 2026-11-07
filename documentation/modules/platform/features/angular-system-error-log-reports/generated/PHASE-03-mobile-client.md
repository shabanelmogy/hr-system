<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# System Error Logs managed reports Phase 03 - Expo Mobile Client

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

- **System Error Logs managed reports cross-platform master review:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-review.md` sections 3, 4, 6, 7
- **System Error Logs managed reports Expo implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-log-reports-master | 3 | `af5eaaef486626fff1d4354733e65c1a9458f5ef9609f6286761ecb451b0998c` |
| angular-system-error-log-reports-master | 4 | `dae0a8847e44166632877639f7e93fc1a1262ee7002bda5355bcd1760d2c3a68` |
| angular-system-error-log-reports-master | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-master | 7 | `6b5a31169e46bb252b0ed56eb85abd716a87d874baa33973d080d38a2c31fa71` |
| angular-system-error-log-reports-mobile | 1 | `f7cd7664118897df3aaa7c45aeea2ed29157b85da2bb5f846db5b5ff413aa3bc` |
| angular-system-error-log-reports-mobile | 2 | `acb734f7fe636701495dc27f6aefd8f51be19fad48557bb58dc1bb66567cc219` |
| angular-system-error-log-reports-mobile | 3 | `af5eaaef486626fff1d4354733e65c1a9458f5ef9609f6286761ecb451b0998c` |
| angular-system-error-log-reports-mobile | 4 | `dae0a8847e44166632877639f7e93fc1a1262ee7002bda5355bcd1760d2c3a68` |
| angular-system-error-log-reports-mobile | 5 | `3e6d9e67aea112290c14f307c982dc4422ce1797a871b9b987994981f78d8723` |
| angular-system-error-log-reports-mobile | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-mobile | 7 | `6b5a31169e46bb252b0ed56eb85abd716a87d874baa33973d080d38a2c31fa71` |
| angular-system-error-log-reports-mobile | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-mobile | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-mobile | 10 | `bdfecdeaebe5da652531314b0993ce8305ec61732bb2a9c3bc48a95a44ad8702` |
| angular-system-error-log-reports-mobile | 11 | `aae000f51a6f9b0334a5a5aa321b6e2c6b76c49ea421e9a824f371f1dfee332b` |
| angular-system-error-log-reports-mobile | 12 | `8125463a4a9faf6d1eeda71c0caf1abc750b8a0a9afd80a5440f652e90100fb5` |
| angular-system-error-log-reports-mobile | 13 | `08f6995929a83ec1ac6c34252634c5243c37e8604893f55ed49a6bc07618bd82` |
| angular-system-error-log-reports-mobile | 14 | `8b59218e61eeb3245be416d8587e27993a11d382de227f9eb4259bb6d4074b22` |
| angular-system-error-log-reports-mobile | 15 | `0f99b0d679a29e602977f35588d63f7879a3936a7fa55b7684ea56bb09879e3e` |
