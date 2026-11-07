<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Super Admin System Error Logs and Settings parity Phase 03 - Expo Mobile Client

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

- **Super Admin System Error Logs and Settings parity cross-platform master review:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-review.md` sections 3, 4, 6, 7
- **Super Admin System Error Logs and Settings parity Expo implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-logs-workspace-master | 3 | `74b5b6bc297245ac52302d58ff8c4130a89c8d3879aa68d314a08fb9b18928d7` |
| angular-system-error-logs-workspace-master | 4 | `ea13c26fe451e25e2389849c6baa46db19db0e2e5818b47fcacd55b3a2281a0c` |
| angular-system-error-logs-workspace-master | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-master | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-mobile | 1 | `27221500c9f680320394bf82abe2ef357c178b2212de64093ad06e5d7192f3bb` |
| angular-system-error-logs-workspace-mobile | 2 | `a749dd385b666bb616eac51f085fa68edaec20e091f7f3e14c18712f8d4d71c6` |
| angular-system-error-logs-workspace-mobile | 3 | `74b5b6bc297245ac52302d58ff8c4130a89c8d3879aa68d314a08fb9b18928d7` |
| angular-system-error-logs-workspace-mobile | 4 | `ea13c26fe451e25e2389849c6baa46db19db0e2e5818b47fcacd55b3a2281a0c` |
| angular-system-error-logs-workspace-mobile | 5 | `0882b5ee797d72df822b3a2c64474f56b81c240a86bc3e7e038952b3db0569c4` |
| angular-system-error-logs-workspace-mobile | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-mobile | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-mobile | 8 | `6f43bfd7053bfa065d6f1e2bceb15dc4556e7a92bd21fced18040a30cc8a7845` |
| angular-system-error-logs-workspace-mobile | 9 | `e98c2390ea74ebb9e125f9ab193cb9ee91f6be26ff2a951666083039aae33ba0` |
| angular-system-error-logs-workspace-mobile | 10 | `fee1dff779bd0040e0ea1567ddd715c9152f9f2552db2323caf2732ad03c6d0c` |
| angular-system-error-logs-workspace-mobile | 11 | `24d7b0fd035ab332a688f41685fc07897e3643351b53a90c627dfd8403d37d72` |
| angular-system-error-logs-workspace-mobile | 12 | `cb8f7cc1d6276dbb248c5cf26c5e0b4ec1908c4046c4fede247f84ef682b7bb2` |
| angular-system-error-logs-workspace-mobile | 13 | `fdbb006d3d48d5ad6b83e2df730882633dd79bb9420e888b6a55a49af0c3e3e8` |
| angular-system-error-logs-workspace-mobile | 14 | `e3d8de172d1efdd565cda4f84084894bc4c4ce6470f45b077f09da519e71c756` |
| angular-system-error-logs-workspace-mobile | 15 | `5fa233a8133ed08729a070c8ce7019ae46f3ae101678ceb4a0bcfc93d16a2409` |
