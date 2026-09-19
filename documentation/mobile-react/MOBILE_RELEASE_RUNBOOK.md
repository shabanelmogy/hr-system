# Mobile preview and production runbook

## Required release identity

- Use Node 22.13.0 and a clean `npm ci`.
- Set `EXPO_EAS_PROJECT_ID` to the real Expo UUID. Do not commit credentials.
- Set `EXPO_PUBLIC_API_URL` to the hosted HTTPS `/api/vN` URL.
- Set `EXPO_PUBLIC_APP_LINK_HOST` to the HTTPS host whose association files are deployed.
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

## Build and installation

```powershell
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile preview --platform ios
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

Phase 08 is signed only after the journey record is filled with real artifact
IDs and results. Repository gates alone do not close Android/iOS evidence.
