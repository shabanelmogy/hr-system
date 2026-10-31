# API generation compatibility — Retained native profile

## 1. Ownership

Platform Web Architecture owns this internal ERP-01 assessment; each API module retains DTO/domain/grant ownership. No business capability or schema change.

## 2. Current evidence

Actual hosted /swagger/v1/swagger.json returned200 on2026-10-29, OpenAPI3.0.4,381 paths/344 schemas. Source ConfigureSwaggerOptions, Countries/FiscalYears/Files and HostProblemDetails are inspected. Host availability does not establish source-build identity.

## 3. Bounded outcome

One isolated reproducible ng-openapi-gen1.1.0 compatibility proof against a captured hosted subset. No generated imports in app src, no generator-wide adoption, API edit/deployment, business request or UI. Candidate decision must include fallback when unsupported.

## 4. Relationships

Reuse Angular22.2.3/TypeScript6.0.3/RxJS and actual HttpClient contracts. Existing owner services use withCredentials and current in-memory X-ERP-XSRF. No interceptor replacement, bearer-token store or duplicate domain service.

## 5. Platform classification

Web internal tooling/compile/transport fixture Required; app UI Excluded. Native new UI/runtime Excluded; retained contracts unchanged. Business CRUD, chart, import/export UI, report designer, offline and mocks Excluded. Technical schemas/fixtures are explicitly non-live.

## 6. Typed transport and criteria

Capture source URL/version/date/raw SHA256 and verbatim operation/schema closure; never repair missing metadata in the observed input. Pin generator/config and isolated lock. Countries query names/paging preserved. Generated output is disposable, generated only and never hand edited.

## 7. Business Rules Matrix

Rules: no writes => read-only fetch/technical HTTP backend; no hidden schema repair => extraction only; no false contract authority => compare each claimed shape with owner source; current security preserved => candidate credentials/CSRF tested; no broad readiness => per-dimension assessment and fallback. Enforcement is proof harness/report, not business runtime.

## 8. States and edge cases

Assess optional vs nullable/non-nullable source strings, int32 IDs/zero, numeric enum, date/date-time strings, decimal represented as JSON number, query arrays/paging, arbitrary ProblemDetails extensions/validation paths, opaque RowVersion, unsubscribe cancellation, multipart input and absent binary output schema. Unsupported dimensions are findings, not invented contracts.

## 9. Consistency and permission

Public schema reads only; no user/tenant/company data or cookies. Countries has no RowVersion in actual source; fiscal-year edit does. Generator must not synthesize domain concurrency. Write fixtures use no real server and preserve context security requirements.

## 10. API and persistence

Read-only API source/spec audit. No DTO/controller/domain/EF/config/schema changes; migrations/live DB and five-point business UI audit N/A. Hosted Swagger describes bearer globally; Cookie/CSRF/ProblemDetails enrichment and files need source reconciliation.

## 11. Verification

Phase06 Verified assessment, raw-client adoption rejected; IMPLEMENTATION_REPORT
and verification/results.json own actual evidence.4 projection tests,13 transport
assertions,109 generated files/deterministic repeat/strict ngc compile, hosted
scoped digest check, clean isolated installation/audit0, app architecture10/types pass.
No actual business write, UI, EF or server mutation; full API/Next/native gates N/A.

## 12. Operations and release

FOLLOW-003 owns whole-API contract parity and missing schema metadata; PROD-019 retains matching hosted-resource deployment. No host write/publish or credentials. Existing RISK-012 retained Next dependency drift is not repaired here.

## 13. UI pattern and accessibility

N/A no app route, screen or visible text. Both platform UI entries explicitly Excluded in the version2.0 contract. Existing Shared controls remain unchanged.

## 14. Readiness

301 Phase00 recipes/planning passed before bounded tooling. G0-G3 fixed; no app
runtime/API/schema/UI adoption. Phase06 assessed and proved compatibility limits;
typed owner services + runtime validation/contract tests are the ERP-01 fallback.
Overall plan remains Draft; release gates and whole-API FOLLOW-003 remain open.

## 15. Handoff

This assessment is Verified/Closed with the documented typed-service fallback. IMPLEMENTATION_REPORT and portable results own actual outcomes; FOLLOW-003 owns broader remediation. ROADMAP/RESUME identify the sole next Active feature. Prior S1-A4 evidence remains independent; overall plan stays Draft.
