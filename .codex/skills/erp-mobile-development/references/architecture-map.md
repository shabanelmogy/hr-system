# ERPSYSTEM Mobile Architecture Map

Read this reference for Mobile analysis, review, debugging, design, and
implementation orientation. Current source and higher-authority canonical documents
win if this map becomes stale.

## Authority and evidence

Use these sources together:

1. Repository and `mobile-react/AGENTS.md` instructions.
2. An approved Plan/Slice and version 2.0 feature execution contract for planned
   business work.
3. `documentation/mobile-react/MOBILE_ARCHITECTURE.md`.
4. `documentation/mobile-react/MOBILE_FEATURE_GUIDE.md`.
5. `documentation/mobile-react/MOBILE_STYLE_GUIDE.md` for every style/UI change.
6. `documentation/project/SCREEN_PATTERN_CATALOG.md`,
   `SHARED_REUSE_CATALOG.md`, and `Shared_Form_Layouts.md` for reusable screen/form
   shape.
7. The owning module package and applied API/Web/Mobile/cross-platform books.
8. Current source, tests, route/API compatibility matrix, native configuration,
   export/prebuild results, and device evidence for implementation claims.

Documentation defines required direction and approved behavior. Source and tests
prove current implementation. A generated phase packet is navigation, not proof.
Preserve conflicts as findings and reconcile the canonical owner.

## Application boundary and stack

`mobile-react/` is the Expo client. Its current baseline is Expo SDK 57, Expo Router
57, React Native 0.86.3, React 19.2.3, TypeScript, TanStack React Query, React Hook
Form, Zod, SignalR, encrypted SQLite/SQLCipher, SecureStore, Jest with `jest-expo`,
and native file/print/share integrations. `package.json`, its lockfile, Expo config,
and installed official SDK documentation are exact version truth.

Stable top-level ownership:

```text
mobile-react/
  app/            thin Expo Router route and navigator adapters
  src/core/       environment, API transport, query, localization, theme,
                  secure storage, observability and offline infrastructure
  src/modules/    user-facing ERP business modules and feature slices
  src/platform/   auth/RBAC, tenants/companies, modules, reporting, realtime,
                  notifications, administration and technical tools
  src/shared/     domain-neutral native components and utilities
  src/shell/      application composition, registration and top-level layouts
```

The top-level `src/features` and `src/layouts` roots are forbidden. Legacy folders
inside a feature may exist during a controlled migration, but new behavior targets
the clean feature layers.

## Owner dependencies and public APIs

`mobile-react/scripts/module-boundaries.mjs` is the executable owner allowlist, and
`npm run check:architecture` enforces it. General direction:

```text
core -> no higher owner
shared -> core
platform -> core + shared
business module -> core + shared + platform + explicitly allowed module APIs
shell -> registered module public APIs + platform + shared + core
app -> public composition APIs only
```

`core` must remain independent of shared UI, Platform, Shell and business modules.
Root composition owns UI hosts such as `AppFeedbackHost`. Cross-owner imports use a
curated `index.ts`; an allowed owner dependency never permits importing private
screens, hooks, endpoint files, or data adapters.

## Clean feature layers

The target feature shape is:

```text
src/modules/<module>/<feature>/
  domain/          pure entities, values, policies and repository/clock/ID ports
  application/     UI-neutral use cases and orchestration over ports
  data/
    remote/        endpoints, transport DTOs, response schemas and normalization
    local/         feature-owned SQLite access when approved
    mappers/       explicit transport/domain/local conversion
    repositories/  port implementations and online/offline policy
  presentation/
    components/
    hooks/
    queries/       stable keys and React Query controllers
    screens/
  validation/      form schemas, separate from response schemas
  navigation/      feature navigation only when needed
  composition/     concrete dependency wiring
  index.ts         narrow public API
```

Dependency direction:

```text
presentation -> application -> domain
data -----------------------> domain/application ports
composition -> concrete data/core wiring
```

Domain does not import React, React Native, Expo, Axios, React Query, SQLite or
Core. Application remains UI-neutral. Presentation never calls `apiService`,
`axiosClient`, or a remote data source. Avoid broad `export *`; a public API is a
compatibility contract.

## Routing, navigation, authorization, and contracts

- `src/core/constants/routes.ts` mirrors physical routes and owns typed builders.
- `src/platform/auth/presentation/rbac/route-manifest.ts` is the canonical access
  and main-drawer metadata manifest.
- Routed pages retain `RouteGuard`; drawer visibility calls the same route policy.
- Unknown authenticated routes are denied by default.
- `src/shell/module-registration.ts` composes user-facing module definitions. The
  server catalog remains authoritative for enabled/purchased modules.
- `AppBreadcrumbs` owns complete parent chains for direct routes and responsive RTL
  overflow behavior.
- Expo Router 57 owns navigation. Application code uses its matching entry points
  rather than external `@react-navigation/*` packages.

`documentation/mobile-react/MOBILE_API_COMPATIBILITY_MATRIX.json` is the canonical
route/endpoint client matrix. `npm run check:contracts` validates every physical
`app/**/*.tsx` route and exported endpoint leaf for aligned owner, scope, permission,
HTTP behavior, offline policy and non-test caller. `deferred`, `UNREVIEWED`, or
`UNUSED` entries are not acceptable for an active implementation.

## API, session, and server state

- Core `apiService`/Axios infrastructure owns authorization, cancellation, timeout,
  refresh, request-context rotation and Problem Details mapping.
- A remote adapter requests `unknown`, parses it with the feature's Zod response
  schema, and maps it to domain/application data. Required fields fail closed.
- React Query owns server-state orchestration, not durable offline truth. Query keys
  are feature-owned and mutations invalidate the narrowest stable prefix.
- Realtime uses public key prefixes and wakes authoritative refresh/reconciliation;
  it is not a durable source of truth.
- Auth/company transitions abort requests from the old context and clear cache so
  scoped data cannot cross sessions. Dirty forms require explicit shared discard
  confirmation before a company switch.
- Access/refresh tokens use SecureStore. `EXPO_PUBLIC_*` configuration is embedded
  in the bundle and must never contain credentials or secrets.

## Server-managed list contract

The normal flow is:

```text
useServerListState (zero-based UI)
  -> query mapper / toApiPageNumber
  -> presentation query
  -> application/repository boundary
  -> validated remote adapter or approved scoped local read
  -> AppListScreen + AppMultiView + AppDataTable/AppDataCard
```

- Search is debounced through the shared list controller.
- Search/filter/sort/page-size changes reset to page zero.
- Every criterion in the server query has a visible control and reset path.
- Keep the previous page visible during fetch when using the reference pattern.
- Disable local table pagination inside `AppMultiView`; pass controlled server state
  to a standalone table.
- Selection is feature-owned by stable IDs; shared table/card components own native
  selection affordances, touch targets and edit flash. Clear selection when the
  visible query criteria/page changes.
- Do not fetch or slice all records to fake server paging, filtering or analytics.

Countries is the P-001 Reference Data implementation with Table, Cards, Chart,
Report and Import. Those surfaces apply only when the feature contract requires
them. States adds a required parent lookup. Cost Centers is P-002 hierarchy. Add
Tenant is a documented P-003 Mobile adaptation using one stacked `AppForm` context;
`AppFormTabs` remains available when the approved Mobile contract selects tabs.

## Offline foundation and safety ceiling

Durable business data uses encrypted SQLCipher SQLite through `src/core/offline`.
The key is a device-scoped 256-bit SecureStore secret. AsyncStorage is limited to
lightweight preferences and non-business UI state.

Every operation declares a code-owned maximum mode:

- `online-only`: require an authoritative server response.
- `offline-read`: serve scoped local data and refresh when authorized/connected.
- `offline-draft`: persist a draft locally but submit only online.
- `offline-command`: atomically update local state and enqueue a certified replay
  command.

The Platform tenant/company policy may select only a supported mode. Unknown,
missing, stale, malformed, wrong-scope or unsupported policy fails closed to
`online-only`. Cached policy is a bounded fallback, not editable authority. A local
preference may narrow but never expand the effective mode.

Partition records, sync cursors, drafts and commands by authenticated user/tenant/
company scope. Ordinary React Query mutations use online-authoritative behavior and
do not retry into an implicit queue. An offline command additionally requires:

- declared safety and central policy approval;
- atomic local state + outbox persistence;
- idempotency or row-versioned aggregate concurrency;
- deterministic reconciliation of ambiguous/409 outcomes;
- bounded retry/backoff, dead-letter/conflict/uncertain states and user resolution;
- restart/interruption recovery, scope isolation, retention and fair draining;
- fresh server-authenticated writable authority before replay.

An offline session lease may render authorized cached UI for its bounded scope, but
never authorizes network replay or online-only mutations. SignalR is only a sync
accelerator. Headless background maintenance does not invent React session/policy
authority or perform fake replay.

## Shared native UI and style ownership

Search `src/shared/components` before adding UI. Key contracts include:

- layout: `AppScreen`, `AppPageHeader`, footer/safe-area composition;
- lists: `AppListScreen`, `AppMultiView`, `AppDataTable`, `AppDataCard`, shared
  pagination and server list state;
- forms: `AppForm`, approved text/select controls, `AppFormSection`, `AppFormTabs`,
  `AppFormStepper`, field messages and dirty-state confirmation;
- feedback: `AppStateView`, `AppAlert`, shared dialogs, feedback/toast/error hosts;
- specialized: shared charts, `AppHierarchicalTree`, and
  `AppSpreadsheetImportView`.

Style ownership is narrow:

1. `src/core/theme` owns semantic reusable tokens and mode behavior.
2. `src/shared/components` owns domain-neutral visual behavior.
3. The feature owns only its composition and feature-specific colocated styles.

Use `StyleSheet.create` for invariant styles; semantic colors/direction/dimensions
are dynamic. Use semantic tokens, `AppText`, logical properties, live localization
direction, direction-aware icons, safe-area boundaries and measured responsive
breakpoints. Do not create a global styles dump, hardcoded feature palette, fixed
screen dimensions, LTR-only spacing, or invariant inline-style sprawl.

Every action needs native accessibility semantics, visible pressed/focus/disabled
state, at least a 44x44 hit target, text-scaling tolerance and a non-color signal.
Verify phone/tablet, portrait/landscape, English/Arabic, LTR/RTL and every theme
palette in light/dark/system modes.

## Optional capability boundaries

- Chart: compose shared chart primitives, state whether values describe the loaded
  page, and use a dedicated aggregate API for global analytics.
- Managed Crystal Report: use Platform Reporting schemas/repository/viewer and the
  correct global or tenant authorization gate. Never call the Crystal host or send
  paths, SQL, connection data, tenant IDs or company IDs.
- Import: use Expo/native document picker and filesystem APIs, a bounded value-only
  parser, exact file/header/row/envelope rules, native interruption/cancellation/
  uncertain states, and device evidence. Never copy DOM/FileReader/drag-drop code.
- Tree: use `AppHierarchicalTree`; the API remains authoritative for valid parent,
  level, ordering, lifecycle, cycle and concurrency decisions.

## Verification ownership

- Domain/application: invariants, policies, use cases and port orchestration.
- Remote/local/repository: response parsing, exact requests, malformed fixtures,
  SQL scope, offline mode resolution, queue/reconciliation/concurrency behavior.
- Presentation: list mapping, permissions/read-only, mutations/invalidation, forms,
  loading/empty/error/forbidden/conflict/sync, optional views and shared contracts.
- Routing/contracts: every physical route, `ROUTES`, route manifest, breadcrumb,
  module definition and endpoint matrix leaf.
- Localization/style: literal-key use, EN/AR parity, RTL, semantic tokens,
  accessibility and responsive/device states.
- Native/release: Expo compatibility, Android export, disposable prebuild assertions,
  dependency audit, sign-in, tenant/company switching and critical workflows on
  actual supported device/simulator targets.

Passing Jest or export alone does not prove native secure storage, SQLCipher,
background, file-picker, keyboard, safe-area, deep-link, or device navigation
behavior.
