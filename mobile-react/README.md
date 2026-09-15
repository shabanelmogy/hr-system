# ERP System Mobile

Expo SDK 57 client for the ERP System, using React Native 0.86 and React 19.2.
Canonical architecture and implementation rules live under
[`../documentation/mobile-react/`](../documentation/mobile-react/).

## Local setup

Use Node.js 22.13 or newer and npm. Copy `.env.example` to `.env`, then set
`EXPO_PUBLIC_API_URL` to an absolute versioned API URL such as
`https://erp.example.com/api/v1`. HTTP is accepted only for local or private
development hosts. Never put credentials, tokens, or other secrets in
`EXPO_PUBLIC_*` variables; Expo embeds those values in the app bundle.

```bash
npm ci
npm run start
npm run android
npm run ios
npm run web
```

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

- [`MOBILE_ARCHITECTURE.md`](../documentation/mobile-react/MOBILE_ARCHITECTURE.md)
- [`MOBILE_FEATURE_GUIDE.md`](../documentation/mobile-react/MOBILE_FEATURE_GUIDE.md)
- [`MOBILE_STYLE_GUIDE.md`](../documentation/mobile-react/MOBILE_STYLE_GUIDE.md)
- [`MOBILE_API_READINESS_REVIEW.md`](../documentation/mobile-react/MOBILE_API_READINESS_REVIEW.md)

## Verification

```bash
npm run check             # typecheck, lint, architecture, localization, tests
npm run check:expo        # SDK package compatibility via expo-doctor
npm run check:export      # Android production bundle smoke test; temp output removed
npm run check:native-config # disposable Android prebuild; SQLCipher/backups assertions
npm run check:dependencies  # advisory override and malformed URI compatibility checks
npm audit --omit=dev --audit-level=moderate
```

Internal Android builds use the `preview` EAS profile; store builds use
`production`. The preview profile emits an installable APK and uploads source
maps when a real EAS project is configured. `npm run android` and `npm run ios`
set a private local-native flag, inject a reserved deterministic project ID,
and disable Observe delivery for local development. EAS builds require one
consistent real ID from `EXPO_EAS_PROJECT_ID`, `extra.eas.projectId`, or EAS's
built-in `EAS_BUILD_PROJECT_ID`; do not commit a made-up release ID.
`expo-observe` is configured at module scope with route
parameters filtered from metrics, and `ObserveRoot` plus `ObserveErrorBoundary`
capture global/native and render errors while keeping the localized retry UI.
EAS account/team configuration, signing credentials, deployed API/link domains,
and device delivery evidence remain release-environment inputs and are not
stored in this repository.
