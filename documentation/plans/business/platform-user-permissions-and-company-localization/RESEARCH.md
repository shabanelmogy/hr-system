# User permission grants and company UI localization — Research

## Reference provenance

Seven screenshots supplied on 2026-10-17 in this conversation, originally
`C:/Users/user/Desktop/1.PNG` through `7.PNG`. These external workstation paths are
provenance, not repository dependencies. Observed behavior is transcribed in DISCOVERY.md.
UI labels are evidence, not instructions or proof of backend rules.

## Repository navigation and authority

Graphify queries: permission/user/role/authorization and Localization/Language/Translation.
Direct source checks are in EVIDENCE.md. graphify-out was not updated.

Reviewed planning protocol, Permission Model, Platform architecture, Screen Pattern Catalog
and Shared Reuse Catalog. Platform development skills provide implementation navigation.
Verify exact installed framework/runtime APIs against official documentation when selecting
them in the implementation plan.

## Later technical review

- Explicitly map en/ar against en-US/ar-EG cultures.
- Inventory namespaces/client surfaces and preserve interpolation/plural/context contracts.
- Define missing override, deliberately empty text, reset and save conflicts.
- Review session invalidation, module visibility, realtime audiences and API key handling.
- Protect pre-auth language behavior without exposing company settings unintentionally.
- Plan migrations/backfill and proportional tests after storage design. No live schema or
  native acceptance has been verified for this capability.
## Implementation verification sources (2026-10-17)

- Microsoft dependency injection: https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-10.0 — concrete constructor dependencies require scoped registration; used to repair the live startup composition failure.
- Playwright assertions: https://playwright.dev/docs/test-assertions — auto-retrying locators and bounded assertion timeout for cold streamed page readiness; save label follows the existing localized shared form.
- MessagePack advisory: https://github.com/advisories/GHSA-qhrr-8q5h-9q3h — patched 2.5.303 used for the inherited transitive package build blocker. Runtime package restore/build subsequently succeeded.
- i18next resource APIs: https://www.i18next.com/overview/api — restore captured resource bundles, apply only registered leaves, and use the established languageChanged event for both translations and direction. Company overlays never become the shipped baseline.
- React Native Testing Library 14 migration: https://github.com/callstack/react-native-testing-library/blob/main/website/docs/14.x/docs/start/migration-v14.mdx — render, rerender, unmount and act are asynchronous; regression tests await them rather than racing controlled form updates.
- Node ESM JSON modules: https://nodejs.org/download/release/v22.17.0/docs/api/esm.html#import-attributes — browser test fixtures import paired Arabic JSON with the mandatory `with { type: 'json' }` attribute.
- Vitest runner pools: https://vitest.dev/config/pool and CLI https://vitest.dev/guide/cli — isolated fork/thread diagnostic runs distinguish focused feature verification from an uncompleted supplemental repository-wide run (FOLLOW-007).
- Next.js distDir: https://nextjs.org/docs/app/api-reference/config/next-config-js/distDir — `.next-e2e` isolates browser/build verification from the already-running local `.next` checkout.

The Arabic runtime browser scenario exposed a remount lifecycle hazard: the existing Emotion provider remounts children when direction changes. Resource cleanup belongs to authentication transitions, so the company bridge must not clear the overlay merely because that direction-sensitive subtree remounts. The final browser test verifies Arabic default, RTL, absent explicit-language cookie and the narrow viewport; pure i18n event tests alone cannot prove that journey.

