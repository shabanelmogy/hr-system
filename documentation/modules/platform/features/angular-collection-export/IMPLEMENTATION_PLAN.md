# Shared all-filtered export implementation

Exact authority: S4-A4a contract in the migration plan. Preserve current checkout,
unrelated changes and user servers. No dependencies, schema, commit/push/deploy.

1. API owner: extend existing Reporting ExportExcelService/ExportRequests with
   bounded scalar validation and correct CSV quoting/BOM/formula protection.
   Retain tenant endpoints. Add separate global controller and dedicated global
   permission/catalog. API worker owns Reporting source/tests only; no docs,
   generated catalogs, frontend, database or cross-owner edits. Source/RED/GREEN
   and owned tests precede root full solution gates.
2. Shared foundation: root owns typed file writer port and cancelable all-pages
   orchestration in shared, projection/limits, PageHeader menu/public APIs and tests.
   Source page callbacks remain feature services/state. No UI HTTP.
3. Reporting Angular adapter: root owns authenticated credentialed CSRF file
   generation service, stable public provider and lazy composition binding. Exact
   tenant/global authority, filename/MIME/status/error/binary validation.
4. Owner integration: existing collection state adapters expose captured filters,
   allowed projection and source page/cursor/complete-array loaders. Every current
   applicable collection header gets the same menu in Grid/Cards. Dedicated
   ErrorLogs cap and API requirements are preserved. No current-page substitution.
5. Verification/closure: source reviews, API solution and full Angular quality
   gates, parsed file browser evidence, scope/filters/cancel/limit failures and
   shared owner regressions. Portable evidence/current manifest; explicit external
   publication note; Phase06 then Arabic education/Phase07 and next sibling.

Frozen file format endpoints: existing tenant
POST /api/v1/export/exportExcel/{fileName}/{culture} and exportCsv equivalent.
New global POST /api/v1/global-data-exports/{format}/{fileName}/{culture}, format
`xlsx` or `csv`, culture `en` or `ar`, scalar dictionaries body. Role super_admin
AND GlobalDataExports:Export; independent of TenantMember/Analytics:Export.
The file-generator reads no business data. Source retrieval remains separately
authorized.100000rows/200columns/2000000cells/8MiBrequest; reject empty, invalid
scalar/filename/culture/format/envelope rather than silently truncate.

Root owns public integration and reviews; at most one implementation worker and
the existing read-only reviewer. No duplicate investigation or parallel Angular
build/test. Runtime starts only after the exact Phase00 gate is confirmed.
