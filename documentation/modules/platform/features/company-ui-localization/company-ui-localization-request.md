# Company UI localization — Implementation request

Approved intent: platform-user-permissions-and-company-localization / S2 Company UI localization, requester 2026-10-17.
Contract: documentation/plans/business/platform-user-permissions-and-company-localization/decomposition/company-ui-localization.md.
Owner: Platform. S1 closed before this feature implementation; the applied books and evidence ledger record the delivered automatic scope and separately owned release checks.

## Authorized scope correction — 2026-10-17

The requester approved excluding system-owned translations from company management
and explicitly selected "prevent them at companies for now". A new global Web/Mobile
translation editor for Super Admin is Excluded from this correction. This extends
the existing catalog eligibility boundary, not the aggregate, schema, permissions,
routes, or screen pattern. System strings remain shipped static resources.

One explicit classification manifest owns `system`, `company`, and `shared`
catalog eligibility. Global geography (Countries/States/Districts), tenant and
tenant-admin management, Super Admin dashboards and their mixed-source navigation
keys are system-owned. Company-scoped Address Types, tenant roles/users/invitations,
company geography, and generic controls remain eligible according to their current
owners. A technical-looking namespace alone does not make it Super Admin-only.

The API must omit system-only sources and mixed-source system keys from settings,
text search/paging, and runtime; reject direct set/reset requests; and suppress old
stored overrides without deleting their audit/history. Web and Mobile runtime
overlays independently reject system keys. Classification participates in both
client fingerprints, and unknown new sources/Mobile roots require classification.
Focused tests cover mixed keys, stale persisted overrides, direct store/handler
calls, valid shared/company customization, and client baseline restoration.

## Existing-System Relationship Review

Extend Platform company settings and existing translation runtimes. Keep the existing file-backed API resource editor unchanged. Web/Mobile shipped catalogs are the authoritative key baseline; a generated embedded catalog bridges them to the API. No cross-module EF/database access. Auth sessions provide trusted company scope. All editor mutations online-only. No session revocation is required for translation changes.

## Business Rules Matrix

| Rule | Primary owner | Stable outcome/error | Required evidence |
| --- | --- | --- | --- |
| Current active company only | Application actor + Infrastructure scoped query/write guard | Forbidden/missing scope | Foreign company read/write and response-scope tests |
| Registered source/language/key only | Application catalog validation | Invalid source/key/language field | Catalog unknown key and malformed client tests |
| en/ar only | Domain language policy | Invalid language | No language creation control/endpoint |
| Exact interpolation multiset preserved | Domain text policy + catalog | Value field validation | Missing/extra/duplicated variables |
| Empty text uses reset | Domain text policy | Value field validation | Whitespace rejected; reset deletes customization |
| Single company revision | Domain aggregate + serialized transaction | 409 Conflict | Stale create/edit/default/reset/no-op |
| Preserve shipped baseline | Runtime resource owner | Static fallback | Reset/switch/logout and late namespace tests |
| Explicit preference > company default > English | Client language owner | Deterministic selection | Existing preference unchanged on switch |
| Independent action authorization | Controller exact permissions | 403 | View/Edit/Reset/SetDefault tests |
| Audit and mutation atomic | Infrastructure transaction | Rollback on failure | Audit content/revision/save tests |

## Edge Cases and Validation

| Category | Scenario/decision | Enforcement | Required evidence |
| --- | --- | --- | --- |
| Identity/scope | Missing tenant/company; foreign response; inactive company | Actor, scoped context, client adapter | Denial tests |
| Required/length | Source <=100, key <=400, value <=4000, search <=200 | Validator + Domain | Invalid boundary tests |
| Duplicates | One override per source/language/key; one root per company | Unique indexes + root aggregate | Model/migration + upsert test |
| Relationships | Company FK; key must exist in embedded catalog | Persistence + catalog | FK/model and unknown key test |
| Lifecycle | Reset removes one override; default en if absent | Aggregate | Reset/no-op/default tests |
| Concurrency | All mutations carry expectedRevision >=0 | Aggregate + lock | Conflict and first-write serialization |
| Formatting | Preserve whitespace inside value, placeholders/plural leaf keys | Text policy | Exact value roundtrip |
| Search/paging | Ordered key, page >=1, pageSize 1..100; no editor full dump | Query validator/projection | Bounds/status/search tests |
| Runtime | Only requested web/mobile overrides, no client scope input | Runtime read projection | Consumer isolation tests |
| Availability/offline | Static bundles on error; no offline editor writes/cache | Client repository/runtime | Offline/read error tests |
| External/provider/calculation | N/A: no provider, money, stock or integration event | N/A | N/A |
| Release | Native device acceptance scheduled explicitly | PROD-026 | Requester device checklist |

## Impact Matrix

| Area | Decision | Evidence/target |
| --- | --- | --- |
| Domain | Add company settings aggregate + text policy | Platform company localization |
| API | Add scoped CQRS query/commands/ports/controller | company-localizations route |
| Database | Add settings/override tables + migration | Platform context |
| Authorization | Extend exact TenantAdministration permissions | CompanyLocalizations View/Edit/Reset/SetDefault |
| Web | Add Platform route, P-001 page, shared forms, runtime overlay | Existing global editor/reference + static namespace registration |
| Mobile | Add Platform Clean Architecture feature/route, shared list/forms, runtime overlay | Existing company geographic scope and localization references |
| i18n | Add paired strings and generated catalog bridge | Web namespaces; Mobile translation |
| Sessions | Reuse trusted scope/reset lifecycle; no grant/stamp changes | Auth transition neutral reset hook |
| Tests/docs | Add focused validation/scope/runtime/UI checks | Phase 06 evidence + manifests |
| Reporting/import/export/tree | Excluded independently on both clients | No placeholder surfaces |
| Cards | Required on Mobile; Web Grid Required, Cards Excluded for V1 bounded text comparison | P-001 platform adaptation |

## Delivery and acceptance

API → Web → Mobile → integrated HTTP/browser verification → documentation/education. Real device testing is separately owned by PROD-026. Register only existing evidence paths before runtime. Do not claim implementation merely from this request.
Mock policy refinement: both row-edit forms expose the existing shared generator to create a local suffix on the shipped target text, retaining every placeholder; no invented key, revision, user or company. Web Cards are Excluded in V1 because this editor compares base/target columns in one bounded grid; Mobile Cards remain Required. Missing status means no company override, while effective fallback remains visible.

