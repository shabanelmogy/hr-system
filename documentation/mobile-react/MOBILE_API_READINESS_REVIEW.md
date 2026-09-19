# Mobile API Readiness Review

Status: **Phases 01–07 source foundations are implemented and verified; Phase 08 device/EAS evidence remains open**.

This review records the mobile client's verified API and platform boundaries. It
does not claim a live production smoke test or store-signing validation.

Implementation evidence and the external validation boundary are recorded in
[MOBILE_PHASES_01_08_IMPLEMENTATION.md](MOBILE_PHASES_01_08_IMPLEMENTATION.md),
[MOBILE_RELEASE_RUNBOOK.md](MOBILE_RELEASE_RUNBOOK.md),
[MOBILE_UI_EVIDENCE_MATRIX.md](MOBILE_UI_EVIDENCE_MATRIX.md), and
[MOBILE_PERFORMANCE_BUDGETS.md](MOBILE_PERFORMANCE_BUDGETS.md).

The code-level release safety gates are now present: production dependency
audits run at moderate severity, the two upstream advisory roots are pinned to
patched versions, and a disposable Expo Android prebuild asserts SQLCipher and
backup settings without writing native artifacts to the repository. Expo
Observe is configured before mount with route-parameter filtering, and its
global/native and render-error capture wraps the existing localized retry UI.

## Architecture and API boundary

The app is an Expo Router client with `app/` route adapters, `src/core/` runtime
infrastructure, user-facing modules under `src/modules/`, shared platform
capabilities under `src/platform/`, domain-neutral UI under `src/shared/`, and
module registration/composition under `src/shell/`. Owner dependencies are
checked by `scripts/module-boundaries.mjs`; the core allowlist is empty. Route
and presentation files cannot import `apiService` or `axiosClient`. Feature
remote adapters own routes, request mapping, and runtime parsing of server
responses from `unknown`.

The Phase 00 compatibility gate covers 74 routes, 27 endpoint catalogs, 200
endpoint leaf members, and 226 traced operations. Profile, SignalR, host
diagnostics, file transfer, and binary report calls are part of that inventory.
The gate rejects local endpoint objects and direct transport URLs outside a
reviewed endpoint catalog, so these calls cannot silently disappear from future
ownership and offline-policy reviews.

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
both manage applications and evaluate interviews; completion uses
`ManageApplications`, while evaluation uses `EvaluateInterviews`. Completed
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
runtime, while the Node 22.13.0 CI/EAS build remains a separate environment gate.
`eas.json` defines internal preview APK and production profiles on Node 22.13.0.
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
through query-string and checks the production dependency graph. The moderate
production audit currently reports 0 advisories. `check:native-config` runs a
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
- Added patched production dependency overrides for `decode-uri-component` and
  `xcode`'s `uuid`, with compatibility and adversarial-input checks.
- Added disposable native prebuild verification for SQLCipher and disabled
  Android backups, plus Expo Observe configuration with filtered route params
  and source-map upload settings.

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
