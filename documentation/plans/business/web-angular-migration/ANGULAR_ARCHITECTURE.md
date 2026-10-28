# Angular Architecture and Shared Component Policy — Proposed Implementation Contract

Plan: web-angular-migration. Status: Draft target architecture, 2026-10-28.
Requester explicitly requires strong organization and the same shared-component-first
policy as Next. These are proposed Angular equivalents, not existing runtime files.
State-management policy in section 6 is requester-approved under D06 on
2026-10-28; the remaining Draft readiness and runtime gates still apply.

## 1. Ownership before folders

Use one Angular application with explicit modules and lazy routes. Begin with
ordinary Angular CLI tooling plus enforceable boundaries; introducing Nx or a
multi-package runtime is not required to establish modularity. A later workspace
tool must solve a measured need and preserve the same ownership policy.

```text
web-angular/
  angular.json
  package.json
  src/
    app/
      app.config.ts
      app.routes.ts
      routes/                          thin route registration and metadata
      shell/
        layout/                        main/public layouts and responsive shell
        navigation/                    authorized navigation composition
        bootstrap/                     startup orchestration
        public-api.ts
      platform/
        auth/                          session bootstrap and account journeys
        work-context/                  trusted tenant/company context coordinator
        authorization/                 permission/read-only policy and guards
        modules/                       entitlements and module registration
        localization/                  scope-owned overrides and catalogs
        realtime/                      connections and invalidation dispatch
        reporting/                     platform policy, not report business UI
        observability/                 sanitized errors and correlation
        administration/                identity/tenants/company tooling
      modules/
        reference-data/
          module.definition.ts
          module.routes.ts
          public-api.ts
          geography/countries/
            pages/                     route composition
            components/                country-specific composition
            data-access/               typed service and boundary mappers
            state/                     feature store/controller and query keys
            types/                     exact wire contracts and view models
            validation/                typed form validators and field mapping
            utils/                     pure domain-presentation utilities
            public-api.ts
        accounting/
        hr/
        crm/
        reporting/
      shared/
        ui/                            generic page/table/card/dialog/feedback
        forms/                         containers, fields, errors and dirty registry
        query/                         scope keys, cache and invalidation contracts
        transport/                     HttpClient adapter and shared errors
        validation/                    domain-neutral validator primitives
        utils/
      runtime/                         low-level environment/browser adapters
      config/                          public configuration and route constants
    locales/                           scoped en/ar resources
    theme/                             semantic tokens and PrimeNG preset
  e2e/
  scripts/                             architecture/catalog/release checks
```

Do not create empty folders/placeholders for every possible ERP domain. Create a
feature boundary when its approved contract is implemented. Tests are colocated
where practical; browser journeys stay under e2e. Root-level guides remain in
`documentation/`, never a new application docs tree.

## 2. Dependency direction and public API

| Consumer | Allowed dependencies |
| --- | --- |
| Route adapters | Owner public APIs, shell composition and generic route metadata |
| Shell | Platform public APIs, shared, runtime/config/theme |
| Business module | Shared and explicitly allowed owner public APIs; exact policy imported from current module-boundaries after review |
| Platform capability | Shared/runtime/config and explicitly declared Platform capability public APIs |
| Shared UI/forms | Other compatible shared primitives, runtime/config/theme; no Platform or business imports |
| Runtime | Config and framework/vendor primitives; no domain ownership |

Each owner/feature exposes curated `public-api.ts`; avoid broad star-export barrels.
Imports into another owner's state/pages/data-access are forbidden even if the
owner dependency itself is allowed. `shared` is not a dumping ground for business
DTOs, permission names, tenant behavior or every reusable-looking function.
Business-specific reusable components stay in their owning feature/module and
are exposed only when a real consumer needs a stable public contract.

Dependency flow:

```text
route -> feature page -> controller/SignalStore -> feature service
      -> shared HttpClient transport -> existing .NET API
```

Pages own composition; feature state owns orchestration; services own API mapping.
Requester-approved simplicity boundary: direct API calls, no BFF or new gateway,
and no mandatory Redis/session-store service. Use existing Angular capabilities
and actual shared needs; avoid a custom query framework, universal CRUD engine,
empty wrapper layers or mandatory state stores for simple screens. Shared read
cache behavior remains bounded to the correctness requirements that actually apply.
Shared components emit typed events and accept view data; they do not call business
APIs, fetch lookups or decide permission scope. The caller supplies allowed actions
and callbacks; handlers and API still enforce the same authorization independently.

## 3. Mandatory reuse sequence

1. Search the Angular shared catalog and the selected reviewed feature.
2. Reuse the existing shared component when its contract fits.
3. If close, add a generic backward-compatible capability and meaningful behavior tests.
4. Create a shared primitive only when no suitable one exists and it owns truly
   generic behavior. Initial foundational ports are justified by existing multiple
   Next consumers; list the first Angular consumers in the component contract.
5. A feature-local component may compose shared primitives with domain content;
   it must not duplicate their styling, lifecycle, accessibility or state handling.

Do not create local wrappers merely to rename an existing shared component. Use
typed templates/content projection and explicit capability inputs for legitimate
extension. Avoid a universal mega-table or a metadata form engine that hides
business rules and makes every feature depend on a growing switch statement.

## 4. Canonical shared components and PrimeNG boundaries

Names below are proposed public contracts; finalize exact selectors in S1.

| Public component | Owns | Extension boundary |
| --- | --- | --- |
| ErpPageHeader / ErpPageLayout | Title/actions/view controls, responsive spacing | Typed action slots and feature content |
| ErpDataTable | PrimeNG Table/Paginator, shared toolbar/search, grid options, footer and record navigator | Columns/cell templates, server criteria, toolbarFilters, emptyContent, typed row actions |
| ErpCardList / ErpEntityCard | Collection/card scaffold, paging and shared feedback | Feature-owned fields, badges and permitted callbacks |
| ErpFormContainer/Header/Content/Footer | Layout/pending/submit/discard/error summary/focus | Projected sections/tabs; feature supplies typed form and validators |
| ErpField / shared inputs | Label/help/error/aria/control integration | Typed options and ControlValueAccessor where an actual value-control wrapper is required |
| ErpReferenceSelect | Generic remote selection/keyboard/loading/error behavior | Feature-owned typed lookup adapter, scope/parent criteria and selected-value resolution; ERP-02 |
| ErpDialog / ErpConfirmation | Consistent overlay lifecycle, focus return, busy/discard behavior | Feature-specific body and actions |
| ErpFeedbackState | Loading/empty/error/forbidden/retry | Domain-specific message/actions through slots |
| ErpContextBadge / ErpContextSwitcher | Generic context display/selection ergonomics | Platform owns trusted switching and dirty decision |
| ErpTreeWorkspace | Responsive tree/detail shell, selection and keyboard contracts | Owner nodes/edges/move validation; specialized diagram adapter |
| ErpReportHost / ErpImportHost | Shared host lifecycle, transport/error/pending UI | Licensed renderer/parser adapter plus feature contract |

Collection pages must use ErpDataTable; feature imports of PrimeNG Table,
Paginator or alternate grids are blocked. Generic toolbarFilters and emptyContent
provide the established escape points without duplicating the shell.

Add/edit forms must use the shared form container and fields. Feature code cannot
instantiate raw PrimeNG input/dialog shells to bypass error/focus/dirty rules.
Approved specialist adapters can use vendor internals within registered shared
adapter directories; exceptions need a narrow, reasoned allowlist with a test.
Small compositional primitives need no gratuitous wrapper when no project behavior
is being owned, but their usage must remain consistent with the shared catalog.

## 5. Form contract

Detailed shared lookup, keyboard and structured-entry acceptance is owned by
ERP_ACCEPTANCE ERP-02..ERP-04. Use that contract rather than creating divergent
per-feature keyboard/lookup lifecycles. Typed wire generation is evaluated under
ERP-01; generated clients remain behind feature services and out of components.

- One authoritative typed Reactive Form per editor; child sections receive typed
  controls or documented nested groups. Do not mirror every value into Signals.
- Feature validators are reusable and live in validation; generic primitives may
  be shared. Preserve server-authoritative rules and exact field-error paths.
- Keep Save/Create available for validation; pending duplicates/read-only/denied
  actions may be blocked. Never disable merely because the draft is incomplete.
- Submit marks relevant controls, renders specific errors beneath inputs, shows
  accessible error-summary links, opens the relevant tab and focuses first invalid.
- Use noValidate; no native alert/confirm/validation UI.
- Dirty navigation, context switches and dialog closure use one shared discard
  registry and asynchronous decision flow, including pending saves.
- Repeaters use dedicated add/edit/remove/reorder controls and stable child identity;
  edit loading/view mode/mock generation preserve structured data.
- Asynchronous load, server errors, nested arrays and status display are explicitly
  verified under Zoneless; Angular documentation notes model APIs alone do not
  schedule a component check.

## 6. State and query contract

Global: session, trusted tenant/company context, language/theme and minimal shared
preferences. Working fiscal year remains Accounting-owned and is composed through
a public context contract. Root availability does not transfer business ownership.

Feature/route: list criteria, selection, draft workflows, pending/error and loaded
data. Component-local: overlay visibility and ephemeral presentation state.
Query criteria suitable for deep links can live in URL state.

Approved selection policy (D06):

| State shape | Mechanism | Boundary |
| --- | --- | --- |
| Simple component state and derived values | Angular Signals/computed | Keep local; do not create a store merely for overlay visibility |
| Simple state shared by a few related components | Owner-scoped Angular Signals service where sufficient | Private writable state, public readonly signals and explicit update methods |
| Complex feature workflow with coordinated state/operations | Scoped NgRx SignalStore | Feature/route lifetime; root only for a justified app-wide owner |
| Need for action/reducer/effects orchestration beyond the baseline | Traditional NgRx Store only by recorded architecture decision | No mandatory installation, no universal global ERP store |

Complexity is judged by coordinated interactions, shared consumers and lifecycle,
not by the ERP's total size. Each feature contract records mechanism, scope,
reason and tests. Similar feature shapes follow one consistent pattern; do not
alternate mechanisms arbitrarily across equivalent CRUD screens.

Server cache is a separate policy: scope keys, reads/in-flight deduplication,
freshness, errors, invalidation/realtime/cancellation and reset. Neither Signals
nor SignalStore alone establishes cache correctness, company isolation or safe
mutation retries. Keep those contracts and tests regardless of state mechanism.

## 7. Translation/theme and accessibility

Use namespaced en/ar catalogs with the existing company/system ownership model.
Shared components accept translated labels or generic shared-scope keys; they do
not import business namespaces. Logical CSS and document direction preserve RTL.
Map semantic project tokens into one PrimeNG preset; use variant inputs rather
than feature-level internal selectors, ng-deep or deep CSS forks.
Keyboard/focus/aria/error links and compact/wide behavior are shared contracts.
Feature tests still verify actual content and permission composition.

### Shared token package integration

`packages/tokens` (`@app/tokens`) remains the design-value source for Angular as
well as retained Next and Expo. Current source exports `getTheme`, five palettes
(`green`, `orange`, `blue`, `navy`, `monochrome`), light/dark modes, semantic
colors, module/chart colors and non-color scales. Do not create an independent
Angular palette catalog or copy these values into feature styles.

Build one Angular/PrimeNG adapter in `web-angular/src/theme/` against the existing
public compiled package. It consumes framework-neutral values, not MUI theme
options or React components. Map background/surface/text/border/ring/status and
module/chart semantics deliberately. Preserve the distinction between quiet
`secondary`/`accent` surfaces and stronger `brand2`/`brand3`; similarly named
PrimeNG slots do not establish equivalent semantics. Review any required shade
derivation and contrast instead of inventing per-feature color scales.

Carry spacing/radius/typography/motion semantics where applicable; framework
breakpoints, overlay stacking and component state behavior remain reviewed adapter
choices. Theme preferences update the same shared palette/mode identity. Test all
five palettes in light/dark, EN/AR and core controls, including status contrast and
selection/focus/disabled states. Feature code uses shared semantic tokens or the
adapter's variables; raw hex colors require a documented external-content case.

At S1 add Angular to the package consumption/synchronization and CI verification
contract. The current `packages/tokens/scripts/sync-apps.mjs` lists only Next and
Expo; do not claim Angular is synchronized until that integration is implemented.
Keep compiled outputs current through the package build/check workflow and verify
retained consumers after any central token change. No package/runtime change is
made by this planning clarification.

## 8. Executable governance required before broad migration

Shared/API/feature test evidence must also map applicable ERP-01..ERP-12 IDs.
Use actual contract/concurrency/audit behavior; no parallel frontend business
engine or speculative server dependency is introduced to satisfy a UI check.

| Gate | Must reject or prove |
| --- | --- |
| architecture | Forbidden cross-owner internals, cycles, shared-to-domain dependencies, broad exports, component HttpClient calls |
| shared UI policy | Raw PrimeNG/alternate grid and paginator imports in features, local form/dialog lifecycle duplication, native alert/confirm |
| types/templates | Strict TS and strictTemplates; unknown payload narrowing; no any/ignore/cast escape chains |
| forms | Invalid submit/focus/field mapping, dirty protection, repeaters and Zoneless async behavior |
| i18n/catalog | Visible literal policy, EN/AR key parity, namespace ownership and company override catalogs |
| query/context | Scope keys, cancellation/reset/stale-response prevention and no automatic write replay |
| tests/build | Unit/integration, production bundle budgets and fixture/live browser journeys |
| documentation | Registered Angular evidence and up-to-date generated packets, without relabeling Next sources |

Use AST/template-aware checks where feasible, including alias and dynamic imports,
not a fragile string-only ban. Checker tests must cover allowed shared use and
forbidden feature bypass. Do not claim governance exists until implemented.

## 9. Reuse acceptance

S1 cannot close after publishing empty wrappers: shared behavior must work in
two distinct representative test compositions. S3 and the next distinct real
consumer then verify reuse without feature rules leaking into shared. This avoids
making S1 depend on a business feature that itself requires S1. Before wider rollout, verify Grid,
Cards, search/filters, paging, record navigation and forms against the same Next
reference data/viewports. Intentional differences belong in the owning feature book.

Source policies: repository AGENTS, shared SCREEN_PATTERN_CATALOG/SHARED_REUSE_CATALOG,
current frontend architecture, Countries/States applied books. Angular equivalents
must be registered centrally before runtime business implementation; the existing
Next-specific policies remain unchanged for Next.
