# Angular API contract generation compatibility — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S0-API-01 — API contract generation compatibility proof |
| Child Feature ID | angular-api-contract-generation-proof |
| Child feature name | Angular API contract generation compatibility proof |
| Owner | Platform Web Architecture + owning API contracts |
| Depends on | angular-reference-selection-foundation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded tooling-only proof after301 recipe/planning Phase00 checks; no application runtime/API/schema/UI edits |

## 1. Child boundary and outcome

ERP-01 requires an actual versioned hosted OpenAPI document and representative
Angular generator assessment before business clients. Capture provenance, compare
schemas to current source, generate an isolated representative Countries service,
compile against actual Angular/TypeScript, and assess nullable/optional IDs, enums,
dates/decimals, arrays/paging, errors/validation, concurrency, cancellation and files.
Produce a documented adoption decision or a typed-service/contract-test fallback.
Do not change API semantics, deployment, schema, existing clients or business UI.

## 2. UI Pattern Gate (mandatory before implementation)

No user screen is created or changed. All UI patterns, form/collection variants,
responsive/browser parity and business mock journeys are N/A with the reasons below.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.contract-proof | Web | No app route | Verify client generation compatibility | Source/spec/disposable compile audit | N/A — no UI | All form decisions N/A | api/ErpSystem.Api/Hosting/ConfigureSwaggerOptions.cs | Excluded | All UI views Excluded | Report actual outcomes only | No offline store | Technical transport fixtures only | Public spec read; no business writes | N/A no screen | No generated runtime adoption until exact decision/gate |
| platform.foundation.contract-proof | Mobile | No app route | Retain current client | Source compatibility audit only | N/A — no UI | All form decisions N/A | mobile-react/package.json | Excluded | All new UI views Excluded | Existing behavior retained | Existing policy | No new business mocks | No changed grant/scope | N/A no screen | No native runtime change |

## 3. Closest existing reference

Actual versioned Swagger configuration at api/ErpSystem.Api/Hosting/ConfigureSwaggerOptions.cs;
Countries presentation, application request/response contracts and existing Angular
platform/api transport are reviewed as evidence, not copied as new business scope.
ERP_ACCEPTANCE.md §2 owns required test dimensions. FOLLOW-003 owns broader automation.

## 4. Reuse and composition contract

Preserve existing Cookie/CSRF/context and error transport. A evaluated tool generated
client is isolated from app imports and cannot replace security interceptors.
Pages must consume owner services, never generated transport directly. No manually
edited generated files or separately maintained duplicate wire DTOs are adopted.

## 5. Screen and workspace contract

One technical assessment, one Active feature. No new business capability, screen,
workspace, lookup API or universal client engine. Findings requiring API behavior
changes need a separately bounded owner contract before implementation.

## 6. Typed transport and server criteria

Record source URL, API/OpenAPI version, retrieval date, SHA256, generator exact
version/config and actual operation subset. No synthetic required/nullability or
concurrency fields may be silently added to make code generation look correct.
Compare list criteria/array encoding/order/paging to the actual controller binder.
Exact permissions are unchanged; Permission Action Matrix N/A no action added.

## 7. Create, edit, view, and lifecycle contract

N/A business journeys; no business mutation. Validate compile/transport fixtures
without posting records. RowVersion and validation gaps block safe broad adoption.
Five-point domain UI and EF migration audits N/A: no domain/schema/client UI change.

## 8. UX states, permissions, offline, and mock data

N/A UI. Report missing/stale schema, generator/compile failures and undocumented
response metadata distinctly. Public spec read only; no credentials or payloads in
evidence. Technical fixtures cannot prove a live authorized business write.

## 9. Concurrency, transactions, and consistency

Assess opaque RowVersion/ETag and actual ProblemDetails/validation paths, existing
cancellation and request serialization. No DB transaction, migration or write.
Do not accept a stale host spec merely because generated TypeScript compiles.

## 10. i18n, RTL, accessibility, and responsive behavior

No visible app text/control change; canonical translation/SQL catalog retained.
N/A browser/mobile visual acceptance for a tooling-only proof.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A4 Verified/Closed | Host provenance and current-source compatibility matrix | This contract |
| 2 | Web | Verified | API audit recorded | Isolated evaluated tool generation/compile and adoption/fallback decision | This contract |
| 3 | Mobile | Verified | Web assessment | Retained source classified | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Actual hosted spec + compile/transport findings, no write claim | This contract |
| 5 | Documentation and closure | Verified | Phase06 exact decision | Canonical books/manifest/report and next handoff | This contract |

Next-step rule: no sibling feature or app runtime while this assessment is Active.

## 12. Verification contract

Phase00 applied books/current-only manifest/recipes/checks before persistent tooling
or runtime adoption. Read-only hosted fetch and disposable experiments are research.
Final report records each ERP-01 dimension as pass/gap/N/A with source/fixture
evidence, reproducibility, unsupported cases and typed fallback boundaries.

## 13. Child exit gate

- [x] Prior reference field Verified/Closed with127 unit/40+8 browser checks.
- [x] Sole preparation owner registered; no business runtime authorization.
- [x] Actual host spec and current-source contract audit.
- [x] evaluated tool generation/compile and representative transport assessment.
- [x] Decision, central findings and canonical closure checks:301 recipes/planning passed.

Customer Education N/A internal technical proof. Overall plan stays Draft.

Bounded tooling entry2026-10-29:301 recipes and current planning passed. G0-G3 fixed for isolated pinned generator/spec projection/strict compile/technical transport harness only. G4 release gates remain PROD-002/017/019/RISK-018. No app adoption or API behavior change.
Phase06 Verified assessment2026-10-29:109 files/strict Angular compile/determinism,4 projection/13 transport tests; raw runtime adoption rejected. IMPLEMENTATION_REPORT owns typed fallback and FOLLOW-003 findings.
