# ERP System Mobile

Expo SDK 57 client for the ERP System, using React Native 0.86 and React 19.2.
Canonical architecture and implementation rules live under
[`../documentation/guides/mobile/`](../documentation/guides/mobile/).

## Local setup

Use the approved Mobile Node.js 22.23.4 baseline and npm. Copy `.env.example` to `.env`, then set
`EXPO_PUBLIC_API_URL` to an absolute versioned API URL such as
`https://erp.example.com/api/v1`. HTTP is accepted only for local or private
development hosts. Never put credentials, tokens, or other secrets in
`EXPO_PUBLIC_*` variables; Expo embeds those values in the app bundle.

```bash
npm ci
npm run start
npm run start:tunnel
npm run android
npm run ios
npm run web
```

`npm start` targets the custom development client. Install the EAS `development`
APK once, then scan the running Metro QR code for Fast Refresh. Use `start:tunnel`
when the phone cannot reach the computer over LAN. SQLCipher requires the custom
native client. Setup, connection and rebuild instructions live in the canonical
[Mobile release runbook](../documentation/guides/mobile/MOBILE_RELEASE_RUNBOOK.md#live-development-with-fast-refresh).

## Project structure

- `app/` contains Expo Router route adapters and root navigator composition.
- `src/core/` owns environment validation, API transport, localization,
  providers, query infrastructure, secure storage, theme, and offline runtime.
- `src/modules/` contains business modules and feature slices. Each feature
  follows `domain`, `application`, `data`, `presentation`, and optional
  `composition` boundaries.
- `src/platform/` owns shared capabilities such as authentication, tenant and
  company context, module entitlements, realtime, administration, and tools.
- `src/shared/` contains domain-neutral components and utilities.
- `src/shell/` composes installed modules and app-level navigation.

The mobile dependency policy is declared in `scripts/module-boundaries.mjs` and
checked in CI. `core` is a leaf layer: it cannot import `shared`, platform, shell,
or business modules. Route and presentation code cannot call the API transport
directly; feature data adapters own endpoint and response parsing.

Read these guides before changing the mobile architecture or adding a feature:

- [`MOBILE_ARCHITECTURE.md`](../documentation/guides/mobile/MOBILE_ARCHITECTURE.md)
- [`MOBILE_FEATURE_GUIDE.md`](../documentation/guides/mobile/MOBILE_FEATURE_GUIDE.md)
- [`MOBILE_STYLE_GUIDE.md`](../documentation/guides/mobile/MOBILE_STYLE_GUIDE.md)
- [`MOBILE_API_READINESS_REVIEW.md`](../documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md)

## Verification

```bash
npm run check             # typecheck, lint, architecture, localization, tests
npm run check:expo        # SDK package compatibility via expo-doctor
npm run check:export      # Android production bundle smoke test; temp output removed
npm run check:native-config # disposable Android prebuild; SQLCipher/backups assertions
npm run check:dependencies  # advisory override and malformed URI compatibility checks
npm audit --omit=dev --audit-level=moderate
```

Live development uses the `development` EAS profile. Standalone internal Android
builds use `preview`; store builds use `production`. The preview profile emits an installable APK and uploads source
maps when a real EAS project is configured. `npm run android` and `npm run ios`
set a private local-native flag, inject a reserved deterministic project ID,
and disable Observe delivery for local development. EAS builds require one
consistent real ID from `EXPO_EAS_PROJECT_ID`, `extra.eas.projectId`, or EAS's
built-in `EAS_BUILD_PROJECT_ID`; do not commit a made-up release ID.
`expo-observe` is configured at module scope with route
parameters filtered from metrics, and `ObserveRoot` plus `ObserveErrorBoundary`
capture global/native and render errors while keeping the localized retry UI.
Expo Go does not include the native `ExpoAppMetrics` module, so the app uses a
JS-only error-boundary fallback there and skips metrics initialization. The
full Observe integration is enabled automatically in a custom development
build (`npx expo run:android`/`npx expo run:ios` or an EAS development build)
and in release builds.
The public ERP EAS project identity is recorded in `app.json`; public preview
endpoints live in the project's EAS environment. Signing credentials remain in
managed storage. Physical delivery and hosted acceptance remain release checks.
