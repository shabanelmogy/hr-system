<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared date-only field preparation Phase 03 - Expo Mobile Client

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

- **Shared date-only field preparation cross-platform master review:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-review.md` sections 3, 4, 6, 7
- **Shared date-only field preparation Expo implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-date-field-foundation-master | 3 | `23e20132deb3637d09a0d142107706cf24c8632497d450987b365993df49b620` |
| angular-date-field-foundation-master | 4 | `56869c4802b77dda2f3a6eeef12e8209e60500e47881aa4fe0ad96c412c55dfe` |
| angular-date-field-foundation-master | 6 | `5c78dd050fbcee69f99914bc203a48759ad20907e1032ec5d90644490a960545` |
| angular-date-field-foundation-master | 7 | `9e324801adf4cf50a669bbae92c944015e530449d22cf0cf35026ba210f27ca7` |
| angular-date-field-foundation-mobile | 1 | `e1cfbfca434a9117317544364b7e5a6a398002cda16ec9ee54a8abb4c7367fde` |
| angular-date-field-foundation-mobile | 2 | `03c61b99033bd1593dd5779780201572cb293c0e091427973fa776ed09def764` |
| angular-date-field-foundation-mobile | 3 | `23e20132deb3637d09a0d142107706cf24c8632497d450987b365993df49b620` |
| angular-date-field-foundation-mobile | 4 | `56869c4802b77dda2f3a6eeef12e8209e60500e47881aa4fe0ad96c412c55dfe` |
| angular-date-field-foundation-mobile | 5 | `a2a7ccac6b034a0df0387c0ab05e3e205958fa486ba545ee98dd7851c121aaad` |
| angular-date-field-foundation-mobile | 6 | `5c78dd050fbcee69f99914bc203a48759ad20907e1032ec5d90644490a960545` |
| angular-date-field-foundation-mobile | 7 | `9e324801adf4cf50a669bbae92c944015e530449d22cf0cf35026ba210f27ca7` |
| angular-date-field-foundation-mobile | 8 | `5b2660e078c4586cc2203a485dea38bfb6d6d3a8456596f5f8d4e7f17a6a3143` |
| angular-date-field-foundation-mobile | 9 | `46307ad33ca60cd0d2aa6779fcef25809b5bddbbe6ed0910a56c0fdb22e6b0a2` |
| angular-date-field-foundation-mobile | 10 | `33fde289be4b6f5d29ee9fe5f5cd9501b57d5b726426a2b13fe47e40fa5a2b8b` |
| angular-date-field-foundation-mobile | 11 | `81fdb53d5c5d5e91e6457833d212cff7677988658c8317d72325e3201ab4a18e` |
| angular-date-field-foundation-mobile | 12 | `75229fc755f98c53d03581d4c11eda0d4f0117045aa427d1334deca8962a57cd` |
| angular-date-field-foundation-mobile | 13 | `2f661a94a6cb2dc6efcf39e10063dad86731f89d1500882203d3aeb3925a2728` |
| angular-date-field-foundation-mobile | 14 | `653ba6d1ef25f1f9f25ab3b3dfecec57ff644a3bd68d4b7ab062ff840c119c60` |
| angular-date-field-foundation-mobile | 15 | `b7c9adf55029b1a27c4837a63414631a0a6cd88aefd93a54337afef3007199b4` |
