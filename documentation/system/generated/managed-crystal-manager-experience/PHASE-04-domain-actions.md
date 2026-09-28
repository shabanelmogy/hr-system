<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Managed Crystal Report Manager Experience Phase 04 - Domain Actions and Lifecycle

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

- **Managed Crystal Report Manager Experience cross-platform master review:** `../project/MANAGED_CRYSTAL_MANAGER_EXPERIENCE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Managed Crystal Report Manager Experience API implementation profile:** `../api/ManagedCrystalManagerExperience_API_Implementation_Profile.md` sections 6, 7, 8
- **Managed Crystal Report Manager Experience Next.js implementation profile:** `../web-next/features/managed-crystal-manager-experience-frontend-reference.md` sections 6, 7, 8, 9
- **Managed Crystal Report Manager Experience Expo implementation profile:** `../mobile-react/managed-crystal-manager-experience-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-manager-experience-master | 3 | `95b2877cf63539d97f8812e17338a1f02b17431a802f48f6652646b80a9d1675` |
| managed-crystal-manager-experience-master | 4 | `100d6ff5f514f29fc9f2c4283571b3649c9fcb92cf3274b437126efe403b107f` |
| managed-crystal-manager-experience-master | 6 | `11acfb50331a9258f4cb84c91af1c2919d9caddfde1af01db9b0e1de4445311d` |
| managed-crystal-manager-experience-master | 7 | `cae2d057019488500bdc6fa7854889c1394d4d219864d534b6064680d3cffb1a` |
| managed-crystal-manager-experience-master | 8 | `c04f821b9512863559aba221fd5f54a4d45a4cf7dbf9f14b482fd69b59cb21a4` |
| managed-crystal-manager-experience-api | 6 | `bd5481e78db6cb51f758b078be897c86a762cb69c3e22965546eaff97f5a37ba` |
| managed-crystal-manager-experience-api | 7 | `dc83b76a43780060c3fc24ff1dd82764a312b9f36024223385db7f9a1e3a173c` |
| managed-crystal-manager-experience-api | 8 | `dfe2d1e952c76df4b242c1b5540f1f202e05a2e66ac20a135f5b2baed6d4f991` |
| managed-crystal-manager-experience-web | 6 | `531c37e86683f6bf81a1ba0d0be82ae29d498ea933a04dfa7cfa6a9cf6125f1c` |
| managed-crystal-manager-experience-web | 7 | `47229d57ffa02ba6b8d3bfd56cceed1b6c522bcb34e4ff6748bd9658266b6a81` |
| managed-crystal-manager-experience-web | 8 | `804054f9ca706bc227203f5323086261dd587f0b2d89d3f6ab6ece0f411226cf` |
| managed-crystal-manager-experience-web | 9 | `168b224f985a8261c9f44954d628924a67a7b486f1f4b81e7caf2f110f490a63` |
| managed-crystal-manager-experience-mobile | 9 | `617210daa47b09b95a0de7fadef5ab44e1310cb17f32e89d378eaf06193a9563` |
| managed-crystal-manager-experience-mobile | 10 | `e7b323fd17d5a89c4b276fed0c08895e3d8094f234cf56e0c881ec73ffa5d64c` |
| managed-crystal-manager-experience-mobile | 11 | `a8228f8a355cef3bc39fa8cf713120e24ef90ac0b2c059ffaa5dede3f2d7bb03` |
