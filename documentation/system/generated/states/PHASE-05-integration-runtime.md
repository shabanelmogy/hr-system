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
- [ ] Every Required Import client sends the documented exact request body and
      resolves dependency lookups through an authorized registered endpoint.
- [ ] Import success uses the documented plural audit/notification/realtime action
      and refreshes normal feature caches; conflict and network paths remain retryable as specified.
- [ ] A successful mutation refreshes all open clients through their normal cache/realtime path.
- [ ] Notification action URLs land on authorized routes in both clients.
- [ ] Unauthorized, read-only, validation, not-found, conflict, and network failures render safely.
- [ ] Production build configuration does not rely on local-only URLs or secrets.
- [ ] Localization and RTL are tested in actual runtime layouts.

Capture configuration and registration evidence separately from behavior tests.
A file existing in the feature folder does not prove its route, DI, permission,
realtime, notification, localization, report, or Import integration is reachable.

## Approved references

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 8
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 8, 9, 10
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 8, 9, 10, 13
- **States Expo implementation profile:** `../mobile-react/states-mobile-reference.md` sections 2, 11, 12, 13, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 4 | `ace44bd1e264d69b1f14d302cd27fdd211e3023d22261b14afe2c20cb4fc2f66` |
| states-master | 5 | `885ba01b409f605e650990d649c44935897caed196b1c3edaf44f56297bc25f6` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `ccdb4b0d23c807c41f0c7a9af54f7667d8a543ad0ce265df9b4e4f64c69a947e` |
| states-master | 8 | `e3b3334363a7838d07786d63c3d6d91ce0e5f26ae54aef07597ea29ad2fb4c85` |
| states-api | 8 | `4778b66ab2e8bc98acc1502c1988db12fa425ebdba2caebe7e6a0fa0ff427221` |
| states-api | 9 | `fa29e6b6d508b4adf2fbee147d4cdd2e0520800e9974aba97afacde7dd386ed5` |
| states-api | 10 | `67f990428b9dbca4718c2f98282eab7cbd9bb777971adb9c3614260407765e8c` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `746099e532ae94bd3061c2ef0f9418838809d5c581bdd7444e64e3ef7948de7a` |
| states-web | 10 | `3e502c9832ab020e30d883b7b57ffbec73936e1159832768a087ac1ed9da3522` |
| states-web | 13 | `6f4711600d21044390b0bccc326dadf61fbb4bb687b5c0b4aebe5f33772c42ca` |
| states-mobile | 2 | `df5e503c56700392a3580c09741dd3bf946ce7f43ec310fd3a0a79acb53329be` |
| states-mobile | 11 | `a658c758cf1ad2b2ee4e64cfe6ecc5c5c16418220248aa4cd02df51a1ced4063` |
| states-mobile | 12 | `7536843d769e8361a410f15eec2b76d37720f6bb7ef92aaeb086714bf585dc5f` |
| states-mobile | 13 | `6cdcf87afece4e578bc818a282cfe89996fc9b27c8248b5d37fbb7a23b841efa` |
| states-mobile | 15 | `4b53b4a14da5675cf262da99e7d8698c0fdd0159f1f488b3fee1d616d08c7b6d` |
