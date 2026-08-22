<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# States Phase 05 - Integration and Runtime

## Purpose

Prove the feature is connected to the running system, not merely implemented in isolated files.

## Integration matrix

Verify all applicable registrations:

- API endpoint versioning, authentication, tenant membership, permissions, dependency injection, validation scan, mapping scan, database context, localization, Hangfire, notification, and realtime.
- Web route, API proxy path, endpoint registry, route access, navigation, permissions, query keys, realtime query registry, translations, report route, and import dependencies.
- Mobile route file, typed route constant, route manifest, navigation, permissions, endpoint client, query keys, realtime registry, notification deep-link mapping, translations, report file handling, and device-safe layout.

## Runtime evidence

- [ ] API request and response samples match documented field names and paging metadata.
- [ ] Browser and mobile requests serialize the same shared filters and sort tokens.
- [ ] A successful mutation refreshes all open clients through their normal cache/realtime path.
- [ ] Notification action URLs land on authorized routes in both clients.
- [ ] Unauthorized, read-only, validation, not-found, conflict, and network failures render safely.
- [ ] Production build configuration does not rely on local-only URLs or secrets.
- [ ] Localization and RTL are tested in actual runtime layouts.

## Approved references

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 8
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 8, 9, 10
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 8, 9, 10, 13
- **States Expo implementation profile:** `../mobile-react/states-mobile-reference.md` sections 2, 11, 12, 13, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 4 | `9d784c317c702d41f1d9282b7d153ea617fab527d8e80ef7222e65f18cd52fb0` |
| states-master | 5 | `885ba01b409f605e650990d649c44935897caed196b1c3edaf44f56297bc25f6` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `9e3df427e9a5cf7bec84a8f110739543a736248bb2b576225895c0f523e9de51` |
| states-master | 8 | `4943e0d1fc6a2d0893837c810839ab2fb28cfadee58e6b7a57e1cd5e318e4699` |
| states-api | 8 | `5f502b1906084a55b3bbff646f16611cc3c88e03b432a210d739a729d0eca2aa` |
| states-api | 9 | `19ad89693b2398543aff1b54378da61520f0171ab8d1e1e67f8b7627de4ff7a1` |
| states-api | 10 | `86e2ea950a4ca4301825133cc4e23a5fb901d665a9105e81b22821a9080ef4d5` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `3103392ff8db16be591f2bf6d1e3bc0abfba246c3b6421fc00b0af2afcbbb665` |
| states-web | 10 | `fc95a596f566ea1b062e1df4e995f381918234f6db6c5b4c56a87ab7a0c93c10` |
| states-web | 13 | `69707aa982857aa1778d13b32ec7f4a6149889380ca6a889acffd0d41af71a90` |
| states-mobile | 2 | `df5e503c56700392a3580c09741dd3bf946ce7f43ec310fd3a0a79acb53329be` |
| states-mobile | 11 | `b566631745234edd79055f13f0b8a6966119912f9560a7e88e40b321d912af22` |
| states-mobile | 12 | `7536843d769e8361a410f15eec2b76d37720f6bb7ef92aaeb086714bf585dc5f` |
| states-mobile | 13 | `6cdcf87afece4e578bc818a282cfe89996fc9b27c8248b5d37fbb7a23b841efa` |
| states-mobile | 15 | `4b53b4a14da5675cf262da99e7d8698c0fdd0159f1f488b3fee1d616d08c7b6d` |
