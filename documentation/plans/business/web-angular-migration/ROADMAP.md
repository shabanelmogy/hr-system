# Angular Web Migration — Proposed Delivery Roadmap

Status: Draft; no runtime feature authorized or active. This file owns proposed
order. Each workstream must be decomposed into one-feature version 2.0 contracts
before execution; no workstream is a blanket authorization.

## Dependency order

| Stage | Outcome and scope | Depends on | Exit evidence | Relative effort |
| --- | --- | --- | --- | --- |
| S0 Baseline and architecture proof | Classify all routes/views/partials; freeze API/permission map, DEC-027 direct authentication, package peers, license entitlements; prove form/table/translation/vendor adapters | Planning review; no-BFF DEC-025 selected | Decisions resolved for authorized slice; baseline ledger; no placeholder counted as complete | M |
| S1 Angular foundation | Independent app/build/CI; owner boundaries, theme/tokens, locales, transport/query policy, shared forms/table/cards/feedback | S0 | Strict template/type/build tests, shared behavior tests, no raw-grid/form bypass | L |
| S2 Platform access and shell | Direct API authentication/session, all current auth journeys, context transitions, launcher/guards/navigation, preferences | S1; DEC-027 | Fixture and live API auth/scope tests; late-response and refresh-race tests; compact/wide EN/AR | L/XL |
| S3 Reference pilot | Reporting adapter minimum first, then complete Countries; then States and Districts separately | S2; specialist proof | Countries Grid/Cards/Chart/Report/Import and required designer path; archive/restore/bulk; States parent dependency; all permissions and paging | L/XL |
| S4 Remaining Platform and ReferenceData | Address Types/company geography; users/roles/permissions; tenants/admins/invitations; profile/settings/localizations; logs/tools/offline operations | S3; each actual dependency | One feature accepted at a time; exact data-scope and override catalogs; no feature omitted because similar CRUD exists | XL |
| S5 Accounting current scope | Currencies/fiscal years, ledger setup hub, singleton company settings, accounts/hierarchy, dimensions/books/journals/rates/determination | S3/S4 context; actual lookup dependencies | Current implemented resource paths classified and ported; settings not turned into generic DTO; hierarchy/concurrency evidence | XL |
| S6 HR organization | Branches/departments/divisions/cost centers; titles/levels/positions/descriptions | S4; required Accounting lookups | Structured children create/edit/view/list/mock; tree move and cycle/permission tests; responsive direct Move alternative | XL |
| S7 HR operational flows | Workforce plans/budgets/envelopes/requests/amendments/trace; attendance devices/users/punches/pull runs; recruitment | S5/S6 as actual dependency graph requires | Workflow/permission/trace and device API evidence; Kanban pattern review before UI | XL |
| S8 CRM, files and specialist closure | Appointments; remaining reports/designer/manager, file/media integrations, global search/notifications and specialist tools | S2; specialist adapters proven early | Calendar/realtime/date behavior, representative reports and file MIME/range/upload tests; no roadmap vendor feature assumed available | L/XL |
| S9 Full parity and release readiness | Close every inventory row; full cross-feature acceptance, security/accessibility/performance, deployment/recovery, customer education | All required features | No unexplained gap; live API/DB evidence; independent Next/Angular builds; release-only checks recorded | L |

Effort labels indicate uncertainty/relative size, not elapsed days or a commitment.
Detailed ERP acceptance is owned by [ERP_ACCEPTANCE](ERP_ACCEPTANCE.md), not by
duplicated rules in individual workstream summaries. The requester authorized
ERP-01..ERP-12 as applicable requirements, with the timing below.
Reporting/file/calendar proof begins in S0, even if business UI completion is later.
Cross-module/report/lookup dependencies can advance a child contract earlier; all
adjustments must be recorded here, with only one feature Active after authorization.

## Feature units, not bulk conversion

- S1: separate contracts for toolchain/governance, transport/query, shared forms,
  shared collections and localization/theme as their responsibilities require.
  Theme integration consumes `@app/tokens` via one PrimeNG adapter, verifies all
  five palettes/light-dark and adds Angular to package sync/CI without palette duplication.
- S2: coherent contracts for direct API authentication, auth journeys, work context
  and access/navigation; no BFF/gateway workstream or speculative session infrastructure.
- S3: separate Countries, States and Districts contracts. The Countries pilot is
  not accepted as CRUD-only while its Required views remain missing.
- S4–S8: one coherent workflow per contract; do not combine all HR screens or all
  ledger resources into a generic CRUD contract. Use actual API/source boundaries.
- S9: integration/release evidence, not permission to repair unrelated domain scope.

## Mandatory per-feature acceptance checklist

In addition to the checklist, each child records its applicable ERP-01..ERP-12
IDs, owner, status, test command/run and live evidence or N/A with reason.

1. Source route, API/CQRS, exact permission actions, scope and owning books reconciled.
2. Required/Deferred/Excluded capabilities decided per platform; current gaps classified.
3. Active UI Pattern selected with exact reference; resolve DEC-026 where relevant.
4. Shared UI audit and approved Angular adapter selection; no local visual shells.
   Record the D06 state mechanism, scope/lifetime and complexity reason; preserve
   the same pattern for similar features without imposing traditional NgRx Store.
5. List/filter/sort/paging, selection/footer/record navigation and Grid/Card parity.
6. Dedicated structured create/edit/view and realistic mock-data journeys.
7. Field/server validation, first invalid focus, enabled submit and dirty protection.
8. Empty/loading/error/forbidden/read-only/conflict/uncertain-result behavior.
9. Session/context isolation, mutation guards, cache/lookup/realtime invalidation.
10. EN/AR/RTL/themes, compact/wide, keyboard/accessibility and comparison captures.
11. Unit/integration/browser fixture tests plus live .NET/data verification as applicable.
12. Canonical Angular evidence, existing Next/Mobile classification, manifest/recipes
    and generated outputs reconciled; customer education after Verified.

## Baseline change protocol

Record the source commit plus relevant working-tree changes and route/feature
acceptance ID when each child starts. New Next/API changes receive an explicit
impact classification. Reconcile affected Angular behavior before child closure;
do not silently copy a moving branch and call it parity. No fixed deadline until
S3 and one complex S5/S6 journey provide measured implementation/verification effort.

## ERP requirements by delivery point

| Delivery point | Required work / evidence |
| --- | --- |
| S0 | ERP-01 representative versioned OpenAPI generation proof; freeze actual amount/date/wire conventions; inspect current concurrency/idempotency/lifecycle/audit contracts; identify real gaps and owners. |
| S1 | ERP-02 generic reference selector and typed owner adapters; ERP-03 keyboard/error/focus contract; ERP-04 shared structured-editor harnesses; generator/config/stale-output check if proof succeeds. |
| S2 | Direct auth/context cancellation, no stale scope result, safe pending/uncertain write behavior; preserve exact existing API guarantees. |
| S3 | Full pilot demonstrates lookup selection/search/parent behavior, conflict/duplicate/result handling where applicable, typed transport and production-size/request baseline. |
| S4–S8 | ERP-04..ERP-11 verified against each real workflow: structured edit/reload, precision/date edges, lifecycle authority, actual audit, reports/import/export and scale. |
| S9 / before first external production data | Close coverage and applicable live tests; ERP-12 isolated restore/integrity proof, diagnostics/redaction and recovery/rollback ownership under existing production note IDs. |

Generated client assessment and a backup restore are not new product modules.
No BFF, new queue/cache server or generic workflow engine is added. A missing
domain/API guarantee becomes an explicit owning-slice gate, not an unreviewed
Angular workaround or permission to redesign the ERP during conversion.
