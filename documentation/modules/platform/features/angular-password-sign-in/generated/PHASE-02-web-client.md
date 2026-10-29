<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-angular-client.template.md -->

# Angular Password Sign-in Phase 02 - Angular Client

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

- **Angular Password Sign-in and Session Entry cross-platform master review:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-review.md` sections 3, 4, 6, 7
- **Angular Password Sign-in and Session Entry Next.js implementation profile:** `../modules/platform/features/angular-password-sign-in/angular-password-sign-in-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-password-sign-in-master | 3 | `d5e936d54807668736382545378507c26cca64348e0b3da20e4c67577ffbbddd` |
| angular-password-sign-in-master | 4 | `d06b04062d6c005d2e30e19b963b1a4ce012c21c495812ea6ecba8ce076468e7` |
| angular-password-sign-in-master | 6 | `0e3a09ab847df948a96ac927449465c464811f6340cf891e2ae5a8ff7a770f89` |
| angular-password-sign-in-master | 7 | `e4f6797163f888606842779e37f5fd483d649ff93504447be1234913e9563c6d` |
| angular-password-sign-in-web | 1 | `4d04517f7c89c559c891a7a8b66307fc8c056b2b55263b7f2320af01a707a662` |
| angular-password-sign-in-web | 2 | `afd865510b9657196a4e70f2a940fb71485b8e7c71268f84cfe9c5cc65a8fc86` |
| angular-password-sign-in-web | 3 | `d5e936d54807668736382545378507c26cca64348e0b3da20e4c67577ffbbddd` |
| angular-password-sign-in-web | 4 | `d06b04062d6c005d2e30e19b963b1a4ce012c21c495812ea6ecba8ce076468e7` |
| angular-password-sign-in-web | 5 | `16451bc961f142c6a8c1c431ff6c340da11492ea5f23843de448ef5b3d3dafcb` |
| angular-password-sign-in-web | 6 | `0e3a09ab847df948a96ac927449465c464811f6340cf891e2ae5a8ff7a770f89` |
| angular-password-sign-in-web | 7 | `e4f6797163f888606842779e37f5fd483d649ff93504447be1234913e9563c6d` |
| angular-password-sign-in-web | 8 | `20bb0006bf41335f8388d59ee615c62130b86c47d6054816da5b6ffffcd1ef4f` |
| angular-password-sign-in-web | 9 | `1c4d78b720a7cdf945b7660d390d8dc8231cdb31b67d5839949dd89d27c6741e` |
| angular-password-sign-in-web | 10 | `ca3239d03a84ac7440b0a9d7d9bb7a9b26160ab88f976e7084951110f8210966` |
| angular-password-sign-in-web | 11 | `8f2747a1bf5b7e3f1e11ec31e6c8a1b54fe7662515d3e2e7898496e12230cda5` |
| angular-password-sign-in-web | 12 | `e1236d5a6672c5efd5942f0d28c5e0e3f2a91e52ed676c1ffa4ea9c514dad1b1` |
| angular-password-sign-in-web | 13 | `6579caaa1aa7b33f80bcd9dc58af531a38a3bfc4e7b4d4eb7490ef3342106645` |
| angular-password-sign-in-web | 14 | `dd02cbcbb56b2a58649f3ea4d90dfdedb6059d2ed8bfa6c6cdb25f495640158e` |
