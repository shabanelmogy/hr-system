# Phase 00 baseline and verification record

This snapshot belongs to Phase 00 of the mobile ERP readiness plan. It is
intentionally separate from the release-readiness decision: a reproducible
baseline does not mean that ownership, business workflows, offline journeys, or
device release evidence are complete.

## Repository snapshot before Phase 00

| Item | Recorded value |
|---|---|
| Commit | `1e0e6e47ec704933bfa3f449b5d9d3d7e2231ab` |
| Branch | `main` |
| Local Node | `v24.18.1` |
| Local npm | `11.16.0` |
| CI/EAS target | Node `22.13.0` (unchanged by this phase) |
| Previous `mobile-react/package-lock.json` SHA-256 | `DBA5461008D2A8D3EC2A424A3F544B51D6612AEA303108A9BF83EB61A85B48CB` |
| Worktree note | Existing user changes, especially under `web-next`, were preserved. |

## Gate results before Phase 00

These results were captured before the Expo patch update and matrix gate:

| Gate | Result |
|---|---|
| `npm run check` | passed: 142 Jest suites / 425 tests, with TypeScript, lint, architecture, and i18n checks |
| `npm run check:dependencies` | passed |
| `npm audit --omit=dev --audit-level=moderate` | passed: 0 vulnerabilities |
| `npm run check:native-config` | passed |
| `npm run check:export` | passed: Android bundle smoke, 2,876 modules, approximately 9.3 MB Hermes bundle |
| Documentation generator check | passed: 77 recipes |
| `npm run check:expo` | failed 20/21 because ten Expo SDK 57 patch versions were behind the expected versions |

## Phase 00 changes

- Expo SDK 57 patch dependencies are pinned to the versions requested by
  `npx expo install --check`; the lockfile is regenerated with npm.
- `MOBILE_API_COMPATIBILITY_MATRIX.json` is now the canonical route and endpoint
  manifest. Its Markdown companion records the ownership findings and the
  per-surface offline policy.
- `scripts/check-contract-matrix.mjs` discovers physical routes and endpoint
  members and fails when the manifest is incomplete or malformed. It also
  rejects local endpoint catalogs and transport URLs that bypass a reviewed
  `*-endpoints.ts` source.
- `check:contracts` is part of the mobile `npm run check` gate.

## Verification after implementation

These are the final Phase 00 verification results after the implementation and
SOL review:

| Gate | Result |
|---|---|
| `node scripts/check-contract-matrix.mjs` | passed: 74 routes, 27 endpoint files, 200 full-path endpoint members, and 226 traced operations covered |
| `npx expo install --check` | passed: dependencies are up to date |
| `npm run check:expo` | passed: 21/21 checks |
| `npm ci` | passed: clean install, 1,127 packages added with `--ignore-scripts --no-audit --no-fund` |
| `npm run check` | passed: TypeScript, ESLint, architecture, contract matrix, i18n, 142 Jest suites / 425 tests |
| contract-gate negative checks | passed: removing one route or one endpoint leaf made the gate fail; a direct transport URL outside an endpoint catalog also fails; restoring the reviewed manifest made it pass |
| `npm run check:dependencies` | passed |
| `npm audit --omit=dev --audit-level=moderate` | passed: 0 vulnerabilities |
| `npm run check:native-config` | passed |
| `npm run check:export` | passed: 2,876 modules; Android Hermes bundle approximately 9.3 MB |
| documentation generator check | passed: 77 recipes |
| post-change lock SHA-256 | `ACE6A96D6ED40E53C37C88EC4018D7E828DD8498D884633608B5F267FA431E73` |

The local Node 24 runtime is not evidence that the CI/EAS Node 22.13.0 build
works. Phase 00 therefore records both versions and leaves CI/EAS configuration
unchanged. Device journeys and EAS builds remain Phase 08 release evidence.
