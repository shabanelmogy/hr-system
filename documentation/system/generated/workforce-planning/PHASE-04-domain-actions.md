<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Workforce Planning Phase 04 - Domain Actions and Lifecycle

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

- **Workforce Planning cross-platform master review:** `../project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Workforce Planning API implementation profile:** `../api/WorkforcePlanning_API_Implementation_Profile.md` sections 6, 7, 8
- **Workforce Planning Next.js implementation profile:** `../web-next/features/workforce-planning-frontend-reference.md` sections 6, 7, 8, 9
- **Workforce Planning Expo implementation profile:** `../mobile-react/workforce-planning-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| workforce-planning-master | 3 | `8a6e6f69a054988c340491b10518046b54afe615727bf4fc084bb455b37e868b` |
| workforce-planning-master | 4 | `159708f556ff4c7fd6abe33b8953d5e9f2024ef3b688fb8fa310e5253c622625` |
| workforce-planning-master | 6 | `aca3820d1e8cceabd1d783a1fec9e1265ae8fe95ea335ed7d5469e4e39f43829` |
| workforce-planning-master | 7 | `be08f8b94bfb467005917ed0b5875f676b1069c96678fea62b082c1ad6041852` |
| workforce-planning-master | 8 | `6477631f6815fb5b2b30feebace504df77a54281f6a6952394d35794f7fef815` |
| workforce-planning-api | 6 | `0263735c47f76a4aa79bcecd19c8d5a1a80cd105faafa759c5066f4c8df40a9b` |
| workforce-planning-api | 7 | `14954033c5dbb4f9d1c0d65ed548e0a1cded24d456f26facde4fbfb7b6c51d67` |
| workforce-planning-api | 8 | `c704b6af82f8445876dfd1f1ab587e91b5c22c45d4c7de226d0f0796368fb47a` |
| workforce-planning-web | 6 | `ecccbb128531cde41855d7f9a469afa135df3f8e81e76415dcfb02d915a64f96` |
| workforce-planning-web | 7 | `64e4794b8809cfd72c3539f66b0cc86dac19f3a9d12fb1eb40283865cf73ee9e` |
| workforce-planning-web | 8 | `8b343f4f8bf42f04bd0f364c17055290e0a6b359f502fe494d1a34e7286f6b35` |
| workforce-planning-web | 9 | `92762547f800e07b951751c7d464a20b80c831e8304a2219486c3a8a8a5fdc85` |
| workforce-planning-mobile | 9 | `882c73fae541af6359faff0264916014a65e38fa60b0d6b195016b389b460910` |
| workforce-planning-mobile | 10 | `8b43775cd8eb7d818751b4fe5f71fe7496b7425fb38b86894ba9c172e30f5471` |
| workforce-planning-mobile | 11 | `8dd034f4bc5ac13c8db4677149426911c07a7cb253950525a16057ff221f4062` |
