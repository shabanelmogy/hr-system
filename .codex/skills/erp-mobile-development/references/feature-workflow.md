# ERPSYSTEM Mobile Feature Workflow

Use this reference for any Mobile source, route, endpoint, screen, offline behavior,
shared component, localization, native configuration, test, or canonical
documentation change. It is an execution aid; canonical plans and Mobile/system
guides remain authoritative.

## 1. Preflight and relationship trace

From the repository root:

```powershell
git status --short
graphify query "Which Mobile owner, routes, endpoints, layers, shared components, offline policies, tests, and documentation are connected to <requested behavior>?"
./documentation/system/Generate-Documentation.ps1 -Check
```

Read:

- `mobile-react/AGENTS.md`;
- `MOBILE_ARCHITECTURE.md` and `MOBILE_FEATURE_GUIDE.md`;
- all of `MOBILE_STYLE_GUIDE.md` for any UI/style work;
- official documentation for the exact installed Expo SDK 57 / React Native 0.86
  API involved;
- the owning module package and feature Mobile/API/Web/cross-platform profiles;
- current routes, typed routes, route manifest, module definition, public index,
  domain/application/data/composition/presentation source, translations and tests;
- the compatibility matrix entries for every affected physical route/endpoint;
- the Pattern ID and actual Mobile/Web reference sources before UI implementation.

For a read-only review, do not mutate source or documentation unless the user also
requested changes. Record verified behavior, requested behavior, intentional
platform adaptations, and unresolved findings separately.

## 2. Select the documentation mode

### New capability or substantial rebuild

The exact authorized scope needs:

1. A registered Plan/Slice with its required gates satisfied.
2. A completed Feature Decomposition Gate and version 2.0 Screen/Workflow Contract.
3. A selected screen Pattern ID, or an unresolved Candidate that blocks UI coding.
4. Explicit Mobile and Web `Required`/`Deferred`/`Excluded` decisions for each
   optional capability and an operation-by-operation offline decision.
5. A feature scaffold created from the repository root:

```powershell
./documentation/system/New-FeatureDocumentation.ps1 `
  -FeatureId <feature-id> `
  -FeatureName "<feature name>" `
  -PlanId <plan-id> `
  -SliceId "<exact authorized slice>" `
  -Module <module-slug>
```

Use `-ReferenceFeature` only when its workflow and risks genuinely match. Register
only evidence that already exists during Phase 00; future runtime paths do not
belong in the initial required-file manifest.

### Existing-feature review

Begin from the final required-file manifest, applied profiles, current source,
contract matrix and tests. Collect evidence read-only by default. A type, route,
unused component, or generated packet does not prove a working native journey.

### Existing-feature change

Preserve or explicitly revise the frozen contract, implement the bounded change,
update the evidence surface, and reconcile the smallest complete phase set defined
by `documentation/system/README.md`. Update API and Web profiles when wire contracts,
permissions, lifecycle, fields, views, or parity decisions change.

## 3. Define the feature and device contract

Before choosing folders or components, write down:

- actor, goal, owner/module and relationship to existing behavior;
- physical route, typed route, navigation, breadcrumb, module and RBAC policies;
- permissions, entitlement, tenant/company/global scope and read-only behavior;
- API list/detail/lookup/create/update/lifecycle/report/import contracts;
- response schemas, paging, filters, sort vocabulary, defaults, concurrency,
  idempotency, validation, error and uncertain outcomes;
- Pattern ID and exact reference files inspected on Mobile and Web;
- Required/Deferred/Excluded views and realistic mock-data behavior;
- code-supported and centrally allowed offline mode for every read/write operation;
- durable scope, freshness, retention, replay, conflict and reconciliation rules;
- loading, empty, error, forbidden, dirty, conflict, pending/syncing/failed/uncertain
  states;
- phone/tablet, orientation, safe-area, keyboard, accessibility, EN/AR, RTL,
  text-scaling and light/dark/system expectations;
- tests, export/prebuild and device evidence needed for acceptance.

If the API lacks a safe replay, concurrency, aggregate, idempotency, scope, report,
or import contract required by the journey, stop at the contract boundary. Do not
invent client authority or synthetic success.

## 4. Inventory shared and reference behavior

Search current source before creating UI or infrastructure:

```powershell
rg --files mobile-react/src/shared/components mobile-react/src/shared
rg --files mobile-react/src/modules mobile-react/src/platform mobile-react/src/shell
rg -n "<matching component, hook, route, endpoint, or policy>" mobile-react/app mobile-react/src
```

Inspect the selected reference's physical routes, typed routes, route manifest,
module definition, public API, screen/controller, use cases, repositories, remote
schemas/endpoints, optional local adapter, permissions, shared composition, tests,
translations, compatibility matrix and documentation profile.

Decision order:

1. Reuse an existing shared/public contract unchanged.
2. Add a generic backward-compatible option to the existing shared component, with
   focused contract tests and affected-consumer checks.
3. Keep domain-specific composition and styling inside the owning feature.
4. Add a new shared component only when behavior is domain-neutral and its API,
   accessibility, tokens, RTL, device states, compatibility and tests are owned.

Do not copy a reference's appearance while dropping its controlled list state,
permission guards, dirty-state behavior, validation, feedback, offline policy or
native states.

## 5. Implement inside-out, then compose

### Domain

- Model pure business values, invariants, lifecycle and repository/clock/ID ports.
- Do not import UI, Expo, transport, React Query, SQLite or Core infrastructure.
- Keep trusted scope, server identity and concurrency semantics explicit.

### Application

- Add UI-neutral use cases over narrow ports.
- Express orchestration and outcomes without React/React Native/Expo/Axios/React
  Query types.
- Keep online/offline intent explicit; application code never treats transport
  failure as success.

### Data remote boundary

- Define endpoint constants and exact request/query mapping.
- Request `unknown`, parse with owning Zod response schemas, and map to domain data.
- Include contract-valid and malformed fixtures. Required fields fail closed;
  optional compatibility fallback is narrow and tested.
- Keep a parent ID in a parent filter; use the selected child ID for child detail and
  mutation routes. Test them with distinct values.

### Data local and repository boundary

- Add local SQLite only for an explicitly approved offline capability.
- Partition every durable row/cursor/draft/command by authenticated scope.
- Repository behavior resolves the code safety ceiling, fresh central policy and any
  narrowing device preference. Missing or invalid inputs resolve to `online-only`.
- For offline commands, atomically persist local state and outbox command, carry
  idempotency/concurrency evidence, reconcile ambiguous/409 outcomes, stop on real
  conflicts, and cover restart, retry, dead-letter, retention and scope switch.
- Never turn a normal React Query mutation into an implicit queue.

### Composition and presentation

- Wire concrete adapters only in `composition`.
- React Query controllers call application/repository boundaries and own stable keys,
  enabled conditions, server state and narrow invalidation.
- Screens orchestrate shared UI and feature components; they do not call transport or
  remote adapters.
- Put feature response parsing in data/remote and form validation in feature
  validation/presentation; do not reuse one schema accidentally for both purposes.

## 6. Lists, forms, and optional views

### Server-managed lists

- Use one controlled `useServerListState` and one query for all views.
- Convert UI page zero to API page one at the boundary.
- Reset page and controlled selection for relevant search/filter/sort/page-size
  changes.
- Give every server criterion a visible control and reset path.
- Compose `AppListScreen`, `AppMultiView`, `AppDataTable`, `AppDataCard`, shared
  pagination, loading/empty/error and permission/read-only states.
- Do not locally re-filter a server page or make a table inside `AppMultiView` own a
  second pager.

### Forms and mutations

- Use React Hook Form, `zodResolver`, a feature-owned schema and named domain/form/
  request mappers.
- Reuse a list row for edit only if it contains every mutable field; otherwise fetch
  detail and block editing during detail loading/error.
- Preserve entered values after recoverable failures and map server field errors.
- Check tenant read-only before permission denial so the explanation is accurate.
- Guard the direct mutation handler as well as buttons; keep confirmation open on
  failure and prevent duplicate pending submissions.
- Use one `AppForm` context for an aggregate. Preserve dirty close/Android-back
  protection, first-invalid focus, keyboard avoidance and bottom safe areas.
- A local mock-data action fills a realistic schema-valid draft only; it never
  submits, persists, or fabricates server identity, scope, lookups or row versions.

### Chart, Report, Import and Tree

- Chart: use shared primitives, suitable shapes and text meaning. Distinguish loaded
  page metrics from total matching count; global analytics needs an aggregate API.
- Managed Report: use Platform Reporting schemas/repository/viewer, correct global
  or tenant gate, no list pager, and native PDF open/share/error behavior.
- Native Import: use Expo picker/filesystem APIs, approved `.xlsx`, bounded file and
  row sizes, exact headers/envelope, value-only safe parsing, preview/cancel/failure/
  uncertain states and native interruption evidence. Never use DOM APIs.
- Tree: use `AppHierarchicalTree` and a phone-appropriate stacked/detail journey.
  Reparent/reorder needs an explicit API validation/concurrency contract.

## 7. Routes, modules, localization, and styles

For a route or endpoint change:

1. Add/update the physical Expo route and thin adapter.
2. Update typed `ROUTES` and dynamic builders.
3. Update route manifest access and drawer metadata.
4. Update module definition/registration and breadcrumb parent chain where relevant.
5. Keep `RouteGuard` and direct handler checks.
6. Run `npm run sync:contracts`, review the diff, then `npm run check:contracts`.

Do not place tests in `app/`.

Add English and Arabic keys together in paired, feature-grouped resource modules;
keep the `en.ts`/`ar.ts` facades composition-only. Generic shared feedback uses its
shared namespace, never a feature key fallback. Use `t(...)` for visible copy and
accessibility labels.

For style work, follow the complete style guide:

- semantic Core theme tokens and `AppText`;
- invariant colocated `StyleSheet.create` rules;
- dynamic theme/direction/state/dimension values in render or a small memoized
  factory;
- logical spacing, live direction and directional icons;
- safe-area ownership at screen/modal boundaries;
- measured responsive layout rather than device-name checks;
- at least 44x44 touch targets, semantic roles/states, text scaling and contrast;
- phone/tablet, portrait/landscape, EN/AR, RTL and all light/dark/system palettes.

## 8. Full-stack parity audit

For a domain contract change, verify both Web and Mobile:

1. Creation: dedicated controls can enter every new collection, relationship or flag.
2. Editing: structured data loads and saves without loss.
3. Viewing: structured values render as readable native content.
4. Listing/filtering: relevant state is visible in Table/Card and filters when
   required.
5. Mock data: generators create realistic valid drafts without fabricating trusted
   data or persisting.

Record an intentionally absent platform journey as Required, Deferred, or Excluded
with the canonical owner/reopening trigger where required. Do not treat an updated
TypeScript type or unused route/component as completed UI.

## 9. Testing and verification

Run focused tests first from `mobile-react/`:

```powershell
npm.cmd test -- <affected-test-file> --runInBand
npm.cmd run typecheck
npm.cmd run check:architecture
npm.cmd run check:contracts
```

For a changed Mobile feature, run the full repository quality gate:

```powershell
npm.cmd run check
```

This covers strict TypeScript, ESLint, architecture, route/API contracts, i18n,
foundation checks and coverage. For full feature handoff, also run:

```powershell
npm.cmd run check:expo
npm.cmd run check:export
```

Add proportional release/native checks:

```powershell
npm.cmd run check:native-config
npm.cmd run check:dependencies
npm audit --omit=dev --audit-level=moderate
```

- Run native-config for dependency/configuration, SQLCipher, backup or prebuild
  changes.
- Run dependency audit when packages or overrides change.
- Use `npx expo install --fix` to align Expo packages; do not force/downgrade packages
  merely to silence Expo Doctor.
- Record device/simulator evidence for direct navigation, sign-in, tenant/company
  switching and critical business workflows. Exercise phone/tablet, orientation,
  keyboard/safe area, EN/AR, RTL and theme modes relevant to the change.
- Required import/report/offline/file/background behavior needs representative native
  evidence. Expo web, Jest or an Android export alone is insufficient.
- EAS/store checks require real project/account/signing inputs; never commit a fake
  release project ID. Report unavailable release inputs as environment blockers.

From the repository root, finish with:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
git diff --check
```

When planning registries or central notes changed, also run:

```powershell
./documentation/plans/Check-Planning.ps1
```

## 10. Documentation and handoff

In the same change, update every owner affected by the result:

- owning module package and feature catalog;
- Mobile implementation profile;
- API and Web profiles when contracts or parity decisions changed;
- cross-platform review/guide and screen pattern/shared catalog when the reusable
  shape changed;
- compatibility matrix and required-file manifest;
- feature-scoped recipes and regenerated phases when evidence changed;
- central `PROD-*`, `DEF-*`, `RISK-*`, `FOLLOW-*`, or `DEC-*` note for material
  deferred/release/open work.

Never edit generated packets directly or create a project-local documentation tree.
At handoff report exact focused/full checks, device/native evidence, feature
regressions, inherited failures, environment blockers, release credentials/manual
checks, and remaining central notes. Do not call the feature complete because Jest
or TypeScript passed while native behavior, live API/schema, Web parity, or a
Required journey remains unresolved.
