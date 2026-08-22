<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# States Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `features/<feature>/<FEATURE>-REVIEW-ARTIFACTS.md`.
2. Record the operating mode (`new feature`, `existing-feature review`, or `existing-feature change`) and the selected applied reference with a reason.
3. For a new feature, create `features/<feature>/required-files.draft.json`; do not register it while declared runtime files are missing. For an existing review, start from its final `required-files.json`.
4. Before final registration, replace the draft with `required-files.json` containing only existing repository-relative paths and evidence-based source-collection minimums.
5. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
6. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
7. Record tests that prove each contract rather than only naming test folders.

## Discovery checklist

- [ ] Domain entity, persistence mapping, and migration impact identified.
- [ ] Controller, CQRS messages, handlers, stores, validators, jobs, and dependency injection identified.
- [ ] Web route, feature boundary, query state, views, forms, permissions, realtime, translations, and shared UI identified.
- [ ] Mobile route, feature boundary, server-list state, forms, permissions, realtime, translations, responsive layout, RTL, and shared UI identified.
- [ ] Shared HTTP field names, nullability, paging base, sort tokens, filters, errors, and lifecycle actions frozen.
- [ ] Known gaps are listed as findings and excluded from the copy baseline.
- [ ] The generated phase packets and fingerprints belong to this feature, not to an unscoped reference output.

## Approved references

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 1, 10, 11
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 1, 2, 12, 13
- **States Expo implementation profile:** `../mobile-react/states-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 1 | `c0ee316628bce2cb59990a0123cbef713cda365cad5d37a39c78a8e1fcc64fe6` |
| states-master | 2 | `f1462cfea2d924b4ae4a48a56f29a26faaa38ea195066212af66867ed1647ae1` |
| states-master | 5 | `885ba01b409f605e650990d649c44935897caed196b1c3edaf44f56297bc25f6` |
| states-master | 8 | `4943e0d1fc6a2d0893837c810839ab2fb28cfadee58e6b7a57e1cd5e318e4699` |
| states-master | 9 | `dc012338042d0c12e881dd3cd7993cbadef93fd194a278e843ed21ba01613d61` |
| states-api | 1 | `15d834bcb75fb59cc980cd3b79c748f1be10cae3708fbc8f16bb2cf5f1fe05fd` |
| states-api | 10 | `86e2ea950a4ca4301825133cc4e23a5fb901d665a9105e81b22821a9080ef4d5` |
| states-api | 11 | `f2b01ffaf68b622e1d1806e4023186002714fec72fb3b0ea81f8a376afe3e681` |
| states-web | 1 | `b64d63147b922890e8547ac8a854c7a162075b945f1c34f8d6b1b27990790918` |
| states-web | 2 | `b3c1ebb8ee137dda12d0fd7baaf36d0d205b7bd6ed29238aab0decc9dff502ed` |
| states-web | 12 | `a92d7e498e248a50703de9be7ceff1d2f7c49e773223584579c4c860d036d162` |
| states-web | 13 | `69707aa982857aa1778d13b32ec7f4a6149889380ca6a889acffd0d41af71a90` |
| states-mobile | 1 | `26054606895b798f1b277e4e0eca622dd99d75f4d1ce7815e8dcfc92d9c5ee81` |
| states-mobile | 14 | `7d5c6b9e3f30747a1618af874a2eedd703bc07977d38eafa2068069da9e76028` |
| states-mobile | 15 | `4b53b4a14da5675cf262da99e7d8698c0fdd0159f1f488b3fee1d616d08c7b6d` |
