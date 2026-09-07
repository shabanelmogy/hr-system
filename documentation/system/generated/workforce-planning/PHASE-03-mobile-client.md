<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Workforce Planning Phase 03 - Expo Mobile Client

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

- **Workforce Planning cross-platform master review:** `../project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Workforce Planning Expo implementation profile:** `../mobile-react/workforce-planning-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| workforce-planning-master | 3 | `8a6e6f69a054988c340491b10518046b54afe615727bf4fc084bb455b37e868b` |
| workforce-planning-master | 4 | `159708f556ff4c7fd6abe33b8953d5e9f2024ef3b688fb8fa310e5253c622625` |
| workforce-planning-master | 6 | `aca3820d1e8cceabd1d783a1fec9e1265ae8fe95ea335ed7d5469e4e39f43829` |
| workforce-planning-master | 7 | `be08f8b94bfb467005917ed0b5875f676b1069c96678fea62b082c1ad6041852` |
| workforce-planning-mobile | 1 | `94737446979c0eb700399f8366c713560a174d1874bfa2dd1843e73ec66f232a` |
| workforce-planning-mobile | 2 | `5496effdc53dd627494401e4ab27129427cb36867b292bc40e3d91a3b4e392f0` |
| workforce-planning-mobile | 3 | `cfd61d6b1c9ec0977386b9f8057976db5bb825d1ba7e9b8d1f74c04af57e99e3` |
| workforce-planning-mobile | 4 | `4f94d89f155b9072fcc6fdbc93703ed132c87f5982fea722c03e5077a11a0c4a` |
| workforce-planning-mobile | 5 | `dd432f179dfc18338ffcd60ab997eed5ae5fc33b638b545e42f8c86bf8922fae` |
| workforce-planning-mobile | 6 | `4221b0901c6feaaea6eef78ca53d4646a4f983e4615bd607e8359e1c8239bcaf` |
| workforce-planning-mobile | 7 | `0532ac32535a13d38555c071e1fd01ac4b4ad6860b370726d3562fef88a7e304` |
| workforce-planning-mobile | 8 | `5bef6aeb663050ba7327f6911f771b7a4960922dd911684bc3c9a9206acf1461` |
| workforce-planning-mobile | 9 | `882c73fae541af6359faff0264916014a65e38fa60b0d6b195016b389b460910` |
| workforce-planning-mobile | 10 | `8b43775cd8eb7d818751b4fe5f71fe7496b7425fb38b86894ba9c172e30f5471` |
| workforce-planning-mobile | 11 | `8dd034f4bc5ac13c8db4677149426911c07a7cb253950525a16057ff221f4062` |
| workforce-planning-mobile | 12 | `0f86b606461f3c155af19fcea49a744f5829e9aa0aaec1a14223178af2ad43a9` |
| workforce-planning-mobile | 13 | `bddab343dab9c5e70b71b23e81bd88d9e73a63a4ed38b26ca68b6d65a2273ae4` |
| workforce-planning-mobile | 14 | `433eadc88c76ad2c72e48c5b4e683a42e208f9f2720e8a7c8017f431a55e8a16` |
| workforce-planning-mobile | 15 | `e886a90cc9a59d080e123c96c072ea5ed243174544cdc9aa468996bc2ffc8d35` |
