<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-angular-client.template.md -->

# Angular Shared Fields and Form Phase 02 - Angular Client

## Purpose

Implement the exact authorized Angular client slice using its applied Web book,
current runtime sources and screen/workflow contract. Retained Next.js source is
reference evidence, not the framework or UI structure to generate for Angular.

## Required structure and ownership

- Keep the strict standalone Angular application under web-angular. No Next,
  React or mobile runtime imports; no BFF or JavaScript credential persistence.
- Use the chosen public platform/shared APIs. Use HttpClient only in data services,
  typed contracts and runtime validation at untrusted boundaries.
- Keep small local state in signals. Follow the approved D06 decision for larger
  state; do not invent a universal store/query engine.
- Use existing shared controls before adding visual wrappers. Where business UI is
  Excluded, do not create speculative forms, lists, module shells or routing.
- Preserve API scope, permissions, catalog keys, revision/conflict and lifecycle
  authority. API/native source changes need their own authorized scope.
- Register only existing source/config/test/evidence files in the final manifest.

## Runtime and translation checks

- [ ] Scope transition/logout clears old state before the next context is exposed.
- [ ] Cancellation and generation checks reject stale reads and late failures.
- [ ] Existing database-backed translation keys/catalog and company/system
      authority are preserved; shipped resources remain the fallback.
- [ ] Lazy namespace registration preserves accepted overrides and placeholders.
- [ ] Explicit user language wins over company default, with document lang/dir.
- [ ] Typed write/reset/default services preserve expectedRevision and surface
      conflicts without blind retry or forced overwrite.
- [ ] Service fixtures are distinguished from actual signed-in API/SQL/UI proof.
      Register later consumer/release acceptance in canonical central notes.
- [ ] Shared visual, form, grid, accessibility and view acceptance is exercised
      only for Required implemented surfaces under the current screen contract.

## Verification and handoff

Run focused behavioral tests plus strict type/template checks, architecture and
catalog checks and production build. Preserve bundle budgets. Record exact results,
scope exclusions and intentional retained-client differences in the applied book.
Regenerate feature-scoped packets; Phase 06 must be Verified before education.

## Canonical references

- **Angular Shared Text Fields and Form Submission cross-platform master review:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-review.md` sections 3, 4, 6, 7
- **Angular Shared Text Fields and Form Submission Next.js implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-foundation-master | 3 | `1c07ac405eb9a9da732bbc2cd5d3043d903b7d7fee12ac491660742dcf928262` |
| angular-form-foundation-master | 4 | `1b47dfc85b7c0c905a5cfc0e75f64cdc37b04cf1e47a64acd27ba7fb18fe99c9` |
| angular-form-foundation-master | 6 | `4c846e1af1e4f8be32a79a58ff2f272759a316890b776c9960c0096a4661669a` |
| angular-form-foundation-master | 7 | `e46cfce5be74e89543f3d8ad5ef40f3640578392f7f72abee376d81c0041bcf8` |
| angular-form-foundation-web | 1 | `3faf7c7e731326a9d26b46946abe7eb9059ff63cb8eec7a8ac2055308cf6fc84` |
| angular-form-foundation-web | 2 | `f2251a944a00c8155b578e2ac7e59625798f5ab536762ef52fd00529ba0982d6` |
| angular-form-foundation-web | 3 | `1c07ac405eb9a9da732bbc2cd5d3043d903b7d7fee12ac491660742dcf928262` |
| angular-form-foundation-web | 4 | `1b47dfc85b7c0c905a5cfc0e75f64cdc37b04cf1e47a64acd27ba7fb18fe99c9` |
| angular-form-foundation-web | 5 | `c6d1c95cb6dfb29c3a4eb08fcf1592391d0d06246967c3fab9725067f8bc2687` |
| angular-form-foundation-web | 6 | `4c846e1af1e4f8be32a79a58ff2f272759a316890b776c9960c0096a4661669a` |
| angular-form-foundation-web | 7 | `e46cfce5be74e89543f3d8ad5ef40f3640578392f7f72abee376d81c0041bcf8` |
| angular-form-foundation-web | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-web | 9 | `9e69e079b4dcc5b2ca68cde1376645625bb85e1030a5da4e8083eb9453d322ee` |
| angular-form-foundation-web | 10 | `7cef5c81383b73aa3f407c82f8fbd0dd848ef5b67a6e2f0eb8adfb995ec8d14c` |
| angular-form-foundation-web | 11 | `391d65f6b02080f8b4bacf2293b5a07a1aa69f834d784a1d94b4bb86400ee81c` |
| angular-form-foundation-web | 12 | `70f10c72924980a36133310b0a7b4dc18511cb110b18323a79dd960adcbc8be3` |
| angular-form-foundation-web | 13 | `d369cbf630d95eb29023602fbe352a2095526c95a1d43009ad38382a265e53c6` |
| angular-form-foundation-web | 14 | `31cf6ca8ba62d489b09c1844f693f761227241e974459440821f57be559bf031` |
