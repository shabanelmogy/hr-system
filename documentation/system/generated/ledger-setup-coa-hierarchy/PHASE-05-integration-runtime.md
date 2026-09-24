<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Accounting Chart of Accounts and Hierarchy Phase 05 - Integration and Runtime

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

- **Accounting Chart of Accounts and Hierarchy cross-platform implementation contract:** `../project/LEDGER_SETUP_COA_HIERARCHY_FEATURE_FULL_REVIEW.md` sections 4, 5, 6, 7, 9
- **Accounting Chart of Accounts and Hierarchy API implementation contract:** `../api/LedgerSetupCoaHierarchy_API_Implementation_Profile.md` sections 8, 9, 10
- **Accounting Chart of Accounts and Hierarchy Next.js implementation contract:** `../web-next/features/ledger-setup-coa-hierarchy-frontend-reference.md` sections 8, 10, 13
- **Accounting Chart of Accounts and Hierarchy Expo implementation contract:** `../mobile-react/ledger-setup-coa-hierarchy-mobile-reference.md` sections 2, 11, 12, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-coa-hierarchy-master | 4 | `d98c472a1497ad2d7f2e5d96839ed1a1c7fec16d3f6f3c1a45fd083f190be6d8` |
| ledger-setup-coa-hierarchy-master | 5 | `0976c6ca329e0384e1cafbb08925931731db09b8d9000d03864ee5c72913020d` |
| ledger-setup-coa-hierarchy-master | 6 | `aa868978610f3e8a3aa72060935719cf3f657c796f10359642b45cc0c244edc5` |
| ledger-setup-coa-hierarchy-master | 7 | `7a06d80a788ca9f33ed3c3651f664ddddeade75ccfbc008979ae5eaf90d72150` |
| ledger-setup-coa-hierarchy-master | 9 | `18d3ec5849cc352024286af9cdf57d35681fe9873a7d9e6495d5afc11cf10506` |
| ledger-setup-coa-hierarchy-api | 8 | `8dcb5ea99081e32bbd4095112efce6a07842e0058acdc680cf894f4f04a91f47` |
| ledger-setup-coa-hierarchy-api | 9 | `c8041457f1c06b0cd3ee0961ffa2e68f5affd8510f8853c775e43df1925fad8e` |
| ledger-setup-coa-hierarchy-api | 10 | `92b6ee99a4b7937cb020709d6fbcd182c273535be0067760f35ba068aaf5ace4` |
| ledger-setup-coa-hierarchy-web | 8 | `d1847f446370d2d37dde9fec6fb57fd8731f7c700e413476fdc3965d94a75dca` |
| ledger-setup-coa-hierarchy-web | 10 | `33bb55239f23ddff10f381100cd21f83fa52864583d7496824b4cc9233aa02e2` |
| ledger-setup-coa-hierarchy-web | 13 | `8b93bc6b97cf54398c3e16940c46c65f873bc7b80c05b2fd9164ea69bf516e74` |
| ledger-setup-coa-hierarchy-mobile | 2 | `f21cabc1f28ee6a65d578c6b5cfdd2d6a023c6a4497c15eaf868f173fbf87e07` |
| ledger-setup-coa-hierarchy-mobile | 11 | `caa58263a99e472c4a77664492d5fc21590c70ea93e0311cbe2c827cee848c2b` |
| ledger-setup-coa-hierarchy-mobile | 12 | `dc50a9ab0032d4816fa63a289f7bcefef05a63fc7f1a09b1c14527959ae7fb36` |
| ledger-setup-coa-hierarchy-mobile | 15 | `fd777f1160cb0a2076ea34e551efeb53102377cff6225cf39f19dc9037f4fe3f` |
