<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Company email templates Phase 04 - Domain Actions and Lifecycle

## Purpose

Reconcile every lifecycle action across API, browser, and mobile before considering the feature complete.

## Action ledger

For create, bulk create, edit, archive, restore, bulk archive, import, report, and child-management actions, record:

- Permission and read-only requirements.
- Eligible entity states and relationship guards.
- Confirmation and dirty-exit behavior.
- Request shape, normalization, validation, and maximum batch size.
- Transaction boundary, audit record, background job, notification, and realtime behavior.
- Shared concurrency resource/constraint for every dependency predicate, including
  all parent, child, restore, move, and bulk participants plus lock ordering.
- Cache invalidation and list-selection cleanup in both clients.
- Success, partial failure, all-or-nothing, idempotent, and retry outcomes.

## Exit checks

- [ ] UI visibility is not the only authorization boundary.
- [ ] Archived records cannot enter active-only flows.
- [ ] Restore behavior is explicit and tested.
- [ ] Bulk operations do not silently ignore invalid or duplicated identifiers.
- [ ] Client bulk selection cannot exceed the API maximum; oversized selection is
      rejected with feedback and the direct submit path rechecks it.
- [ ] Parent/child lifecycle races are tested or otherwise proven at the database
      boundary; isolated handler prechecks are not accepted as concurrency proof.
- [ ] Required Import distinguishes local-invalid rows from the submitted batch,
      states whether the submitted batch is atomic, and never reports partial
      success unless the API contract explicitly supports it.
- [ ] Import validates client limits before submitting and the API independently enforces its own limits.
- [ ] Import duplicate checks are field- and scope-specific, relationship lookups
      are explicit, retry behavior is safe, and any rejected-row download is
      separately classified as Required, Deferred, or Excluded.
- [ ] Client feedback uses stable server errors and localized fallback messages.

## Evidence to capture

For every action, record one row linking its direct client handler, permission
guard, API request, handler, transaction boundary, side-effect action, query-key
invalidation, success test, and failure test. Use `N/A` only with a reason.

## Approved references

- **Company email templates cross-platform master review:** `../modules/platform/features/company-email-templates/company-email-templates-review.md` sections 3, 4, 6, 7, 8
- **Company email templates API implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-api.md` sections 6, 7, 8
- **Company email templates Next.js implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-web.md` sections 6, 7, 8, 9
- **Company email templates Expo implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-email-templates-master | 3 | `8cfceb41ccd21b6f52a9dbaa638bff99dadf8a412a1db8855124cfa4b36f337e` |
| company-email-templates-master | 4 | `ecf324faf8fb27d4110c34672c429c9f8664b54d71c0fe07f24641366780567f` |
| company-email-templates-master | 6 | `8ed77bb6949b5a4989589bba630b031ff6adc4d6a87ddc0b4758137c1021b5b0` |
| company-email-templates-master | 7 | `b806a110148b1bc25878a8c0537a288061646b9c75caf91bcf77dc745e7980a2` |
| company-email-templates-master | 8 | `4a8da1af76e17ddb92272e724cc218650102217c7dc717446c4a20ac35976cd8` |
| company-email-templates-api | 6 | `f6af26e5d3e2d2baf1ac263fb20c657d56c35f05c97cc67316c9e63142405a05` |
| company-email-templates-api | 7 | `95a39402ae66c71e999ea6de19bf53ef6bca82840a2682b8292a1bad7bfdcf9a` |
| company-email-templates-api | 8 | `0800b92f0acdcd92e1f39b6b07efc3da076eb900cd5e2d17e53e1a8a045ab88e` |
| company-email-templates-web | 6 | `32f5ad93f2ac472464b41408ec9317035cec2f1477160ae64c1b4fd4e284b936` |
| company-email-templates-web | 7 | `3d52e74d285673d6d907153a58202661742864e28347b9186192bd0ad204446d` |
| company-email-templates-web | 8 | `47c36b6225dea207dddadd8fea5157985285dbb3c4da730b4bbee2429d965859` |
| company-email-templates-web | 9 | `9c9d2394df7107e216794cd4aa680e2b7b7922f6799290ff6e7fe9a5fa116221` |
| company-email-templates-mobile | 9 | `abd4b786d0bace04600c3c7334993e45b36f3d85333edd933d4f9058bedddbeb` |
| company-email-templates-mobile | 10 | `c1262e113c9347c341577f50e04883b503211cf3966692b2ec5cef1f9a487cf5` |
| company-email-templates-mobile | 11 | `a335f402b24a86afd4f905e258dcfa0afe955977fd528db1e363c8b46163c6e3` |
