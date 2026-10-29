<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-angular-client.template.md -->

# Angular Shared Theme and Action Control Phase 02 - Angular Client

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

- **Angular Shared Theme and Action Control cross-platform master review:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-review.md` sections 3, 4, 6, 7
- **Angular Shared Theme and Action Control Next.js implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-theme-foundation-master | 3 | `071779e2c74d963bce39981ae360e9ad0206810e48a29edca4473916ce983c68` |
| angular-theme-foundation-master | 4 | `da77c409251d42150cbb611b466e34269a36e417e5afd3890a68836bf33243eb` |
| angular-theme-foundation-master | 6 | `c59b87b10fc969391f2d782547421b84c7d4b47bdf19df5f2b8485949b709791` |
| angular-theme-foundation-master | 7 | `74ab13bcbd7d84010d64cac92472527044e747aca5045560ab602ee00fb3a1d8` |
| angular-theme-foundation-web | 1 | `350106b9d165927fccfe97ada1dd90dfe9128de5f0076e9a95a6bcef39eb9c44` |
| angular-theme-foundation-web | 2 | `23ebd67dc023b93e3fe4b46bf2d361346ae97d9e9e774aa289e82f4ec0584f7b` |
| angular-theme-foundation-web | 3 | `071779e2c74d963bce39981ae360e9ad0206810e48a29edca4473916ce983c68` |
| angular-theme-foundation-web | 4 | `da77c409251d42150cbb611b466e34269a36e417e5afd3890a68836bf33243eb` |
| angular-theme-foundation-web | 5 | `a866a4bf9fdc929bfb990a70fe575bfc962a4097a68f81e636044e80f620d8d1` |
| angular-theme-foundation-web | 6 | `c59b87b10fc969391f2d782547421b84c7d4b47bdf19df5f2b8485949b709791` |
| angular-theme-foundation-web | 7 | `74ab13bcbd7d84010d64cac92472527044e747aca5045560ab602ee00fb3a1d8` |
| angular-theme-foundation-web | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-web | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-web | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-web | 11 | `58dc115e8092bcba8eba15cea9974b490796f1bb79ea8dcb5f57f9f9083b5e13` |
| angular-theme-foundation-web | 12 | `1551bbf6ddbdcd426aa3759d7ced8fdf0a303c7a5143aba86a4c6e5870592c4b` |
| angular-theme-foundation-web | 13 | `13bc8ce32880ebc4901c2ccf67f921e1a34fcffa5dbb2bf3f3e08566adaa8a61` |
| angular-theme-foundation-web | 14 | `b654c4c4e8ade2d5e7f21a434b4c89913a1dc05ce33ff6113fbe7b0510cc1f22` |
