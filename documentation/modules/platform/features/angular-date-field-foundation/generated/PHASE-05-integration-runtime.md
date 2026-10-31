<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Shared date-only field preparation Phase 05 - Integration and Runtime

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

- **Shared date-only field preparation cross-platform master review:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-review.md` sections 4, 5, 6, 7, 9
- **Shared date-only field preparation API implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-api.md` sections 8, 9, 10
- **Shared date-only field preparation Next.js implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-web.md` sections 8, 10, 13
- **Shared date-only field preparation Expo implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-date-field-foundation-master | 4 | `56869c4802b77dda2f3a6eeef12e8209e60500e47881aa4fe0ad96c412c55dfe` |
| angular-date-field-foundation-master | 5 | `a2a7ccac6b034a0df0387c0ab05e3e205958fa486ba545ee98dd7851c121aaad` |
| angular-date-field-foundation-master | 6 | `5c78dd050fbcee69f99914bc203a48759ad20907e1032ec5d90644490a960545` |
| angular-date-field-foundation-master | 7 | `9e324801adf4cf50a669bbae92c944015e530449d22cf0cf35026ba210f27ca7` |
| angular-date-field-foundation-master | 9 | `46307ad33ca60cd0d2aa6779fcef25809b5bddbbe6ed0910a56c0fdb22e6b0a2` |
| angular-date-field-foundation-api | 8 | `5b2660e078c4586cc2203a485dea38bfb6d6d3a8456596f5f8d4e7f17a6a3143` |
| angular-date-field-foundation-api | 9 | `46307ad33ca60cd0d2aa6779fcef25809b5bddbbe6ed0910a56c0fdb22e6b0a2` |
| angular-date-field-foundation-api | 10 | `33fde289be4b6f5d29ee9fe5f5cd9501b57d5b726426a2b13fe47e40fa5a2b8b` |
| angular-date-field-foundation-web | 8 | `5b2660e078c4586cc2203a485dea38bfb6d6d3a8456596f5f8d4e7f17a6a3143` |
| angular-date-field-foundation-web | 10 | `33fde289be4b6f5d29ee9fe5f5cd9501b57d5b726426a2b13fe47e40fa5a2b8b` |
| angular-date-field-foundation-web | 13 | `2f661a94a6cb2dc6efcf39e10063dad86731f89d1500882203d3aeb3925a2728` |
| angular-date-field-foundation-mobile | 2 | `03c61b99033bd1593dd5779780201572cb293c0e091427973fa776ed09def764` |
| angular-date-field-foundation-mobile | 11 | `81fdb53d5c5d5e91e6457833d212cff7677988658c8317d72325e3201ab4a18e` |
| angular-date-field-foundation-mobile | 12 | `75229fc755f98c53d03581d4c11eda0d4f0117045aa427d1334deca8962a57cd` |
| angular-date-field-foundation-mobile | 15 | `b7c9adf55029b1a27c4837a63414631a0a6cd88aefd93a54337afef3007199b4` |
