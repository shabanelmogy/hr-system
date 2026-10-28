# Mobile API Readiness Review

Status: **Phases 01–07 source foundations are implemented and verified; the first signed Android EAS preview completes on 2026-10-28. Installed-device, hosted and store acceptance remain open**.

This review records the mobile client's verified API and platform boundaries. It
does not claim a live production smoke test or store-signing validation.

## Secure runtime and ERP EAS preview — 2026-10-28

Device feedback on 2026-10-28 reports `NativeDatabase.execAsync: file is not a
database` during offline bootstrap. Inspection of installed Expo SQLite 57.0.4
shows that `withExclusiveTransactionAsync` creates another native connection
without applying the key from the provider connection. The shared offline writer
now opens its own isolated connection to the same database path, validates and
sets the existing SecureStore key before BEGIN, enables foreign keys, executes
the transaction and closes only that connection. Web serialization remains.
Eight focused tests cover fresh schema, legacy preservation, independent keyed
connections, rollback, key failure, invalid keys and web sequencing. No database
file, key or schema version is reset. The requester reloads the installed
development client and confirms the application opens on 2026-10-28;
`FOLLOW-010` is Verified for the reported bootstrap failure. Real offline
business-write journeys remain `PROD-026`.
The final complete Mobile check passes 194 suites / 598 tests, with coverage
25.66/17.87/21.37/28.26 percent and unchanged floors. Android export passes the
3,030-source policy. The running HTTPS tunnel serves a development bundle
containing the corrected connection code (HTTP 200, 18,297,793 bytes).

Primary references: [Expo SDK57 SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/),
[SDK57 SQLiteDatabase source](https://github.com/expo/expo/blob/sdk-57/packages/expo-sqlite/src/SQLiteDatabase.ts)
and [SQLCipher key initialization](https://www.zetetic.net/sqlcipher/sqlcipher-api/#PRAGMA_key).

The requester subsequently selects live changes during development. SDK57's
`expo-dev-client` and an internal `development` EAS profile now support that
workflow, reusing the configured preview endpoints. Build
`b71a24b6-897b-41df-ba95-1c36287ed9bf` tracks the development client. Metro is
started with `--dev-client`; the development tunnel serves the Android
development manifest successfully. The canonical release runbook records startup,
installation and rebuild boundaries. Phone-side Fast Refresh remains unverified
until that new client is installed (`PROD-026`); this is not an OTA release claim.
The complete Mobile check passes (194 suites / 593 tests, unchanged coverage
floors), native config and dependency compatibility pass, and Expo Doctor is
21/21. A real Android development-bundle request through the tunnel succeeds
(HTTP 200, 18,296,780 bytes); this proves bundle delivery, not phone-side refresh.
HMR WebSocket registration through the same tunnel succeeds with the expected
update and `bundle-registered` messages. The normal Android production export
also still passes its 3,030-source boundary; four upload-policy tests pass.
The development build finishes at 2026-10-28 11:49:00 UTC. Its downloaded APK
passes all ZIP CRCs (292,688,381 bytes / 1,763 entries), is debuggable and has the
expected development launcher/scheme, package and 1.0.0/code 1 identity. The
embedded signing certificate matches the previous standalone preview; physical
update installation is still unverified. The canonical runbook records its APK
link and hashes. Metro is restarted in the background after the terminal session
ends, and HTTPS manifest/bundle/HMR checks pass again.
The production dependency audit remains red at 13 Low / 3 High affected entries
with no Critical findings, retained under `RISK-013`/`RISK-014`.

Mobile CI and
both EAS profiles now pin Node 22.23.4, the [official security release](https://nodejs.org/en/blog/release/v22.23.4).
The release source gate checks both profiles. A checksum-verified portable copy
is used for current external tooling; the complete Mobile check (194 suites /
593 tests), unchanged coverage floors, focused release gate and Android export
also pass on this exact Node version. `RISK-015` retains the separate default
workstation-runtime follow-up.

EAS CLI 26.0.0 is the version currently published in npm and verified locally;
the reference site's displayed 27.0.0 was unavailable from that registry. One
has no connected Expo service, so the official EAS CLI handles the handoff.
Authentication is verified. With requester authorization, a dedicated
[@shabanelmogy/erp-system-mobile](https://expo.dev/accounts/shabanelmogy/projects/erp-system-mobile)
project is created and linked in app.json with its real ID. The preview API and
report URLs use the existing client configuration; the requester selects
`shabanhrms.runasp.net` for preview app links. These three public values are set
only in the project's EAS preview environment. Preview and production select
separate environments; versioning is remote. The Android keystore is generated
by EAS and stays in its managed credential storage.

Release/native-config checks now sanitize only the copied project identity in
disposable verification fixtures so synthetic tests do not conflict with the
real binding. The real app.json hash remains unchanged through both checks.
The complete Mobile check passes again (194 suites / 593 tests) and preview-mode
Android export still passes the 3,030-source policy. EAS build
[`32f6f9a6-7779-4077-a42d-8d1309f32015`](https://expo.dev/accounts/shabanelmogy/projects/erp-system-mobile/builds/32f6f9a6-7779-4077-a42d-8d1309f32015)
finishes successfully at 2026-10-28 11:07:06 UTC (Android, preview, version
1.0.0/code 1), producing a signed internal APK. The release runbook records its
download and file evidence. `PROD-009` retains installation and remaining
iOS/store acceptance; the cloud build does not verify physical journeys.
Unauthenticated requests to both standard association-file paths on the chosen
preview host return HTTP 401 on this date. `PROD-012` retains public association
publication, signing-fingerprint matching and device link verification.

The root EAS upload policy now limits the archive to the Mobile project and local
shared tokens, preserves required compiled token output/vendor assets and
excludes other applications, local credentials and generated files. All four
upload-policy tests pass, including the directory-entry traversal used by EAS.
Actual authenticated inspection produces 1,221 files / 5,906,864 bytes, no
forbidden paths, and ten required build inputs matching the source hashes.
Temporary/output directories are outside the checkout to avoid self-copy.
The gate is registered in CI; archive evidence does not replace build/install
results.

## Native bundle dependency boundary — 2026-10-28

Maintenance now verifies dependency reachability in the actual Android export.
`npm run check:export` first runs 13 Node policy tests, then emits a production
Hermes bundle with a source map and inspects every native map before cleanup.
The verified map has 3,030 unique sources, application and React Native evidence,
application Zod v4, and no legacy Zod, deepmerge or CLI tooling schemas.

Expo intentionally includes `@expo/cli/build/metro-require/require.js` as its
[Metro module loader](https://github.com/expo/expo/blob/sdk-57/packages/%40expo/cli/metro-require/require.ts).
The policy permits that exact file; other CLI modules still fail. Regression
tests cover the loader's neighboring paths, legacy validation, malformed/empty
maps, missing application/native evidence, Windows paths, sourceRoot and indexed
maps. The verification export's source maps and bundles remain disposable and
are removed after inspection.

The complete `npm run check` is repeated after the gate wiring and passes 194
suites / 593 tests, strict types, full lint, architecture, contracts, i18n and
foundation/release checks. Coverage stays 25.56/17.85/21.30/28.14 percent against
unchanged floors. The 13 source-map policy cases run separately through Node's
test runner and do not replace Jest coverage.

CI runs its unchanged moderate production audit after the source/export and
documentation gates, so those checks can report results while audit findings are
open. The audit still fails the job and has no ignore or continue-on-error.
Current full audit is 15 Low / 3 High entries; production is 13 Low / 3 High,
with zero Critical. `RISK-013` owns the upstream Zod path and `RISK-014` owns the
newly reported deepmerge advisory. Latest CLI 58.1.16 still declares Zod 3;
upgrading the SDK alone is not a demonstrated fix.

These maps prove the boundary for the inspected export, not signed APK/IPA or
installed-device acceptance. The current session has no configured Android SDK
and no java/adb commands, with standard SDK/JDK paths checked; `PROD-009` retains
native build/artifact ownership. Hosted and physical journeys remain under the
existing `PROD-*` notes.

## Corrective readiness verification — 2026-10-27

The complete `npm run check` passes strict types, ESLint, architecture, contracts
(90 physical routes, 35 endpoint catalogs and 253 endpoint members), i18n/catalog
parity, foundation/release source checks and all 194 Jest suites / 593 tests.
Coverage across executable source is 25.56% statements, 17.85% branches, 21.30%
functions and 28.14% lines, above the unchanged 20/13/17/22 floors. Focused Ledger
Setup/Offline Operations verification passes 47 tests in 15 suites. Android export
also passes with React Compiler enabled. `FOLLOW-006` is Verified.

The generic Ledger Setup renderer no longer imposes manual memoization boundaries
on save/lifecycle callbacks and its small column projection; current scope,
selected record and concurrency values remain render-owned. React's
[compiler lint guidance](https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization)
supports this correction. The offline screen test supplies explicit edit
authority and covers missing/cache/read-only/denied states. No business schema,
API contract, list layout, form system or device permission is changed.

That source correction initially left the 15 SDK57 patch mismatches in
`FOLLOW-008`. The subsequent dependency maintenance below closes SDK compatibility;
device/EAS/hosted acceptance remains separately owned by the `PROD-*` notes.

## SDK57 patch and dependency maintenance — 2026-10-27

`FOLLOW-008` is Verified after the [official Expo alignment workflow](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
within SDK57. A clean `npm ci --no-audit --fund=false` installs 1,135 packages;
all 1,135 installed package versions match their lockfile entries. React Native
remains 0.86.3 and React remains 19.2.3. Verification uses local Node 24.13.1;
configured CI/EAS runtime and signed-device evidence remain separate release gates.

| SDK dependency | Verified installed version |
| --- | --- |
| expo | 57.0.31 |
| expo-asset | 57.0.20 |
| expo-background-task | 57.0.21 |
| expo-constants | 57.0.22 |
| expo-crypto | 57.0.4 |
| expo-document-picker | 57.0.3 |
| expo-image-manipulator | 57.0.21 |
| expo-linking | 57.0.13 |
| expo-observe | 57.0.26 |
| expo-router | 57.0.29 |
| expo-sharing | 57.0.24 |
| expo-splash-screen | 57.0.10 |
| expo-sqlite | 57.0.4 |
| expo-task-manager | 57.0.21 |
| jest-expo | 57.0.6 |

`expo install --check` passes, and Expo Doctor passes 21/21. The complete Mobile
check passes every source gate and 194 suites / 593 tests, with unchanged coverage
25.56/17.85/21.30/28.14 percent (statements/branches/functions/lines). Dependency
compatibility passes, including adversarial URI decoding. Disposable Android
prebuild verifies local/EAS Observe identities, SQLCipher and disabled Android
backups; the release source gate verifies app links and metadata. Android export
passes with React Compiler enabled and a 9.9 MB Hermes bundle.

The clean install also exposes an obsolete compatibility assertion: Expo's updated
config plugins resolve xcode 4.0.0, which [uses Node crypto for PBX identifiers](https://github.com/apache/cordova-node-xcode/blob/master/lib/pbxProject.js).
The unused xcode/uuid override is retired. The compatibility gate now exercises
the CommonJS project API and its 24-character uppercase hexadecimal identifier
contract. The local patched URI-decoder override remains enforced.

Compatible security updates include Axios 1.21.0, application Zod 4.6.7,
follow-redirects 1.16.2, shell-quote 1.12.0 and brace-expansion 1.1.21/5.0.12.
Both full and production audits still report three high package entries through
Expo CLI's Zod 3 dependency, with zero critical; the audit gate remains red.
Canonical exposure, owner, release trigger and upstream-fix criteria are
`RISK-013` in `documentation/plans/notes/KNOWN_RISKS.md`. SDK compatibility does
not close that security note or physical acceptance under `PROD-026`.

Implementation evidence and the external validation boundary are recorded in
[MOBILE_PHASES_01_08_IMPLEMENTATION.md](MOBILE_PHASES_01_08_IMPLEMENTATION.md),
[MOBILE_RELEASE_RUNBOOK.md](MOBILE_RELEASE_RUNBOOK.md),
[MOBILE_UI_EVIDENCE_MATRIX.md](MOBILE_UI_EVIDENCE_MATRIX.md), and
[MOBILE_PERFORMANCE_BUDGETS.md](MOBILE_PERFORMANCE_BUDGETS.md).

The code-level release safety gates are now present: production dependency
audits run at moderate severity, earlier compatible dependency fixes are retained
and current upstream findings remain explicit, and a disposable Expo Android prebuild asserts SQLCipher and
backup settings without writing native artifacts to the repository. Expo
Observe is configured before mount with route-parameter filtering, and its
global/native and render-error capture wraps the existing localized retry UI.
Expo Go does not ship `ExpoAppMetrics`; the runtime adapter therefore bypasses
native Observe and keeps a JavaScript-only recovery boundary in that client.
Native metrics remain enabled for custom development and release builds.

## Architecture and API boundary

The app is an Expo Router client with `app/` route adapters, `src/core/` runtime
infrastructure, user-facing modules under `src/modules/`, shared platform
capabilities under `src/platform/`, domain-neutral UI under `src/shared/`, and
module registration/composition under `src/shell/`. Owner dependencies are
checked by `scripts/module-boundaries.mjs`; the core allowlist is empty. Route
and presentation files cannot import `apiService` or `axiosClient`. Feature
remote adapters own routes, request mapping, and runtime parsing of server
responses from `unknown`.

The Phase 00 compatibility gate covers 74 routes, 27 endpoint catalogs, 193
endpoint leaf members, and 226 traced operations. Profile, SignalR, host
diagnostics, file transfer, and binary report calls are part of that inventory.
The gate rejects local endpoint objects and direct transport URLs outside a
reviewed endpoint catalog, and fails on active mismatch, deferred, or
`UNREVIEWED` entries. These calls cannot silently disappear from future
ownership and offline-policy reviews.

Composite Shell routes intentionally have no module requirement. A mobile
submodule must expose an entry candidate and route prefix; Attendance is
deferred and absent from the mobile registry until its device workflow exists.
Reporting remains a cross-cutting Platform/reporting capability until it becomes
a first-class mobile module.

The main gate collects coverage from all executable `src` files rather than
only modules loaded by tests. The measured baseline is 21.57% statements,
14.08% branches, 18.52% functions and 24.02% lines; conservative thresholds of
20/13/17/22 prevent regression while new business features raise coverage.

`EXPO_PUBLIC_API_URL` accepts an absolute versioned `/api/vN` API address only,
rejects credentials, query and fragment values, and requires HTTPS in production.
Plain HTTP is limited to localhost or private development addresses. The root
URL helper returns the validated origin. API errors normalize recognized
ProblemDetails fields and field-error arrays, preserve optional application
codes, and use generic fallbacks for malformed or untrusted payloads.

Recruitment remote responses now use Zod schemas for each endpoint and parse
`unknown` transport values before returning data. The pause and close actions
require an explicit caller-provided reason while retaining their existing
endpoint and request-body contract. Admin and file-manager endpoint paths were
checked against the current API; their action-style routes are intentional.

Recruitment interviews are queried from `GET recruitment/interviews` with the
application ID as a page filter. Each returned `InterviewDto` keeps its own ID;
scorecard, completion, and evaluation requests use the selected interview ID.
The client offers evaluation for scheduled interviews only when the actor can
both complete applications and evaluate interviews; completion uses
`Interviews:Complete`, while evaluation uses `Interviews:Evaluate`. Completed
interviews skip completion, and cancelled/no-show interviews are excluded from
evaluation choices.

## Authentication, tenant scope, and access control

The API remains authoritative for identity, tenant/company membership, roles,
permissions, tenant module availability, and company ownership. Authentication
response/session schemas validate server data. Access and refresh tokens use
`expo-secure-store` on native platforms; token writes that partially fail clear
both stored credentials. The Axios auth boundary attaches bearer credentials,
serializes token refresh, prevents stale-context requests after tenant/company
changes, and normalizes unauthorized/network responses.

Expo Router protected groups separate onboarding, public authentication, and
authenticated routes. `route-manifest.ts` owns route authorization and drawer
metadata; route guards and navigation use the same policy. Tenant access derives
subscription read-only state from the session, refreshes on resume when locked,
and blocks write requests through the API interceptor. Company selection is
limited to companies in the current authenticated session and switching updates
the authenticated context. Session changes clear React Query state and sensitive
file cache.

The mobile module registry is only a presentation allowlist: it intersects the
server module/submodule catalog with modules known by this build and cannot
grant entitlements or permissions. Unknown routes and modules are not made
accessible by local registry state.

## Offline data, cache, and realtime

Screen-test maintenance (2026-10-27, `FOLLOW-006`): Offline Operations' screen unit
test now supplies an explicit edit-permission boundary instead of loading the
unrelated authentication runtime through its public barrel. Five cases cover
missing policy, app/server mode intersection, tenant read-only, cached authority
and a live policy without edit permission. The production policy screen/provider
and fail-closed rules are unchanged. Keep permission outcomes explicit in focused
screen tests and leave live authentication/route behavior to its owning tests.

The full-suite pass also requires exact native/backend permission-catalog parity.
The existing Message Logs View/Export identifiers were missing in the native
catalog and are now mirrored without adding a route, screen or authority. The
feature remains queued per its canonical execution contract.

React Query owns server-state caching. Durable offline records, scopes, and
outbox commands use SQLite; each scope is keyed by user, tenant, and company.
Offline capability definitions bound server-configurable offline policy, and
missing, expired, malformed, stale, wrong-scope, or unsupported policy fails
closed to online-only behavior. Device preferences can narrow an allowed mode
but cannot widen it.

The certified offline mutation pilot is Workforce Plan draft update. A draft
write and outbox command are persisted together; replay is guarded by the
server rowVersion plus deterministic GET reconciliation, while idempotency keys
are required only for handlers whose API contract is idempotent-key based. The
pilot reconciles ambiguous/conflict outcomes and does not silently overwrite
concurrent server changes. Countries is the offline
read reference; other operations remain online-authoritative unless explicitly
certified and declared in the safety registry.

SignalR is enabled for authenticated foreground sessions and follows the active
tenant/company context. Incoming payloads are parsed, recent event IDs are
deduplicated, known resources invalidate narrow query prefixes, unknown
resources invalidate active queries, notifications are deduplicated, and
session-affecting events refresh the session.

## Files and security

The file manager uses the API-backed upload, download, stream, list, and delete
routes. Responses are schema-validated. Uploads enforce per-file, count, and
aggregate size limits. Native previews/downloads use bearer-authenticated
requests and a sensitive temporary cache that is disposed when viewing ends;
session transitions clear the sensitive cache. File routes were cross-checked
against the current API implementation.

Client validation is a usability measure; the API remains authoritative for
authorization, ownership, subscription state, and business validation. Tokens
and credentials are excluded from public Expo environment configuration. The
export smoke test uses only `https://api.example.invalid/api/v1` and writes to a
disposable system temporary directory.

## Deployment and verification

Expo SDK 57 package versions were behind the `npx expo install --check`
expectations at the start of Phase 00. Phase 00 aligned the ten patch versions;
the recorded clean `npm ci`, `npx expo install --check`, and Expo Doctor run now
pass (21/21). This proves dependency compatibility on the recorded local Node
runtime. CI/EAS was originally pinned to Node 22.13.0; maintenance on 2026-10-28
updates the Mobile CI and EAS profiles to the security release Node 22.23.4.
The actual remote build remains a separate environment gate.
`eas.json` defines internal preview APK and production profiles on Node 22.23.4.
EAS builds require one consistent real project ID from `EXPO_EAS_PROJECT_ID`,
`extra.eas.projectId`, or EAS's built-in `EAS_BUILD_PROJECT_ID`; local
`npm run android`/`npm run ios` builds use a reserved deterministic ID with
Observe dispatch disabled. Android verified links include email confirmation,
invitation acceptance, and password reset routes when
`EXPO_PUBLIC_APP_LINK_HOST` is set.

Run from `mobile-react/`:

```bash
npm ci
npm run check
npm run check:dependencies
npm run check:native-config
npm run check:expo
npm run check:export
npm audit --omit=dev --audit-level=moderate
```

Run the documentation gate from the repository root:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
```

`npm run check` runs TypeScript, ESLint, architecture and localization gates,
and Jest. `check:dependencies` exercises the patched CommonJS URI decoder
through query-string and xcode's PBX identifier API. The current moderate
production audit remains red for the SDK57 CLI/Zod dependency path (`RISK-013`);
the earlier Phase 00 zero-advisory result is historical. `check:native-config` runs a
disposable Android prebuild with local-native mode and verifies the reserved
project ID, disabled Observe dispatch, SQLCipher, and disabled backups. Expo
Doctor verifies the installed SDK package set. Android export smoke testing
verifies Metro/native bundling without contacting a real API.

Code-level crash observability is configured through Expo Observe before mount,
including global/native capture and `ObserveErrorBoundary` component stacks;
local-native builds explicitly disable delivery. EAS release delivery and
source-map evidence remain external checks requiring a real EAS project UUID,
account/project provisioning, credentials/build secrets, and device
verification.

## Findings recorded before Phase 00

- The previous review stated that SDK 57 patch dependencies were aligned. The
  Phase 00 pre-check contradicted that statement (20/21 with ten mismatches),
  then the Phase 00 patch update and clean-install verification closed that
  dependency mismatch with Expo Doctor 21/21.
- Removed the `core` to `shared` provider cycle by moving transient feedback
  composition to the root application layout.
- Added enforced route/presentation transport boundaries and an AST localization
  gate for visible text, translation fallbacks, static keys, and locale parity.
- Added strict API URL validation, safe ProblemDetails normalization, atomic
  secure-token cleanup, and complete Recruitment response parsing.
- Removed default Arabic pause/close reasons; callers now provide translated
  reasons explicitly without changing API semantics.
- Added reset-password Android app-link filtering and a themed localized root
  error boundary with a tested retry/remount path.
- Replaced stale README structure with the current module/platform architecture
  and verification commands.
- Phase 00 added patched dependency overrides for `decode-uri-component` and
  `xcode`'s `uuid`, with compatibility and adversarial-input checks. SDK57 patch
  maintenance later retires the unused uuid override after xcode 4 adopts Node
  crypto; the decoder override and behavioral checks remain.
- Added disposable native prebuild verification for SQLCipher and disabled
  Android backups, plus Expo Observe configuration with filtered route params
  and source-map upload settings.

## Deferred Release Gates

These gates are postponed by decision and do not block business development.

| Gate | Owner | Trigger | Evidence |
|---|---|---|---|
| Real EAS Android/iOS artifacts and signing | Mobile release | Preview or store candidate | EAS IDs, commit, signing, installed APK/IPA |
| Hosted authenticated device E2E | QA + API | External tester build or API change | Auth, tenant/company, permissions, offline pilot, files/reports |
| Swagger/API drift | API + Mobile | Endpoint or API version change | Hosted Swagger diff and authenticated smoke |
| App/Universal Links | Platform release | Final host/package/fingerprint | Association files and device route evidence |
| Observe/source maps | Observability | Real EAS artifact | Delivered symbolicated crash with redaction |
| Physical accessibility/RTL/theme/tablet | UX + QA | Before public preview/store | Phone/tablet matrix evidence |
| Measured performance budgets | Mobile performance | Before public preview/store | Release p95 startup/resume/navigation/search/memory/file results |

## External release checks

- Set the real API URL and HTTPS app-link host in the release environment.
- Publish Android `assetlinks.json` for the final package/signing fingerprint
  and verify Android App Links on a device; configure and verify the iOS
  Associated Domains entitlement when iOS distribution is enabled.
- Configure the EAS account/project UUID and signing credentials in the release
  environment, then build and install preview/production artifacts. The
  repository does not invent or commit a project ID.
- Verify EAS Observe device delivery and source-map processing with a real
  release artifact before claiming production crash telemetry.
- Run authenticated device smoke tests against the deployed API for tenant and
  company switching, role/permission denial, subscription read-only behavior,
  file upload/download, and password-reset deep links.
