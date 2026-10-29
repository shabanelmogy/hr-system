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

- **Angular Role Home cross-platform master review:** `../modules/platform/features/angular-role-home/angular-role-home-review.md` sections 3, 4, 6, 7
- **Angular Role Home Angular web implementation profile:** `../modules/platform/features/angular-role-home/angular-role-home-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-role-home-master | 3 | `e048bd0ced8c61c21dd123c60b8970593fb7caec43ef695f3a15d43ce1ba450d` |
| angular-role-home-master | 4 | `0b512f0ad7afaa343b36e43ab0148064b2a42e0dd51f3d682d7de6e0570920e6` |
| angular-role-home-master | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-master | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-web | 1 | `f984be175a16c176b96a040e2653b65d903c05bee762fe5a3c150470c6a97bb5` |
| angular-role-home-web | 2 | `b897606c0ca6644b476e0d49a4efb8d0c00b2b42c1b37d8f6282224dcb9ad071` |
| angular-role-home-web | 3 | `e048bd0ced8c61c21dd123c60b8970593fb7caec43ef695f3a15d43ce1ba450d` |
| angular-role-home-web | 4 | `0b512f0ad7afaa343b36e43ab0148064b2a42e0dd51f3d682d7de6e0570920e6` |
| angular-role-home-web | 5 | `563cf43ec82636430fe4e20f38f8398ba1e21e6344b16f5d7af85ccd4943fec2` |
| angular-role-home-web | 6 | `e127c53db94b549e9a0839a46884007b0cb45407d19b1f32fe03d7fbc884e21d` |
| angular-role-home-web | 7 | `c1c548649c4b8f25bfa58b9c5e31aff3d5b9dd128868657c9f2295058e414d4d` |
| angular-role-home-web | 8 | `d28963b7a469ef83b975e057f57db47703ca3b8fd120d21ff3b4b6497b8a656f` |
| angular-role-home-web | 9 | `60f9c606d5d26a6f8a4c4dc82559183bcd0269bd903190817574405dbd36670f` |
| angular-role-home-web | 10 | `1c839c0e89ee2594c02d7b00912de2fcf2e0690ef23d50b52255e5491a33fe20` |
| angular-role-home-web | 11 | `091fbcbc24ef465bd0fa7e2e1b02611b0ddaca9d52a29c2deb40c8220573e104` |
| angular-role-home-web | 12 | `61c9f87d0e0bbe8f149e1ec5f4dd673d136de6fe271eed0177c4ef0c3e7055c4` |
| angular-role-home-web | 13 | `e55af14d30d5c713f1629c69ece73be17f6f6f02273c21e4a7c067af65869cdc` |
| angular-role-home-web | 14 | `1d027bc20ed0bcbe5fb1530e64bdab6f6dfee98c396873ba3fc376bf8a5f2005` |
