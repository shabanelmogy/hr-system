<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# States Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

Use `documentation/system/templates/FEATURE-IMPLEMENTATION-REQUEST.template.md`
as the copy-ready scope contract and the review artifact as the evidence ledger.
`Required` means current-release and gated, `Deferred` requires an owner/trigger,
and `Excluded` means no runtime surface.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `features/<feature>/<FEATURE>-REVIEW-ARTIFACTS.md`.
2. Record the operating mode (`new feature`, `existing-feature review`, or `existing-feature change`) and the selected applied reference with a reason.
3. For a new feature, create `features/<feature>/required-files.draft.json`; do not register it while declared runtime files are missing. For an existing review, start from its final `required-files.json`.
4. Before final registration, replace the draft with `required-files.json` containing only existing repository-relative paths and evidence-based source-collection minimums.
5. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
6. Classify Import independently for web and mobile as `Required`, `Deferred`, or
   `Excluded`. Record the accepted format, data scope, dependency lookups, and the
   reason for every platform difference.
7. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
8. Record tests that prove each contract rather than only naming test folders.

## Discovery checklist

- [ ] Domain entity, persistence mapping, and migration impact identified.
- [ ] Controller, CQRS messages, handlers, stores, validators, jobs, and dependency injection identified.
- [ ] Web route, feature boundary, query state, views, forms, permissions, realtime, translations, and shared UI identified.
- [ ] Mobile route, feature boundary, server-list state, forms, permissions, realtime, translations, responsive layout, RTL, and shared UI identified.
- [ ] Shared HTTP field names, nullability, paging base, sort tokens, filters, errors, and lifecycle actions frozen.
- [ ] Import is explicitly classified per client, and every Required Import path
      has a named format, permission, bulk endpoint, and dependency source.
- [ ] Known gaps are listed as findings and excluded from the copy baseline.
- [ ] The generated phase packets and fingerprints belong to this feature, not to an unscoped reference output.
- [ ] Every optional capability has one platform decision, data scope, reason, and
      evidence path; no decision is inferred from the selected reference.
- [ ] Verification gates are identified before coding, including manual and
      environment-dependent checks.

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
| states-master | 8 | `e3b3334363a7838d07786d63c3d6d91ce0e5f26ae54aef07597ea29ad2fb4c85` |
| states-master | 9 | `3bb32b0b771b82c4f9f9369d2aac0af5ad543878f7e223b3f4b989555486ff28` |
| states-api | 1 | `15d834bcb75fb59cc980cd3b79c748f1be10cae3708fbc8f16bb2cf5f1fe05fd` |
| states-api | 10 | `67f990428b9dbca4718c2f98282eab7cbd9bb777971adb9c3614260407765e8c` |
| states-api | 11 | `539f37f24d7580f0ff02e92c6172aa48665203d2179e10f21b91074b929472a8` |
| states-web | 1 | `b64d63147b922890e8547ac8a854c7a162075b945f1c34f8d6b1b27990790918` |
| states-web | 2 | `5715616f7749731d49b88637b1bdf8ddeb9d6d691bfa13552d58058a37aaed75` |
| states-web | 12 | `ecb38dd9b6149a025aa10b1edca9ed23050620cedf2f397b10ff34764e10874d` |
| states-web | 13 | `6f4711600d21044390b0bccc326dadf61fbb4bb687b5c0b4aebe5f33772c42ca` |
| states-mobile | 1 | `26054606895b798f1b277e4e0eca622dd99d75f4d1ce7815e8dcfc92d9c5ee81` |
| states-mobile | 14 | `878d6ee91cf9a0c0fbbad61869a28448bd5abe694f3c8ad4fa6943c2ce49221e` |
| states-mobile | 15 | `b3b8a55cb4cbf29648648d312dc0d12f8fa6c2673bb0c40e6123a12247f18acd` |
