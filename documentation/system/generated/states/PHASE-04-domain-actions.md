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
- [ ] Import validates client limits before submitting and the API enforces its own limits.
- [ ] Client feedback uses stable server errors and localized fallback messages.

## Approved references

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7, 8
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 6, 7, 8
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 6, 7, 8, 9
- **States Expo implementation profile:** `../mobile-react/states-mobile-reference.md` sections 9, 10, 11

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 3 | `1bcee45daae927bacec3682c14a6330114ca29ffbcf6b489376cccf337a7d38f` |
| states-master | 4 | `9d784c317c702d41f1d9282b7d153ea617fab527d8e80ef7222e65f18cd52fb0` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `9e3df427e9a5cf7bec84a8f110739543a736248bb2b576225895c0f523e9de51` |
| states-master | 8 | `4943e0d1fc6a2d0893837c810839ab2fb28cfadee58e6b7a57e1cd5e318e4699` |
| states-api | 6 | `97e7703fbf9f0fa2eee2f1927c01c3e8c47dc983c6169ffc42bc09df2fd4853e` |
| states-api | 7 | `79ef819ddb68cb8382bf2c5f313131548be7b4a66ed3ab6e53777108f1093f66` |
| states-api | 8 | `5f502b1906084a55b3bbff646f16611cc3c88e03b432a210d739a729d0eca2aa` |
| states-web | 6 | `d12500e4febb37cccf52cb70d167f2b69e9a84793948328d0928459a19f787d2` |
| states-web | 7 | `dd6b988a8e7b8b83010b144e56d1cec974980774b9fd9155dd966a6167bed42c` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `3103392ff8db16be591f2bf6d1e3bc0abfba246c3b6421fc00b0af2afcbbb665` |
| states-mobile | 9 | `c13868e55ed4b8222f0f9c3198da550e0d9ef4a8400fac18280850115b3cf1c0` |
| states-mobile | 10 | `0c98fb8ba9d3ae023010173c1dec5c03cf83d196656377dcee0a9563155944fc` |
| states-mobile | 11 | `a658c758cf1ad2b2ee4e64cfe6ecc5c5c16418220248aa4cd02df51a1ced4063` |
