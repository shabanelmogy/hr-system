<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Countries create and edit workflow Phase 03 - Expo Mobile Client

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

- **Countries create and edit workflow cross-platform master review:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-review.md` sections 3, 4, 6, 7
- **Countries create and edit workflow Expo implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-edit-workflow-master | 3 | `db3a081602bb5973134e4ce07713f62205089a3eb34649c6e76848d34e252309` |
| angular-countries-edit-workflow-master | 4 | `191dd68f7e834b4f6033d137a3fa9e59fd2a4ca303758d4fbe493e9159690254` |
| angular-countries-edit-workflow-master | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-master | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-mobile | 1 | `d46506912b9934a2c6ba023b994989f84386796cc2df6f50882477c3ed8714ce` |
| angular-countries-edit-workflow-mobile | 2 | `69e135396446c50c716b2a6a02dcf3c44a0c458a22831f62074b0f7bd160cc5b` |
| angular-countries-edit-workflow-mobile | 3 | `db3a081602bb5973134e4ce07713f62205089a3eb34649c6e76848d34e252309` |
| angular-countries-edit-workflow-mobile | 4 | `191dd68f7e834b4f6033d137a3fa9e59fd2a4ca303758d4fbe493e9159690254` |
| angular-countries-edit-workflow-mobile | 5 | `9e4c812bc1ac25ecc365f17515aaaceb899f41acf26ee693b6411da8de5c18dc` |
| angular-countries-edit-workflow-mobile | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-mobile | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-mobile | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-mobile | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-mobile | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
| angular-countries-edit-workflow-mobile | 11 | `adda81dee42224b01bc2856c4f6282a4e94dd40fce4d5c5c636539fb544f459a` |
| angular-countries-edit-workflow-mobile | 12 | `023c1f0759d9e28fd51a1d3bc5d29849c23a156b2bfe19bebc5559ee18334fb9` |
| angular-countries-edit-workflow-mobile | 13 | `4f2482d3a8078435c3b1aa19e3a5c242fc8a6ca5bafd8027bbb30d7446eee075` |
| angular-countries-edit-workflow-mobile | 14 | `fedd30cc133188972b1381cabddc8b91141c174788a8138b9bb8d0eb2f20f366` |
| angular-countries-edit-workflow-mobile | 15 | `3bdb97fabcca5472fbecbb8945f60ca7500fd39e3eef75a68338e90f6bc895c5` |
