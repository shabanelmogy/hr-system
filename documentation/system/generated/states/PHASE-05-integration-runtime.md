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
| states-master | 4 | `5a6d15c81abe80fbc5e13715f385f8a978b6482153ba7cec90474f46b6886ebf` |
| states-master | 5 | `885ba01b409f605e650990d649c44935897caed196b1c3edaf44f56297bc25f6` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `a0695f176343e9d5455803e4e75b9d913893c4f6d1a7626a53df6cb0ebc68e00` |
| states-master | 8 | `103cda8ceabc6cdb194149434e646d558fac575baaa20e3f693ba7c38737ca22` |
| states-api | 8 | `4778b66ab2e8bc98acc1502c1988db12fa425ebdba2caebe7e6a0fa0ff427221` |
| states-api | 9 | `fa29e6b6d508b4adf2fbee147d4cdd2e0520800e9974aba97afacde7dd386ed5` |
| states-api | 10 | `67f990428b9dbca4718c2f98282eab7cbd9bb777971adb9c3614260407765e8c` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `746099e532ae94bd3061c2ef0f9418838809d5c581bdd7444e64e3ef7948de7a` |
| states-web | 10 | `3e502c9832ab020e30d883b7b57ffbec73936e1159832768a087ac1ed9da3522` |
| states-web | 13 | `6f4711600d21044390b0bccc326dadf61fbb4bb687b5c0b4aebe5f33772c42ca` |
| states-mobile | 2 | `5351f9449214fcab85cd168d1b76405c676fc140bbad5d6031466f55ccd2b04f` |
| states-mobile | 11 | `a658c758cf1ad2b2ee4e64cfe6ecc5c5c16418220248aa4cd02df51a1ced4063` |
| states-mobile | 12 | `7536843d769e8361a410f15eec2b76d37720f6bb7ef92aaeb086714bf585dc5f` |
| states-mobile | 13 | `24f6000520d5146bb64caa497764c9efa2ef091e3fcd14608655ff065cec0c8b` |
| states-mobile | 15 | `b3b8a55cb4cbf29648648d312dc0d12f8fa6c2673bb0c40e6123a12247f18acd` |
