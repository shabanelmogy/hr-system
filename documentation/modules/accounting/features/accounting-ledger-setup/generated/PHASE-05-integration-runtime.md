<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Accounting Ledger Setup Phase 05 - Integration and Runtime

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

- **Accounting Ledger Setup cross-platform implementation contract:** `../modules/accounting/features/accounting-ledger-setup/accounting-ledger-setup-review.md` sections 4, 5, 6, 7, 9
- **Accounting Ledger Setup API implementation contract:** `../modules/accounting/features/accounting-ledger-setup/accounting-ledger-setup-api.md` sections 8, 9, 10
- **Accounting Ledger Setup Next.js implementation contract:** `../modules/accounting/features/accounting-ledger-setup/accounting-ledger-setup-web.md` sections 8, 10, 13
- **Accounting Ledger Setup Expo implementation contract:** `../modules/accounting/features/accounting-ledger-setup/accounting-ledger-setup-mobile.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| accounting-ledger-setup-master | 4 | `06d973a1925b5145faf6d2df5b8b583d963a5253cb1287749dfac17411aa40c8` |
| accounting-ledger-setup-master | 5 | `87f60e757fef7a4b41105347f7ce21ce3a142761a1508c3cbea45625d4ea7557` |
| accounting-ledger-setup-master | 6 | `4c420eef9bb4f80999de2e4e4bebf23f4d9b3934746b134431e3cd97be170dbe` |
| accounting-ledger-setup-master | 7 | `b92882805c347017f5b031c78910e2aee911d3c40803f8e830e62fefbcfde520` |
| accounting-ledger-setup-master | 9 | `7054a939e6cc2faa4f8f97e8271de948ae6139f7049594b236d8d1c430f81d6e` |
| accounting-ledger-setup-api | 8 | `41d4b1feca011b953fd8e9854d130b9845ec2a231d006bca531ba8ee5120bcb3` |
| accounting-ledger-setup-api | 9 | `d29c661ae9da4a7c9386abb9bed6c06c8f0b2c2e7f6f0c5748960ee4a48d710c` |
| accounting-ledger-setup-api | 10 | `48fd2445b8ddce0714334cd79b3fa7a6fe3ec5ed0f9c4a1e53b221092362fa13` |
| accounting-ledger-setup-web | 8 | `685a2b7b584057016a5604aaabd9119f073dfe5af18c9edb020de5630782624a` |
| accounting-ledger-setup-web | 10 | `0d95f05b0868ba0ea4d5606cfa5d95543bcfb0c4c9ae6a899dc7c2e3fb4a64d0` |
| accounting-ledger-setup-web | 13 | `2dbb41708fc772c97f51356c9903a258148eff82d8f0eca2499e8fc4c3d081c1` |
| accounting-ledger-setup-mobile | 2 | `d9fa0988586e5ce71e9872c903882e9c7d3b7284a7389dadf16ef91b7f7ba065` |
| accounting-ledger-setup-mobile | 11 | `63d74a38b34eeb8328687b1a744a9507b0a7524bfbb6fb42f63c07a3a96ddd36` |
| accounting-ledger-setup-mobile | 12 | `aac8b8ddd629c4b3f3dedbd1cc26947919d81e4d6574c009a04916ea805c23db` |
| accounting-ledger-setup-mobile | 15 | `bf90a02cc0efd84b676907c5a05d0d311c1e7d41561635afe08363e1cefa84ef` |
