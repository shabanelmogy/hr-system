<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-angular-client.template.md -->

# Angular Toolchain and Localization Runtime Phase 02 - Angular Client

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

- **Angular Toolchain and Localization Runtime cross-platform master review:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-review.md` sections 3, 4, 6, 7
- **Angular localization foundation Angular Web profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-localization-foundation-master | 3 | `ce20c23bd1cc943f42290794831e6b0955bf48b4df3fb4f72e5e13d85673593f` |
| angular-localization-foundation-master | 4 | `2345e4c0df8f384bba2a2b07fe7e9f102ba3b93096314d620fa8be452461ed41` |
| angular-localization-foundation-master | 6 | `7ef4ef81649a5cf87f78af83589a72bb1d3575294e98efe4da414ab698114f3e` |
| angular-localization-foundation-master | 7 | `c1f5c712a2d2529993fc7f4ac45fc8d015ad29fd934eadae86a2c98f7db5df49` |
| angular-localization-foundation-web | 1 | `265fd2b4b95c9c933ce3aef4ccca2b46b645ca9b779d2684869d104faa9be73d` |
| angular-localization-foundation-web | 2 | `dbb9c391093ad2e63ab72da54097310c2dfddd667487d0934e43c8bb5ca9c928` |
| angular-localization-foundation-web | 3 | `ce20c23bd1cc943f42290794831e6b0955bf48b4df3fb4f72e5e13d85673593f` |
| angular-localization-foundation-web | 4 | `2345e4c0df8f384bba2a2b07fe7e9f102ba3b93096314d620fa8be452461ed41` |
| angular-localization-foundation-web | 5 | `71dad2ca5b311ecc4d115bee358583247edb7e5498ec4f932e1dc5aa12bf55e9` |
| angular-localization-foundation-web | 6 | `7ef4ef81649a5cf87f78af83589a72bb1d3575294e98efe4da414ab698114f3e` |
| angular-localization-foundation-web | 7 | `c1f5c712a2d2529993fc7f4ac45fc8d015ad29fd934eadae86a2c98f7db5df49` |
| angular-localization-foundation-web | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-web | 9 | `46fb0447edae1fca09c9986213d9472d157e56cc4c960a40aced27e409d47265` |
| angular-localization-foundation-web | 10 | `fe7928624f22f08764dcf7e54d5651be2cb0f41f1930ac527aaa94e00a35faf6` |
| angular-localization-foundation-web | 11 | `5dab27474a1b99ba062fd373bdbdb3dd3a8a6fe523b6dbf3da6991fc4335f10e` |
| angular-localization-foundation-web | 12 | `40be14913017d390ebd1bea15586705971b0542343e8c56b0b7267e5972efd62` |
| angular-localization-foundation-web | 13 | `a4f2b92cb7b0ddb46e4abfbc3ffd75253df09b1252afe8221c3bde9d44d2dd2e` |
| angular-localization-foundation-web | 14 | `8eb0574471e920e016444fe94f7ac5951ad3ffdb506efa474a7154c2ad240f95` |
