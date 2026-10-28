# Mobile preview and production runbook

## Required release identity

- Use the patched Node 22.23.4 baseline and a clean `npm ci`.
- Use the real Expo UUID recorded in app.json; an optional `EXPO_EAS_PROJECT_ID` override must match. Do not commit credentials.
- Set `EXPO_PUBLIC_API_URL` to the hosted HTTPS `/api/vN` URL.
- Set `EXPO_PUBLIC_APP_LINK_HOST` to the HTTPS host whose association files are deployed.
- Set `EXPO_PUBLIC_DEMO_LOGIN_ENABLED=true` only for development/preview builds;
  the production profile pins it to `false` and the release source gate verifies it.
- EAS exposes the commit through `EAS_BUILD_GIT_COMMIT_HASH`; `app.config.ts`
  records commit, release channel and API contract version in non-secret metadata.

## Repository gates

From `mobile-react/`:

```powershell
npm ci
npm run check
npm run check:dependencies
npm audit --omit=dev --audit-level=moderate
npm run check:expo
npm run check:native-config
npm run check:release
npm run check:export
npm run check:upload
```

`check:release` is a dependency-free, network-free release gate. It evaluates
Expo config in disposable isolated environments for local-native and EAS
builds, verifies the reserved local project ID with Observe delivery disabled,
the real EAS UUID and HTTPS app-link host, iOS/Android email-link routes,
required Expo Router files, API contract metadata `v1`, and the preview and
production EAS profile settings. EAS config rejects a missing or invalid
`EXPO_PUBLIC_APP_LINK_HOST`; local and development builds may leave it unset.

From the repository root:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
```

## Android runtime dependency boundary

`npm run check:export` runs 13 policy tests before generating a production Hermes
bundle with external source maps. Every native map must include application and
React Native sources and exclude legacy Zod, deepmerge and CLI tooling modules.
Expo's exact `@expo/cli/build/metro-require/require.js` loader is intentionally
allowed; the [upstream runtime](https://github.com/expo/expo/blob/sdk-57/packages/%40expo/cli/metro-require/require.ts)
is part of native bundling. Other files under that package remain prohibited.
The check deletes its temporary maps/bundles after inspecting them.

2026-10-28 evidence: 3,030 sources and one approved Metro loader; no prohibited
modules. This is export-specific evidence. Native installation and real crash
symbolication still require signed artifacts and device results.

CI collects source, export and documentation results before running the unchanged
moderate production audit. Its failing exit remains a failing job; no audit
finding is ignored. Remaining upstream items are `RISK-013` and `RISK-014` in
`documentation/plans/notes/KNOWN_RISKS.md`. SDK57 and latest CLI metadata both
still declare Zod 3, so SDK migration alone is not closure evidence.

## EAS source-upload boundary

The repository-root `.easignore` allows only `mobile-react/` and its local
`packages/tokens/` dependency. It preserves the packaged token output in
`packages/tokens/dist/` and the mobile vendor tarball and npm configuration.
Other applications, Graphify, documentation, local tooling, environment files,
credentials, key files, installed dependencies, caches and generated native
directories are excluded. EAS generates the native projects through Prebuild.

`npm run check:upload` verifies required real build inputs and forbidden paths
with four policy tests, including directory entries without trailing slashes
used by EAS's copy filter. CI runs this alongside source-map inspection. After
authentication and verifying the project binding, run the official archive
inspection before submitting a build:

```powershell
$taskEasRoot = Join-Path (Split-Path (git rev-parse --show-toplevel) -Parent) 'erp-eas-work'
$env:TEMP = Join-Path $taskEasRoot 'temp'
$env:TMP = $env:TEMP
New-Item -ItemType Directory -Path $env:TEMP -Force | Out-Null
$taskArchive = Join-Path $taskEasRoot ('archive-' + [Guid]::NewGuid().ToString('N'))
npx eas-cli@26.0.0 build:inspect --platform android --stage archive --profile preview --output $taskArchive
```

Keep both temporary storage and the fresh output directory outside the Git
checkout; the Windows copy operation rejects copying the repository into
itself. Inspect that actual archive. The [EAS upload rules](https://docs.expo.dev/build-reference/easignore/)
read `.easignore` from the Git root; application commands still run from
`mobile-react/`. The local policy tests do not replace authenticated archive
inspection. Verified 2026-10-28: 1,221 files, 5,906,864 bytes, zero forbidden paths,
ten required inputs matching source hashes, including compiled shared tokens and
the actual project binding.

## SDK57 patch maintenance

Keep this maintenance path within SDK57 unless a separate SDK migration is
authorized. Follow the [official Expo dependency-alignment workflow](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/):

```powershell
npx expo install --fix --npm
npm ci
npx expo install --check
npm run check:expo
```

Then repeat the repository gates above, including native-config prebuild, Android
export and the production audit. Doctor compatibility is independent of security
audit results. `RISK-013` in `documentation/plans/notes/KNOWN_RISKS.md` records the
remaining SDK57 CLI/Zod dependency advisory, and `RISK-014` records deepmerge;
no audit exemption or release
acceptance is implied by patch alignment. Do not apply npm's forced Expo
downgrade or replace the CLI's declared Zod major as a patch-maintenance shortcut.
Local Node evidence also does not replace the configured CI/EAS runtime check.

## Live development with Fast Refresh

SQLCipher bootstrap corrective maintenance (2026-10-28, `FOLLOW-010`): a phone
reports `file is not a database`. The shared writer now keys each owned native
transaction connection before BEGIN rather than using Expo's internally unkeyed
exclusive helper. Keep the installed development APK and stored database/key;
reload the project from the development menu after Metro delivers the change.
Do not clear app data or uninstall as a routine workaround. If the error remains,
collect the new log/operation evidence; a missing/wrong key or a legacy plaintext
file requires separate diagnosis, not automatic deletion or key replacement.
The requester confirms on 2026-10-28 that the application opens after Reload;
`FOLLOW-010` is Verified for bootstrap. This confirmation does not establish
acceptance of all offline writes or other physical journeys under `PROD-026`.

On 2026-10-28 the requester selects immediate updates while the development
computer is running. SDK57-compatible `expo-dev-client` is installed, and the
`development` EAS profile creates an internal Android development client using
the project's preview environment, development release metadata and Node 22.23.4.
Build `b71a24b6-897b-41df-ba95-1c36287ed9bf` tracks its native artifact.
The standalone preview APK above/below is a separate snapshot and does not
connect to Metro for live edits.

| Development delivery evidence (2026-10-28) | Value |
| --- | --- |
| EAS build | [b71a24b6-897b-41df-ba95-1c36287ed9bf](https://expo.dev/accounts/shabanelmogy/projects/erp-system-mobile/builds/b71a24b6-897b-41df-ba95-1c36287ed9bf) |
| Cloud status | FINISHED, 2026-10-28 11:49:00 UTC; Gradle reports BUILD SUCCESSFUL in 20m 39s |
| Development APK | [Download development 1.0.0/code 1](https://expo.dev/artifacts/eas/PrB6SO7Osx1dxFSXlJcmEIYZ73R5KXhBZpcxXcyynAo.apk) |
| APK identity / debug mode | com.erpsystem.mobile, 1.0.0/code 1, debuggable true |
| Downloaded bytes / ZIP CRC | 292,688,381 bytes; all 1,763 ZIP entries pass CRC |
| APK SHA-256 | 712e41183719b3575f4ad88097d7db9121722f1f13c8241add26d725dbad5cdf |
| Signer / preview compatibility | Embedded signer certificate SHA-256 matches the preview APK: 3ab53820c94003e0fd2add82a44eff940673517ea7c9f95772fa16e67678a896; same package/version/code. Device installation remains unverified |
| Development launcher / scheme | DevLauncherActivity present; exp+erp-system-mobile registered |
| Metro delivery | Android development manifest and 18,296,780-byte bundle return HTTP 200 through the session tunnel |
| HMR transport | Entry point registered; update-start/update/update-done/bundle-registered received |
| Physical Fast Refresh | Pending development-client installation and visible phone-side change (`PROD-026`) |
| Source provenance | EAS snapshot includes the uncommitted authorized development-client maintenance; base commit alone does not describe it |

Use the approved Node runtime, then from `mobile-react/`:

```powershell
npx eas-cli@26.0.0 build --profile development --platform android
npm start
# Same-network connection:
npm run start:lan
# Remote/mobile-data connection:
npm run start:tunnel
```

Install the development APK once, then scan the running server's QR code with
the system camera or open its connection URL through the installed development
client. Expo Go does not provide this application's SQLCipher configuration.
The inspected development APK uses the same package and embedded signer
certificate as the previous preview, so install it as an update over that APK.
Do not uninstall or clear application data as a routine setup step. Artifact
checks establish ZIP integrity, manifest identity, debug mode and signing-block
certificate evidence; they do not replace cryptographic signature verification
or physical installation. The server was restarted as a hidden background
process after the original terminal session ended; the renewed HTTPS manifest,
bundle and HMR registration were checked again successfully.
Fast Refresh applies JavaScript/TypeScript, UI and styling changes while Metro
and the network connection remain available. Some module changes trigger a full
reload and can reset transient state. Native dependency/config-plugin changes
require a new development binary; API changes require their own server deployment.
This workflow does not publish over-the-air release updates.

Tunnel support uses the official `@expo/ngrok` helper installed in the isolated
portable toolchain. The running 2026-10-28 tunnel returns HTTP 200 for `/status`
and the Android development manifest, with `dev: true` and development release
metadata. A real Android development-bundle request through that tunnel succeeds
(HTTP 200, 18,296,780 bytes). The HMR WebSocket also registers that entry point
through the tunnel and receives `update-start`, `update`, `update-done` and
`bundle-registered`. The development bundle includes React Refresh/HMR and the
configured ERP API. This confirms server delivery/registration, not a phone-side
rendered change. The tunnel URL is session-specific and is not committed as a
permanent application endpoint. Restart the command and scan the current QR if
the server/tunnel stops. Physical install/refresh acceptance remains `PROD-026`.

Official references: [SDK57 DevClient](https://docs.expo.dev/versions/v57.0.0/sdk/dev-client/),
[development build usage](https://docs.expo.dev/develop/development-builds/use-development-builds/)
and [tunnel workflow](https://docs.expo.dev/develop/development-builds/development-workflows/).

## Build and installation

The approved Mobile CI/EAS runtime is Node 22.23.4. Use that patched runtime for
authentication and build commands; the local 2026-10-28 check/export verification
also passes on 22.23.4. `RISK-015` owns the remaining default-workstation runtime
follow-up. Verify the actual runtime with `node --version` before authentication.

EAS CLI 26.0.0 is verified from npm. Authenticate through
`npx eas-cli@26.0.0 login --browser` and verify `whoami` and `project:info`.
The real project ID is recorded in app.json; an optional `EXPO_EAS_PROJECT_ID`
override must match it. Never substitute the reserved local-native ID.
Verification scripts use isolated config copies, removing that identity only
from fixtures and preserving the actual binding.

| Verified ERP preview configuration (2026-10-28) | Value |
| --- | --- |
| Project | `@shabanelmogy/erp-system-mobile` |
| Project ID | `27312add-bc4e-4cfe-b196-63ad6fb50495` |
| Android package | `com.erpsystem.mobile` |
| EAS preview API | `https://shabanhrms.runasp.net/api/v1` |
| EAS preview report environment value | `https://crystalreport-generator.runasp.net` (retained configuration; current native reporting calls the ERP API) |
| EAS preview app-link host | `shabanhrms.runasp.net` (requester selected) |
| Version | `1.0.0`, remote Android code `1` |
| Android build request | `32f6f9a6-7779-4077-a42d-8d1309f32015` |
| Build page | [Android preview](https://expo.dev/accounts/shabanelmogy/projects/erp-system-mobile/builds/32f6f9a6-7779-4077-a42d-8d1309f32015) |
| Source provenance | Working tree based on `48372545`, including uncommitted authorized maintenance; EAS's base commit alone does not describe this snapshot |
| Cloud acceptance | `FINISHED`, 2026-10-28 11:07:06 UTC; Gradle reports `BUILD SUCCESSFUL in 21m 55s` |
| Signed Android APK | [Download preview 1.0.0/code 1](https://expo.dev/artifacts/eas/L7HoKvXg3jEIOrp3t_Ve9GCrFmH3E3H93YzH6FunTrc.apk) |
| Downloaded file | `140,188,486` bytes; `1,681` ZIP entries; every ZIP CRC passes |
| APK SHA-256 | `32bde8b5e5ae9932c2c230f4637baee8f031b6ec94951e725f6d8e68aa61e607` |
| APK manifest evidence | Package/version/code match the table; app-link host is `shabanhrms.runasp.net` |
| APK API evidence | The downloaded Hermes bundle contains `https://shabanhrms.runasp.net/api/v1` |
| Native ABIs | `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64` |
| Signing evidence scope | EAS managed signing completes; downloaded APK contains the v2 signing-block ID `0x7109871a`. No local apksigner cryptographic verification or installation is claimed |
| Physical installation / hosted journeys | Pending (`PROD-009`, `PROD-010`, `PROD-026`) |

The preview public values are stored in the EAS project environment. Production
uses its own environment and remains unprovisioned for release. Android signing
uses an EAS-generated managed keystore; no key contents enter the repository.
The current `src/core/config/env.ts` reads the ERP API URL; native managed-report
adapters call that API through the shared authenticated client. They do not read
`EXPO_PUBLIC_REPORT_API_URL`, so its retained environment value is not claimed as
a direct reporting-service integration or expected in the APK bundle.
App-link association, installation, hosted journeys and real crash delivery
remain owned by the production notes.
Unauthenticated checks on 2026-10-28 return HTTP 401 for both
`https://shabanhrms.runasp.net/.well-known/assetlinks.json` and
`https://shabanhrms.runasp.net/.well-known/apple-app-site-association`.
`PROD-012` remains open: publish the matching association files publicly, record
the managed signing fingerprint, and verify links on actual devices.

```powershell
npx eas-cli@26.0.0 build --profile preview --platform android
npx eas-cli@26.0.0 build --profile preview --platform ios
```

Record the EAS build IDs, commit, API deployment/version, database schema
version, device/OS and tester. Install the exact artifacts; a Metro session is
not release evidence. Production builds use EAS remote versioning with
`autoIncrement` and uploaded source maps.

## Mandatory device journeys

1. Sign in, automatic single tenant/company selection, explicit multi-company
   switch, logout and revoked/expired session.
2. Super-admin and tenant-admin boundaries, limited role, read-only subscription,
   no entitlement and permission removal while the app is open.
3. CRUD/view error/paging/search on reference data, Recruitment and Workforce.
4. Airplane mode, kill/relaunch inside and outside the lease, queued draft,
   retry deadline, uncertain reconciliation, conflict, discard and company switch.
5. Invitation, confirmation and reset links from a real HTTPS link.
6. Arabic/English, RTL/LTR, dark/light, font scaling, keyboard, TalkBack/VoiceOver.
7. File upload/download/preview cleanup and managed-report generation/open/share.
8. Observe crash delivery and source-map symbolication without tokens, payloads,
   financial amounts or personal data.

## Compatibility and recovery

- API contract metadata is `v1`; incompatible server changes require a new API
  version or an explicit minimum-client response before deployment.
- Offline schema downgrade is rejected. Migration preserves old tables under
  recovery names and never resets pending work automatically.
- Roll back the API or publish a newer compatible client. Do not clear app data
  as an incident response while pending work exists.
- OTA is currently not an accepted release mechanism. If introduced, define
  `runtimeVersion`, native-change compatibility and rollback evidence first.

## Deferred Release Gates

These gates are intentionally postponed and do not block business development;
they become mandatory when a preview/store build or external tester is planned.

| Gate | Owner | Trigger | Evidence |
|---|---|---|---|
| EAS artifacts/signing | Mobile release | Candidate build | Build IDs, commit, signing and installed APK/IPA |
| Hosted API/device E2E | QA + API | External tester or API change | Auth, tenant/company, permissions, offline, files/reports |
| Swagger drift | API + Mobile | Endpoint/API version change | Hosted snapshot diff and smoke report |
| Links | Platform release | Final host/package/fingerprint | Association files and device evidence |
| Observe/source maps | Observability | First real EAS artifact | Symbolicated crash and redaction result |
| Accessibility/RTL/theme/tablet | UX + QA | Before public preview/store | Physical device matrix |
| Performance | Mobile performance | Before public preview/store | Release p95 startup/resume/navigation/search/memory/file results |

Phase 08 is signed only after the journey record is filled with real artifact
IDs and results. Repository gates alone do not close Android/iOS evidence.
