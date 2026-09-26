---
name: erp-web-development
description: Use when analyzing, reviewing, debugging, implementing, refactoring, testing, or documenting the ERPSYSTEM Next.js frontend under web-next. Covers App Router adapters, modular ownership, shared UI and form contracts, React Query/API services, permissions and scope, i18n/RTL, reports/imports/realtime, performance, and frontend verification. Do not use for API-only work, the legacy web/ client, or mobile-react work.
---

# ERPSYSTEM Web Development

Use this skill only in the ERPSYSTEM workspace. Confirm the repository with
`web-next/package.json` and `documentation/web-next/`, and inspect current source
before relying on examples because the frontend and its canonical documentation
evolve together. `web-next/` is the supported frontend; do not implement new work
in the legacy `web/` application.

This skill is a navigation and execution layer over the project documentation; it
does not replace that documentation. Approved plans and canonical guides own intent
and architecture. Current source, configuration, tests, generated manifests, and
runtime evidence prove implementation. Treat a conflict between documentation and
current evidence as a finding to reconcile through the documented workflow.

## Load the right context

- Always read [architecture-map.md](references/architecture-map.md) before web
  analysis, review, debugging, design, or implementation work.
- For any source, route, contract, UI, localization, test, or web documentation
  change, also read [feature-workflow.md](references/feature-workflow.md).
- Read `web-next/AGENTS.md` and
  `documentation/web-next/architecture/frontend-architecture-reference.md` before
  changing frontend code. For a server-managed feature, also read
  `documentation/web-next/features/server-managed-feature-reference.md`.
- Before creating or rebuilding a screen, read
  `documentation/project/SCREEN_PATTERN_CATALOG.md` and
  `documentation/project/SHARED_REUSE_CATALOG.md`, select the actual matching
  Pattern ID, and inspect its registered Web and Mobile references.
- For a new capability or substantial rebuild, read `documentation/plans/README.md`,
  the exact approved Plan/Slice and version 2.0 feature execution contract,
  `documentation/plans/PLAN_QUALITY_GATE.md`, and `documentation/system/README.md`
  before runtime work.
- For an existing registered feature, start from
  `documentation/system/features/<feature>/required-files.json`, the applied
  cross-platform/API/Web/Mobile books, and only the generated phases relevant to
  the requested change. Generated packets are navigation aids, not authored truth.
- Before changing Next.js behavior, read the installed Next.js 16.3.5 documentation
  under `web-next/node_modules/next/dist/docs` for the exact API involved. Use
  official upstream documentation if the local package documentation is absent.
- When `graphify-out/graph.json` exists, begin codebase investigation with a focused
  `graphify query "<question>"`; use `graphify path` or `graphify explain` for a
  narrower relationship. Do not modify `graphify-out/` unless requested.
- Inspect `git status --short`, the owning feature, its public exports, its routes,
  its tests, and current worktree edits before editing. Preserve unrelated changes.

## Establish ownership and the user contract

Before editing a route or component, establish:

1. The owning business module or Platform/Shell capability and its public API.
2. The actor, route, permission, module entitlement, tenant/company scope, and
   read-only behavior.
3. The exact API list/detail/lookup/create/update/lifecycle contracts and their
   paging, sorting, validation, concurrency, and error semantics.
4. The selected screen Pattern ID and Web/Mobile status for every optional surface:
   Grid/Table, Cards, Tree, Detail, Chart, Report, Import, Export, or another view.
5. Required loading, empty, error, forbidden, dirty, conflict, responsive, RTL,
   accessibility, and realistic mock-data behavior.
6. The current feature evidence, affected consumers, tests, documentation, and
   whether the requested scope authorizes all required cross-platform changes.

Do not infer product scope from Countries, States, or another reference. A reference
supplies implementation shape only. Every optional capability remains independently
`Required`, `Deferred`, or `Excluded` for Web and Mobile in the owning contract.

## Preserve frontend boundaries

Use the established dependency direction:

```text
src/app route adapter -> module/platform/shell public API
feature page/component -> controller hook -> React Query hook
React Query hook -> feature service -> shared API client -> same-origin BFF -> API

shell -> platform public APIs + shared
modules -> allowed public owner APIs + shared
platform -> shared
shared -> lib/config/theme only
lib -> config
```

- Keep App Router pages and layouts thin. They compose guards/layouts and import
  curated public APIs; they do not own business queries, forms, or API calls.
- Keep API-facing contracts in feature `types`, transport calls in feature
  `services`, query keys/cache/mutations in hooks, and visual composition in pages
  and components. Never call `apiService` from a visual component.
- Import across owners only through curated public `index.ts` APIs and only when
  `web-next/scripts/module-boundaries.mjs` permits the dependency. An allowed owner
  dependency never permits importing another owner's internals.
- Do not create broad barrels, dependency cycles, duplicate DTOs, `any`,
  `@ts-ignore`, or chained `as unknown as` casts. Parse or narrow untrusted data.
- Keep module metadata, route prefixes, navigation, dependencies, namespaces, and
  entitlement presentation in the registered module definition/Platform policies;
  never let a UI module definition grant server access.

## Reuse the shared experience

Search `web-next/src/shared/components/` and the selected reference before creating
or changing a screen, form, dialog, list, grid, card, filter, toolbar, pagination,
feedback state, tree, chart, or layout. Reuse the existing component when its
contract fits. If it is close, add a generic backward-compatible option and focused
tests before creating a parallel look-alike. Keep business rules in the feature.

- Forms use React Hook Form with `zodResolver`, a feature-owned Zod schema, shared
  `MyForm`, `FormContainer`, `FormHeader`, `FormContent`, `FormFooter`, and approved
  shared fields such as `MyTextField` and `MySelect`.
- Keep Save/Create enabled until submission. On submit, show each validation error
  beneath its field and focus the first invalid field through the shared form
  system. Map server field errors back to the relevant shared field.
- Preserve shared dirty-state/discard protection. Do not use browser-native
  validation, `alert`, or `confirm` for application workflows.
- Server-managed lists use one controlled `useServerListState`, stable query
  mapping, server paging/filtering/sorting, shared `PageHeader`, `MyDataGrid`, card
  scaffold, pagination, and loading/empty/error states. UI pages are zero-based;
  convert to one-based API pages at the boundary.
- Use shared chart, managed-report, spreadsheet-import, tree, and feedback contracts
  when those surfaces are Required. Do not fetch all rows to simulate server
  analytics or silently convert a current page into a global result.
- Interactive tree/canvas drag-and-drop uses `framer-motion`, O(1) target/ancestor
  checks during movement, isolated inner controls, and an accessible direct Move
  action. Do not use HTML5 native drag-and-drop for these interactions.

## Protect runtime, security, and locale behavior

- Preserve same-origin BFF transport, centralized Problem Details handling, request
  scope rotation, and React Query cache isolation during auth/company transitions.
- Treat route visibility, module entitlement, named permission, tenant/company
  access, and read-only state as separate client decisions. Direct mutation handlers
  must guard the same policy as the visible control; the API remains authoritative.
- Keep query keys hierarchical and stable, invalidate the narrowest correct prefix,
  and register realtime invalidation through public stable keys rather than private
  hooks. Realtime accelerates refresh; it is not the source of truth.
- Add every visible string to both English and Arabic catalogs, use
  `useTranslation`, and preserve RTL through theme/shared components and logical
  layout rather than directional patches.
- Keep first-paint dependencies static and load interaction-only forms, dialogs,
  optional heavy views, and export tooling on demand. Mount lazy UI only when used.
- When a domain contract introduces structured children, flags, or relationships,
  implement the dedicated create, edit, view, list/filter, and mock-data journeys;
  do not leave a flat text field or require users to type JSON.

## Finish with evidence

Add focused tests for mapping, list state, permissions/read-only policy, forms,
server errors, mutations/invalidation, optional views, and shared behavior changed.
Run the narrowest relevant tests first, then the proportional gates in
[feature-workflow.md](references/feature-workflow.md). Run `npm run check` for a
changed feature; run build/measurement and broader tests when the runtime boundary,
bundle, route ownership, shared infrastructure, or release contract changes.

Update the owning canonical Web profile and every affected API/Mobile/cross-platform
book, required-file manifest, recipe registration, and generated phase packet in
the same change when evidence or decisions changed. Never create `web-next/docs/`
and never edit `documentation/system/generated/` directly. At handoff distinguish
feature regressions, inherited failures, environment blockers, and manual/release
checks. Do not claim a browser, production build, or cross-platform journey was
verified when it was not run.
