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
- Cache invalidation and list-selection cleanup in both clients.
- Success, partial failure, all-or-nothing, idempotent, and retry outcomes.

## Exit checks

- [ ] UI visibility is not the only authorization boundary.
- [ ] Archived records cannot enter active-only flows.
- [ ] Restore behavior is explicit and tested.
- [ ] Bulk operations do not silently ignore invalid or duplicated identifiers.
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
| states-master | 3 | `1bcee45daae927bacec3682c14a6330114ca29ffbcf6b489376cccf337a7d38f` |
| states-master | 4 | `cb62a77c84913085b17954f7eb0fc5ae7d282a1cbd18a82286c9c0b6ea5684e0` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `6a8707cf3f36f91fe9a6fe41ab4c9e76cb37d1504a7bbbe13f284d266f61ed81` |
| states-master | 8 | `e3b3334363a7838d07786d63c3d6d91ce0e5f26ae54aef07597ea29ad2fb4c85` |
| states-api | 6 | `0bf7b721bb2d1a4e0587c80652289834a868cc3e03a8c4376e1925457c5714cf` |
| states-api | 7 | `79ef819ddb68cb8382bf2c5f313131548be7b4a66ed3ab6e53777108f1093f66` |
| states-api | 8 | `4778b66ab2e8bc98acc1502c1988db12fa425ebdba2caebe7e6a0fa0ff427221` |
| states-web | 6 | `e8d419ebdf670d54113ac689fa0e42bb70202bc785662fb5e974a5dab1812425` |
| states-web | 7 | `dd6b988a8e7b8b83010b144e56d1cec974980774b9fd9155dd966a6167bed42c` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `b4892594b883341c8754301b6b316d035526f5600427bd489b0ab5a2d9523b6e` |
| states-mobile | 9 | `c13868e55ed4b8222f0f9c3198da550e0d9ef4a8400fac18280850115b3cf1c0` |
| states-mobile | 10 | `0c98fb8ba9d3ae023010173c1dec5c03cf83d196656377dcee0a9563155944fc` |
| states-mobile | 11 | `a658c758cf1ad2b2ee4e64cfe6ecc5c5c16418220248aa4cd02df51a1ced4063` |
