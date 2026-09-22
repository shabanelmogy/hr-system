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

- **Accounting Ledger Setup cross-platform implementation contract:** `../project/ACCOUNTING_LEDGER_SETUP_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Accounting Ledger Setup API implementation contract:** `../api/AccountingLedgerSetup_API_Implementation_Profile.md` sections 8, 9, 10
- **Accounting Ledger Setup Next.js implementation contract:** `../web-next/features/accounting-ledger-setup-frontend-reference.md` sections 8, 10, 13
- **Accounting Ledger Setup Expo implementation contract:** `../mobile-react/accounting-ledger-setup-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| accounting-ledger-setup-master | 4 | `53f38a770f4b9c229d5f924b56a2be70be0db253054c0b998b0c21ec8c2ca0ca` |
| accounting-ledger-setup-master | 5 | `87f60e757fef7a4b41105347f7ce21ce3a142761a1508c3cbea45625d4ea7557` |
| accounting-ledger-setup-master | 6 | `4c420eef9bb4f80999de2e4e4bebf23f4d9b3934746b134431e3cd97be170dbe` |
| accounting-ledger-setup-master | 7 | `530c84fc6ad3ba2299961c837d2bd3af3f2693292a7893dc1e27a7636b0c9290` |
| accounting-ledger-setup-master | 9 | `4614badb58c2768d465aac681ad22c3f2fa4c16ee17cc05a8fe62177d99374a7` |
| accounting-ledger-setup-api | 8 | `41d4b1feca011b953fd8e9854d130b9845ec2a231d006bca531ba8ee5120bcb3` |
| accounting-ledger-setup-api | 9 | `d29c661ae9da4a7c9386abb9bed6c06c8f0b2c2e7f6f0c5748960ee4a48d710c` |
| accounting-ledger-setup-api | 10 | `6c7e7b50ee5365b6105ecdfe2f7cb77290a4222a0ea767cae96acb5ce46021ae` |
| accounting-ledger-setup-web | 8 | `685a2b7b584057016a5604aaabd9119f073dfe5af18c9edb020de5630782624a` |
| accounting-ledger-setup-web | 10 | `9e280560fb080cd3f4191b6398bd457150fb3e776fd24e21312c31fd2b4759d5` |
| accounting-ledger-setup-web | 13 | `2dbb41708fc772c97f51356c9903a258148eff82d8f0eca2499e8fc4c3d081c1` |
| accounting-ledger-setup-mobile | 2 | `92c812138335162645a688002fce8b47d64842727e20706a330b1eef5c610dfb` |
| accounting-ledger-setup-mobile | 11 | `63d74a38b34eeb8328687b1a744a9507b0a7524bfbb6fb42f63c07a3a96ddd36` |
| accounting-ledger-setup-mobile | 12 | `aac8b8ddd629c4b3f3dedbd1cc26947919d81e4d6574c009a04916ea805c23db` |
| accounting-ledger-setup-mobile | 15 | `bf90a02cc0efd84b676907c5a05d0d311c1e7d41561635afe08363e1cefa84ef` |
