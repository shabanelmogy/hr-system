<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Managed Crystal Contract Registry Phase 04 - Domain Actions and Lifecycle

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

- **Managed Crystal Contract Registry cross-platform master review:** `../project/MANAGED_CRYSTAL_CONTRACT_REGISTRY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **Managed Crystal Contract Registry API implementation profile:** `../api/ManagedCrystalContractRegistry_API_Implementation_Profile.md` sections 6, 7, 8
- **Managed Crystal Contract Registry Next.js implementation profile:** `../web-next/features/managed-crystal-contract-registry-frontend-reference.md` sections 6, 7, 8, 9
- **Managed Crystal Contract Registry Expo implementation profile:** `../mobile-react/managed-crystal-contract-registry-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 3 | `868e9bbb67b82d3949d71fde30b56870b8dde13c345793fdf5f3aca712d3e048` |
| managed-crystal-contract-registry-master | 4 | `8f299058d6b0fa1871fc583289549498805511fc5edcd4283b6cd1f6fb06f516` |
| managed-crystal-contract-registry-master | 6 | `e987bebc42adb87b9650b15783b0f6a5619c9207ba2a847e75674a4775c40e24` |
| managed-crystal-contract-registry-master | 7 | `650941c9496a8555d485db43353c67ba57b588414dc301a23d8dce4ac5d415bb` |
| managed-crystal-contract-registry-master | 8 | `9c1edb8c857d186995a0213e1360d1fed18a24b8c8505be64cccd43559fc05ed` |
| managed-crystal-contract-registry-api | 6 | `3c4e425d69cbd361887a897498fc7a23c074766613e4a02d323b6176b2bcffdb` |
| managed-crystal-contract-registry-api | 7 | `a5c077ea645efaf01230c8a3d0c6e1b0c7ec92885b9588cffadb78d608910187` |
| managed-crystal-contract-registry-api | 8 | `4593669845c25df873284a06dbadc97c7e2d29c6b52cf4bb4f9968a227e5f6d9` |
| managed-crystal-contract-registry-web | 6 | `8992b8e6694ffb6a1b529bc5a1651af96af7b0981ae3fe9512729ffe6bbac760` |
| managed-crystal-contract-registry-web | 7 | `091f2e085cd46cf76a118df40e771013de569fa0c37b5ff7e7dcb767c3501a50` |
| managed-crystal-contract-registry-web | 8 | `d04671b611c64713bff2e7947b3e12348da0575350039ffbbbc914ee2ee48322` |
| managed-crystal-contract-registry-web | 9 | `c70c158a834ad5bca2d2497f2c8c7f29fe39c66289618cb6c3fa2eb7ee9cb29c` |
| managed-crystal-contract-registry-mobile | 9 | `8b88cb5e7a406ad351234aec940277ac3af39b831d67eeb96ac9862bf30f18f8` |
| managed-crystal-contract-registry-mobile | 10 | `faa21e171e5cad10e9ae5207e7c8f6c835551c4927b74612dea3cbd4e8a9d08f` |
| managed-crystal-contract-registry-mobile | 11 | `cba911103ac459014c19924ea5628fb9673222c8e3e1d76ecc1cd49afa7c35f7` |
