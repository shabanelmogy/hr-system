# ERPSYSTEM Web Feature Workflow

Use this reference for any Web source, route, API contract consumer, screen, shared
component, localization, test, or canonical documentation change. It is an
execution aid; canonical plans and frontend/system guides remain authoritative.

## 1. Preflight and relationship trace

From the repository root:

```powershell
git status --short
graphify query "Which Web owner, routes, services, queries, shared components, API contracts, tests, and documentation are connected to <requested behavior>?"
./documentation/system/Generate-Documentation.ps1 -Check
```

Read:

- `web-next/AGENTS.md`;
- `documentation/web-next/architecture/frontend-architecture-reference.md`;
- the local Next.js 16.3.5 documentation for the framework behavior involved;
- the owning module package and feature Web/API/Mobile/cross-platform profiles;
- the exact current route, public index, page/controller, service, query keys,
  types, shared consumers, translations, tests, and worktree edits;
- `server-managed-feature-reference.md` when list/CRUD behavior is in scope;
- the screen pattern and shared reuse catalogs before UI implementation.

For a read-only review, do not mutate source or documentation unless the user also
requested changes. Record verified behavior, requested behavior, intentional
platform differences, and unresolved findings separately.

## 2. Select the documentation mode

### New capability or substantial rebuild

Do not start runtime work from a feature name alone. The exact authorized scope
needs:

1. A registered Plan/Slice with the gates required for that slice satisfied.
2. A completed Feature Decomposition Gate and version 2.0 Screen/Workflow Contract.
3. A selected screen Pattern ID or an explicitly unresolved Candidate that blocks
   UI implementation.
4. Explicit Web and Mobile `Required`/`Deferred`/`Excluded` decisions for every
   optional capability.
5. A feature documentation scaffold created from the repository root:

```powershell
./documentation/system/New-FeatureDocumentation.ps1 `
  -FeatureId <feature-id> `
  -FeatureName "<feature name>" `
  -PlanId <plan-id> `
  -SliceId "<exact authorized slice>" `
  -Module <module-slug>
```

Use `-ReferenceFeature` only after confirming the reference matches the workflow.
During Phase 00, register only evidence that already exists. Do not add future
runtime paths to `required-files.json`.

### Existing-feature review

Begin from the final required-file manifest, applied profiles, current source, and
tests. Collect evidence read-only by default. A generated packet can point to a
source but cannot prove that the behavior remains current.

### Existing-feature change

Preserve or explicitly revise the frozen contract, implement the bounded change,
update the evidence surface, and reconcile the smallest complete generated phase
set defined by `documentation/system/README.md`. Update API and Mobile profiles when
wire contracts, permissions, lifecycle, fields, views, or platform parity change.

## 3. Define the user and API contract

Before choosing components, write down:

- actor and goal;
- owner/module and relationship to existing behavior;
- route, navigation entry, module definition, permission and entitlement;
- tenant/company/global scope and read-only behavior;
- API list/detail/lookup/create/update/lifecycle/report/import contracts;
- server paging, filters, sort allowlist, defaults, concurrency and error outcomes;
- Pattern ID and source files reviewed on Web and Mobile;
- Required/Deferred/Excluded status for Grid/Table, Cards, Chart, Report, Import,
  Export, Tree, Detail, and mock data;
- loading, empty, error, forbidden, dirty, conflict and uncertain states;
- responsive, accessibility, EN/AR and RTL expectations;
- tests and evidence needed for acceptance.

If a required API behavior is absent or ambiguous, stop at the contract boundary and
record the dependency. Do not simulate server rules in the client or declare a
contract complete from a TypeScript type alone.

## 4. Inventory shared and reference behavior

Search current source before creating UI:

```powershell
rg --files web-next/src/shared/components
rg --files web-next/src/modules web-next/src/platform web-next/src/shell
rg -n "<matching component, hook, route, or behavior>" web-next/src
```

Inspect the selected reference's actual page/controller, query mapper, service,
types, permission helpers, Grid/Card/other view composition, forms/dialogs, tests,
translations, module definition, route adapter, and documentation profile.

Decision order:

1. Reuse an existing shared/public contract unchanged.
2. Add a generic backward-compatible capability to the existing shared component,
   with focused contract tests and affected-consumer checks.
3. Keep domain-specific composition inside the owning feature.
4. Add a new shared component only when the behavior is domain-neutral and its API,
   accessibility, RTL, loading/error state, compatibility, and tests are documented.

Never copy the appearance of a reference while replacing its list state, toolbar,
pagination, feedback, dirty-state, validation, or permission behavior.

## 5. Implement boundaries from contracts to UI

### Types and boundary conversion

- Define distinct list row, detail, lookup, create, update, query and page contracts
  as required by the API.
- Accept untrusted values as `unknown` and parse/narrow them. Do not add `any` or
  conceal drift with assertions.
- Create named pure mappers for API query/body normalization and domain-to-form/
  form-to-request conversion.
- Preserve nullable and optional semantics. Never replace a missing required field
  with an empty string, zero, or fabricated default.

### Service and query layer

- Keep feature API calls in `services`; visual TSX never calls `apiService`.
- Map zero-based UI pages to one-based API pages once at the boundary.
- Use stable hierarchical query keys and narrow invalidation after mutations.
- Keep detail and lookup queries separate from list rows when their contracts differ.
- Preserve cancellation, Problem Details, same-origin proxying and auth/scope
  transitions from the shared client.
- Register realtime invalidation using stable public key prefixes.

### Page/controller and list state

- Put orchestration in a controller hook and keep rendering components declarative.
- Use one `useServerListState` for all views of the same server result.
- Reset page zero for search/filter/sort/page-size changes.
- Expose every server criterion in the UI with a reset path.
- Do not locally filter, sort, or paginate a server page as though it were the full
  dataset.
- Compose shared loading, empty, error, toolbar, Grid/Card, pagination, selection,
  lifecycle and feedback behavior.

### Forms and mutations

- Put reusable feature schemas and inferred form types in `validation/` or an
  approved feature validation utility.
- Use React Hook Form, `zodResolver`, `MyForm`, shared fields and form layouts.
- Keep the primary submit action enabled; validate on submission, show specific
  messages below fields, and focus the first invalid field.
- Map server field errors and preserve entered data on recoverable failures.
- Register dirty state and request shared discard confirmation before closing or
  application-owned navigation.
- Guard mutation handlers for permission/read-only state even when controls are
  hidden or disabled. Keep confirmation dialogs open on failure.
- Disable duplicate submissions while pending, but do not disable the action merely
  because the form is currently incomplete.

### Optional views

- Chart: use shared chart primitives and distinguish loaded-page metrics from
  authoritative totals. Add an aggregate endpoint for global analytics.
- Report: use the Reporting public API and the correct global/tenant availability
  policy. Keep Report independent of list pagination.
- Import: enforce exact file/header/row/envelope/atomicity rules, permissions and
  read-only checks. Treat ambiguous submission as uncertain and reconcile.
- Tree: reuse shared tree/split layout. Use `framer-motion` plus an accessible direct
  move action only when a real API hierarchy-move contract exists.
- Export/heavy tooling: load on demand and verify bundle impact.

## 6. Routes, modules, permissions, and localization

When adding or moving a route:

1. Place the App Router adapter in the declared owner route group.
2. Import only the owner's public API and keep the adapter thin.
3. Update the owning module definition, route requirements and Shell navigation as
   applicable.
4. Keep route guard, navigation visibility, module entitlement and permission rules
   aligned without merging them into one implicit check.
5. Regenerate the architecture manifest when ownership/route evidence changes.

Add all visible text, error copy, accessibility labels, optional-view names and
confirmation wording to both English and Arabic catalogs. Use translation keys in
the owner and rely on shared theme/logical layout for RTL.

## 7. Full-stack parity audit

For any domain contract change, check both Web and Mobile:

1. Creation: every new field/collection/flag has a dedicated input control.
2. Editing: structured data loads and saves without loss.
3. Viewing: structured values have a readable detail presentation.
4. Listing/filtering: relevant state appears in Grid/Card and filters where required.
5. Mock data: generators create realistic schema-valid drafts without persisting or
   fabricating trusted scope/identity/concurrency values.

If another platform is Deferred or Excluded, record the canonical reason, owner and
reopening trigger where required. Do not use an absent platform surface as a silent
scope reduction.

## 8. Testing and verification

Run focused tests first. Typical targeted checks from `web-next/` are:

```powershell
npm.cmd run test -- --run <affected-test-file>
npm.cmd run type-check
npm.cmd run check:architecture
```

For a changed Web feature, run:

```powershell
npm.cmd run check
```

`npm run check` covers architecture, governance, release contracts, i18n, lint and
strict TypeScript. Add the proportional gates below when the change affects them:

```powershell
npm.cmd run test:module-generator
npm.cmd run test:coverage
npm.cmd run build
npm.cmd run measure:build
```

- Run architecture and module-generator checks for route/owner/module/public-boundary
  work.
- Run coverage for feature/shared runtime behavior.
- Run production build and measurement for route roots, providers, dependencies,
  dynamic imports, bundle/performance, configuration, or release work.
- Run Playwright or equivalent browser evidence for high-risk interactive journeys;
  a component test does not prove browser history, focus, file, or navigation behavior.
- Do not start a development server merely to validate static code.

From the repository root, finish documentation/evidence checks:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
git diff --check
```

When planning registries or central notes changed, also run:

```powershell
./documentation/plans/Check-Planning.ps1
```

## 9. Documentation and handoff

In the same change, update every owner affected by the result:

- owning module package and feature catalog;
- Web implementation profile;
- API and Mobile profiles when contracts or parity decisions changed;
- cross-platform review/guide;
- required-file manifest and feature-scoped recipes when evidence changed;
- central `PROD-*`, `DEF-*`, `RISK-*`, `FOLLOW-*`, or `DEC-*` note for material
  deferred/release/open work;
- regenerated phases from canonical inputs.

Never edit generated packets directly or create a project-local documentation tree.
At handoff report exact focused/full checks, browser/manual evidence, feature
regressions, inherited failures, environment blockers, and production-only checks.
Do not call a feature complete because types compile while a Required UI journey,
API behavior, Mobile decision, or release gate remains unresolved.
