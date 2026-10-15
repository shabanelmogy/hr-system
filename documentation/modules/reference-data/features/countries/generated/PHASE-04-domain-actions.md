<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Phase 04 - Domain Actions and Lifecycle

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

- **Countries cross-platform master review:** `../modules/reference-data/features/countries/countries-review.md` sections 3, 4, 6, 7, 8
- **Countries API implementation profile:** `../modules/reference-data/features/countries/countries-api.md` sections 6, 7, 8
- **Countries Next.js implementation profile:** `../modules/reference-data/features/countries/countries-web.md` sections 6, 7, 8, 9
- **Countries Expo implementation profile:** `../modules/reference-data/features/countries/countries-mobile.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `065031192c357475ed1ad19cf4d387a6d4ea6a73c92faeff265dd5429030ca6e` |
| master | 4 | `5313466cc23f4cd78d346588b46a10c8f3459953defddd6c00a05dc22f4ad6c5` |
| master | 6 | `b7fb453c6be690cf10f98e85664f30fb55fb590e628b0f8a0435f54cf67058ac` |
| master | 7 | `e603de6e96ed32d995c8cf0eeb698f377a3da508a9febf3d500377754e915c84` |
| master | 8 | `d984d8e0337d1a27f16371f454b72ff6911422bf8832f69f73e2139a49490e96` |
| api | 6 | `f22bc1b1bb58cbce5e29c6149ae499edd6fbc5a155893d7d489b5aa840fe065a` |
| api | 7 | `d3c803b44c4e65794a60c9b31eeeab120922dc55a8da5e8c0de7e8a116913f93` |
| api | 8 | `dd207cd27ef0d9cd7d96de3e743aa1aa04eb0d5271e227ad002afc2613e28850` |
| web | 6 | `b34711333b9a23f02b3e0e39507cc1402c68af9224c5c9f5876bd41aa19f9e03` |
| web | 7 | `80a57ab957f96a05e4c959ef00172579844d78aa5835b13529156a0c6072ab84` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 9 | `4da29b144dca03553c2568393fde9b32e14b1782bcd53ce7244453d4c9510f97` |
| mobile | 9 | `18d5414dd29a98f496e41ab0a8b2deedf96fa4eaa03506d081fad8059754cd40` |
| mobile | 10 | `7d90a6bd3148af61cc84222408c9349630432fd3c40780d755e1212ac0e76171` |
| mobile | 11 | `6d043a9367e3d899f66abafd760eed0dfe3a6ad9e8114b839126cccc9a113f53` |
