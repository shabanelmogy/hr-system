<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Managed Crystal Report Manager Experience Phase 03 - Expo Mobile Client

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

- **Managed Crystal Report Manager Experience cross-platform master review:** `../project/MANAGED_CRYSTAL_MANAGER_EXPERIENCE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Managed Crystal Report Manager Experience Expo implementation profile:** `../mobile-react/managed-crystal-manager-experience-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-manager-experience-master | 3 | `95b2877cf63539d97f8812e17338a1f02b17431a802f48f6652646b80a9d1675` |
| managed-crystal-manager-experience-master | 4 | `6155835514ebb01ebdfce1431aa47209f3799dcdf826d944233756fd85a5bdf1` |
| managed-crystal-manager-experience-master | 6 | `11acfb50331a9258f4cb84c91af1c2919d9caddfde1af01db9b0e1de4445311d` |
| managed-crystal-manager-experience-master | 7 | `cae2d057019488500bdc6fa7854889c1394d4d219864d534b6064680d3cffb1a` |
| managed-crystal-manager-experience-mobile | 1 | `4593daa1728acaa76ca733030809f86a61b5ab8e9ce5edafaed8738b91517831` |
| managed-crystal-manager-experience-mobile | 2 | `aea443fe72612197e12c8c1c6457782bfbcab024ab6d1411f789a28ac54cef2e` |
| managed-crystal-manager-experience-mobile | 3 | `fc3931dfccca9f6221874597cd18bb38f10a8ab4fd375466ffeef7a19e1bed18` |
| managed-crystal-manager-experience-mobile | 4 | `afd471c2545f16effd9ea772828b262311f47ad3eefef4edaf5562daf5dd4f23` |
| managed-crystal-manager-experience-mobile | 5 | `8348ae9a9c72db980025d5156246b1f35e5eb289f0b0e87b3a8614cf4644748c` |
| managed-crystal-manager-experience-mobile | 6 | `c8fad1250c8259d047cb7b3a1180d9e6e50aa08badfe39e6377f44a2af1f3151` |
| managed-crystal-manager-experience-mobile | 7 | `155c4223adbe34444f33fa440073c239296f149095c26c46fc925b0273f58f27` |
| managed-crystal-manager-experience-mobile | 8 | `a0287167cbeba8b62f8df710f538ec4b1d77c8310516fa0a5480a990f9846793` |
| managed-crystal-manager-experience-mobile | 9 | `617210daa47b09b95a0de7fadef5ab44e1310cb17f32e89d378eaf06193a9563` |
| managed-crystal-manager-experience-mobile | 10 | `e7b323fd17d5a89c4b276fed0c08895e3d8094f234cf56e0c881ec73ffa5d64c` |
| managed-crystal-manager-experience-mobile | 11 | `a8228f8a355cef3bc39fa8cf713120e24ef90ac0b2c059ffaa5dede3f2d7bb03` |
| managed-crystal-manager-experience-mobile | 12 | `dabaad871ebdc616ca5d5d6be95085971c684aa2576ca16e5d00feb72c892f5e` |
| managed-crystal-manager-experience-mobile | 13 | `5429f6fd06cf471be28eeed112b26b9fc12199d31b89c4231dfb7450501de1e5` |
| managed-crystal-manager-experience-mobile | 14 | `4bcc9e39942fd641f5b37ba44f8ff8344b1e18f137441872b7f2ea0b9ce3fe3d` |
| managed-crystal-manager-experience-mobile | 15 | `a1f8f3db22e9cf6685bf54c33da126706600e291aa6143fa27b8ad27941b1769` |
