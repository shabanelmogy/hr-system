<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# States Phase 03 - Expo Mobile Client

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

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **States Expo implementation profile:** `../mobile-react/states-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 3 | `11eb828b5ab01b440915284f32842ff110624d6f4f7a57b77d5dde5f7ce9ca4b` |
| states-master | 4 | `5a6d15c81abe80fbc5e13715f385f8a978b6482153ba7cec90474f46b6886ebf` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `a0695f176343e9d5455803e4e75b9d913893c4f6d1a7626a53df6cb0ebc68e00` |
| states-mobile | 1 | `26054606895b798f1b277e4e0eca622dd99d75f4d1ce7815e8dcfc92d9c5ee81` |
| states-mobile | 2 | `5351f9449214fcab85cd168d1b76405c676fc140bbad5d6031466f55ccd2b04f` |
| states-mobile | 3 | `96bfcdff4b5d87a86dd849a784c2b9ce6449f67aedb2544535731deb9046f5a7` |
| states-mobile | 4 | `30658a398475bda73f68d955a018f4d6468a6584256862583f5ae50207835e6e` |
| states-mobile | 5 | `1a333a0f60a2f948b82302f8bd71eb2082606b591f979fbd89daacadf4cfc68e` |
| states-mobile | 6 | `59d68df2993d391812625ebf915f2a7b4bc1cb12b19ba1ec50a1231b236ed94d` |
| states-mobile | 7 | `e28dc1e2b90928482406b55c47446fa4058e41ee3efecae46edf52ecdc6876a5` |
| states-mobile | 8 | `13aaad756a686b4f5af87117253330fbab3381bb8047c3c160d5a247d9abb037` |
| states-mobile | 9 | `974ae317e365f8838ed342fd4c3b51945da8867e4631c3a54b087706b202a48c` |
| states-mobile | 10 | `0c98fb8ba9d3ae023010173c1dec5c03cf83d196656377dcee0a9563155944fc` |
| states-mobile | 11 | `a658c758cf1ad2b2ee4e64cfe6ecc5c5c16418220248aa4cd02df51a1ced4063` |
| states-mobile | 12 | `7536843d769e8361a410f15eec2b76d37720f6bb7ef92aaeb086714bf585dc5f` |
| states-mobile | 13 | `24f6000520d5146bb64caa497764c9efa2ef091e3fcd14608655ff065cec0c8b` |
| states-mobile | 14 | `878d6ee91cf9a0c0fbbad61869a28448bd5abe694f3c8ad4fa6943c2ce49221e` |
| states-mobile | 15 | `b3b8a55cb4cbf29648648d312dc0d12f8fa6c2673bb0c40e6123a12247f18acd` |
