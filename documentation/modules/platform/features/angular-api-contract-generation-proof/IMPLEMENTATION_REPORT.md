# ERP-01 — Angular API generation compatibility assessment

Phase06: **Verified assessment** on2026-10-29. Decision: **do not adopt the raw
generated client in application runtime**. Use typed owner services, unknown-input
runtime validation and focused contract/transport tests for migrated consumers.
This is the documented ERP-01 fallback. It does not close whole-API FOLLOW-003.

## Actual baseline and scope

The hosted public https://shabanhrms.runasp.net/swagger/v1/swagger.json returned200,
OpenAPI3.0.4/API1.0,381 paths/344 schemas. Reviewed subset:32 paths/35 schemas from
Countries, FiscalYears, Files and EnvelopeAmendments. No credentials/business data
or live write were used. A captured local component closure is copied without
required/nullability/media/security repairs. Provenance records UTC fetch time,
raw SHA256 and projection digest. Availability does not prove a deployed Git SHA.

Pinned ng-openapi-gen1.1.0 generates109 files. Exact config, isolated package lock,
snapshot, projection/transport harness and digest are in web-angular/tooling/api-contract-proof.
Generated code exists only under ignored .angular/cache/api-contract-proof/run-*.
No app imports it; main app dependency versions and architecture rules are preserved.
Tool peer dependencies pin Angular22.2.3/RxJS7.8.2; actual app compiler is
Angular22.2.3/TypeScript6.0.3. Node24.18.1 used for the recorded run.

## Compatibility matrix

| Dimension | Observed evidence | Decision |
| --- | --- | --- |
| Generation/strict compile |109 files; two outputs byte-identical; actual ngc strict compile passed | Candidate can generate and compile, insufficient for runtime acceptance |
| IDs/nullable/optional | int32 IDs become number; numeric0 serializes; nullable strings retained. No required list: CountryDetailResponse accepts{} and nameEn is optional/nullable despite non-nullable source | Owner runtime schema still Required; do not fake required metadata |
| Enums | FiscalPeriodFrequency1/2 becomes numeric union; fixture carries1 without string coercion | Pass representation; owner rules retained |
| Dates | Date/date-time remain strings; Date object rejected by compile fixture | Pass wire representation; UI/timezone conversion remains owner-owned |
| Decimals | Actual decimal AdditionalSalaryCost represented as OpenAPI number/double and TS number;1234.56 JSON unchanged | No precision guarantee from generator; ERP-07 domain/precision acceptance remains each owner |
| Query/paging | Actual Countries PageNumber/PageSize/Unicode Search/HasStates=false serialized, omitted fields stay omitted | Pass scoped serializer; defaults/bounds remain server/owner |
| Query arrays | No query-array endpoint in captured subset; supplemental RequestBuilder fixture proves repeated ids=0&ids=2 | Serializer-only evidence; no live binder acceptance claim |
| ProblemDetails/validation |400 fixture passes raw HttpErrorResponse with nested field path, trace/correlation. Schema uses arbitrary additionalProperties with any | Gap: no typed validation/error narrowing or response runtime validation |
| Concurrency | Actual fiscal-year RowVersion opaque string preserved. Countries source itself has no RowVersion | Pass existing fiscal representation; no new Countries guarantee invented |
| Cancellation | Unsubscribing Observable triggers backend teardown | Pass client cancellation; no server rollback claim |
| Multipart | Blob becomes FormData; boundary header left to browser | Pass input fixture; upload response metadata incomplete |
| Binary download | Observed response has no content metadata; generated function requests text and returns void while actual FilesController streams File/ranges | Blocking binary contract gap; owner typed Blob service needed |
| Cookie/CSRF | Raw function has withCredentials=false and no X-ERP-XSRF header | Blocking integration gap for direct cross-origin API; preserve existing scoped security transport |
| Media variants | application/json,text/json,application/*+json collide to same function name; observed source order leaves wildcard Content-Type | Block unadapted generation. Sorting object keys changes chosen alias; projection preserves observed order |
| Architecture |61 generated files contain any, rejected by the existing unmodified architecture policy | No broad policy exemption or generated imports added |

## Verification actually executed

-4 projection tests: unrelated exclusion, unchanged nullability/requirements/security,
 missing/external refs fail closed, cyclic local closure, media-order preservation.
-13 transport/type assertions with a recording HttpBackend; zero transport network
 requests/business writes. Actual spec fetch and later --live comparison pass.
-Strict Angular compile includes generated services/functions/models and positive/
 negative type assertions. Two independent generation folders match exactly.
-Clean isolated npm ci from lock passes; final dependency audit0 vulnerabilities.
-Main Angular architecture10 and app/spec type checks pass after tooling addition.
-Entry301 recipes and planning pass. Final canonical checks recorded in closure.
-Prior S1-A4 runtime acceptance remains127 unit/40+8 reference browser cases,
 forms40/login10/context24/language20; those are not rerun/claimed as new tooling tests.

Research-backed harness fixes: Node type definitions are explicitly scoped to
tooling typeRoots because app dependencies contain no @types/node. Media-map order
is preserved after local generator source showed same-name variants overwrite.
No app build/UI test was repeated for tooling-only changes with no runtime import.
API/Next/Mobile runtime, schema and EF remain unchanged; full API test gates N/A.

## Adoption/fallback boundary and remaining work

Continue current typed owner services + unknown narrowing/Zod validation with
contract/transport tests. Preserve withCredentials/current in-memory CSRF, trusted
scope identity, cancellation, error/validation normalization and binary handling.
Feature services own mapping; components cannot call generated transport. Do not
create both generated and manually maintained wire DTO authorities for a consumer.

FOLLOW-003 remains Open: each migrated contract compares actual source/host shape;
before reconsidering generator adoption, reconcile required/nullability, typed
ProblemDetails extensions, file status/media/range metadata, Cookie/CSRF policy,
JSON aliases and no-any output through an exact owning scope and tests. The proof
does not authorize changing business concurrency or globally patching Swagger.
S3 Countries/States and ERP-02 actual consumers remain unimplemented here.

## Reproduce on another device

Run npm --prefix web-angular ci, then
npm ci --prefix web-angular/tooling/api-contract-proof --ignore-scripts.
Run npm --prefix web-angular run verify:api-contracts for offline snapshot proof;
run npm --prefix web-angular run verify:api-contracts:live to additionally compare
the current hosted scoped schema with the reviewed digest. Live drift fails closed.
Explicit recapture is node web-angular/tooling/api-contract-proof/verify.mjs --capture;
review snapshot/provenance changes before accepting a new baseline. No app server,
login, API write or deployment is needed. Cache outputs stay ignored.

## Primary research

[Generator documentation](https://github.com/cyclosproject/ng-openapi-gen) and
[operation variant implementation](https://github.com/cyclosproject/ng-openapi-gen/blob/master/lib/operation.ts)
explain Observable/media behavior; installed1.1.0 code and actual probes are proof.
[ASP.NET Core media metadata](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/include-metadata?view=aspnetcore-10.0)
documents formatter-derived aliases. [TypeScript typeRoots](https://www.typescriptlang.org/tsconfig/typeRoots.html)
supports isolated Node tooling types. [openapi-typescript](https://openapi-ts.dev/introduction)
was reviewed as a type-only alternative, not installed/adopted or claimed verified.
