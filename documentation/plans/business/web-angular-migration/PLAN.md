# Angular 22 and PrimeNG Web Migration — Master Build Plan

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | web-angular-migration |
| Business capability | Angular 22 and PrimeNG Web Migration |
| Owning module | Platform |
| Ownership coordination | Web Architecture; existing business module owners remain unchanged |
| Preflight-only slice | S3-A7 — Countries XLSX import |
| Preflight-only feature | angular-countries-import-view |
| Current execution | S3-A2 read and S3-A3 Create/Edit Verified/Closed; S3-A4 lifecycle Verified/Closed; D28 bounded context/filter/icons Verified, full S1-A14 Queued; D29–D32 S3-A3 form/record correction Verified/Closed; S3-A5 Chart Verified/Closed; S3-A6 Report Verified/Closed; S3-A7 Import source/API/Phase00 Active; full Countries and remaining Views stay Required; S1-A14 extras Queued |
| Status | `Draft` |
| Target milestone | Independent Angular client with verified current Web parity |
| Primary owner | ERP owner + Web Architecture; API/Security for direct authentication |
| Reference features | Countries, States, Cost Centers, Add Tenant, Role Permissions; exact shape only |
| Planning method version | `2.0 — capability plan + slice roadmap + feature contract + evidence ledger` |
| Related plans | frontend-foundation-hardening; accounting-core-gl; workforce-planning; managed-crystal-reporting-reliability |
| Last reviewed | 2026-10-31 |

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
Required chart/managed-Crystal-report/import/export/file/realtime flows; CI and hosting.
ActiveReports viewer/designer/SDK and related template-authoring UI are Excluded
by the requester on2026-10-30; see DEC-028.
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
- ActiveReportsJS viewer/designer/SDK is Excluded by DEC-028; no Angular dependency,
  renderer placeholder, licensing task or parity gate remains for it. Managed
  Crystal/PDF remains Required. Other approved specialist integrations retain their
  own evidence/entitlement gates; PrimeUI does not establish those entitlements.
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
Community-key activation passed under FOLLOW-013. S2-A0 through S2-A5 are Verified/Closed: sign-in, frame/preferences, module discovery, role home, company and personal fiscal-year context. Current Angular99/architecture7, production year15/company14/language20/shell24/home14/login10 and actual API/SQL/tab/reload/restoration proofs are in canonical reports. The requester authorizes continued sequential migration and reviews at the end. S2-A6 application context navigation is Verified/Closed: Angular109/architecture9, production context24 and existing regressions, Next13/native7 and actual hosted catalog/navigation/reload/refresh/logout passed. S1-A3 shared collections are now Phase06 Verified/Closed: Angular119/architecture10/config4,
collection40 and final8 keyboard/layout8, Next8 comparisons/11 tests/type-check,
API localization40/catalog7 and login10/context24/language20 passed. New catalog
host deployment remains PROD-019; retained local Next dependency drift is RISK-012.
S1-A4 is Phase06 Verified/Closed:127 unit tests/10 architecture/4 configuration,
reference40+final8, forms40/login10/context24/language20 and API localization40/catalog7.
Current catalog is b5f21c3a41caf897daa75240d11a69b01a82011a8b913c72f99b592a4c744d8c;
PROD-019 owns matching hosted deployment. ERP-01/S0-API-01 assessment is Verified/Closed: hosted381/344, scoped32/35,
109 deterministic generated files/strict ngc,4 projection/13 transport checks,
isolated audit0 and app architecture10/types. Raw client adoption is rejected;
typed owner services/runtime validation/contract tests are the documented fallback.
FOLLOW-003 owns metadata/security/no-any remediation and whole-API parity.
S1-A5 local form-close is Phase06 Verified/Closed:138 unit/10 architecture/4config,
build440.64kB/116.75kB, browser40+final8 and forms40/reference8/login10/context24/
language20 pass;309 canonical recipe/planning checks pass. No global dirty claim.
S1-A6 registered-draft navigation/context protection is Phase06 Verified/Closed:
160 unit/10 architecture/4config, route40+final8/context8, close8/company14/year15/
module24/login10/language20 pass. Production465.01kB/122.64kB;317 recipes/planning pass.
S1-A7 strict shared date-only field is Phase06 Verified/Closed:173 unit/10 architecture/
4config, date40+final8/timezone10 and reference8/close8/navigation8/login10/language20,
API localization43/catalog7 pass. Build470.79kB/124.18kB;325 recipes/planning pass.
S1-A8 exact numeric field is Phase06 Verified/Closed:188unit/10architecture/4config,
numeric40+8/forms40/reference8/date8/close8/navigation8/login10/language20/API43/
catalog7 pass. Build470.79kB/124.18kB;333 recipe/planning closure passed.
S1-A9 boolean field is Phase06 Verified/Closed:198unit/10architecture/4config,
boolean40+8/numeric8/reference8/close8/navigation8/login10/language20/API43/catalog7
pass. Build472.17kB/124.22kB;341 recipe/planning closure passed.
S1-A10 multiline TextField is Phase06 Verified/Closed:206unit/10architecture/4config,
multiline40+8/form40/numeric8/boolean8/reference8/date8+timezone10/login10/language20
pass. Build473.71kB/124.26kB;349 recipe/planning closure passed.
S1-A11 applied collection criteria/URL is Phase06 Verified/Closed:252unit,
criteria40+8/collection8/navigation8/login10/language20 and357 recipe/planning pass.
Build473.79kB/124.32kB, shared Grid/Cards projected action spacing verified.
S1-A12 scoped read lifecycle is Phase06 Verified/Closed:264unit/read40+8,
context24/home14/company14/fiscal15/login10/language20 and365recipe/planning pass.
Build474.00kB/124.37kB; actual business lookup/watch acceptance remains FOLLOW-017.
S1-A13 read-only assessment is Verified/Closed with373recipe/planning checks.
Current foundation mechanisms support reporting preparation; full S1/G0-G4/pilot
acceptance remains unclaimed. Countries managed-Crystal/PDF path is distinct from
the separate ActiveReports viewer, now Excluded by DEC-028; RISK-017 retains managed PDF and other specialist proof.
S3-A0 global managed Crystal/PDF minimum is Phase06 Verified/Closed with295unit,
PDF40+8,retained login10/language20/context24,API17/localization43/catalog7.
S3-A1 source-only preparation is Verified/Closed: current source/API74/Next13,389recipes and complete queued child contracts. Historical standalone S3-A2 read acceptance was reopened by the requester; S3-A2 correction is sole Active; remaining S1-A14 powers and S3-A3 create/edit are Queued. ActiveReports Excluded
by DEC-028; no designer/license proof for the canceled capability.
Overall migration remains Draft.

### Feature Decomposition Gate

Passed for the exact preflight and subsequent session-runtime increments below. The remaining workstreams still
need decomposition; this table grants no blanket runtime readiness.

| Authorized slice | Decision | Feature ID | Screen/Workflow Contract | Coherent boundary |
| --- | --- | --- | --- | --- |
| S0-API-01 — API contract generation compatibility proof | Single feature | angular-api-contract-generation-proof | documentation/plans/business/web-angular-migration/decomposition/angular-api-contract-generation-proof.md | ERP-01 hosted schema/source audit and isolated generator compatibility; no API/business/native runtime change |
| S1-A14 — Complete shared PrimeNG Table capabilities | Single feature | angular-grid-capabilities | documentation/plans/business/web-angular-migration/decomposition/angular-grid-capabilities.md | One coherent typed shared Table adapter and neutral harness, with exact Next appearance and complete installed capabilities; actual business API/host integration remains consumer-owned |
| S3-A2 — Countries read workspace | Single feature | angular-countries-read-workspace | documentation/plans/business/web-angular-migration/decomposition/angular-countries-read-workspace.md | Global current-page reads, explicit status/search field/operator/sort, shared toolbar/options/footer/record navigation, detail-by-ID, scope loss and transport cancellation. No write or permission placeholders. |
| S3-A3 — Countries create and edit workflow | Single feature | angular-countries-edit-workflow | documentation/plans/business/web-angular-migration/decomposition/angular-countries-edit-workflow.md | Six-field shared form with detail loading, errors/focus/summary, unsaved protection, dev mock data, safe pending/uncertain outcomes, current scoped list reconciliation. |
| S3-A4 — Countries archive and restore | Single feature | angular-countries-lifecycle | documentation/plans/business/web-angular-migration/decomposition/angular-countries-lifecycle.md | Shared confirmation for archive/restore/bulk, exact action authority and read-only barriers, active current-page selection, dependency failures, no hard deletion. |
| S3-A5 — Countries page-scoped charts | Single feature | angular-countries-chart-view | documentation/plans/business/web-angular-migration/decomposition/angular-countries-chart-view.md | Shared chart adapter and four charts: currencies,creation timeline,states count and states coverage; total matching versus visible-page labels, locale/theme/responsive/empty/loading. |
| S3-A6 — Countries managed report integration | Single feature | angular-countries-report-view | documentation/plans/business/web-angular-migration/decomposition/angular-countries-report-view.md | Compose the existing Reporting global Crystal/PDF owner in the Countries view, preserving independent applied criteria, source/hash/permission/cancel and mobile open/download behavior. |
| S3-A7 — Countries XLSX import | Single feature | angular-countries-import-view | documentation/plans/business/web-angular-migration/decomposition/angular-countries-import-view.md | Reusable bounded XLSX file/template/parser/preview/row status and validation composition. One valid-row batch, no invalid-row upload, duplicate feedback and uncertain-submission recovery. |
| S3-A8 — Countries complete pilot acceptance | Single feature | angular-countries-pilot-acceptance | documentation/plans/business/web-angular-migration/decomposition/angular-countries-pilot-acceptance.md | Complete current-source comparison across all five views and actions, realtime invalidation/reconnect, source/layout/paging/focus/full lifecycle/host/production-size acceptance. Enable business route only after complete coverage. |
| S3-A1 — Countries pilot preparation | Single feature | angular-countries-pilot-preparation | documentation/plans/business/web-angular-migration/decomposition/angular-countries-pilot-preparation.md | Read-only full pilot API/multi-view/action/permission audit and exact decomposition; no runtime until frozen child and Phase00 |
| S3-A0 — Managed reporting adapter preparation | Single feature | angular-managed-reporting-adapter | documentation/plans/business/web-angular-migration/decomposition/angular-managed-reporting-adapter.md | Reporting minimum prerequisite source/permission/binary/lifecycle/renderer/designer reconciliation; no runtime before freeze/Phase00 |
| S1-A13 — Foundation exit and pilot readiness assessment | Single feature | angular-foundation-exit-assessment | documentation/plans/business/web-angular-migration/decomposition/angular-foundation-exit-assessment.md | Read-only S1/ERP/Sigma evidence and prerequisite assessment; no runtime/API/schema/native work or implicit full S1/Countries acceptance |
| S1-A12 — Shared scoped read lifecycle preparation | Single feature | angular-scoped-read-lifetime-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-scoped-read-lifetime-foundation.md | Existing scoped-read/SIG-01/02/03 source, finite snapshot/watch and cancellation audit; smallest freeze/Phase00 before runtime, no business/API/schema/native change |
| S1-A11 — Shared collection criteria URL preparation | Single feature | angular-collection-criteria-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-collection-criteria-foundation.md | Existing S1 collections/SIG-06 typed applied criteria and URL/history audit; exact freeze/Phase00 before runtime, no business/API/schema/native change |
| S1-A10 — Shared multiline text preparation | Single feature | angular-multiline-field-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-multiline-field-foundation.md | Extend existing TextField after source/reuse/newline/IME contract and Phase00; no rich text/business/API/schema/native change |
| S1-A9 — Shared boolean field preparation | Single feature | angular-boolean-field-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-boolean-field-foundation.md | Strict boolean Shared checkbox/switch source and reuse preparation; exact freeze/Phase00 before runtime; no business/domain/API/schema/native rewrite |
| S1-A8 — Shared numeric field preparation | Single feature | angular-numeric-field-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-numeric-field-foundation.md | Numeric string/integer/decimal source and precision/reuse preparation; exact freeze/Phase00 before runtime; no business/financial calculation/API/schema/native rewrite |
| S1-A7 — Shared date-only field preparation | Single feature | angular-date-field-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-date-field-foundation.md | Date-only semantic/CVA/shared-field source audit and frozen Phase00 before runtime; no UTC timestamp/calendar/business/API/schema/native rewrite |
| S1-A6 — Shared unsaved navigation and context protection preparation | Single feature | angular-unsaved-navigation-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-unsaved-navigation-foundation.md | Route/context/unsaved registry source preparation; exact freeze/Phase00 before implementation; no domain/API/schema/native runtime |
| S1-A5 — Shared form close and discard protection preparation | Single feature | angular-form-close-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-form-close-foundation.md | Local form-close/discard source/reuse preparation; exact freeze/Phase00 before runtime; no universal navigation/context/API/UI change |
| S1-A3 — Shared collection foundation | Single feature | angular-collection-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-collection-foundation.md | Frozen generic Table/Cards/toolbar/footer/feedback kit and dev-only harness; exact bounded entry after current Phase00, no business/CRUD/API/schema/native UI |
| S1-A4 — Shared reference selection preparation | Single feature | angular-reference-selection-foundation | documentation/plans/business/web-angular-migration/decomposition/angular-reference-selection-foundation.md | Read-only source/API/CVA/reuse audit and exact Phase00 before bounded runtime; no business lookup/API/schema/native UI |
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

S1-A4 bounded entry2026-10-29: G0-G3 fixed by SHARED_REFERENCE_CONTRACT; four current-source books/manifest and293 recipe/planning checks passed. The exact shared single-reference/CVA/form-discovery/dev-harness kit is execution-ready; PROD-002/017/019/RISK-018 remain release-only. No other S1/business runtime is authorized by this entry.

S1-A5 bounded entry2026-10-29:309 recipes/planning and four current-source books/manifest pass; SHARED_FORM_CLOSE_CONTRACT fixes G0-G3 for local consent/Shared modal extraction/dev-only harness. Remaining G4 release-only PROD-002/017/019/RISK-018 cannot change the frozen kit. No global dirty/context/business/API/schema/native feature authorized.

S1-A6 bounded entry2026-10-29:317 recipes/planning and current-only Phase00 pass. UNSAVED_TRANSITION_CONTRACT fixes G0-G3 registered drafts/Router/context barriers/shared confirmation/dev proof; remaining G4 release only. No business editor/API/schema/native/persistent draft or forced reload recovery.

S1-A7 bounded entry2026-10-29:325 current recipes/planning pass. DATE_ONLY_FIELD_CONTRACT fixes G0-G3 for strict string/shared date input, actual PrimeNG calendar and synchronized captions; remaining G4 PROD-002/017/019/RISK-018 release only. No API business/schema/native/timestamp runtime.

S1-A8 bounded entry2026-10-30:333 recipes/planning pass; NUMERIC_FIELD_CONTRACT freezes G0-G3 exact string input/validation/shared template and SQL-backed captions; remaining G4 PROD-002/017/019/RISK-018 release only. No new business/API/schema/native/calculation runtime.

S1-A9 bounded entry2026-10-30:341 current Phase00 recipe/planning checks pass; BOOLEAN_FIELD_CONTRACT freezes G0-G3 strict bool Shared field/vendor controls/SQL captions/dev proof. Remaining G4 PROD-002/017/019/RISK-018 release only; no domain/API/schema/native policy.

S1-A10 bounded entry2026-10-30:349 Phase00 recipes/planning pass; MULTILINE_FIELD_CONTRACT freezes G0-G3 for existing TextField extension and neutral browser proof. Remaining G4 release-only PROD-002/017/019/RISK-018. No API/domain/schema/native/resource change.

S1-A11 bounded entry2026-10-30:357 Phase00 recipes/planning pass. COLLECTION_CRITERIA_CONTRACT fixes G0-G3 for optional Shared collection codec/Router bridge and neutral SIG-06 proof. Remaining G4 release-only PROD-002/017/019/RISK-018. No API/domain/schema/native/resource/permission change.

S1-A12 bounded entry2026-10-30:365 Phase00 recipes/planning pass. SCOPED_READ_CONTRACT fixes G0-G3 for existing helper finite snapshot/error/captured identity/invalidation/lifetime and neutral proof. Remaining G4 release-only PROD-002/017/019/RISK-018; actual business watcher acceptance FOLLOW-017. No API/domain/schema/native/resource change.

Requester scope correction2026-10-30 DEC-028: cancel ActiveReports in Angular, including viewer/designer/SDK/license tasks. Managed Crystal catalog/render/PDF and its manager remain in their existing slices; no existing Next/API/native removal or new business/schema behavior authorized.

S3-A0 bounded entry2026-10-30:381Phase00 recipes/planning pass after DEC-028 cancellation. GLOBAL_PDF_CONTRACT fixes G0-G3 for global Countries catalog/PDF minimum, Shared validated PDF resource/layout and current secure transport. Remaining G4 release-only PROD-002/017/019/RISK-018 for this child; other specialist/full-pilot acceptance remains RISK-017. No ActiveReports/API business/schema/native change.

S3-A2 bounded runtime entry2026-10-30:397current Phase00 recipes/planning pass. GLOBAL_COUNTRY_READ_CONTRACT fixes G0-G3 for authenticated dev-only global Grid/Cards/detail reads and generic shared compatibility extensions. Remaining G4 release-only PROD-002/017/019/RISK-018 cannot change this read contract. Other pilot actions/views remain Required in Queued S3-A3..A8; no API/domain/schema/native/write/AR runtime authorized.

Historical standalone S3-A2 closure (superseded by requester correction)2026-10-30:397entry recipes preceded runtime; fullAngular323/40+8Countries/8Next comparisons and owner regressions verified. Actual runtime manifest/report/technical guide retained; S3-A3 is now Queued behind S1-A14/S3-A2 correction. No full-pilot/host SQL/native acceptance or ActiveReports.

Prior requester correction authorized bounded shell/sidebar entry for S3-A2; the latest priority makes that correction sole Active and S3-A3 Queued. Review current correction ledger before historical closure entries.

Requester scope expansion2026-10-30: all installed PrimeNG Table capabilities through reusable shared configuration/templates/events and exact web-next appearance. FOLLOW-016 is now scheduled S1-A14; no styling differences accepted. Historical generic-kit entry passed Phase00. Current priority makes S3-A2 navigation/header/query correction sole Active/Not Verified, with remaining S1-A14 extras and S3-A3 Queued. Unrelated generic extras do not block actual Countries correction.

S1-A14 bounded runtime entry2026-10-30:405current Phase00 recipes and planning passed. Exact generic Table CAPABILITY_MATRIX and current Next header measurements fix G0-G3. Remaining G4 release-only PROD-002/017/019/RISK-018 do not change this technical contract. No consumerAPI/schema/native/AR runtime from this entry; current Phase06 Not Verified until complete capability proof.

Requester priority override2026-10-30: the complete actual Countries screen is the reference deliverable. ROADMAP is authoritative: S3-A2 correction is sole Active, remaining generic S1-A14 powers Queued, then the existing Countries child contracts execute before any other business screen. Shared components are extended as needed by the actual screen. Native menus now bind strict multi-condition API criteria in source; deployed API/catalog proof and all source Views/actions remain Required for full Countries acceptance. Follow D19: shared-first template reuse, native PrimeNG features and MCP-first verification.

S3-A5 bounded entry2026-10-30: current source/API/MCP/native boundaries reviewed, CHART_SOURCE_CONTRACT.md fixes G0–G3, existing corrected read and command dependencies Closed. Authorize exact read-only page-scoped four charts/shared adapter after Phase00 generation/check/planning; remaining G4 release-only PROD-019/023 and full-pilot gates retained. No new aggregate/entity/schema/native or live business writes.


S3-A5 closure2026-10-31: Phase06 Verified on 2026-10-31 for exact S3-A5 and requester Cards refinements.
Full npm run check passed: 75 files/417 tests, 4 configuration/12 architecture,
types/catalog/tokens/fonts and production build. Initial498.98kB/130.00kB estimated
transfer; unchanged500kB warning budget. Chart renderer212.09kB/63.63kB remains lazy.
Actual authenticated shell browser40 passed five palettes × light/dark × EN/AR ×
390×780/1440×1050. Native canvases painted, source data/counts/zeroes/UTC timeline,
theme/locale repaint without GET, reduced motion, text alternatives, first-page
reset with criteria, retry, stale authority mask and destruction verified. Native
scroll reaches the lower plots; desktop chart rows fill the available viewport.
Current Next source8 comparisons and fresh command/form/record regressions8 pass.
See verification/CURRENT_CHART_ACCEPTANCE.md and durable JSON/screenshots/logs.
No hosted business writes/deployment, schema/migration, native-device or full-pilot
acceptance. PROD-019/023, S1-A14/FOLLOW-016 and remaining pilot children stay open.

Next active child is S3-A6 source/API/Phase00 only, with independent runtime gate. Requester instructed stopping after completing the current Chart step; do not treat its closure as authorization to bypass the Report gate.


S3-A6 bounded entry2026-10-31: source/API/permission/current shared dependencies reviewed. REPORT_SOURCE_CONTRACT.md fixes G0–G3 for embedded global Countries Crystal/PDF and shared compatible presentation. Authorize exact Web after Phase00 entry generation/check/planning. Remaining G4 release-only PROD-019/023/RISK-008/017 and full-pilot checks cannot change this frozen contract. No new API/domain/schema/native/ActiveReports or sibling runtime.


S3-A6 closure2026-10-31: Phase06 Verified2026-10-31 for exact S3-A6 Countries managed Crystal/PDF integration.
Full npm run check:75files/422tests,4configuration/12architecture,types/catalog/
tokens/fonts/build passed; initial499.84kB/130.16kB estimated transfer, unchanged
500kB budget. Entry437recipes/planning passed before application edits.
Actual authenticated Countries Report40 palette/mode/EN-AR/390×780/1440×1050 cases,
focused failure/authority/mobile-PDF-fallback8, current Next source8, retained command8,
Chart8 and standalone Reporting8 passed. Durable JSON/logs/screenshots are in verification/.
No live hosted render/business write, actual Crystal engine/RPT output, native device,
schema/migration, full five-view pixel acceptance or production release claim.

S3-A6 bounded integration Verified/Closed after Phase07 education. Next sole Active
child S3-A7 Countries XLSX Import source/API/Phase00 only, independently runtime-gated.
S3-A8 full pilot/source visual/realtime/host/scale, S1-A14/FOLLOW-016 complete Table
powers and PROD-019/023/RISK-008/017 remain open. ActiveReports Excluded DEC-028.
