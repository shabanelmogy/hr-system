<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Tenant module entitlements Phase 03 - Expo Mobile Client

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

- **Tenant module entitlements cross-platform master review:** `../project/TENANT_MODULE_ENTITLEMENTS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Tenant module entitlements Expo implementation profile:** `../mobile-react/tenant-module-entitlements-mobile-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| tenant-module-entitlements-master | 3 | `212764afdc3ce2ce0f4bd27da0a48644dadb0f63c0edd3b9102bbabe1a727e99` |
| tenant-module-entitlements-master | 4 | `e555dc9d04feebee880d75fafd06d4fa2c525673d99cc4476055e8b15cfe36ab` |
| tenant-module-entitlements-master | 6 | `5dda69ba2342bfa1f8caee1dee1868a383b4d7c1ce1f7596a753e20c4aba1cfb` |
| tenant-module-entitlements-master | 7 | `fe1349efb104547e5f048e64174e844f17ad248fb17f5e0c7c4e14334bc8213f` |
| tenant-module-entitlements-mobile | 1 | `dac449024ffa05afd4c86f4dca97b17ef88bcbb19f9786faa0702c25233b035c` |
| tenant-module-entitlements-mobile | 2 | `b422902bf641ac79bba50eccfe3a77f6b14e1341e53b7fefcf5e974903253122` |
| tenant-module-entitlements-mobile | 3 | `f826c397432ed64c179aa7eae9d5f407e266fa77353b955c26c54759db5be764` |
| tenant-module-entitlements-mobile | 4 | `662d14f7b40105f7c0c4dd065123a5bf3eb14b8bb7638e181957cb8330bfb87f` |
| tenant-module-entitlements-mobile | 5 | `5f38371b871846e482bbad4e68dd03c03f3079b6fbc0f3b36da827173b878f4d` |
| tenant-module-entitlements-mobile | 6 | `396e3fbed6987594b3205415d637be00a021289dd64d548cf09d65a6d69c8f8c` |
| tenant-module-entitlements-mobile | 7 | `fa10308a8017db01e03275a36686cc09ce9f2ab2d051c02b2058122737f8f6f8` |
| tenant-module-entitlements-mobile | 8 | `7daba0e4d0cc86a4f9478df2d9ffd7d9b53dc2d9356c09d570f7f48f8253a57f` |
| tenant-module-entitlements-mobile | 9 | `88fff12c814927904bcf16b637ce09c6d216434d475bc151c534483edd82a916` |
| tenant-module-entitlements-mobile | 10 | `0040d144a535b0dd6647f63593d6f416ce69c4da6561085b720d668765374586` |
| tenant-module-entitlements-mobile | 11 | `405a054943b4eeb6d2ab063900a2db8e31abcf04368e15f78ca3f9ce98d21f2f` |
| tenant-module-entitlements-mobile | 12 | `d36cebfaa781c995c7776ebc740b7499f4b16bcdc07d9f5f556e5ffbcc7ad755` |
| tenant-module-entitlements-mobile | 13 | `ecb8f782824d936f2a91c826e19553ca1f825c73b364b430be1a9f779dfca1a3` |
| tenant-module-entitlements-mobile | 14 | `ad56df437717354886dddec6587c7b805f7e2e539e5f767b81c01b85629aa8dc` |
| tenant-module-entitlements-mobile | 15 | `32851ba2d1639f1c905ebf6269b6f55623aa6856171421fed3edd2ce5034715c` |
