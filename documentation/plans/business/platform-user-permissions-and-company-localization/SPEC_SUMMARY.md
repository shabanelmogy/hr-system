# User permission grants and company UI localization — Pre-plan specification

Status: Scope and implementation approved 2026-10-17; source evidence remains separate.

## Product and outcome

Platform administrators can give a user extra authority without changing shared roles,
and customize English/Arabic UI wording and default language independently per company.

## Scope

### Required

- Add/remove direct grants; show inherited, direct and effective permission sources.
- Removing a direct grant preserves inherited role permissions.
- Company language settings with English/Arabic built-ins and one effective default.
- Text editor: base/target languages, source, search, all/missing-override filter, bounded
  paging, key/base/target values, row edit and reset to shipped text.
- Distinguish effective fallback text from an explicit company override.
- Preserve placeholders and plural/context variants according to each resource format.
- Web and Mobile consume current-company text with baseline fallback and isolated context.
- Exact authorization/delegation, audit, concurrency, session/cache and rollout contracts
  must be completed during implementation planning.

### Deferred

Additional languages: canonical DEF-025. No new-language runtime placeholder in V1.

### Excluded

Direct deny; narrowing inherited role permissions; arbitrary translation-key creation/
deletion; automatic translation/providers; importing the reference framework; workspace
generation. Existing role scope is not redesigned by additive user grants.

## Primary journeys

1. Authorized administrator inspects a user's inherited/direct/effective grants and
   saves additions/removals. Direct grants are company-scoped per resolved DEC-021.
2. Administrator opens current-company language settings and selects English or Arabic
   as default without changing another company.
3. Administrator selects base/target/source, searches/filters text, saves an override
   or resets it to shipped text; conflicts preserve entered work.
4. A Web/Mobile user sees that company's text. Company switches resolve the new context
   while preserving existing unsaved-change and request/cache-isolation discipline.

## Domain and source of truth

Platform owns grants, company settings and durable overrides. Proposed storage identity:
Tenant/company + client surface + registered resource + culture + key. Actual Web/Mobile
resource inventories must be reviewed; identical key sets are not assumed. Shipped files
remain the baseline, while database overrides survive redeployment.

Recommended grant identity for company business resources includes user, Tenant, company
and exact Resource:Action. Tenant/global administrative resources retain separately declared
authority. DEC-021 resolved: requester approved company scope on 2026-10-17.

## Architecture and integrations

Use Platform CQRS, persistence and existing security/session boundaries. Extend one
effective-permission authority for tokens, live checks and dependent consumers instead of
a UI-only exception. Retain membership, company-access, read-only and entitlement gates.
Review module visibility and realtime/notification audiences for role-only assumptions.

UI text requires runtime delivery to both clients; updating existing API JSON is insufficient.
Scope cache/request/query identities appropriately. Review retiring/restricting old shared-file
mutation routes so company editing has one safe authority. No external provider is needed.

## Web / Mobile / Design decisions

| Surface | Status | Proposed Active pattern | Required UI |
| --- | --- | --- | --- |
| User permission assignment | Required on Web/Mobile; company grants | P-006 scoped relationship editor; inspect current Role Permissions references before contract approval | Inherited grants read-only, direct grants editable, effective result, search/filter and explicit save. |
| Company language settings | Required on Web/Mobile | P-005 singleton settings using shared form systems | Two built-in languages and one default. |
| Language texts | Required on Web/Mobile | P-001 server-managed list; adapt existing localization tools/shared lists/forms | Wide table, accessible compact rows/cards, dedicated editing form. |

These are pre-plan choices. Exact reviewed sources/routes, permission matrix, optional views,
mock data and tests belong to later version 2.0 contracts. Loading, empty, error, forbidden,
read-only, dirty, conflict and offline states are required. Administrative writes are
online-only. No Candidate screen pattern is needed.

## Privacy / security / commercial applicability

Grant changes and administrator identity follow existing audit/session discipline.
Trusted Tenant/company context and delegation restrictions apply on the server, with
negative cross-scope tests. Registered UI text identifiers are not executable content.
No financial, external-provider, billing or legal-publication workflow is introduced.

## Verified current-state summary

See [EVIDENCE.md](EVIDENCE.md). Role-derived permissions and an API dictionary editor exist.
Bundled English/Arabic UI exists. Direct grants and company UI overrides are target behavior.

## ASSUMPTIONS

| ID | Assumption | Why needed | Impact if wrong | Validation trigger |
| --- | --- | --- | --- | --- |
| A-001 | Explicit user language, then company default, then English system fallback. | Define defaults without overwriting preference. | Startup/switch behavior changes. | Requester specification review. |
| A-002 | Edit/reset company overrides over read-only shipped baseline; missing-override filter differs from effective fallback text. | Define persistence and recovery. | Editor/storage contract changes. | Requester specification review. |
| A-003 | Both clients consume runtime company text and expose online administration via existing tools. | Cross-platform parity. | Client acceptance scope changes. | Review before feature contracts. |

## OPEN RISKS / UNKNOWNS

| ID / note | Risk or unknown | Impact | Owner | Resolution/reopen trigger |
| --- | --- | --- | --- | --- |
| DEC-021 | Resolved 2026-10-17: direct grants are company-scoped. | Persistence, editor and effective permission flow. | Product + Platform | Confirmed in requester implementation authorization. |
| E-005/E-011 | Existing file/cache model has no company partition. | Cannot serve as company UI storage/cache unchanged. | Platform + clients | Replacement boundary in G2. |
| DEF-025 | Languages beyond English/Arabic are postponed. | Language metadata/direction/onboarding remain outside V1. | Product + Platform | Explicit additional-language requirement. |

## Readiness to plan

- [x] Current and target behavior separated.
- [x] Main localization scope confirmed.
- [x] DEC-021 resolved; A-001–A-003 accepted as the specified implementation defaults.
- [x] Requester approved turning this specification into an implementation plan.

Runtime authorization: requester explicitly approved both capabilities on 2026-10-17; execute through PLAN.md and per-feature gates.