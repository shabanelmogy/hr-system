<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Company UI localization Phase 03 - Expo Mobile Client

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

- **Company UI localization cross-platform master review:** `../modules/platform/features/company-ui-localization/company-ui-localization-review.md` sections 3, 4, 6, 7
- **Company UI localization Expo implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-ui-localization-master | 3 | `ae522a981014d3db9c430fa6065b685a3e9ea8941f671ff038f99100e42c7daf` |
| company-ui-localization-master | 4 | `4bd147662b54d98c579aed8cff606deb90ad3a173bd56299833a23743eddfbb9` |
| company-ui-localization-master | 6 | `943b732392e0c38800ae8e34732c3eba94fae4f111c24dd29ffa5bb65826cf61` |
| company-ui-localization-master | 7 | `84585fc9dd5664a9529a4b399768755ef9aae77060fa2123401f07440f5cbd7c` |
| company-ui-localization-mobile | 1 | `737545a8ec9a6caad29ddccf0bb834e52fbf4018e1be3f5c1c3112140b30c263` |
| company-ui-localization-mobile | 2 | `cc59a46d73e4c858fe1f480031e1d0e63661c21a32353b9c0d8ca3a71c3bfdf1` |
| company-ui-localization-mobile | 3 | `a9d0c59c4bab363ba275a8470c458c3cca4ae1e7381d6c483d7a68ad0a123f31` |
| company-ui-localization-mobile | 4 | `7a5c95cf7ab333d00c4032fc472f7b2b5ec9af9f589aa4fd73eaab4c68e4b562` |
| company-ui-localization-mobile | 5 | `92191d773fdb2b53803181aae5cf36d042e5e30b6bd7289233e9ca25f1d77628` |
| company-ui-localization-mobile | 6 | `42528179383e3df6afdd089bfbe301106bd9cdca5a4e44e7c8f4f6703840c1bb` |
| company-ui-localization-mobile | 7 | `990211799c253b9ad4c95ce5d599828e8471574dade97b4954320e9084fc0904` |
| company-ui-localization-mobile | 8 | `68187684a5597e52010df9222e3bf5096ee38467c36e447c42badf898460ac5c` |
| company-ui-localization-mobile | 9 | `f4ead8335fdfa8198d3e95feb4ba0654788b0b859817a3e91fd98a9540fa0706` |
| company-ui-localization-mobile | 10 | `4618cad0837107f97db6a31c332b07dc7b28cc96b8d1981871305dcd4290a853` |
| company-ui-localization-mobile | 11 | `a60d252f08206ad41a752583668c2cb3bbd03680c84ec4352a3e263e6296c6ea` |
| company-ui-localization-mobile | 12 | `5fd60e867cfca77071ee32c5414c78e9e1d5410f7d126aacc4e1ba481d702e8a` |
| company-ui-localization-mobile | 13 | `24ec361dca646b49f5564374cdc25b6f4246f4e8fe19e8c47730b08f47596b03` |
| company-ui-localization-mobile | 14 | `1970d14f7733bc4a36b1dfd8d4fa8174672cffe378f7d44341b67f6e5884b0bb` |
| company-ui-localization-mobile | 15 | `abdd7be309129ae44f826a2ef3210c9d6c4ef5ec58e8a4deae184a8d239fd0db` |
