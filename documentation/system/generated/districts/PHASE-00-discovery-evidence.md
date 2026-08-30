<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Districts Phase 00 - Discovery and Evidence

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

- **Districts cross-platform master review:** `../project/DISTRICTS_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Districts API implementation profile:** `../api/Districts_API_Implementation_Profile.md` sections 1, 10, 11
- **Districts Next.js implementation profile:** `../web-next/features/districts-frontend-reference.md` sections 1, 2, 12, 13
- **Districts Expo implementation profile:** `../mobile-react/districts-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| districts-master | 1 | `51dc9bf711f3af7c9b93b050ed972340a5353e10be5efd925a1a7b7f6ae08453` |
| districts-master | 2 | `c1e4a7ede6afaad7d955cb8e1e59fac93210489cd5e9fd0dba8fdf5878b79b7d` |
| districts-master | 5 | `acc697a7d29a374cf2baaaf6678e2e1c3cfab296999f8afcadef2edb116b6e1c` |
| districts-master | 8 | `8b2d2dd81761ee08dc4f372a5fed20353b60d2020d2680d5d0138459389b7bbd` |
| districts-master | 9 | `6266a855e1cd714553644fb584e857d8f02350ce0abec9a1904245cf0f63eeb5` |
| districts-api | 1 | `22b3bbfddbed6d5048acb0224ba4b08ff7d1e5f94af607e8dde95b758b0a4c9b` |
| districts-api | 10 | `36d563363a7c0b878ef54b12ab23dc6eb7e77e583b14c5199eeed69540539ee0` |
| districts-api | 11 | `94630d0b417ed5537a5071fe59e19f7e36b325b45b543acd0a067dffb45e4bbc` |
| districts-web | 1 | `150f2646e4e4c492b2addcc6960dca2c9c6eb1cc303d235a7737764985a23072` |
| districts-web | 2 | `65a9dcab8af8b0efaad40974a60066c7e3178c8987eca502da411df85adc81a9` |
| districts-web | 12 | `cf9b0888ef0144a75decf29a461edb753e1d68c5b8c12089d5d107157f157fe7` |
| districts-web | 13 | `275456e2e6a79a8377c5e3d77a905e22c5488d11756b1a93a7b89707f8474409` |
| districts-mobile | 1 | `682435c23634ea28fe064a96e876c6289a69fe969be5a2aac50a1e81fe8c2730` |
| districts-mobile | 14 | `485ff7dc418e59ff8e15ebe9d20da50d60f68cfe972d1386d0984a047f3487f5` |
| districts-mobile | 15 | `30bfd7df99edd51301571c165f236d3e34da8d46086cd49201dcd1ead9da9390` |
