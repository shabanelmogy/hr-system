<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Countries managed report integration Phase 03 - Expo Mobile Client

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

- **Countries managed report integration cross-platform master review:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-review.md` sections 3, 4, 6, 7
- **Countries managed report integration Expo implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-report-view-master | 3 | `dac0aafd01072bcd072b7fb9173bd520856278ceda3129d7325f20ec8a47b325` |
| angular-countries-report-view-master | 4 | `3b38fdb0f0c035d49d625c0ef5925ea5dab689790a0e902b6d14455d457ffc2e` |
| angular-countries-report-view-master | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-master | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-mobile | 1 | `387934e62c1e0197f4894fc3b143548ac4b5776cbffe763057b6aa3de8a68e59` |
| angular-countries-report-view-mobile | 2 | `1abd6291624d06e3d1f34333891ca796a9e00f8aa20cacadf888cd301df5a66b` |
| angular-countries-report-view-mobile | 3 | `dac0aafd01072bcd072b7fb9173bd520856278ceda3129d7325f20ec8a47b325` |
| angular-countries-report-view-mobile | 4 | `3b38fdb0f0c035d49d625c0ef5925ea5dab689790a0e902b6d14455d457ffc2e` |
| angular-countries-report-view-mobile | 5 | `43b959cae6bb10e1d9bcf2e172b2478bedb17a95f07dcf801fdebabb55016a2b` |
| angular-countries-report-view-mobile | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-mobile | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-mobile | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-mobile | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-mobile | 10 | `13d60bdce102af4d3de471b1c12d188b22f6defca177537ecb29b0a236150bca` |
| angular-countries-report-view-mobile | 11 | `07d4a23ab10ebc939015f30437df95f269e1947926ae9878cceb0fd53cf1d7f2` |
| angular-countries-report-view-mobile | 12 | `d00ef73c695843a04a35e438f8baf2757d912e610092d13ab610d3e29eaf9625` |
| angular-countries-report-view-mobile | 13 | `70cc223c7e0e082bc94d8dc214ce9a5a1cc7d1692876327bd4cf761090c4e345` |
| angular-countries-report-view-mobile | 14 | `dd66464a591dcdb36b27d479b433ff9c893b83e74dfb2f3b93099c11b1bb1775` |
| angular-countries-report-view-mobile | 15 | `77e437514d564ff8e9a24ba924f71ab6918acd8ba106c5c08f9577b533b90aa7` |
