# Mobile architecture

This document defines the stable application boundaries for the Expo SDK 57 client. Read it together with [MOBILE_FEATURE_GUIDE.md](MOBILE_FEATURE_GUIDE.md) and [MOBILE_STYLE_GUIDE.md](MOBILE_STYLE_GUIDE.md) before adding a module.

## Layer ownership

| Layer | Owns | Must not own |
| --- | --- | --- |
| `app` | Expo Router route adapters and navigator composition | API calls, queries, forms, business rules |
| `src/core` | Environment, transport, secure storage, query client, localization runtime, theme tokens | Feature behavior or feature UI |
| `src/features` | Business screens, feature API contracts, schemas, query keys, mutations and permissions-aware UI | Generic application infrastructure |
| `src/layouts` | Application shells, headers, drawers and reusable module navigation | Server state or business API calls |
| `src/shared` | Domain-neutral components, list state and utilities | Imports from business features |

Dependency direction is `app/layouts -> feature public API -> shared/core`. A feature may use another feature only through that feature's curated root `index.ts`; it must not import another feature's internal files. `shared` and `core` never import a feature.

Run `npm run check:architecture` to enforce these boundaries. The checker is intentionally small and supplements review; it does not replace TypeScript or tests.

## Route and authorization ownership

- `src/core/constants/routes.ts` mirrors physical Expo Router paths and provides typed dynamic builders.
- `src/features/auth/rbac/route-manifest.ts` is the canonical access and main-drawer metadata manifest.
- Route files still render `RouteGuard` for defense in depth.
- Drawer visibility calls the same `canAccessRoute` policy used by the guard; do not reproduce role or permission checks in navigation.
- Unknown authenticated routes are denied by default.
- Expo Router protected groups in `app/_layout.tsx` separate onboarding, public auth and authenticated application areas.
- Expo Router 57 owns the navigation runtime. Application code imports navigation APIs from the matching `expo-router/*` entry point and never imports external `@react-navigation/*` packages directly.

Current authenticated route modules:

| Area | Route ownership | Navigation |
| --- | --- | --- |
| Home and settings | `app/(main)/(tabs)` | Main tabs |
| Profile and notifications | `app/(main)` | Main drawer destinations |
| Basic Data | `app/(main)/basic-data` | Dedicated responsive module drawer |
| Administration | `app/(main)/administration` | Intentional three-tab workspace for Users, Invitations and Roles |
| Extras | `app/(main)/extras` | Module navigation for Files and Appointments |
| Advanced Tools | `app/(main)/advanced-tools` | Module navigation for operations/admin tools |
| Tenant administration | `app/(main)` | Main drawer, super-admin policies |

Administration intentionally keeps tabs because its three adjacent access-management workspaces are switched frequently. New large HR modules such as Employees, Attendance, Leave and Recruitment should use a dedicated responsive Drawer like Basic Data rather than adding more main tabs.

## Feature boundaries

Each routed feature exposes a curated public API. Router and layout files may import the feature root or a documented subdomain public index, but never `screens/...`, `hooks/...`, or `types/...` directly.

`platform-tools` is a navigation/composition umbrella only. Its stable internal domains are:

- `file-manager`
- `appointments`
- `track-changes`
- `localization`
- `operations` for health, background jobs and external operational viewers
- `navigation` for Extras/Advanced Tools composition

The legacy platform-tools API/hooks/type files remain compatibility facades while consumers migrate; new code targets the owning domain.

## Server state and lists

- React Query owns server state; local component state owns only transient UI state.
- Query keys and endpoint constants belong to their feature.
- Mutations invalidate the narrowest stable query prefix.
- Realtime uses public/stable query prefixes and must not import hook implementations.
- Large datasets use `useServerListState`, controlled `AppListScreen`, and `serverPagination`/`serverState` rather than downloading all rows and slicing locally.
- UI pages are zero-based; use `toApiPageNumber` at the API boundary.
- Keep the previous page visible while fetching the next page and surface a non-destructive progress indicator.

## API and session

- Configure the backend through `EXPO_PUBLIC_API_URL`; public variables never contain secrets.
- Use `apiService` for JSON and multipart requests so authorization, cancellation, timeout, refresh and Problem Details mapping stay centralized.
- Validate responses at the owning feature API boundary. Required fields fail closed; compatibility fallback is explicit and limited to optional fields.
- Store access and refresh tokens through `secureSession`, never AsyncStorage.
- Authentication and company changes clear React Query caches so data cannot cross tenant/company sessions.
- Read-only tenant enforcement remains in Axios as well as the UI.

## Localization, RTL and styling

- Add English and Arabic keys together.
- `translations/en.ts` and `translations/ar.ts` are composition facades only. Add strings to the paired, feature-grouped EN/AR resource files; do not rebuild either facade into a monolith.
- Keep the same semantic keys in both locales. Locale-specific plural forms are expected and are normalized by the translation parity test.
- Use the live `direction` from `LocalizationProvider`; do not reload the app or call `I18nManager.forceRTL` for language changes.
- Use logical layout properties and directional icons.
- Theme tokens live in `src/core/theme`; domain-neutral UI lives in `src/shared/components`; feature styles stay beside their owner.
- Do not create a global `shared/styles` dumping folder.

The complete styling contract is in [MOBILE_STYLE_GUIDE.md](MOBILE_STYLE_GUIDE.md).

## Verification

The mobile quality gate is `npm run check`, which runs:

1. strict TypeScript;
2. ESLint;
3. architecture boundaries;
4. Jest through the Expo-compatible `jest-expo` preset.

Keep tests outside `app`; every file under `app` is treated as a route. Add Maestro end-to-end flows later for login, tenant/company selection and critical HR workflows.

## Adding a module

Follow [MOBILE_FEATURE_GUIDE.md](MOBILE_FEATURE_GUIDE.md). In summary:

1. define the business boundary and API contract;
2. create the feature public API;
3. add physical routes and the route/access manifest entry;
4. use server-managed list state for paged data;
5. add runtime response validation and focused tests;
6. add EN/AR resources and permission/read-only behavior;
7. run `npm run check` and verify phone/tablet, LTR/RTL and light/dark modes.
