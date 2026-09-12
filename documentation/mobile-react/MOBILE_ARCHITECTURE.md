# Mobile architecture

This document defines the stable application boundaries for the Expo SDK 57 client. Read it together with [MOBILE_FEATURE_GUIDE.md](MOBILE_FEATURE_GUIDE.md) and [MOBILE_STYLE_GUIDE.md](MOBILE_STYLE_GUIDE.md) before adding a module.

## Layer ownership

| Owner | Owns | Must not own |
| --- | --- | --- |
| `app` | Thin Expo Router route adapters and navigator composition | API calls, repositories, queries, forms, business rules |
| `src/core` | Environment, transport, secure storage, query client, localization runtime, theme tokens and offline infrastructure | Business-module behavior or routed feature UI |
| `src/modules/<module>` | User-facing ERP business modules and their feature/subdomain Clean Architecture slices | Generic platform/session/shell infrastructure |
| `src/platform` | Cross-module application platform: auth/RBAC, tenant context, module catalog/registry, notifications, realtime, reporting, offline policy, administration and platform tools | Ownership of business modules |
| `src/shared` | Domain-neutral components, list state and utilities | Imports from platform, shell or business modules |
| `src/shell` | Application composition, home/onboarding/settings and top-level layout/bootstrap wiring | Business persistence or server feature implementations |

The top-level source tree is intentionally limited to `core`, `modules`, `platform`, `shared`, and `shell`; legacy `src/features` and `src/layouts` roots are forbidden by the architecture checker.

```text
src/
├── core/
├── modules/
│   ├── hr/
│   │   ├── basic-data/
│   │   ├── finance/
│   │   ├── recruitment/
│   │   ├── workforce-planning/
│   │   └── moduleDefinition.ts
│   └── accounting/
│       └── moduleDefinition.ts
├── platform/
│   ├── auth/
│   ├── modules/
│   │   └── registry/
│   ├── navigation/
│   ├── offline-operations/
│   └── ...
├── shared/
└── shell/
```

Owner dependency direction is enforced by `scripts/module-boundaries.mjs`: business modules may depend on `core`, `shared`, and `platform`; `platform` never depends on a business module; `shell` is the composition root and may register modules; `app` consumes public APIs only. Cross-owner imports must use a curated public `index.ts` rather than another owner's internals.

Inside a business feature the dependency direction is:```text
presentation -> application -> domain
data -----------------------> domain/application ports
```

- `domain` contains pure business types, invariants, policies and repository/clock/ID ports. It must not import React, React Native, Expo, Axios, React Query, SQLite or `src/core`.
- `application` contains use cases and orchestration over domain ports. It must stay UI-neutral and must not import React, React Native, Expo, Axios or React Query.
- `data` implements application/domain ports. Remote data sources own transport DTO/schema mapping; local data sources own SQLite persistence; repositories choose local/remote behavior and sync policy.
- `presentation` contains React components, screens and React Query controllers. Presentation talks to application use cases/repositories, never directly to Axios or feature remote data sources.
- `composition` wires concrete dependencies for the feature and may depend on `core` infrastructure. External consumers still import only the feature public API.

Legacy `api/`, `queries/`, `screens/` and `components/` folders may remain while a feature is being migrated. New business behavior must target the clean layers above, and migrations must preserve routed screens/public exports until all consumers move.

Run `npm run check:architecture` to enforce these boundaries. The checker is intentionally small and supplements review; it does not replace TypeScript or tests.

## Route and authorization ownership

- `src/core/constants/routes.ts` mirrors physical Expo Router paths and provides typed dynamic builders.
- `src/platform/auth/presentation/rbac/route-manifest.ts` is the canonical access and main-drawer metadata manifest.
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

## Module and feature boundaries

Each routed business feature exposes a curated public API below its owning module. Router and shell files may import a module feature root or documented subdomain public index, but never `screens/...`, `hooks/...`, or `types/...` directly. Platform capabilities follow the same public-API rule.

`src/platform/tools` is the navigation/composition umbrella for technical tools. Its stable internal domains are:

- `file-manager`
- `appointments`
- `track-changes`
- `localization`
- `operations` for health, background jobs and external operational viewers
- `navigation` for Extras/Advanced Tools composition

Platform tools are now owned directly under `src/platform/tools`; new code targets the owning subdomain public API. The removed top-level `src/features` compatibility root must not be recreated.

## Server state and lists

- React Query owns server state; local component state owns only transient UI state.
- Query keys and endpoint constants belong to their feature.
- Mutations invalidate the narrowest stable query prefix.
- Realtime uses public/stable query prefixes and must not import hook implementations.
- Large datasets use `useServerListState`, controlled `AppListScreen`, and `serverPagination`/`serverState` rather than downloading all rows and slicing locally.
- UI pages are zero-based; use `toApiPageNumber` at the API boundary.
- Keep the previous page visible while fetching the next page and surface a non-destructive progress indicator.

React Query is a presentation cache/orchestrator, not the durable source of truth for offline-enabled business data. Offline-enabled queries call an application/repository boundary which may serve scoped SQLite data immediately and refresh it from the server when connectivity and authorization allow.

## Offline-first data ownership

- Durable business data uses SQLite through `src/core/offline`; AsyncStorage is reserved for lightweight preferences and non-business UI settings.
- Every durable business row, sync cursor, draft and queued command is partitioned by the authenticated scope (`userId`, `tenantId`, `companyId` as applicable). Never replay commands from a previous tenant/company after a scope switch.
- Offline behavior is governed by the cross-cutting **Offline Operations Policy**. Code owns an immutable safety registry per capability and declares which of `online-only`, `offline-read`, `offline-draft`, and `offline-command` are supported. The Platform API policy at `GET/PUT /api/v1/offline-operations/policy` is authoritative per tenant/company and can select only from those declared modes; it can never expand a capability beyond the code-owned allowlist. Unknown capabilities, invalid scope, missing policy, stale policy, malformed policy, or unsupported overrides resolve to `online-only`.
- Mobile may retain a scoped cached policy (`userId + tenantId + companyId`) only as a bounded runtime fallback with version/fetched-at/valid-until metadata. Cached or fail-closed policy is never editable authority and must fail closed when absent, expired, incompatible, or for the wrong scope.
- Device-local preferences may narrow an already permitted mode but never expand it. Countries is the first integrated example: cached reads require both central policy approval for `countries.read` and the existing local user opt-in. All Countries mutations remain online-authoritative.
- `workforce-plan.update-draft` is the first certified offline mutation pilot. Its code-owned ceiling is `online-only` / `offline-draft` / `offline-command`, while the tenant/company policy defaults to `online-only` and must explicitly opt in. SQL Server integration coverage proves that child-only aggregate edits advance/check the parent rowVersion and reject stale overwrite; the mobile replay path persists draft + command atomically, carries the base rowVersion, reconciles ambiguous/409 outcomes before retry, and stops on a concurrent server change.
- Inactive offline scopes are retained for 30 days and then pruned, except when a non-succeeded outbox entry still depends on that scope. Reading scoped records refreshes the scope access timestamp.
- Local writes that are declared offline-capable update SQLite and enqueue their outbox command in one transaction. The UI may show them immediately with an explicit sync state.
- Never convert a failed HTTP write into a synthetic success. Use explicit `pending`, `syncing`, `failed`, `conflict` and `uncertain` states.
- A command may be queued only when its server contract is replay-safe (for example an idempotency key/client mutation ID) and has an explicit conflict policy. Non-idempotent POSTs with an ambiguous timeout become `uncertain` and must reconcile before retry.
- Concurrency-protected workflows carry the server `rowVersion`/ETag as the command's base version. A conflict stops automatic replay for that aggregate and requires authoritative refresh/resolution.
- Authentication/session validation, tenant/company switching, RBAC/security administration, approval/lifecycle workflows without replay guarantees, file transfer/delete, Crystal rendering and operational dashboards remain online-authoritative unless their feature contract explicitly says otherwise.
- SignalR/realtime is a sync accelerator only. A reconnect or event may wake reconciliation, but missed events must be recoverable from an authoritative delta/change feed or a normal refresh path.
- Cached offline access never bypasses authorization. The app may expose a controlled offline session lease only from previously validated session/permission data, with all mutations additionally gated by the last known tenant read-only state and the operation's offline policy.
- Ordinary React Query mutations use `networkMode: 'always'` and no automatic retry so an offline request cannot become an implicit in-memory write queue. Durable replay exists only behind explicit, safety-certified feature outbox commands.

## API and session

- Configure the backend through `EXPO_PUBLIC_API_URL`; public variables never contain secrets.
- Use `apiService` for JSON and multipart requests so authorization, cancellation, timeout, refresh and Problem Details mapping stay centralized.
- Validate responses at the owning feature API boundary. Required fields fail closed; compatibility fallback is explicit and limited to optional fields.
- Store access and refresh tokens through `secureSession`, never AsyncStorage.
- Authentication and company changes clear React Query caches so data cannot cross tenant/company sessions.
- Authentication/company transitions rotate the Axios request context so requests started for the previous scope are aborted before their responses can populate the next context.
- Company switching requires explicit discard confirmation while registered forms contain unsaved changes.
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

The API remains authoritative for purchased/enabled modules and user permissions. Mobile module definitions describe only which server modules/submodules this build knows how to present; they never grant access by themselves. `src/shell/module-registration.ts` is the composition point that registers user-facing definitions, while technical Platform remains outside the launcher registry.

For a new user-facing ERP module:

1. create `src/modules/<module>/moduleDefinition.ts` and a narrow `index.ts`;
2. add the owner to `scripts/module-boundaries.mjs` with explicit allowed dependencies;
3. register its definition from `src/shell/module-registration.ts` rather than importing the module from Platform;
4. define its submodule route prefixes and entry candidates, then add physical Expo routes and RBAC/entitlement requirements;
5. keep features within the module on `domain -> application`, with data adapters and presentation/composition outside that core;
6. add runtime response validation, EN/AR resources, permission/read-only behavior and focused tests;
7. run `npm run check` and verify phone/tablet, LTR/RTL and light/dark modes.

For a new feature inside an existing module, follow [MOBILE_FEATURE_GUIDE.md](MOBILE_FEATURE_GUIDE.md) and place it beneath that module owner, for example `src/modules/hr/employees` rather than a new top-level feature root.
