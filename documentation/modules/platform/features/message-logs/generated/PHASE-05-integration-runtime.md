<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Company Message Logs Phase 05 - Integration and Runtime

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

- **Company Message Logs cross-platform master review:** `../modules/platform/features/message-logs/message-logs-review.md` sections 4, 5, 6, 7, 9
- **Company Message Logs API implementation profile:** `../modules/platform/features/message-logs/message-logs-api.md` sections 8, 9, 10
- **Company Message Logs Next.js implementation profile:** `../modules/platform/features/message-logs/message-logs-web.md` sections 8, 10, 13
- **Company Message Logs Expo implementation profile:** `../modules/platform/features/message-logs/message-logs-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| message-logs-master | 4 | `963dd2c8e0e45d558cbecf309b2f8d2a206af2b1104a6352b9f595d8a33c64be` |
| message-logs-master | 5 | `eb0d312929f6e5a4c1a25dd9d732dae2a1434d02918fb510bcd5686e61a124fd` |
| message-logs-master | 6 | `aa21844a4a1e0b2bf19b9e53170ff8465c3fcc473af469005f07560d11f3bcdb` |
| message-logs-master | 7 | `d8bf49bfbdf5b89a382d38b2979ded5737bc8152dc819916bfee606ad8716d47` |
| message-logs-master | 9 | `2dd581785c8fc7d10c787d781962588c9752a37b8034a256090bde008fdc12f5` |
| message-logs-api | 8 | `982aa6893abf3c87ecf01ec98243fdcf19e92281f4271a7164b65195b4ecda50` |
| message-logs-api | 9 | `3242f39176ff7031538427a2bae25bdabdf153b9f6fe7caf9f3a5c96d1682992` |
| message-logs-api | 10 | `1cdf8f31874ed038d330d8aefd38069a233a89f69d727e89cc115081d845d75a` |
| message-logs-web | 8 | `6ddd30810eb0451e7129167c5a016dbad81180d3cca32ece55e38660755eb1ea` |
| message-logs-web | 10 | `1115fd0057a1917659d9afbf6aa44203a355620085bb14b2f32b12d023264e57` |
| message-logs-web | 13 | `5b04cbf049022f085f4c4bdaaf5986143fb13d35a0a6f99b92a4d3a771522c4b` |
| message-logs-mobile | 2 | `292afef0c83a071a1ebf74d9c4a97b7f004bf1ff775b6522e31fb1cac44b0f96` |
| message-logs-mobile | 11 | `8123d8ac515f9a0fb92ce5c4ba29bb370697a9d8962e20db3b7038dcc04bc47f` |
| message-logs-mobile | 12 | `3f16c2e9f611d3bf8ce0da35c8641140886e0c95569137ceb659ddb1d0827ffc` |
| message-logs-mobile | 15 | `390786de6f5bc765107f51cc571fd29e74a3259a4845c0010a5c4abd6699b0d9` |
