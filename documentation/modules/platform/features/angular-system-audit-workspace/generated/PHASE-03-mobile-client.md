<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Super Admin System Audit Trail parity Phase 03 - Expo Mobile Client

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

- **Super Admin System Audit Trail parity cross-platform master review:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-review.md` sections 3, 4, 6, 7
- **Super Admin System Audit Trail parity Expo implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-audit-workspace-master | 3 | `533fc06c805178a7940bd29b028ccab1aa8c03323688c0ef84db7cfe11866f11` |
| angular-system-audit-workspace-master | 4 | `5c410a657baf4dc942706d66f6a50d6cac935de8897d25b3430d8ce58deaa78e` |
| angular-system-audit-workspace-master | 6 | `0757cb85fb64ab8d3129445c494bb5332c468f7e14f2bb99dd45a9e1ebfdd85b` |
| angular-system-audit-workspace-master | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-mobile | 1 | `30180a45e3e26ad0647e71a3cdfb4292151787ebf1c71e14939c79eb98e7c78a` |
| angular-system-audit-workspace-mobile | 2 | `ec1abfdbe1d6f23f81c35becb8e10e65908b6e7253be193981561639cc70f3c5` |
| angular-system-audit-workspace-mobile | 3 | `533fc06c805178a7940bd29b028ccab1aa8c03323688c0ef84db7cfe11866f11` |
| angular-system-audit-workspace-mobile | 4 | `5c410a657baf4dc942706d66f6a50d6cac935de8897d25b3430d8ce58deaa78e` |
| angular-system-audit-workspace-mobile | 5 | `e8eefe6fd4499461e5ef5fee1027cece0a67a6eb23675be5e2a7da7dea4bd9b1` |
| angular-system-audit-workspace-mobile | 6 | `0757cb85fb64ab8d3129445c494bb5332c468f7e14f2bb99dd45a9e1ebfdd85b` |
| angular-system-audit-workspace-mobile | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-mobile | 8 | `fe1dcbe0ed968bf0bd8847d263bcd2a32b5c1392f51e4ec8d7d72480c94d2008` |
| angular-system-audit-workspace-mobile | 9 | `bfe3c56110cb9e2dd3ff1d6ae28f28e836cc6795916976cc5ea125d1960c2a97` |
| angular-system-audit-workspace-mobile | 10 | `7bae6bcb1db81bd9577afd59216566fa86f1eca6cc68d0bf365b9bb35af8dc96` |
| angular-system-audit-workspace-mobile | 11 | `b0f7e4802c90ae55f72ff44d21fd2e51f754f1aa25181bcdf33aa0252573c1d8` |
| angular-system-audit-workspace-mobile | 12 | `303464ebeb3776b24df0370d3ca5ab3aaef9b23b2f3beb18911c3ef43238623f` |
| angular-system-audit-workspace-mobile | 13 | `36eb648972d9f80ac55b56fb7c37523213187bc81fd0c37e0a368f099ec90429` |
| angular-system-audit-workspace-mobile | 14 | `93c8531d3b26e95206c8f71216bdc9843f6b9bad1f8caaa1fe7f7f264adc335a` |
| angular-system-audit-workspace-mobile | 15 | `16e732c048cf89e38f223fa037c1266d209cfa019d962f8a9a1657b60941be01` |
