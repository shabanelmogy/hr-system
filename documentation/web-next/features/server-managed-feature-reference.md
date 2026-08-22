# Server-Managed Feature Frontend Reference

Status: Canonical guide for new server-managed master-data and business features in `web-next`.

Use this guide for features such as countries, states, departments, positions,
employees, leave requests, or other capabilities that own a paged server list
and one or more lifecycle mutations. It complements the
[Frontend Architecture Reference](../architecture/frontend-architecture-reference.md),
which remains authoritative for dependency direction, routing, and naming.

Do not force this pattern onto static pages, dashboards, local-only forms, or
analytics screens that do not have a server-managed collection.

## 1. Define the Feature Before Coding

Record these decisions first. Unknown values are contract gaps, not frontend
implementation details to guess.

| Decision | Required answer |
|---|---|
| Business owner | Domain and feature directory |
| Public routes | List, detail, and any child routes |
| API routes | Collection, lookup, detail, lifecycle, bulk actions |
| Identifier | Type and route representation |
| Tenant/company scope | How data isolation is enforced |
| Transport types | List, detail, lookup, create, update, query, page response |
| Permissions | View/create/edit/delete and domain-specific actions |
| Lifecycle | Active/archive/restore, status transitions, dependency rules |
| List contract | Search, filters, sort fields, default sort, page-size limits |
| Error contract | Stable codes, statuses, field errors, conflict behavior |
| Views | Required Grid; mark every optional view Required, Deferred, or Excluded with its data scope and contract |
| Cross-feature consumers | Deliberate public lookup or type APIs |

The backend owns authorization, tenant isolation, invariants, uniqueness, and
the authoritative list order. The frontend owns presentation, client validation,
interaction state, and clear error recovery.

## 2. Ownership and Directory Structure

```text
src/features/<domain>/<feature>/
  pages/                 # Route-level feature composition
  components/            # Feature-owned UI
    grid-view/            # Grid columns, row actions, feature filters
    card-view/            # Optional feature cards
  hooks/                 # Query orchestration and controller hooks
  services/              # HTTP boundary and transport normalization
  types/                 # Transport, form, query, and view types
  utils/                 # Pure mapping, validation, permission rules
  index.ts               # Deliberate cross-feature public API only
```

Keep App Router `page.tsx` files thin. A feature may import shared primitives,
infrastructure, configuration, theme, and its own modules. Other features must
use its deliberate `index.ts` API. Do not export forms, services, mutations, or
internal view components without a real external consumer.

Move code to `shared` only after at least two real consumers prove a stable,
domain-neutral API. Similar-looking domain rules are not automatically reusable.

## 3. Canonical Request Flow

```text
App Router page
  -> FeaturePage
    -> useFeatureController
      -> useServerListState
      -> toFeaturePageQuery
      -> feature query/mutation hooks
        -> FeatureService
          -> centralized apiRoutes
            -> API
```

Each layer has one responsibility:

| Layer | Responsibility |
|---|---|
| Route adapter | Metadata and rendering the public feature page |
| Feature page | Compose views, forms, dialogs, and persistent query errors |
| Controller hook | Coordinate list state, permissions, queries, mutations, and dialogs |
| Query hooks | Query keys, cache policy, mutations, and invalidation |
| Service | HTTP calls and transport normalization |
| Pure utilities | Map criteria, normalize requests, evaluate deterministic rules |
| View components | Render state and emit typed user intentions |

Never call the API directly from a Grid, Card, form, column definition, or dialog.

## 4. Model the Transport Boundary Exactly

Prefer small purpose-specific types over one oversized DTO:

```ts
type FeatureListItem = { /* fields returned by the page endpoint */ };
type FeatureDetail = { /* fields required by view/edit */ };
type FeatureLookup = { /* minimal active selector fields */ };
type CreateFeatureRequest = { /* create body, no route id */ };
type UpdateFeatureRequest = { /* update body, no route id unless API requires it */ };
type FeaturePageQuery = { /* exact query-string contract */ };
type FeaturePageResponse = PageResponse<FeatureListItem>;
```

Rules:

- IDs, enum values, dates, optional fields, and nullability match the API.
- Do not add compatibility aliases for obsolete responses.
- Keep form values separate when controlled inputs need empty strings.
- Normalize trimming, case, and blank-to-null once at the service boundary.
- Map API field errors to form fields; keep business invariants on the server.
- Use generated or automatic mapping only where it reduces code without hiding a
  real contract transformation.

## 5. Server List State

Use the shared `useServerListState<TColumn, TFilters>` for a server-managed list.
Each feature explicitly configures its defaults:

```ts
const list = useServerListState<FeatureSortColumn, FeatureFilters>({
  defaultColumn: "createdOn",
  defaultSortDirection: "DESC",
  defaultFilters,
  defaultPageSize: 10,
});
```

`defaultSortDirection` is optional and the shared fallback remains `ASC`. Select
defaults according to the workflow:

- mutable operational data normally uses `createdOn DESC` so recent records are
  visible immediately;
- stable lookup/reference data may use a localized display name ascending;
- domain priority or effective date may be a better default when explicitly
  defined by the product.

The server must add a deterministic secondary key, such as `ThenBy(Id)`, when
the primary sort can contain equal values. Pagination over a non-deterministic
order can duplicate or skip rows.

Required invariants:

1. UI pages are zero-based; API page numbers are one-based.
2. Search is debounced before it enters the query key.
3. Search, sort, filter, and page-size changes reset the page to zero.
4. Negative pages are clamped to zero.
5. When total count shrinks, move to the last valid page.
6. Reset restores every configured default, including sort direction.
7. Query keys use the normalized server query, not transient input state.
8. Grid, Cards, and other list views share one state and one query.
9. The UI never locally filters or sorts one server page as if it were all data.

Map state to the HTTP contract in a pure feature utility. Omit partially valid
exact filters rather than sending misleading requests.

## 6. Query Keys, Queries, and Mutations

Use a hierarchical feature key:

```ts
all -> pages -> page(normalizedQuery)
all -> lookup
all -> details -> detail(id)
```

Recommended behavior:

- list: short `staleTime`, previous-page placeholder data, visible background fetch;
- lookup: longer `staleTime` when selectors change less frequently;
- detail: enabled only when an ID is present;
- successful mutation: invalidate the feature-wide prefix;
- list failure: persistent inline error with Retry;
- detail failure: visible error with Retry and edit submission blocked;
- mutation failure: transient feedback plus field errors when available.

Prefix invalidation is the safe default. Manually patch cached pages only after a
measured need and only if sorting, filtering, totals, and lifecycle behavior stay
correct.

## 7. Controller Hook

The feature controller owns coordination, not rendering. It should expose:

- rows, total, loading, fetching, and persistent error state;
- controlled page, page size, search, filters, sort, and reset actions;
- selected record and dialog mode;
- effective visible capabilities;
- guarded create, view, edit, archive/delete, restore, and domain actions;
- mutation pending states and refresh.

Keep authorization and application read-only state separate. Visible capability
flags may combine them, but direct handlers check read-only first, then permission,
then record lifecycle. The API is the final boundary.

## 8. Views

### Multi-view naming and spacing

Use `PageHeader` with `variant="multi-view"` as the shared view registry and
switcher. Standard view IDs (`grid`, `cards`, `chart`, `list`, `smallList`,
`report`, `import`, and `grouped`) take their labels from the global `views.*`
translation keys. Do not pass feature-owned `viewLabels` for those standard
meanings; override a label only when the feature is expressing a genuinely
different product concept.

The shared toggle owns consistent internal button padding and click/touch space.
Each rendered view still owns responsive content padding appropriate to its
surface: Grid and Cards may provide it through their established wrappers,
while Chart, Report, and Import roots must not render flush against the feature
shell. Avoid adding the same padding at both the MultiView root and a child view.

### Grid

Grid is the default required list view. Use server pagination and sorting. Wire
search and filters to the server contract. Do not show a client-only filter button
in server mode unless it maps to a supported server filter.

Use the reusable `MyDataGrid` footer and its existing pagination controls, as in
Districts. Do not hide `GridFooter` navigation and replace it with a feature-local
pager. Configure server/client mode, controlled page, totals, and page-size options
through `MyDataGrid` props.

This is a preservation rule, not a styling suggestion. The shared Grid footer,
navigation, range/page-size behavior, responsive layout, and RTL handling are
product-owned reusable behavior. A feature implementation or refactor must not
disable, fork, or restyle that behavior locally unless the product requirement
explicitly calls for a different Grid interaction. A change to the shared primitive
requires checking all current consumers rather than fixing only the active feature.

`GridFooter` presents one tested product interaction in both modes: the same
first/previous/next/last record buttons, current-record/total counter, page
indicator, and page-size selector used by Districts. Client mode moves through
the loaded collection. Server mode moves within the current page and, when a
record boundary is crossed, drives the controlled `paginationModel` to fetch the
adjacent authoritative page before selecting the target record. Do not expose a
second MUI-default pager or a feature-local footer in server mode.

Never switch a server-managed feature to client pagination merely to obtain the
footer controls; that would paginate only the loaded page and break the list
contract.

Use one reusable `MyDataGrid` for both modes. The shared adaptive list strategy
may choose client pagination only after it has obtained the authoritative total
and loaded the complete filtered/sorted collection. The standard client ceiling
is 5000 rows, inclusive; totals above 5000 remain server-paginated. The data
controller owns this decision and fetching. The visual Grid must never infer
client mode from `rowCount` while it only holds one server page.

During a rolling deployment, an older API may still enforce the ordinary page
cap. If the bounded complete-result request is rejected, the adaptive hook must
fail safely back to server pagination and must not surface that compatibility
probe as a page failure. Client mode activates automatically after the matching
API contract is deployed.

### Cards

Cards are optional. They consume the same criteria, rows, total, pagination, and
background-fetch state as Grid. Presentation-only metrics must not look like
persisted business facts.

#### Required card-view composition

Use the shared card-view pieces rather than creating a second local list or a
raw MUI card layout:

```text
<Feature>MultiView
  -> feature CardViewHeader
     -> column + condition + search + sort + direction + Reset + terminal Grid Options menu
  -> <Feature>CardView
     -> scrollable responsive card grid
        -> feature cards built on EntityCard
     -> pinned CardViewPagination
```

- The feature CardViewHeader must expose every server criterion that stays
  active in Cards. Place search-column and search-condition controls before the
  search input, then render only API-allow-listed sort and direction controls.
  Keep the controls and Reset in the shared aligned control row, and put status
  plus permission-gated bulk actions in the final Grid Options menu. Do not
  leave field-specific search criteria active but hidden after a view switch.
- Cards, Grid, Charts, and Reports consume the same controlled zero-based page,
  page size, search value, field, operator, sort, status, rows, total, and
  background-fetch state. A CardView must never filter, sort, or paginate the
  loaded server page locally.
- Build feature cards on `EntityCard`. Keep domain title, chips, metrics and
  lifecycle text feature-owned; preserve the shared fixed-card presentation,
  hover/highlight treatment, reduced-motion behavior, action footer, logical
  RTL positioning and accessible selection checkbox.
- Selection is controlled by the feature controller. Render a checkbox only
  when the record is eligible and the user has the lifecycle permission; clear
  selected IDs when the server criteria, page, or page size changes. Put bulk
  Archive behind Grid Options with its selected-count and pending-state guard.
- Use loading, default-empty, filtered-no-results, and Retry states. New or
  edited rows may receive the shared temporary highlight; it must not change
  server ordering or criteria.

#### Pagination and viewport rule

`CardViewPagination` is a controlled shared footer: it receives zero-based
state, presents one-based page numbers, corrects a now-invalid page when a
total shrinks, emits a page-size value (not a DOM event), announces the visible
range, and adapts its controls at narrow widths. The feature owns its allowed
server page sizes.

When Cards are used inside a management shell, the pagination footer must be
the final non-shrinking child. The card grid is the only vertical scroll region:

```text
viewport-bounded feature shell (height + minHeight: 0)
  -> MultiView (column, height: 100%, minHeight: 0)
     -> card content (flex: 1, minHeight: 0, overflow: hidden)
        -> card grid (overflowY: auto)
     -> pagination footer (flexShrink: 0)
```

Do not make the document/page scroll merely to reach the pager. Do not use
`overflow: hidden` unless every ancestor is height-bounded and the card grid has
its own usable scroll region. Preserve horizontal safety for narrow pagination
controls and use logical CSS properties for RTL.

### Chart and analytics

Add only when there is a product need. Pagination controls belong to list
surfaces (Grid and Cards), not to Chart. A Chart that reuses the list endpoint
must preserve the same criteria, reset the controlled page to zero when entered,
reuse the current server page size, and label every metric as first-page scoped.
It must not render its own pager. Global analytics requires a dedicated aggregate
endpoint and separate query key.

If users need to browse successive pages while looking at a chart, the surface is
acting as another list rather than useful analytics. Keep that navigation in Grid
or Cards, or define an aggregate/chart endpoint with an explicit scope.

Record the decision for each optional view before implementation:

| Decision | Meaning |
|---|---|
| Required | The product needs the view and its data source/scope is approved. |
| Deferred | The need is accepted but a named contract or dependency is missing. |
| Excluded | The feature does not need the view; record the reason. |

Do not leave a feature-owned `*ChartView`, report, or import implementation
orphaned from the view registry. Wire and test an approved view, or remove the
unreachable implementation. Current-page charts may reuse the list endpoint only
when they preserve the same criteria, reset to page zero on entry, omit pagination
controls, and label every metric as page-scoped. Do not require an aggregate
endpoint for that limited scope. Do not present current-page data as global
analytics.

### Report

Keep domain report ownership in the feature and reusable viewers in shared
reporting infrastructure. List filters affect a report only when the report API
supports them explicitly.

### Import/export

Import requires create permission, local parsing feedback, row-level validation,
an atomic bulk endpoint, and invalidation after success. Export must clearly state
whether it exports the page, selected rows, or all matching server records.

## 9. Lifecycle, Permissions, and Scope

Define a feature-specific matrix before rendering actions:

| Action | Permission | Valid record state | Read-only allowed |
|---|---|---|---|
| View | View | domain-defined | yes |
| Create | Create | n/a | no |
| Edit | Edit | mutable state | no |
| Archive/Delete | Delete | domain-defined | no |
| Restore | domain-defined | archived | no |
| Domain action | explicit permission | explicit transition | domain-defined |

Enforce rules at three levels:

1. visible/disabled capabilities;
2. direct event-handler guard;
3. API authorization and invariant enforcement.

Tenant/company scope is never inferred only from client state. The backend derives
and validates it from the authenticated context.

## 10. Forms and Dialogs

- React Hook Form owns values and dirty state.
- Zod owns localized client validation.
- The API owns uniqueness, relationships, and business invariants.
- Add, edit, and view are explicit modes.
- View mode is read-only and has no submit action.
- Reset the form when mode or selected record changes.
- Fetch detail data when the list row does not satisfy the edit contract.
- A detail-load failure is visible and blocks mutation until Retry succeeds.
- Disable duplicate submission and show the shared pending overlay.
- Development mock values may fill a form but never auto-submit or ship as
  production seed behavior.

## 11. Loading, Error, Empty, and Refresh States

| State | Required experience |
|---|---|
| First load | Skeleton or accessible loading state |
| Background refetch | Keep layout stable and show non-destructive progress |
| List failure | Persistent error, explanation, Retry |
| Detail failure | Error inside the workflow, Retry, mutation blocked |
| Empty default list | Domain empty state and permitted primary action |
| Empty filtered list | No-results state and Clear criteria |
| Mutation failure | Toast plus stable field mapping when possible |
| Permission denied | Clear authorization feedback |
| Read-only blocked | Read-only-specific feedback, not permission denied |

Do not report one query failure through both a persistent alert and duplicate toast.

## 12. Localization, RTL, and Accessibility

- Add EN and AR keys together.
- Use namespaced keys owned by the feature.
- Localize actions, errors, Retry, Clear, empty states, filters, and aria labels.
- Use the active locale for names, dates, numbers, and currencies.
- Let theme direction drive layout; avoid hardcoded left/right positioning.
- Icon-only actions require labels and tooltips.
- Loading/error regions announce status appropriately.
- Keyboard and focus behavior must work in dialogs, menus, Grid, and filters.
- Never hide missing translations behind `t(key) || fallback`; use real keys or an
  intentional `defaultValue`.

## 13. Reuse Rules

Established shared controls are deliberate project assets. Reuse them before
writing local UI, and preserve their configured behavior during feature refactors.
Do not treat a working shared control as temporary scaffolding merely because a
feature can reproduce it with a library default.

Good shared candidates are domain-neutral and have multiple real consumers:

- `useServerListState` and page-bound helpers;
- Data Grid, toolbar, footer, and pagination primitives;
- `EntityCard`, card header, toolbar, skeleton, empty/no-results state, and pagination primitives;
- form controls, confirmation dialogs, loading/error/empty states;
- API error extraction, field mapping, toast, read-only, and permission helpers.

Keep these feature-owned:

- routes, transport types, and query mapping;
- filters, sort allow-list, lifecycle, permissions, and validation;
- columns, card content, domain metrics, reports, imports, and mock samples.

Do not create a generic abstraction for a hypothetical second consumer.

When related management features offer a card view, feature cards must compose
the established shared card scaffold (`EntityCard` plus the shared card
header/skeleton/empty/no-results/pagination primitives). Keep the domain title,
chips, metrics, and lifecycle rules feature-owned, but preserve the common grid
spacing, hover/highlight behavior, fixed-card layout, server-page pagination,
and permission-aware action footer. Do not replace that scaffold with a raw MUI
`Card` unless the feature profile documents a product-specific exception.

## 14. Minimum Test Matrix

Pure tests:

- UI-to-HTTP query mapping and omitted invalid filters;
- request normalization and null conversion;
- permission/lifecycle action matrix;
- server-list reducer, page bounds, debounce, and reset;
- configured initial sort and reset back to it;
- domain adapters and deterministic mock-data rules.

Integration tests:

- exact HTTP methods, routes, queries, and bodies;
- successful mutation invalidates the feature prefix;
- Grid and Cards preserve one list state;
- permission and read-only handlers fail closed;
- list/detail errors show Retry and block unsafe submission;
- lifecycle rows expose only valid actions;
- background fetch does not present stale criteria as current;
- EN/AR and RTL-critical controls render correctly.

Then run the repository checks defined in the architecture reference: architecture,
type checks, strict type checks, lint, full tests, and production build.

## 15. Implementation Order

1. Complete the feature decision table and API contract, including a
   Required/Deferred/Excluded decision for every optional view.
2. Define separate list/detail/lookup/request/query types.
3. Add centralized API routes.
4. Implement and test request normalization and query mapping.
5. Implement the service and query-key hierarchy.
6. Create the controller with configured `useServerListState` defaults.
7. Add Grid with server pagination, sort, search, and filters.
8. Add form and lifecycle dialogs with direct guards.
9. Add loading, background fetching, error, retry, and empty states.
10. Add EN/AR, RTL, keyboard, and accessibility support.
11. Add Cards only when useful.
12. Add Chart, Report, Import, or Export only with an explicit product/API contract.
13. Expose only deliberate cross-feature APIs.
14. Run focused verification, then the full repository checks.

## 16. Anti-Patterns

- one DTO for list, detail, lookup, and form;
- local filtering/sorting over one server page presented as global data;
- multiple independent list states for Grid and Cards;
- API calls inside visual components;
- permissions enforced only by hidden buttons;
- read-only reported as missing authorization;
- unstable server ordering with pagination;
- silent list/detail/report failures;
- cached-page patching that ignores filters, sorting, or totals;
- page totals labeled as global analytics;
- feature internals exported from a broad barrel;
- generic shared code created before a second real consumer exists.

## 17. Definition of Done

A feature follows this reference only when:

- transport types, routes, scope, and nullability match the API;
- server criteria, default order, tie-break order, and pagination are deterministic;
- all list views share one state and query contract;
- every Grid uses the reusable `MyDataGrid`/`GridFooter` pagination unless an
  explicit product exception is documented;
- every approved optional view is registered and tested, with no unreachable
  feature-owned view implementation left behind;
- permissions, lifecycle, tenant scope, and read-only behavior fail closed;
- list, detail, mutation, background-fetch, and empty states are explicit;
- EN/AR, RTL, keyboard, and accessibility behavior is complete;
- shared extraction is domain-neutral and proven by real reuse;
- the feature public API is deliberate;
- focused and full verification pass, or environmental blockers are documented.

See the [Countries Full-Stack Web and Mobile Implementation Profile](countries-frontend-reference.md) for
one implemented configuration. Copy the pattern and decision process, not its
country-specific routes, fields, filters, permissions, or optional views.
