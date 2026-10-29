# Angular 22 and PrimeNG Web Migration — Master Build Plan

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | web-angular-migration |
| Business capability | Angular 22 and PrimeNG Web Migration |
| Owning module | Platform |
| Ownership coordination | Web Architecture; existing business module owners remain unchanged |
| Preflight-only slice | S1-A3 — Shared collection foundation |
| Preflight-only feature | angular-collection-foundation |
| Status | `Draft` |
| Target milestone | Independent Angular client with verified current Web parity |
| Primary owner | ERP owner + Web Architecture; API/Security for direct authentication |
| Reference features | Countries, States, Cost Centers, Add Tenant, Role Permissions; exact shape only |
| Planning method version | `2.0 — capability plan + slice roadmap + feature contract + evidence ledger` |
| Related plans | frontend-foundation-hardening; accounting-core-gl; workforce-planning; managed-crystal-reporting-reliability |
| Last reviewed | 2026-10-28 |

Authority: [DISCOVERY](DISCOVERY.md), [EVIDENCE](EVIDENCE.md),
[SPEC_SUMMARY](SPEC_SUMMARY.md), [DECISIONS](DECISIONS.md), [RESEARCH](RESEARCH.md).
Delivery order and proposed exit criteria: [ROADMAP](ROADMAP.md). Route snapshot:
[INVENTORY](INVENTORY.md). Readiness review: [REVIEW](REVIEW.md).
Detailed target ownership and mandatory shared policy:
[ANGULAR_ARCHITECTURE](ANGULAR_ARCHITECTURE.md). The requester explicitly required
strong organization and the same shared-component-first policy on 2026-10-28.
ERP reliability/productivity requirements and their detailed acceptance authority:
[ERP_ACCEPTANCE](ERP_ACCEPTANCE.md), ERP-01 through ERP-12, explicitly requested
for inclusion on 2026-10-28. They strengthen acceptance within the conversion
scope; they do not authorize unrelated business rebuilds or runtime work.

Requester-approved D16 adopts the eight source-reviewed Sigma details as Required
applicable acceptance: [SIGMA_ACCEPTANCE](SIGMA_ACCEPTANCE.md), SIG-01..SIG-08.
That file owns their exact behavior, external evidence and adaptation limits;
ROADMAP maps timing. Sigma is a source-only external reference, not proof of ERP
runtime or a replacement for existing ERP ownership/security. Angular 22,
Zoneless, Strict, D06 and no-BFF decisions remain unchanged.

The requester authorized planning and confirmed a separate Angular application,
retaining Next.js and functional parity first. Runtime is limited to the explicitly
authorized feature contracts and exact bounded increments in section 17; this Draft grants
no broader runtime authority. Angular architecture choices below are proposals unless explicitly
identified as requester decisions. No live customer traffic exists per discovery.

## 1. Outcome and success measures

Reduce cross-project technology switching and establish a maintainable Angular
client for a large ERP, preserving existing product rules and ownership.

| Measure | Baseline | Acceptance target |
| --- | --- | --- |
| Route coverage | INVENTORY snapshot; route presence is not completion | Every inventoried route classified and mapped to verified Angular behavior or an explicitly agreed exclusion |
| Workflow parity | Current source + applied books + API reconciliation | Every Required journey passes, including errors, denied operations and structured editing |
| Isolation | Existing BFF/context coordinator | No previous-company data or late response appears after a context switch |
| Client coexistence | Next retained by requester | Both applications build independently; Angular calls the existing API without a BFF or Next runtime dependency |
| Quality | Existing Web gate outcomes | Equivalent Angular-specific gates plus live API acceptance and documented manual release checks |
| Performance | Recorded Next production baseline | Comparable production measurements; freeze budgets from representative Angular routes, not a raw framework comparison |
| ERP safety/productivity | Existing contracts/behavior to reconcile | Applicable ERP-01..ERP-12 verified: efficient entry, typed contracts, safe writes, correct values, audit and recovery |
| Angular interaction reliability | Sigma source-reviewed examples; no ERP runtime claim | Applicable SIG-01..SIG-08 verified at foundation and real-consumer gates, with actual owner/lifetime and failure evidence |

## 2. Scope: Required / Deferred / Excluded

Required for final Angular parity: shell/auth/context/permissions/entitlements;
current implemented module journeys; EN/AR/RTL; company localization overrides;
shared forms/grid/cards/navigation/feedback; server paging/sort/filter; all existing
Required chart/report/designer/import/export/file/realtime flows; CI and hosting.
Every feature contract independently classifies its views; absence of a ported
view cannot silently become Deferred. An intermediate milestone may state its
bounded coverage but cannot claim full parity.

Next.js remains in the repository. Keep its current behavior and verification;
no deletion, archival or forced retirement is planned. Future changes during the
conversion receive an impact label: API/domain change, shared contract change,
Next-specific fix, or Angular-only work. Update parity inventory when the source
baseline changes. Simultaneous cross-client login is tested according to DEC-027.

Excluded: new business modules, future-only planned functionality, visual redesign
beyond documented PrimeNG adaptation, new domain lifecycle/permissions/schema,
native Expo rewrite, microfrontend architecture and mandatory SSR. These can be
separately scoped later; no placeholders or empty routes imply implementation.
No material new feature is moved to Deferred under this conversion plan.

Required acceptance controls: shared server-backed lookups, keyboard-efficient
structured editing, concurrency/duplicate/uncertain-write handling, atomicity,
money/quantity/date semantics, exact lifecycle/action authority, business audit,
API contract drift assessment, realistic data-volume verification and release
recovery. Reuse existing implementation evidence before declaring a gap.
If satisfying a control requires new domain semantics/schema/API behavior, gate
and authorize that owner's bounded slice separately; no silent scope expansion.

## 3. Ownership and relationships

| Owner/system | Source of truth | Migration treatment |
| --- | --- | --- |
| Existing .NET business modules | Domain/API/contracts | Reuse; no duplicated business persistence or authorization |
| Platform | Sessions/access/entitlements/localization/realtime policy | Reuse server authority; implement Angular presentation adapters |
| Shell | App composition/navigation/bootstrap | Rebuild with Angular Router and public owner contracts |
| Shared | Domain-neutral UI/transport primitives | Rebuild generic Angular components once; no feature-local look-alikes |
| Next.js | Current Web implementation and BFF reference | Preserve; source evidence only, not an Angular runtime dependency |
| Expo | Existing native client | Conversion Excluded; regression-test affected shared contracts |

Angular dependency direction mirrors reviewed owner policy: routes -> owner public
API; shell -> platform/shared; modules -> shared and explicitly allowed owner
public APIs; shared -> low-level runtime/config only. Keep business module codes,
navigation and exact permissions stable. Translate definitions into Angular data
and icon references; do not import React module definitions.

## 4. Actors and trusted scope

Preserve global SuperAdmin operations, tenant administration and company-scoped
business use. Module visibility, entitlement, action permission, record scope and
read-only status remain separate checks. Guards improve navigation; .NET remains
authoritative. Both visible actions and direct handlers must deny unauthorized
mutations. Preserve server-side revocation/expiry and inactive-entity rules.

## 5. Target structure and state

Proposed runtime layout (future paths; not current evidence):

```text
web-angular/
  src/
    app/
      routes/     thin Angular route composition
      shell/      layout, launcher, navigation, bootstrap
      platform/   session, work-context, access, modules, realtime, tools
      modules/    reference-data, accounting, hr, crm, reporting
      shared/     ui, forms, table, query, transport, validation, utilities
      runtime/    low-level runtime adapters
      config/     routes, environment/public config
    theme/        PrimeNG preset + project tokens
    locales/      namespaced English/Arabic resources
```

Each feature owns `types`, `data-access`, `state`, `validation`, `pages`,
`components`, tests and a curated public API. Components do not call HttpClient.
Feature services own wire mapping; stores/controllers own orchestration.

Use Zoneless and standalone Angular APIs. Root state holds only session,
trusted work context and display preferences. D06 is requester-approved on
2026-10-28: local Signals/computed for simple state; an owner-scoped Signals
service when simple sharing is sufficient; scoped NgRx SignalStore for complex
feature workflows. Keep the mechanism consistent across similar feature shapes.
Traditional NgRx Store is not mandatory; introducing action/reducer/effects
orchestration requires a justified, recorded architecture decision. Each child
contract records mechanism, owner/lifetime, reason and tests. Root lifetime is
chosen explicitly; no giant global ERP store. This approval does not close the
remaining Draft gates or authorize runtime implementation.

React Query behavior must be designed explicitly: scope-aware keys containing
session/context generation and applicable tenant/company IDs; normalized server
criteria; in-flight read deduplication; stale/loading/error metadata; bounded
cache lifetime; cancellation; mutation invalidation; realtime invalidation;
context reset; logout cleanup. Reads may retry under a bounded policy; writes
must not implicitly replay. No localStorage persistence of business datasets or
tokens by default. Shared lookup owners publish refresh/invalidation contracts.

## 6. Direct API and session lifecycle — DEC-025 / DEC-027

Requester decision on 2026-10-28: no BFF; avoid unnecessary complexity. Angular
calls the existing .NET API directly. No new BFF host, YARP gateway, distributed
session store or Redis dependency is introduced by default. The existing Next
application keeps its own handlers; Angular does not depend on them.

```text
Angular -> feature service / HttpClient -> existing ERP API
```

DEC-025 is closed by this explicit decision. DEC-027 covers the remaining direct
authentication binding: review the API's actual supported cookie/token contracts,
origins, refresh/logout/revocation, CSRF where cookies are used and credential
handling. Select the simplest secure compatible approach without duplicating
Platform identity. Excluding a BFF does not by itself approve browser token storage,
require an OAuth/identity rewrite or prove that cookie auth already exists.

D17 now resolves persistence: the requester selected secure HttpOnly Cookies
inside the existing API, retaining session continuity and bearer compatibility.
The target transport is [BROWSER_AUTHENTICATION_CONTRACT](BROWSER_AUTHENTICATION_CONTRACT.md).
This approved design does not imply runtime support already exists.

Map the browser outcomes currently provided through Next to direct API contracts
or ordinary hosting configuration. Proxy-only mechanics remain Next-specific;
do not recreate all eight handlers merely to mimic their file structure. Preserve
required authentication, file/report, realtime and observability outcomes.

Required sequence: session bootstrap -> authoritative context verification ->
module access -> business loading. A context change runs dirty-form decision,
blocks mutation initiation, cancels outstanding work, clears/isolates caches,
verifies server context and only then exposes new data. Stamp requests with a
generation and discard late results. Cross-tab and parallel-client transitions
must not race refresh tokens or show invalid work context.

Decide origin/paths, explicit allowed origins, credential transport, refresh
coordination across browser tabs, logout/revocation and expiry from the actual API.
For the selected cookie binding, review cookie scope, CSRF and credentialed requests;
retained bearer consumers keep their reviewed token transport and refresh behavior.
No automatic localStorage token persistence. Handle temporary auth outages without
clearing a newer valid session. Next cookie chunking is source evidence, not a
requirement to add equivalent machinery to Angular. Freeze DEC-027's exact design
inputs in the authorized slice contract before auth implementation; close its
runtime-proof requirement after focused security tests before auth acceptance.
Do not add server infrastructure as a shortcut around this direct-contract review.

S0 source investigation is recorded in
[AUTHENTICATION_PREFLIGHT](AUTHENTICATION_PREFLIGHT.md). Current API routes issue
JSON bearer credentials; Next owns its own HttpOnly cookies. D17 approves a
bounded Platform API browser-cookie binding to preserve reload continuity without
BFF. Persistence selection is resolved; exact slice/preflight and actual
cookie/CSRF/origin proof remain under DEC-027. RISK-018 owns the discovered
refresh/logout/provider source-contract
gaps; passing helper/client tests does not settle them. This completes the source
investigation deliverable only, not S0 or the auth execution gate.

## 7. Rules and edge cases

| Scenario | Required behavior |
| --- | --- |
| Duplicate submit / lost response | Prevent concurrent UI submit; no blind mutation retry; reconcile uncertain result |
| Concurrency / RowVersion | Preserve actual API token/ETag/body contract; show actionable conflict, no silent overwrite |
| Stale scope / permissions | Invalidate context/access; reject late responses and denied direct handlers |
| Partial import / bulk | Preserve atomicity, limits and item-error envelope from actual endpoint |
| Archived lookup | Correctly display existing relation; prevent invalid new selection according to API |
| Dates / decimals | Preserve date-only vs instant, timezone and precision/rounding semantics |
| Large lists | Server criteria and deterministic ordering; no filtering one fetched page as full data |
| Backend outage | Distinct initial error, background refresh failure and uncertain mutation states |
| Files / report streams | Preserve MIME, content disposition, range, size limits, cancellation and timeout behavior |
| Native offline | No conversion; inspect for regressions only if shared API contracts change |
| Audit / privacy | Preserve server audit; redact telemetry; frontend store history is not a business audit log |

Detailed testable rules are ERP-05..ERP-09 in ERP_ACCEPTANCE. Concurrency tests
use two independent clients; mutation tests distinguish commit failure from
response loss after commit. Amount/date tests use owner-approved wire/digit/
rounding/timezone conventions. The client never invents a new domain outcome.

## 8. Permissions and API contract ledger

Before implementing each feature, its contract must map every endpoint and
visible/direct action to exact existing `Resource:Action`, actor, scope,
read-only behavior, bilingual label owner and denial test. Use
`web-next/src/config/api/`, feature services/types, API controllers/CQRS and owning
required-files manifest together. Do not invent a generic `Manage` permission.
Catalog exact list/detail/lookup/write/lifecycle/bulk/import/report shapes,
pagination base, nullable fields, binary results, validation paths, cancellation
and concurrency before porting. Types alone do not prove runtime response validity.

ERP-01 makes OpenAPI generation assessment Required in S0. Prove one representative
Angular/TypeScript client against the actual versioned specification before choosing
a generator. If suitable, pin config/version, separate generated output and detect
staleness in CI. Otherwise record the scoped typed-service/contract-test fallback
and its exact limitations. Feature services remain the public transport owner.
Do not infer full endpoint coverage from Swagger configuration; broader automated
parity remains tracked by FOLLOW-003.

## 9. Persistence and schema

No domain data migration is implied. Reuse the existing database/API identifiers;
do not create Angular-specific copies of business tables. Browser state is not
business persistence. Any actual authentication persistence or endpoint changes require
their owning API workflow and a separately reviewed schema decision. If schema
changes become necessary, apply and verify module migrations in the live test
database before claiming completion; otherwise record schema work N/A with evidence.

## 10. Shared UI and pattern mapping

Requester-confirmed policy2026-10-29: every Angular workflow widget uses a
shared PrimeNG adapter; no plain browser selects, radios, dialogs or unenhanced
buttons. Reuse/extend existing shared controls before introducing another.
Shared ScrollArea owns page/sidebar scrolling and follows @app/tokens; Select
overlays retain their PrimeNG internals with matching themed scrolling. Context
controls show complete desktop text and icons only on small or constrained
toolbars, with PrimeNG Tooltip and accessible names. Architecture checks apply
the widget rule to inline and external templates. S2-A6 acceptance includes this
policy and the user's scrollbar/width refinements.

| Existing behavior/reference | Proposed Angular composition | Acceptance |
| --- | --- | --- |
| PageHeader and shared list toolbar | ERP header/toolbar components over PrimeNG | Search/reset/actions/small-screen behavior preserved |
| MyDataGrid | One shared ERP table over PrimeNG Table/Paginator | Server paging/sort/filter, selection, grid options, footer and record navigation |
| Grid/Card composition | Shared view shell and card scaffold | Same feature fields/actions/permissions, paging and feedback |
| MyForm / FormContainer / fields | Shared Angular form container and field adapters over typed Reactive Forms/PrimeNG | Dirty guard, pending, field errors, summary links, first-invalid focus |
| Reference selectors / lookup inputs | Shared generic searchable selection plus owner-specific typed lookup adapters | Server search/paging, off-page selected value, dependency/scope reset, stale-response protection and keyboard behavior (ERP-02) |
| SplitTreeView / diagrams | Shared Angular tree/workspace adapter, feature-owned nodes | Exact hierarchy/reparent rules, keyboard/direct Move action |
| ContextBadge / ContextSwitcher | Shared header context controls | Tenant/company/fiscal-year order, compact/wide behavior, no clipping |
| Confirmation / errors / empty/loading | Shared PrimeNG-backed feedback components | No native alert/confirm/validation popups |
| Managed reports / import / export | Shared Angular capability adapters | Preserve scopes, parser/envelopes and permission policy |

Keep Save/Create enabled until submission, blocking only duplicate/pending,
read-only or unauthorized actions. On invalid submit show field messages and
focus the first invalid field; no browser-native validation. Map server paths to
controls including nested/repeated children. Use noValidate and a single form
validation source; re-express/test relevant Zod rules rather than add RHF.
ERP-03/ERP-04 additionally require a shared keyboard contract and realistic
structured-entry acceptance. No new invoice/posting capability is added merely
to demonstrate the shared editor; select an actual implemented aggregate.

Register Angular adapters in central architecture/pattern/reuse documentation
before business UI. Existing React-specific mandates such as MyDataGrid,
RHF/zodResolver and Framer Motion continue for Next; Angular needs explicit
equivalent rules, not raw feature bypasses. Select a reviewed Angular-compatible
gesture mechanism for diagrams, including direct accessible Move; do not import
Framer Motion React or silently fall back to native HTML5 diagram drag.

Pattern candidates: P-001 for server CRUD; P-002 for actual tree/master-detail;
P-003 for Add Tenant; P-005 for singleton settings; P-006 for permissions mapping;
P-007 for launcher; Active context-selector P-008 only after DEC-026. Candidate
Kanban/calendar/document patterns require registration/review before related UI.
Countries is a pilot shape, not a source of product fields for unrelated domains.

## 11. Forms, localization, accessibility and visual parity

The requester explicitly reaffirmed database-persisted UI translation on 2026-10-28.
[LOCALIZATION_PARITY](LOCALIZATION_PARITY.md) freezes the existing SQL-backed
company/global runtime and save/reset/revision contract for Angular foundation
and later Settings acceptance; no static-only replacement or key/catalog fork.

Use typed Reactive Forms as proposed baseline, including FormArray builders for
structured children. Test load-edit-save without loss, add/remove/reorder,
conditional controls, pending validation, server errors and view mode. Connect
asynchronous model/status changes to Zoneless notifications; Signals do not
replace validators or duplicate the authoritative form state.

Preserve scoped en/ar keys, lazy namespaces, fallback rules and authorized
company/system overrides. Select the runtime translation adapter during S0/S1;
template translation alone cannot replace dynamic company texts. Preserve key
ownership/catalog/version checks across both clients. Map `packages/tokens`
semantics into a PrimeNG preset after checking its consumer contract.
`@app/tokens` remains the common design-value source for Angular/Next/Expo; use
one Angular PrimeNG adapter, preserve all five current palettes and light/dark,
and extend sync/CI to the new consumer in S1. Do not fork palette values or embed
feature-specific hex colors. See ANGULAR_ARCHITECTURE section 7 for the contract.

Compare identical fixture data at compact/wide viewports, EN/AR, LTR/RTL and
light/dark. Verify keyboard order, focus return, dialogs, popovers, field error
links, contrast, long labels, table overflow/frozen columns and screen-reader
names. PrimeNG may have a documented visual adaptation; missing controls/views
are parity failures. Record captures in the feature's canonical evidence.

## 12. Platform/client classification and structured-data audit

| Surface | Decision |
| --- | --- |
| Angular Web | Required per inventoried/current feature contract |
| Existing Next Web | Retained; no framework or source deletion; regression guard |
| Native Expo | Conversion Excluded; shared API/session regression verification Required when affected |

For every changed structured feature, record create/edit/view/list-filter/mock
journeys on Angular and revalidate existing Next/Mobile behavior. No JSON text
entry substitute for repeaters. If no domain/native change occurs, record native
implementation N/A with existing evidence, not a fabricated new Mobile feature.

## 13. Specialist integrations

- Reporting foundation precedes the full Countries pilot: global reference reports
  use their actual SuperAdmin/global permission policy; tenant reports use their
  own permission plus Reporting access. Preserve report publication/revisions.
- ActiveReportsJS designer/viewer and Syncfusion PDF need licensed Angular or
  framework-neutral adapters proven with representative documents. React wrappers
  cannot be copied. PrimeUI subscription does not prove these entitlements.
- File upload/download/range/preview, spreadsheets, safe headers/formula rejection,
  bulk/import reconciliation and binary errors retain reviewed limits.
- Realtime preserves token acquisition, subscriptions, reconnect and owner-key
  invalidation. Realtime accelerates authoritative refresh, not business truth.
- CRM calendar, recruitment board, diagrams, Hangfire, OAuth popup/callback,
  external frames, CSP/security reporting, error logs and telemetry each receive
  explicit adapter, timeout, failure and release acceptance.

## 14. Performance, reliability and observability

Lazy-load module routes and heavy dialogs/viewers; avoid eager import of all
modules, translations or reporting vendors. Measure production initial bundles,
lazy chunks, request counts, LCP/INP, list latency and context-switch latency on
representative devices/data. Establish comparable compressed/transferred and
uncompressed metrics separately; Next's recorded 24 MiB aggregate is not a page
download or a directly comparable Angular budget. Freeze concrete budgets after
S3 measurements, before widening delivery. Virtual scrolling does not replace
server paging. Correlation IDs, sanitized errors, CSP and no-store private responses
must survive direct API/client integration changes. Separate environment failures from regressions.

## 15. Verification and acceptance

| Layer | Required evidence |
| --- | --- |
| Pure contracts | Request/response mapping, criteria, permissions, date/decimal behavior |
| State | Context generations, cache invalidation, cancellation, no mutation replay, stale responses |
| Forms/components | Nested editing, validators/server errors/focus, dirty protection, all shared states |
| Direct API/auth transport | Actual cookie/token binding, CSRF where applicable, origins, refresh races, logout/revocation, binary/range/body limits/timeouts |
| Browser fixtures | Reuse business scenarios and fixture data with Angular semantic locators |
| Live .NET | Auth/scopes, persistence, denied actions, concurrency, reports/files and integrations |
| Accessibility/visual | Same-view comparisons, EN/AR/RTL/themes, compact/wide, keyboard and axe |
| CI/release | Audit, strict templates/types, boundaries/cycles, locale/catalog checks, unit/integration coverage, build/budgets, E2E, documentation |
| Cross-client | Next still passes affected gates; Mobile regression for changed API/session contracts |
| ERP acceptance | Each applicable ERP-01..ERP-12 maps to passing tests/live evidence or a reasoned N/A; no API/client gap hidden by generated types |

Port behavior-based tests first; React mocks and markup wiring tests are not
reused verbatim. Tests use the same Zoneless mode as production and must not
hide notification failures by forcing every change-detection pass. Test fixture
success does not replace real API/database/integration verification.

## 16. Rollout, recovery and coexistence

1. Agree DEV/test origins, direct API URLs, allowed origins, configuration and secrets ownership.
2. Keep Next operational; host Angular independently in development/test.
3. Build the foundation, then accept one vertical feature at a time.
4. Do not offer unfinished routes as completed navigation. Track coverage in the
   route acceptance ledger; preserve stable deep links on each app origin.
5. Before external release, run live API/browser and production-only gates, backup
   changed configuration and prove that Next remains available for comparison.
6. Rollback an Angular deployment/configuration independently; API changes must
   remain compatible with retained clients. Do not roll business data backward
   merely because a client deployment is reverted.

No production traffic switch, DNS change, Next removal or database migration is
authorized by this planning task. Future dual-client maintenance scope is an
explicit owner decision; drift is tracked by RISK-016.

Before first external production data, ERP-12 requires a demonstrated isolated
backup restore with integrity validation and named ownership (PROD-023), plus
the applicable hosted diagnostics and core browser checks (PROD-001/019/024).
Use existing operational tools where sufficient. No new backup/monitoring platform
is required merely because the Angular client is new.

## 17. Delivery authority and decomposition

[ROADMAP](ROADMAP.md) owns dependency order and acceptance milestones. The requester
authorized S0-AUTH preflight, session repair and browser transport, then continuing
the Angular foundation while reaffirming persisted UI translations.
S0-AUTH-R1 became execution-ready under the bounded slice rule, as recorded in
documentation/modules/platform/features/platform-browser-authentication/SESSION_RUNTIME_READINESS.md.
R2 browser transport was subsequently authorized and implemented under
BROWSER_RUNTIME_READINESS.md; its actual Chromium/SQL acceptance and final gate are
in verification/BROWSER_IMPLEMENTATION_REPORT.md. The API feature is Verified/Closed.
S1-A0 localization and S1-A1 theme/action are now Verified/Closed; actual local
Community-key activation passed under FOLLOW-013. S2-A0 through S2-A5 are Verified/Closed: sign-in, frame/preferences, module discovery, role home, company and personal fiscal-year context. Current Angular99/architecture7, production year15/company14/language20/shell24/home14/login10 and actual API/SQL/tab/reload/restoration proofs are in canonical reports. The requester authorizes continued sequential migration and reviews at the end. S2-A6 application context navigation is Verified/Closed: Angular109/architecture9, production context24 and existing regressions, Next13/native7 and actual hosted catalog/navigation/reload/refresh/logout passed. The sole Active preparation owner is angular-collection-foundation, S1-A3 — Shared collection foundation; preflight-only, runtime blocked until current shared-control contract/decomposition and Phase00 checks. Overall migration remains Draft; FOLLOW-012/014/015 retain other work.

### Feature Decomposition Gate

Passed for the exact preflight and subsequent session-runtime increments below. The remaining workstreams still
need decomposition; this table grants no blanket runtime readiness.

| Authorized slice | Decision | Feature ID | Screen/Workflow Contract | Coherent boundary |
| --- | --- | --- | --- | --- |
| S1-A3 — Shared collection foundation | Single feature | angular-collection-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-collection-foundation.md | Technical shared collection evidence preflight only; no runtime screen or component authorization |
| S2-A6 — Application context navigation | Single feature | angular-module-context-navigation | documentation/plans/business/web-angular-migration/decomposition/angular-module-context-navigation.md | Existing permitted module/overview header navigation; shared scoped catalog and actual routes only |
| S2-A5 — Accounting working fiscal-year context | Single feature | angular-fiscal-year-context | documentation/plans/business/web-angular-migration/decomposition/angular-fiscal-year-context.md | Existing per-user Accounting working-year header read/select; preserve server company-current/lifecycle ownership and exclude year CRUD |
| S2-A4 — Browser company context transition | Single feature | angular-company-context | documentation/plans/business/web-angular-migration/decomposition/angular-company-context.md | Existing secure Cookie company switch, client scope invalidation/recovery and cross-tab revalidation; no new company/domain schema |
| S2-A3 — Role-aware home and tenant summary | Single feature | angular-role-home | documentation/plans/business/web-angular-migration/decomposition/angular-role-home.md | Existing normal application landing and global read-only summary; no tenant/business CRUD |
| S2-A2 — Accessible module discovery and navigation | Single feature | angular-module-navigation | documentation/plans/business/web-angular-migration/decomposition/angular-module-navigation.md | Read-only server-permitted module/area discovery, guarded routes, real empty destinations; business child screens remain FOLLOW-015 |
| S2-A1 — Authenticated shell and personal preferences | Single feature | angular-application-shell | documentation/plans/business/web-angular-migration/decomposition/angular-application-shell.md | Current Next app frame/shared personal preferences; existing session owner; remaining workspace FOLLOW-015 |
| S2-A0 — Password sign-in and session entry | Single feature | angular-password-sign-in | documentation/plans/business/web-angular-migration/decomposition/angular-password-sign-in.md | User explicitly requires actual default login with same Next design; existing Cookie API/typed challenges/session and shared controls; no business shell/schema/native rewrite |
| S1-A2 — Shared text fields and form submission | Single feature | angular-form-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-form-foundation.md | Typed Reactive Forms, shared text/password CVA and form submission/error/focus; technical harness only, no login/domain/dialog/select/date/tree or API/native change |
| S1-A1 — Shared theme and action control | Single feature | angular-theme-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-theme-foundation.md | Shared token/PrimeNG adapter, preferences/action and technical browser harness; no business form/screen/API/native change; bounded entry per current contract |
| S1-A0 — Angular toolchain and localization runtime | Single feature | angular-localization-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-localization-foundation.md | CLI/build plus persisted translation runtime/service contract; no new screen/schema/API; bounded entry per current contract |
| S0-AUTH-R2 — Browser transport | Single feature | platform-browser-authentication | documentation/plans/business/web-angular-migration/decomposition/platform-browser-authentication.md | User-authorized API Cookie routes/security; BROWSER_RUNTIME_READINESS records passed G0-G3 and release-only G4; no new UI/schema |
| S0-AUTH-R1 — Session correctness | Single feature | platform-browser-authentication | documentation/plans/business/web-angular-migration/decomposition/platform-browser-authentication.md | Repair existing refresh/logout/switch lifecycle and SQL races; G0-G3 passed for this increment, remaining G4 release-only; browser routes/UI excluded from this increment |
| S0-AUTH — Browser authentication preflight | Single feature | platform-browser-authentication | documentation/plans/business/web-angular-migration/decomposition/platform-browser-authentication.md | Existing Platform browser session transport and necessary refresh/logout reconciliation; Phase 00 only, no application code changes |

Only existing evidence enters required-files manifests. The feature contract
records no new UI on both clients; transport regressions remain Required.

Each child follows API -> Web -> Mobile -> integrated live verification ->
documentation/closure. Existing API/Mobile may be revalidated or explicitly N/A
with reason; a Web conversion does not authorize rewriting other platforms.
Complete exact screen/permission matrices and independently classify optional
views. Update the generator/schema for Angular as a separate documented system
change; do not relabel Next evidence as Angular or edit generated packets.

## 18. Readiness and central notes

| Gate | Current status | What remains |
| --- | --- | --- |
| G0 scope/ownership | Draft evidence prepared; not formally passed | Complete route classification and acceptance boundary review |
| G1 rules | Not passed | Per-feature exact permission/API/lifecycle mapping |
| G2 architecture | Partial proof, not overall passed | DEC-027 API binding Closed; Angular toolchain/localization technical proof passed for S1-A0; query/vendor/actual consumer acceptance remains |
| G3 client | Not passed | DEC-026 and Angular pattern references; screen contracts |
| G4 execution/release | Not passed | CI/hosting evidence, representative acceptance and release checks |

Canonical notes: DEC-025 closed (BFF excluded); DEC-027 direct auth binding;
DEC-026 pattern identity; RISK-016
retained-client drift; RISK-017 specialist integration parity. Their central
registries own status and details; this plan references them. Existing PROD-001
through PROD-008, PROD-019 and PROD-020 remain applicable as their exact contracts
require; no existing release risk is erased by the conversion.

S0-AUTH Phase 00 has three passing measured feasibility probes: actual JWT/chunk
capacity, real SQL Identity/EF concurrency and trusted Chromium HTTPS/CORS/CSRF.
The [proof report](../../../modules/platform/features/platform-browser-authentication/verification/PREFLIGHT_PROOF_REPORT.md)
owns selected limits and remaining actual adapter/client/deployment acceptance.
These resolve primitive feasibility only; overall and runtime gate statuses above
are unchanged, DEC-027/RISK-018 remain open, and no business runtime changed.

## 19. Customer education and handoff

Technical S0/S1 work: N/A customer education, because no usable business journey
is delivered. Customer-visible S2 onward: Required after Phase 06 Verified,
including navigation/form differences and actual supported workflows. Phase 07
creates education evidence and closure; never describe unverified views as available.

Handoff: review this Draft and complete DEC-027 direct authentication binding. Then authorize one bounded
foundation/feature contract after its gates pass. Re-estimate delivery after the
full Countries pilot and a complex structured/tree feature. AI assistance changes
coding effort, not acceptance coverage; no calendar deadline is asserted now.
