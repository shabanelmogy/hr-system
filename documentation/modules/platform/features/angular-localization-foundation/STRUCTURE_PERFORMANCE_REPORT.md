# Angular structure and startup maintenance — 2026-11-04

## Scope

Requester-approved existing-client maintenance (migration D40): improve structure
and performance; defer new business functionality. Existing approved ownership,
Signal Forms Option B, UI behavior, persisted translation contracts and catalog
identity remain unchanged. No new screen, API, dependency, database migration,
Form Engine or CI workflow. API/Next/Mobile changes and domain parity audit are N/A.

## Changes

- `localization.schemas.ts` owns the existing Zod wire schemas. The HTTP service
  parses unknown company/system responses before handing them to the runtime.
- `localization.types.ts` contains only type imports/declarations, inferred from
  those schemas. No duplicated DTO/schema authority.
- `LocalizationRuntime` accepts validated typed bundles and retains the existing
  generation, identity, role, catalog, permission, placeholder and text-key checks.
  Its synchronous language, baseline and override lifecycle are preserved.
- `presentation.public-api.ts` exposes text presentation/bootstrap independently
  from HTTP persistence. App configuration uses this narrow entry. The existing
  broad public API remains compatible for lazy feature consumers.
- `shared/data/navigation.public-api.ts` exposes unsaved navigation without pulling
  read/collection/PDF utilities into bootstrap. Root application and dev routes use
  it; owner state and service instances are unchanged.

## Measurement

Same configured production build, license input and catalog; `npm run build --
--stats-json` before and after the refactor:

| Metric | Before | After |
| --- | ---: | ---: |
| Initial JS + CSS (raw, CLI rounded) | 608.36 kB | 572.16 kB |
| Initial estimated transfer | 156.67 kB | 147.18 kB |
| Initial warning budget | 500 kB | 500 kB |

Bootstrap raw size decreases by approximately 36.20 kB / 5.95%; estimated transfer
decreases by approximately 9.49 kB / 6.06%. The first schema-only split measured
608.33 kB: broad root exports still retained the HTTP boundary. The narrow entry
changes produce the reported reduction. No dynamic-import shim, proxy runtime,
duplicate translation store or budget increase was used.

Final esbuild statistics show zero Zod, LocalizationService, localization schema,
collection/PDF/read utility or Angular Forms bytes in the initial JS graph. The
current runtime, i18next, bootstrap resources and text authorization policy remain
synchronous. A lazy feature that needs the HTTP/validation code still downloads it.
This measurement proves bootstrap composition/size, not lower total login-route
bytes, a production latency improvement or hosted acceptance. RISK-020 remains
open because the initial bundle still exceeds 500 kB and first-route production
performance needs separate measurement.

## Verification

- Full unit suite: **78 files / 445 tests passed**. Added HTTP-boundary coverage for
  malformed/partially valid data, invalid identity/language/revision, size limits,
  strict system response shape, fallback clearing and successful unchanged refresh.
- Architecture: **16 tests and complete source scan passed**.
- Strict app and spec TypeScript checks passed; generated catalog check passed.
- Production build passed with the unchanged **72.16 kB** budget warning.
- Production artifact served locally: **10 login scenarios** and **20 language
  selector scenarios** passed, including EN/AR, responsive login, modes/palettes,
  keyboard behavior, persisted preference, scoped fixture text and logout fallback.
  API requests were intercepted with fixtures; no live login or business write.
- Central planning/documentation and whitespace checks are recorded at handoff.

Durable scoped evidence: `verification/structure-performance-summary.json`. Previous
Signal Forms evidence retains its earlier source snapshot and historical scope.
Rollback consists of reverting this bounded client/docs change; no data rollback.

## Documentation used

- [Angular injection tokens and value/type references](https://angular.dev/guide/di/lightweight-injection-tokens).
- [esbuild tree shaking and conservative side-effect analysis](https://esbuild.github.io/api/#tree-shaking).
- [Angular initial build budgets](https://angular.dev/tools/cli/build#configuring-size-budgets).
