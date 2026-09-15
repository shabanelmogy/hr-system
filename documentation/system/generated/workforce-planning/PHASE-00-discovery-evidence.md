<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Workforce Planning Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

Use `documentation/system/templates/FEATURE-IMPLEMENTATION-REQUEST.template.md`
as the copy-ready scope contract and the review artifact as the evidence ledger.
`Required` means current-release and gated, `Deferred` requires an owner/trigger,
and `Excluded` means no runtime surface.

For any API work, also follow
`documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`. Phase 00 cannot close and
runtime implementation cannot begin until the Existing-System Relationship Review
and all three Business Readiness matrices in `IMPLEMENTATION-REQUEST.md` are
complete for the known scope. Every Edge Cases & Validation category must contain
scenarios or an explicit `N/A` with a reason.

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
9. Complete the Business Rules Matrix, Edge Cases & Validation Matrix, and Impact
   Matrix in `IMPLEMENTATION-REQUEST.md`; update them when discovery changes scope.

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
- [ ] Existing-System Relationship Review is complete and the owning capability is
      resolved; no parallel/workaround owner is being introduced.
- [ ] Business Rules Matrix records every known rule with one primary owner,
      stable outcome/error, and required test.
- [ ] Every Edge Cases & Validation category is covered by scenarios or explicitly
      marked `N/A` with a reason and has an enforcement layer plus required test.
- [ ] Impact Matrix classifies Domain, CQRS, persistence, API, security/scope,
      migration/data, integrations/runtime effects, tests, clients, and docs as
      `Reuse`, `Extend`, `Change`, `Add`, or reasoned `N/A`.
- [ ] No unresolved ownership, matrix placeholder, or unclassified edge-case row
      remains before Phase 00 is closed.

## Approved references

- **Workforce Planning cross-platform master review:** `../project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Workforce Planning API implementation profile:** `../api/WorkforcePlanning_API_Implementation_Profile.md` sections 1, 10, 11
- **Workforce Planning Next.js implementation profile:** `../web-next/features/workforce-planning-frontend-reference.md` sections 1, 2, 12, 13
- **Workforce Planning Expo implementation profile:** `../mobile-react/workforce-planning-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| workforce-planning-master | 1 | `b7baad6331938258b3267ca02b15d9b874797e5ef02a350f625cbd644ca51055` |
| workforce-planning-master | 2 | `eb785fb621a27384548d676a6aa22a44d13cc7011310a141ff757e38541bc04c` |
| workforce-planning-master | 5 | `22db93cf07be5c6356d8aec9b270f1e8e15b9f2a0fe0b20495f70c896d21107e` |
| workforce-planning-master | 8 | `6477631f6815fb5b2b30feebace504df77a54281f6a6952394d35794f7fef815` |
| workforce-planning-master | 9 | `618443cb9a7c4d12f71415983eb3c79478d3ea3010d923cb74e3c396eca9b440` |
| workforce-planning-api | 1 | `d0f07c6666739dcc646fc29b2293941449978547bbabb2fcd8dd4f210491afed` |
| workforce-planning-api | 10 | `2e1212fe37e33e9c36a2ef3e2065386885f2b4de94610164d896694b735a5774` |
| workforce-planning-api | 11 | `08821f2c666d728ce2575ab88a44d0d3e4739d9646add193aaadc029ccf02b10` |
| workforce-planning-web | 1 | `552f78a13660c80ca0bb21d34957e5baa820750df9790bb4d8155fd135933005` |
| workforce-planning-web | 2 | `f20e51276257b33f8be6f2ed57a0ec1a4a01e8e7a843f217c966e0afc5b96a79` |
| workforce-planning-web | 12 | `8e2d3c6e69e2bbc33a6d93744fb3da90edb02dc7755aaf3a4b985787b91160a8` |
| workforce-planning-web | 13 | `5a0c7e85627cc62f56aa58ffa053de7a4135c6ceebb80224747edadb159092be` |
| workforce-planning-mobile | 1 | `94737446979c0eb700399f8366c713560a174d1874bfa2dd1843e73ec66f232a` |
| workforce-planning-mobile | 14 | `433eadc88c76ad2c72e48c5b4e683a42e208f9f2720e8a7c8017f431a55e8a16` |
| workforce-planning-mobile | 15 | `e886a90cc9a59d080e123c96c072ea5ed243174544cdc9aa468996bc2ffc8d35` |
