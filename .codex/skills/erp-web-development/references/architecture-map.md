# ERPSYSTEM Web Architecture Map

Read this reference for Web analysis, review, debugging, design, and implementation
orientation. Current source and higher-authority canonical documents win if this
map becomes stale.

## Authority and evidence

Use these sources together, not interchangeably:

1. Repository and `web-next/AGENTS.md` instructions.
2. An approved Plan/Slice and version 2.0 feature execution contract for planned
   business work.
3. `documentation/web-next/architecture/frontend-architecture-reference.md`.
4. `documentation/web-next/features/server-managed-feature-reference.md` when the
   requested feature follows a server-managed list/CRUD shape.
5. `documentation/project/SCREEN_PATTERN_CATALOG.md`,
   `SHARED_REUSE_CATALOG.md`, and `Shared_Form_Layouts.md` for reusable UI shape.
6. The owning module package and applied API/Web/Mobile/cross-platform books.
7. Current source, tests, configuration, generated architecture manifest, and
   runtime evidence for claims about what is implemented.

Documentation defines required behavior and approved decisions; source and tests
prove current behavior. Generated packets organize evidence but do not replace the
authored books. Preserve contradictions as findings and reconcile the owner instead
of selecting the convenient version.

## Application boundary and stack

`web-next/` is the supported frontend. Its current baseline is Next.js 16.3.5 App
Router, React 19.3, TypeScript 5.9, MUI 9, TanStack React Query 5, React Hook Form,
Zod, i18next, SignalR, Framer Motion, Vitest, and Playwright. Treat
`web-next/package.json` and its lockfile as the exact dependency truth.

Read the locally installed Next.js documentation under
`web-next/node_modules/next/dist/docs` before using or changing framework behavior.
Do not apply remembered behavior from a different Next.js or React release.

The stable top-level ownership is:

```text
web-next/src/
  app/       thin App Router adapters, route handlers and layout composition
  modules/   user-facing ERP business modules
  platform/  auth, tenants, modules, reporting policy, realtime and tools
  shell/     application shell, navigation, bootstrap and layout composition
  shared/    domain-neutral UI, hooks and services
  lib/       low-level client/BFF/runtime utilities
  config/    centralized configuration
  locales/   English and Arabic catalogs
  theme/     theme composition
```

Do not recreate removed legacy feature/layout roots or implement new work under the
sibling `web/` application.

## Dependency and public-API policy

The executable owner policy lives in `web-next/scripts/module-boundaries.mjs` and
is enforced by `npm run check:architecture`. App route groups are ownership markers;
Next.js removes them from public URLs. Every protected business page belongs under
one declared owner group.

General direction:

```text
app -> modules | platform | shell | shared | lib | config | theme
shell -> platform public APIs | shared | lib | config | theme
module -> allowed owner public APIs | shared | lib | config | theme
platform -> shared | lib | config | theme
shared -> lib | config | theme
lib -> config
```

The current allowlist includes a few deliberate cross-owner dependencies. Always
consult the checker instead of assuming that all module-to-module imports are valid.
Even when an owner dependency is allowed, cross-owner imports target curated public
APIs, not another owner's pages, hooks, types, or implementation folders. Avoid
broad `export *` barrels and cycles.

`web-next/scripts/architecture-governance.mjs` keeps the generated frontend
architecture manifest synchronized. Change ownership/route source or policy first,
then run `npm run generate:architecture-manifest`; never hand-edit generated output.

## Feature request flow

A normal server-backed feature follows:

```text
App Router page/layout
  -> owning feature public API
  -> FeaturePage / feature composition
  -> controller hook
  -> useServerListState or form state
  -> React Query query/mutation hook
  -> feature service
  -> shared apiService / BFF client
  -> same-origin Next BFF route
  -> versioned ERP API
```

Keep responsibilities narrow:

- `types`: exact API-facing list/detail/lookup/create/update/query/page contracts.
- `services`: the only feature layer calling `apiService`; normalize request and
  response data here or in named boundary utilities.
- hooks/controllers: query keys, React Query policy, list state, mutations,
  invalidation, orchestration, and view-model preparation.
- pages/components: composition, presentation, callbacks, and local ephemeral UI.
- validation: reusable feature Zod schemas and inferred form types.
- `public/index.ts` or feature `index.ts`: the minimal supported external surface.

Visual TSX components do not call `apiService`. Do not duplicate wire DTOs between
pages or hide contract conversion inside render logic.

## Routes, modules, and access

- App Router files are adapters, not business implementation.
- Module definitions own client metadata, route prefixes, navigation entries,
  dependencies, and translation namespaces for features known by this build.
- Server module catalog/entitlements remain authoritative. Client module metadata
  never grants access.
- Route authorization, module entitlement, named permissions, trusted tenant/company
  context, and read-only state are related but separate policies.
- Hidden navigation is not authorization. Guard routes and direct mutation handlers
  as well as action visibility.
- `src/platform/modules/routeRequirements.ts`, registered module definitions,
  Shell authorized navigation, and route guards must remain aligned.

## Server state and API transport

- `src/shared/services/apiService.ts` delegates to the centralized client under
  `src/lib/api/`. Preserve same-origin proxy/BFF behavior, auth refresh, cancellation,
  timeout, scope rotation, and Problem Details mapping.
- React Query owns server cache/orchestration; local state owns transient UI only.
- Query keys are hierarchical and feature-owned. Invalidate the narrowest stable
  root that covers the changed data.
- Realtime consumers register stable public query prefixes through Platform. They
  do not import private hooks or assume events replace authoritative refresh.
- Authentication and company changes abort/rotate old-scope requests and clear the
  relevant cache before new-scope data can render.
- Use `unknown` plus parsing/narrowing for untrusted values. Strict TypeScript rules
  reject `any`, `@ts-ignore`, and cast chains that conceal contract drift.

## Server-managed list contract

Use the selected feature reference and shared components rather than recreating the
shell. The reference flow is:

```text
useServerListState (zero-based UI)
  -> named query mapper (one-based API)
  -> server-paged query
  -> shared Grid/Card/other Required views
```

- Search is debounced through the shared controller pattern.
- Search/filter/sort/page-size changes reset to page zero.
- Every server query criterion has a visible control and reset path.
- Filtering and sorting happen on the server; never re-filter one loaded page and
  present it as the full result.
- Keep deterministic sort vocabulary aligned with the API.
- Preserve the previous page while fetching when the reference contract does.
- Use shared `PageHeader`, `MyDataGrid`, toolbar, card shell, pagination, loading,
  empty, error, selection, lifecycle, and edit-flash behavior.

Countries is the P-001 geographic/reference-data implementation with Grid, Cards,
Chart, Report, and Import. Those five views are mandatory only when the owning
contract classifies them Required. States is the parent-dependent example. Cost
Centers is P-002 Tree + Master/Detail. Add Tenant is the P-003 multi-section form
reference. Copy structure and behavior, never reference-specific fields or scope.

## Forms and shared UI

The shared form system is the single owner of dialog layout, pending state,
unsaved-change protection, validation focus, accessible error summaries, and field
error placement:

- `src/shared/components/forms/dialog/MyForm.tsx`
- `FormContainer`, `FormHeader`, `FormContent`, and `FormFooter`
- approved fields such as `MyTextField` and `MySelect`
- `FormTabs`/sections/step layouts when the selected Pattern ID requires them

Feature validation uses a feature-owned Zod schema with `zodResolver`. Submit stays
available; validation runs on submit, renders specific messages below fields, and
focuses the first invalid field. Server errors are authoritative and map back to
fields when identified. Shared `noValidate` behavior prevents browser-native error
dialogs. Use shared confirmation/error UI instead of `alert` or `confirm`.

Register dirty forms through the shared unsaved-changes contract and call its async
discard request before application-owned navigation or company switching. Do not
build a second history guard or confirmation store in a feature.

## Optional capability boundaries

- Chart: compose shared chart primitives. Current-page summaries must say they
  describe the loaded page and show authoritative totals separately. True analytics
  needs a dedicated aggregate endpoint.
- Managed Crystal Report: use Reporting public policy and shared viewer. Global
  geography and tenant reporting have different authorization/entitlement rules.
- Import: use the shared spreadsheet/file contracts, exact headers/envelopes, bounded
  parsing, formula rejection, atomicity and permission/read-only guards. Handle an
  ambiguous submission as uncertain and reconcile; do not auto-retry.
- Tree/diagram: use shared tree/split-view primitives and `framer-motion` for complex
  card dragging. The API owns valid hierarchy/reparent/concurrency rules.
- Export: load shared export tooling on demand and keep it outside initial render.

## Localization, accessibility, and performance

- Add every visible key to `src/locales/en/translation.json` and
  `src/locales/ar/translation.json`; use `useTranslation` in the owner.
- Use existing theme and logical layout for RTL. Do not patch direction with ad hoc
  physical CSS when a shared contract exists.
- Preserve keyboard access, focus order, labels, descriptions, error links, touch
  targets, contrast, and small/large viewport behavior.
- Keep initial route code lean. Dynamically load interaction-only dialogs/forms and
  Required-but-optional heavy views, and conditionally mount them only when opened.
- Place providers at the nearest stable consumer boundary. Measure production build
  effects when a dependency, route boundary, shared root, or heavy view changes.

## Verification ownership

- Pure utilities: mapping, normalization, permissions, list state, view selection.
- Service/query tests: exact URL, query/body, parsing, errors, invalidation, scope.
- Component/integration tests: loading/empty/error/forbidden, form validation,
  server field errors, lifecycle/confirmation, i18n/RTL, shared extensions.
- Browser E2E: high-risk navigation, auth/company transitions, unsaved changes,
  critical create/edit/lifecycle/import/report journeys.
- Architecture/governance checks: ownership, public APIs, route metadata, generated
  manifest, locale parity, release contracts, strict TypeScript.

Passing a focused test does not replace the full proportional gate, and a green
build does not prove browser, API, Mobile, or release-environment behavior.
