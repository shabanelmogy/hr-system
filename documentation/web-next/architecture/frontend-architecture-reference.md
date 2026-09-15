# Frontend Architecture Reference

Status: Applied to `web-next`; modular migration phases 1-8 foundation completed 2026-09-10.

This document is the architecture baseline for future frontend work. It covers ownership, dependency direction, routing, naming, and scalability. It does not define authentication behavior, API implementation, UI design, or performance policy. The current transport and API parity gate is recorded in [Web/API Readiness Review](../WEB_API_READINESS_REVIEW.md).

## Feature Implementation Guides

- [Feature Documentation System](../../system/README.md): operating modes,
  copy-ready implementation request, evidence phases, regeneration, and handoff.
- [Server-Managed Feature Frontend Reference](../features/server-managed-feature-reference.md): the canonical reusable pattern for master-data and business CRUD features.
- [Countries Full-Stack Web and Mobile Implementation Profile](../features/countries-frontend-reference.md): the concrete shared API plus web/mobile Countries configuration and implementation notes for that general pattern.
- [States Next.js Frontend Reference](../features/states-frontend-reference.md):
  the parent-dependent applied reference; it is not evidence for unrelated fields
  or views.
- [Business Feature Template](business-feature-template.md): the standard query,
  validation, form, feedback and module-ownership shape, applied to Fiscal Years.
- [Frontend Module Generator](module-generator.md): module scaffold contract and
  the Accounting/Chart-of-Accounts backend-contract constraint.
- [Performance Baseline](performance-baseline.md): production First Load and
  lazy-chunk measurements after the modular migration.

## Review Summary

The review found no Critical issues.

High-priority issues that were fixed:

- Circular dependencies between shared component barrels and child components.
- Feature and shared components depending on layout internals.
- A shared notification service importing country-specific feature code.
- An overly broad shared component barrel hiding ownership boundaries.

Medium-priority issues that were addressed:

- Inconsistent feature page ownership.
- Mixed directory casing and naming conventions.
- Fragmented component prop types.
- Missing automated dependency-direction checks.
- Untyped application routes.
- Unused legacy barrels and route definitions.

Low-priority cleanup that was addressed:

- Removed the unused `src/shared/index.js` barrel.
- Moved global-presence dashboard ownership from `home` to geographical information.
- Replaced layout-owned content wrapping with a shared layout utility.

## Modular ownership baseline

The target ownership structure is now physically applied. The legacy
`src/features` and `src/layouts` roots are absent and remain guarded as migration
tripwires; business code lives under `src/modules`, product platform capabilities
under `src/platform`, and application chrome under `src/shell`.

| Owner | Current directories | Dependency notes |
| --- | --- | --- |
| Platform | `advanced-tools`, `auth`, `file-manager`, `global-search`, `modules`, `notifications`, `realtime`, `tenant-access`, `tenant-admins`, `tenants` | Depends only on shared/low-level infrastructure. Business modules register integrations such as realtime invalidation into Platform public APIs. |
| HR | `appointments`, `attendance-devices`, `basic-data`, `finance/fiscal-years`, `home`, `recruitment`, `workforce-planning` | Matches the server HR module catalog. Fiscal Years belongs to HR `workforce`, not Accounting. |
| Accounting | module definition and module-local infrastructure | The server Accounting module currently publishes no business submodules. Do not invent frontend business routes before the backend contract exists. |
| Shell | sidebar, top bar, layout, route guard | Consumes Platform public APIs and shared UI only; it does not import business-module internals. |
| Shared | domain-neutral UI/infrastructure plus `reporting` | Must remain business-neutral. Domain report pages stay with their module owner. |

`check:architecture` analyzes static imports and literal dynamic `import("...")`
expressions, validates module directories, rejects code returning to legacy
`src/features`/`src/layouts`, validates dependency direction, and enforces public
`index.ts` boundaries across owners.

### Shared module shell behavior

`shared/components/layout/feature-module/FeatureModuleLayout` is the reusable
module shell for overview, list, and detail routes. It owns the responsive
navigation drawer, breadcrumbs, active-trail selection, and the bounded content
panel. The content panel uses `overflow-y: auto` so long overview/card pages keep
their scroll inside the shell; feature pages must keep child grids and data
panels at `min-height: 0` so they do not create a second body scrollbar. The
navigation helper prefers the deepest matching route when legacy prefixes
overlap. Consumers provide translated labels and module-owned items; they do
not recreate the drawer or apply domain-specific route matching.

The shell is compatible with RTL and narrow viewports. On screens below `md`,
the temporary drawer is above the fixed top bar and the top bar collapses the
brand text while preserving accessible icon labels and context actions. Focused
coverage lives in `shared/components/layout/feature-module/navigation.test.ts`
and the consuming Basic Data, Workforce Planning, and Attendance layouts are
the compatibility examples.

Opening the internal mobile navigation drawer closes the primary sidebar; at
`lg` and above, an expanded internal navigation also closes it. The primary
mobile sidebar remains available whenever the internal mobile drawer is closed.

### User and company context lifecycle

`SessionContext` owns the abort controller and generation gate for session and
company transitions. When the user, tenant, or company changes, requests from
the previous identity are aborted and their results cannot publish into the new
identity. The API client remains gated until the transition has completed; it
does not replay a request that was started under the previous context.

`MainShell` remounts the QueryClient and feature subtree with the complete
user/tenant/company identity key during a switch or logout. This clears query
cache and feature-local stores before the new subtree mounts, so a previous
company's data cannot remain visible while the next context is loading.

The shared `UnsavedChangesProvider` exposes
`requestDiscard(): Promise<boolean>`. Same-tab links, sidebar items, module
launchers, and company switching use this promise before navigation. A busy
form submission refuses navigation, and a pending confirmation resolves
`false` when its provider unmounts. Browser same-document Back/Forward uses
Navigation API cancelable `navigate` events, cancelled before Next handles the
route. One confirmation retains the first destination key during repeated
traversals; acceptance calls `traverseTo(key)` exactly once. Dirty/clean changes
never push, replace or remove history entries. Pending decisions cannot replay
after disposal or a change of origin. The existing shared dialog provides RTL,
translated labels and keyboard support; no new consumer options are required.
`FormContainer` registers dirty/pending submissions; company and module switchers
continue to call `requestDiscard()` before changing context.

Compatibility: this browser-history guarantee requires Navigation API and a
cancelable same-document event. Older browsers retain application-link guards
and full-document beforeunload protection, but same-document browser traversal
is not guaranteed there. No unsafe popstate restoration fallback is installed.
`historyTraversalGuard.test.ts` covers repeated traversal, cancellation, exact
multi-step and forward destinations, disposal and changed origins. A local real
Chromium harness verified no router popstate before approval, one exact accepted
traversal and unchanged history length. Full authenticated ERP journeys remain
a manual release check when the backend is unavailable.

Company-switch verification suppresses per-attempt failure redirects. Only the
final unsuccessful verification redirects to service-unavailable; a session 401
terminates verification through logout. Stale generations cannot overwrite the
verification result; a concurrent logout invalidates the switch via its epoch.

### On-demand feature tooling

Heavy export dependencies are loaded only when the export action is invoked.
`useGridExport` keeps its existing consumer-facing behavior while importing
the spreadsheet tool on demand, so ordinary list and dashboard routes do not
pay the export bundle cost. The export path retains the shared loading and
error states and is covered by its focused hook checks.

### Route and entitlement ownership baseline

- `/attendance-trends` is owned by HR `analytics`; prefix matching must not
  classify it as `attendance`.
- `/administration/crystal-reports` is owned by the frontend Reporting module
  and the server Reporting module. It must not be classified under HR
  `analytics`; authorization still uses the server's `CrystalReports:*`
  permission catalog.
- Sidebar module filtering and route authorization use the same module-access
  predicate. Permission filtering must preserve leaf navigation items rather than
  converting them into empty containers that the module filter removes.
- Route prefixes, launcher presentation, entry candidates, permissions metadata,
  navigation metadata, dependencies, and lazy translation namespaces belong to
  the frontend module definition in `src/modules/<module>/moduleDefinition.tsx`.
- HR business navigation is authored in `src/modules/hr/navigation/*.tsx` and
  exposed through `hrModuleDefinition.navigation`; the shell consumes that
  public definition instead of keeping a second business-navigation registry.
  Submodule menus derive their links from the same definitions and use the
  longest matching route prefix. Neutral navigation types and factories live
  under `src/shared/components/layout/navigation`; the shell only keeps a
  compatibility re-export for moved icons. `src/app/(main)/navigationConfig.test.tsx`
  is the integration coverage for this composition.
- Server `/modules/accessible` remains authoritative for purchased/enabled
  modules and user permission filtering. The frontend registry only intersects
  those server results with capabilities present in the current build.

### API boundary and contract rules

- Browser code calls same-origin `/api` routes through feature-owned services;
  App Router handlers are the only BFF boundary.
- Backend URLs are canonical origins. Runtime overrides are opt-in and exact
  allowlist matches; production defaults keep the override disabled.
- File paths use URL encoded stored filenames and the server scanner's accepted
  extension/MIME pairs. Do not add a client format without updating the API
  contract and its review evidence.
- Problem Details fields (`type`, `title`, `status`, `detail`, `code`, and
  `traceId`) are preserved for feature error handling. Field validation errors
  remain separate from machine error codes.
- `npm run check:architecture` rejects direct HTTP calls from TSX, and
  `npm run check:i18n` scans every non-test TSX/JSX source file and rejects any
  visible literal without translation keys.

## Target Structure

The applied physical structure is:

```text
src/
  app/                         # Next.js App Router only; thin route adapters
  platform/                    # identity, tenancy, entitlements, platform services
  modules/
    hr/                        # HR-owned business capabilities
    accounting/                # Accounting-owned business capabilities
  shell/                       # top bar, sidebar, app/module launch composition
  shared/                      # domain-neutral reusable UI and infrastructure
  lib/                         # low-level integrations
  config/                      # routes, API and environment configuration
  theme/
  types/
```

## Dependency Direction

Allowed direction:

```text
app -> module/platform composition roots, shell, shared, lib, config, theme
shell -> platform public APIs, shared, lib, config, theme
modules -> platform public APIs, shared, lib, config, theme, same-module features
platform -> shared, lib, config, theme
shared -> lib, config, theme
lib -> config and infrastructure dependencies
config -> external/configuration dependencies only
```

Rules:

1. `src/app` contains route adapters, composition registration, metadata, loading, error, and not-found boundaries. Business UI belongs in `src/modules`.
2. Business modules must never import from `src/app` or `src/shell`.
3. Platform must never import business modules. Business-owned registrations call a Platform public contract instead.
4. `src/shared` must never import Platform, Shell, a business module, or route module.
5. Cross-owner imports target deliberate `index.ts` public APIs.
6. Shared services must remain domain-neutral. Business registration belongs to the module that owns it.
7. Do not create imports through a broad root barrel when a domain barrel or direct module import is clearer.
8. New code must not introduce circular dependencies.

## Feature Ownership

- A page component belongs in the feature that owns the business capability.
- Components, hooks, types, services, and utilities used by one feature stay inside that feature.
- Move code to `shared` only when it is reusable across multiple features and contains no business-specific knowledge.
- Dashboard sections belong to the feature represented by their data, not automatically to `home`.
- Reports stay with the domain that owns their data unless they are truly cross-domain reporting infrastructure.

## Reuse-first and behavior-preservation rule

Before creating or replacing UI, search the relevant shared directories and
inspect the existing component's public API, tests, and internal behavior. A
reusable component may contain substantial product logic in addition to visual
styling, including boundary correction, controlled/uncontrolled coordination,
responsive behavior, RTL, accessibility, loading states, and error recovery.

Rules:

1. Reuse an established shared component when it already owns the required
   behavior. A feature configures it through its public props; it does not copy,
   hide, or replace the component with a library default.
2. Preserve existing shared behavior during refactors unless the user or product
   contract explicitly requests a change. Visual similarity is not proof that a
   simpler replacement is equivalent.
3. When a shared capability is missing, first decide whether it is genuinely
   domain-neutral. Extend the shared API only when multiple real consumers need
   the behavior; otherwise compose feature-owned behavior around the shared base.
4. A shared-component change requires focused tests for its behavioral invariants
   and verification of all known consumers. Do not validate only the feature that
   triggered the change.
5. Reuse does not justify moving domain fields, permissions, lifecycle rules,
   filters, or validation into `shared`; those remain feature-owned.

Examples of protected reusable behavior include `MyDataGrid` with `GridFooter`,
`CardViewPagination`, `PageHeader`, the shared card scaffold, form/dialog shells,
and shared loading/error/empty states.

### Form validation safety

- Optional values emitted by text, number, and select controls must use the
  shared primitives in `src/shared/validation/zodFormPrimitives.ts`. Their
  preprocessors normalize blank control values and their inner Zod schemas are
  explicitly optional, so omitted object keys remain optional after transforms.
- Do not model an optional control by transforming a union containing
  `z.undefined()`. With transformed schemas, accepting `undefined` as a value is
  not equivalent to making an object key optional and can produce hidden
  `expected nonoptional` errors.
- Every React Hook Form consumer of `MyForm` must pass errors through
  `toFormErrorMessages()`. This preserves nested array/object paths and makes the
  shared header summary show the same complete error set as the field controls.
- Feature forms should supply translated `errorLabels` for their user-facing
  fields. Unmapped errors remain visible as a technical field path rather than
  being silently omitted.

### Query cache consistency

- The shared QueryClient must keep `refetchOnMount: true`. A mutation or realtime
  event may invalidate a query while its owning screen is unmounted; remounting
  that screen must reconcile the stale cache with the server.
- Every successful mutation invalidates the stable root key for its entity and
  all dependent query families. Cross-feature consumers import those keys/hooks
  through the feature's public API rather than duplicating cache keys.
- A query may opt out of mount refetching only when its data is genuinely static
  for the session and the exception is local, documented, and tested. Never
  disable mount refetching globally to reduce request volume; use `staleTime` for
  that purpose.
- Business-critical cross-feature lookups may use `refetchOnMount: "always"`
  when they must be reconciled on every workflow entry even while technically
  fresh. Fiscal Years uses this policy because Workforce Planning depends on it.

Current examples:

- Geographical pages live under `src/modules/hr/basic-data/geographical-information`.
- Global presence is owned by geographical information.
- Home dashboard composition lives under `src/modules/hr/home`.
- File listing and media preview live under `src/platform/file-manager`.
- Advanced tools are split by capability into `external-tools`, `localization`, and `track-changes`; reusable code stays inside the owning subfeature unless it is domain-neutral and used elsewhere.
- Notification API access, query state, realtime handling, and UI live under `src/platform/notifications`.
- User-profile API access and query hooks live under `src/platform/auth/profile`.
- Cross-domain report viewers and report API access live under `src/shared/reporting`; domain report pages remain with their owning module feature.
- Fiscal Years live under `src/modules/hr/finance/fiscal-years` because the server HR module catalog assigns `FiscalYears:*` to the `workforce` submodule.
- Generic SignalR connection infrastructure lives under `src/lib/signalr`.
- Reusable content wrapping and sidebar context live under `src/shared`.

## App Router Rules

- Keep route groups organizational, for example `(main)`, `(auth)`, `(analytics)`, `(security)`, and `(platform)`.
- Route groups must not change public URLs unless the URL change is explicitly required.
- Keep `page.tsx` files thin and import a feature page component.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` at the nearest meaningful route boundary.
- Do not duplicate route-level business logic in App Router adapters.
- Keep application routes centralized in `src/config/routes.ts` and use typed routes.

## Naming Rules

- Use lowercase kebab-case for directories: `global-presence`, `file-manager`, `media-viewer`.
- Use PascalCase for React components: `CountriesPage.tsx`, `ContentWrapper.tsx`.
- Name route-level feature components with the `Page` suffix.
- Name hooks with the `use` prefix and camelCase: `useCountryQueries.ts`.
- Name types by domain concept, not generic abbreviations.
- Avoid `My` prefixes for new reusable components. Existing names may be migrated incrementally.
- Use `index.ts` only as a deliberate public API, not as a universal export barrel.

## Required Checks

Before completing a structural change, run:

```powershell
npm.cmd run check:architecture
npm.cmd run type-check
npm.cmd run type-check:strict
npm.cmd run lint -- --quiet
npm.cmd run test:module-generator
npm.cmd test
npm.cmd run build
npm.cmd run measure:build
```

`check:architecture` is implemented in `scripts/check-architecture.mjs` with
ownership declarations in `scripts/module-boundaries.mjs`. It checks static and
literal dynamic dependency direction, target module completeness, declared
cross-owner dependencies, public APIs, import cycles, unsafe
transformed-optional Zod schemas, manual top-level-only `MyForm` error projection,
and global disabling of stale-query refetch on mount. Any new exception must be
justified in code review and reflected here.

## Future Change Checklist

- [ ] Start from the feature implementation request, review artifact, and affected generated phase packet.
- [ ] Classify each optional view independently for web/mobile before adding a route or component.
- [ ] Identify the owning module/platform capability before creating files.
- [ ] Inspect existing shared components and tests before creating or replacing UI.
- [ ] Preserve shared behavior and configure it through public props; document any explicit exception.
- [ ] Keep the App Router adapter thin.
- [ ] Keep business code independent from Shell and App Router internals.
- [ ] Confirm shared code has no feature-specific imports.
- [ ] Build optional control schemas from the shared Zod form primitives.
- [ ] Flatten `MyForm` errors through `toFormErrorMessages()` and provide translated field labels.
- [ ] Invalidate stable root/dependency keys after mutations and verify stale inactive data refetches on remount.
- [ ] Use the established lowercase directory and PascalCase component naming.
- [ ] Add or update a feature/module `index.ts` only when a public boundary is needed.
- [ ] Run the architecture, type, lint, test, and build checks.
