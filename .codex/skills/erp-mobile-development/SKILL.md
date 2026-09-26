---
name: erp-mobile-development
description: Use when analyzing, reviewing, debugging, implementing, refactoring, testing, or documenting the ERPSYSTEM Expo client under mobile-react. Covers Expo Router, module and Clean Architecture boundaries, shared native UI/forms, React Query and validated API adapters, RBAC and scope, offline policy/SQLite/outbox behavior, i18n/RTL, reports/imports, device behavior, and mobile verification. Do not use for API-only, web-next-only, or unrelated React Native work.
---

# ERPSYSTEM Mobile Development

Use this skill only in the ERPSYSTEM workspace. Confirm the repository with
`mobile-react/package.json` and `documentation/mobile-react/`, and inspect current
source before relying on examples because the mobile client and canonical guides
evolve together.

This skill is a navigation and execution layer over project documentation; it does
not replace it. Approved plans and canonical Mobile/API/cross-platform guides own
intent and architecture. Current source, configuration, tests, contract matrices,
native builds, and device evidence prove implementation. Treat disagreement between
documentation and current evidence as a finding to reconcile through the owner.

## Load the right context

- Always read [architecture-map.md](references/architecture-map.md) before Mobile
  analysis, review, debugging, design, or implementation work.
- For any source, route, endpoint, offline behavior, UI, localization, test, native
  configuration, or Mobile documentation change, also read
  [feature-workflow.md](references/feature-workflow.md).
- Read `mobile-react/AGENTS.md`,
  `documentation/mobile-react/MOBILE_ARCHITECTURE.md`, and
  `documentation/mobile-react/MOBILE_FEATURE_GUIDE.md` before adding or
  restructuring a feature. Read `MOBILE_STYLE_GUIDE.md` completely before changing
  UI styles.
- Before changing Expo or React Native behavior, read the official documentation
  for the exact installed Expo SDK 57 / React Native 0.86 API involved. Use
  `mobile-react/package.json` and the lockfile as version truth.
- Before creating or rebuilding a screen, read
  `documentation/project/SCREEN_PATTERN_CATALOG.md` and
  `documentation/project/SHARED_REUSE_CATALOG.md`, select the matching Pattern ID,
  and inspect both its registered Mobile and Web reference sources.
- For a new capability or substantial rebuild, read `documentation/plans/README.md`,
  the exact approved Plan/Slice and version 2.0 feature execution contract,
  `documentation/plans/PLAN_QUALITY_GATE.md`, and `documentation/system/README.md`
  before runtime work.
- For an existing registered feature, start from
  `documentation/system/features/<feature>/required-files.json`, the applied
  cross-platform/API/Web/Mobile books, and only the relevant generated phases.
  Generated packets are navigation aids, not implementation proof.
- When `graphify-out/graph.json` exists, begin investigation with a focused
  `graphify query "<question>"`; use `graphify path` or `graphify explain` for a
  narrower trace. Do not modify `graphify-out/` unless requested.
- Inspect `git status --short`, the owning feature and public API, routes, endpoint
  matrix, tests, and current worktree edits before editing. Preserve unrelated work.

## Establish ownership and device contract

Before editing a route, screen, repository, or component, establish:

1. The owning business module or Core/Platform/Shell capability.
2. The actor, physical route, typed route, route manifest entry, permission, module
   entitlement, tenant/company scope, and read-only behavior.
3. The exact API list/detail/lookup/create/update/lifecycle contracts, including
   paging, validation, concurrency, idempotency, error and uncertain outcomes.
4. The code-owned offline safety ceiling for each operation: `online-only`,
   `offline-read`, `offline-draft`, or `offline-command`.
5. The selected Pattern ID and independent Mobile/Web status for Table/Grid, Cards,
   Tree, Detail, Chart, Report, Import, Export, and other optional surfaces.
6. Loading, empty, error, forbidden, dirty, conflict, sync, background/interruption,
   phone/tablet, orientation, safe-area, keyboard, accessibility, EN/AR, RTL,
   light/dark, and realistic mock-data behavior.

Do not infer product scope or offline support from Countries, States, Workforce
Planning, or another reference. A reference supplies implementation shape and
evidence only. Every optional capability remains explicitly `Required`, `Deferred`,
or `Excluded` for Mobile and Web.

## Preserve application and feature boundaries

Use the established owner direction:

```text
app -> curated public APIs and route/layout composition
shell -> core + shared + platform + registered module public APIs
modules -> core + shared + platform + explicitly allowed owner public APIs
platform -> core + shared
shared -> core
core -> no higher owner

presentation -> application -> domain
data -----------------------> domain/application ports
composition wires core/data implementations
```

- Keep `app/` Expo Router files thin. They render guards/layouts and import feature
  public APIs; they do not own API calls, queries, repositories, forms, or business
  rules. Keep tests outside `app/` because every file there is treated as a route.
- Domain is pure and owns business types, invariants, policies, and ports. It does
  not import React, React Native, Expo, Axios, React Query, SQLite, or Core.
- Application owns UI-neutral use cases and orchestration over ports.
- Data remote adapters own endpoint constants, transport DTOs, Zod response schemas,
  normalization and exact request mapping. Local adapters own feature SQLite data.
- Repositories implement the feature ports and its approved online/offline policy.
- Presentation owns React Query controllers and native screens, and calls
  application/repository boundaries rather than transport adapters.
- Composition is the only feature layer that wires concrete Core/data dependencies.
- Cross-owner imports use curated `index.ts` APIs and the dependency allowlist in
  `mobile-react/scripts/module-boundaries.mjs`. Do not recreate `src/features` or
  `src/layouts`, broad barrels, or direct imports of another owner's internals.

## Keep routing, access, and contracts aligned

- Add the physical Expo Router file, typed `ROUTES` entry, RBAC route-manifest rule,
  module definition/navigation metadata, breadcrumb chain, and route guard as one
  coherent change.
- The server module catalog and permissions remain authoritative. Client registry
  metadata only describes what this build can present; it never grants access.
- Unknown authenticated routes fail closed. Hidden navigation is not authorization.
  Guard the route and direct mutation handler as well as visible actions.
- After adding or moving a route or endpoint, run `npm run sync:contracts`, review
  the generated compatibility entry, and run `npm run check:contracts`. Every
  physical route and exported endpoint leaf needs an aligned owner, scope,
  permission authority, offline policy, HTTP behavior, and real caller.
- Application navigation uses the matching Expo Router 57 entry points. Do not
  import external `@react-navigation/*` packages directly.

## Reuse native UI and form contracts

Search `mobile-react/src/shared/components/`, shared listing utilities, and the
selected reference before creating or changing a screen, form, modal, table, card,
filter, toolbar, pagination control, feedback state, chart, tree, or layout.

- Use shared primitives such as `AppScreen`, `AppPageHeader`, `AppListScreen`,
  `AppMultiView`, `AppDataTable`, `AppDataCard`, `AppForm`, approved shared fields,
  `AppStateView`, dialogs, chart primitives, and `AppSpreadsheetImportView` when
  their contracts fit.
- Extend a close shared component with a generic backward-compatible option and
  focused tests before creating a parallel local shell. Keep business vocabulary,
  API behavior, permissions, and query state inside the feature.
- Forms use React Hook Form, `zodResolver`, feature-owned Zod validation, named
  domain/form/request mappers, and the shared `AppForm`/field system. Preserve dirty
  protection, entered data on recoverable errors, server field errors, first-invalid
  focus, keyboard and safe-area behavior.
- Use `AppFormSection`, `AppFormTabs`, or `AppFormStepper` only according to the
  selected screen contract. Keep one form context for one aggregate unless the
  approved workflow defines separate saves.
- Server-managed lists use one controlled `useServerListState`, one server query,
  zero-based UI to one-based API mapping, shared list/table/card/pagination states,
  stable selection, and server-side search/filter/sort. Do not slice a server page
  locally and present it as the complete result.

## Protect data, offline, locale, and device behavior

- Accept API responses as `unknown` and parse them with the owning remote Zod schema.
  Required fields fail closed; compatibility fallback is explicit and limited to
  optional fields. Screens never call `apiService` or `axiosClient`.
- Ordinary writes are online-authoritative and must never become a synthetic
  success or implicit in-memory queue. Persisted replay exists only for a registered,
  safety-certified outbox command with scope, idempotency/concurrency, reconciliation,
  restart, retry, conflict and uncertain-outcome rules.
- Offline capability policy fails closed. Central tenant/company policy can narrow
  only the modes declared safe in code; cached policy and device preferences never
  expand authority. Partition durable records, drafts, cursors and commands by the
  authenticated user/tenant/company scope.
- Use encrypted SQLCipher SQLite for durable business data and SecureStore for
  session/database secrets. Do not store business truth or tokens in AsyncStorage.
- Authentication and company changes abort old-scope requests, clear React Query
  state, and protect dirty forms. Cached/offline UI never authorizes server replay.
- Add English and Arabic keys together in paired feature resource modules; keep
  `en.ts` and `ar.ts` composition-only. Use live localization direction, logical
  styles, directional icons, semantic theme tokens, and shared typography.
- Preserve at least 44x44 touch targets, screen-reader labels/states, text scaling,
  safe areas, keyboard access, phone/tablet and orientation behavior, and all theme
  palettes in light/dark/system modes.
- Required native Import uses Expo/native picker and filesystem behavior with exact
  file, parser, size, row, header and envelope constraints. Managed reports use the
  shared Reporting boundary and never call the Crystal host directly.

## Finish with evidence

Add focused tests for domain/application rules, API schemas and request mapping,
repositories/offline policy, list state, permission/read-only behavior, mutations
and invalidation, routes/contracts, forms/screens, i18n, optional views, and any
shared change. Run the narrowest tests first, then the proportional/full gates in
[feature-workflow.md](references/feature-workflow.md). Device behavior requires
device/simulator evidence; Jest, TypeScript, export, or a web preview does not prove
native sign-in, switching, file, keyboard, secure storage, SQLCipher, or background
behavior.

Update the owning canonical Mobile profile and affected API/Web/cross-platform books,
required-file manifest, recipe registration, and generated phases in the same change
when evidence or decisions changed. Never create `mobile-react/docs/` and never edit
`documentation/system/generated/` directly. At handoff distinguish feature
regressions, inherited failures, environment blockers, release credentials/device
checks, and production-only evidence. Do not claim Mobile completion while a
Required native journey or live API/schema verification remains untested.
