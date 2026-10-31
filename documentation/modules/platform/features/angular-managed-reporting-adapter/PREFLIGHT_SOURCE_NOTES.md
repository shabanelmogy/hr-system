# S3-A0 initial source audit — Draft

Read-only preparation2026-10-30. Runtime still Blocked; this is not Final Phase00.
Technical migration evidence is registered under Platform by the parent plan;
actual API/business ownership remains Reporting and generic layout remains Shared.

Verified GlobalCrystalReportsController: GET api/v1/global-crystal-reports with
entityKey, POST api/v1/global-crystal-reports/{sourceId}/render with EntityKey,
ExpectedSha256, Language, Filters. SuperAdmin role + ViewGlobalCrystalReports at
controller boundary; execution is a read-only global geographic/deployment RPT
boundary, separate from tenant/company stores. PDF response; range processing
false; render advertises400/401/403/404/409. Next config/api/crystalReports.ts points
to these endpoints. No API request/mutation/SQL or runtime code change performed.

Before freeze: inspect query/validator/handler/contracts and host Cookie/CSRF
middleware; reconcile error/MIME/empty/version hash/cancel/timeout and backend
engine behavior, approved filters/languages, tenant counterpart and exact designer
entry. Controller source alone is not complete permission/transport evidence.
Trace mobile-browser PDF fallback and Blob URL teardown/current scope races.
Keep global Countries managed-Crystal distinct from ActiveReports React viewer;
no new package/license/purchase/renderer selection inferred. RISK-017 remains open.
