<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# States Phase 04 - Domain Actions and Lifecycle

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

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 6, 7, 8
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 6, 7, 8, 9
- **States Expo implementation profile:** `../mobile-react/states-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 3 | `11eb828b5ab01b440915284f32842ff110624d6f4f7a57b77d5dde5f7ce9ca4b` |
| states-master | 4 | `5a6d15c81abe80fbc5e13715f385f8a978b6482153ba7cec90474f46b6886ebf` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `a0695f176343e9d5455803e4e75b9d913893c4f6d1a7626a53df6cb0ebc68e00` |
| states-master | 8 | `103cda8ceabc6cdb194149434e646d558fac575baaa20e3f693ba7c38737ca22` |
| states-api | 6 | `100f5727ce3e5e0e0cde9218293a9a96b5d7bd7346bbfc9e760110bc1096afad` |
| states-api | 7 | `21b4aaa6465e8c038b67613a7d59733d4e06b8fea8172c1ba06d98f55e782ed4` |
| states-api | 8 | `4778b66ab2e8bc98acc1502c1988db12fa425ebdba2caebe7e6a0fa0ff427221` |
| states-web | 6 | `c5dbf3d36f71536e19222be00289fa75416d1069692acfe82dd69be886a08eb4` |
| states-web | 7 | `85652ee3b5c1d7468a6c300167194b0d003b49da5f4751350ad169befcb018a5` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `746099e532ae94bd3061c2ef0f9418838809d5c581bdd7444e64e3ef7948de7a` |
| states-mobile | 9 | `974ae317e365f8838ed342fd4c3b51945da8867e4631c3a54b087706b202a48c` |
| states-mobile | 10 | `0c98fb8ba9d3ae023010173c1dec5c03cf83d196656377dcee0a9563155944fc` |
| states-mobile | 11 | `a658c758cf1ad2b2ee4e64cfe6ecc5c5c16418220248aa4cd02df51a1ced4063` |
