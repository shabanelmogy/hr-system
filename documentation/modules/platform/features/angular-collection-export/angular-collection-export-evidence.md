# Shared collection export evidence register

Documentation state: Phase06 Verified2026-11-07 for bounded local client/formatter integration; hosted acceptance remains PROD-032.

Extend existing Reporting formatting service/CQRS; Platform owns reusable Angular orchestration. Reuse existing source-data services under their own modules. No new bounded context, database entity or schema. TenantMember explicitly denies super_admin; the global formatter must have a distinct GlobalDataExports:Export grant and super_admin role. Do not weaken the tenant route.

Reporting generates files from submitted scalar dictionaries; it does not fetch collection rows. Angular now captures domain-owned filters and reads every matching page before sending the complete projection to the existing formatter. PageHeader owns one shared Excel/CSV action for Grid and Cards. Countries, States, Districts, Tenants, Tenant Administrators, Audit Trail, System Error Logs and the global report manager consume the shared contract. Audit Trail retains Grid-only presentation; Tenant Administrators retains Cards-only presentation; export does not add unsupported views.

Allowlisted ordered scalar columns/labels and rows. Capture fileName/culture/format and source query identity.100000rows,200columns,2000000cells,8MiBrequest envelope; no silent truncation. Dedicated domain caps remain authoritative, including5000ErrorLogs.

Source View and formatter Export grants are independent. Domain owner supplies filtered pagination; formatter only creates a file. Validate/escape CSV, reject complex values and unsafe filenames, bound requests and preserve Arabic unicode. No selected/current-page substitution.

Web embedded P-001 Export Required in current collection headers. New native/PDF/import/chart/CRUD/offline persistence Excluded. Existing native/Next consumers retained; backward-compatible CSV correctness applies to existing formatter use.

Retain tenant Excel/CSV POST actions. Separate global formatter in Reporting with super_admin+GlobalDataExports:Export. Current verified actor selects route; exact credentials/CSRF/status/MIME/size/timeout. Known-total/cursor/local sources use captured actual filters/order and fail on count drift, duplicate IDs/cursor cycles or limit overflow.

PageHeader/ActionMenuButton/notifications and shared export-port/orchestration. Reporting service implements injected file-generation port; composition binds it. No shared→Platform/Reporting dependency, no UI HTTP, no local Grid/Card look-alike. Feature adapters own source queries/field projections.

Unavailable/empty/loading/cancelled/sourcefailure/limit/formatterfailure/forbidden/success are distinct. No automatic replay, native alerts or raw exception bodies. Header remains bounded and accessible at390/900/1440 EN/AR light/dark, including900x640.

Export never mutates visible page/selection/filter state. Actor/filter/order/grant/locale replacement and destruction cancel all stages and stale downloads/feedback. Existing API lacks atomic multi-request snapshot isolation; detect observable drift and document that limit. No DB transaction/jobs introduced.

Canonical EN/AR keys and generators, captured labels/culture, Arabic XLSX direction and UTF8BOM CSV. Reuse menu keyboard/focus/RTL behavior. No outer page overflow.

Version2 contract freezes G0owner/G1P-001embedded/G2typedboundaries/G3verification. S4-A4 predecessor client/education Closed. This current-only manifest/books/recipes must generate/check before runtime. Existing release-only catalog/report gates retain exact scope.

Phase06 Verified2026-11-07 for the bounded local client and formatter integration. Full npm run check passed997tests/195files and32architecture tests. Reporting252tests passed; the unchanged full API source retains the1331pass/3opt-in-skip receipt recorded by angular-account-profile. The final browser matrix passed12EN/AR Light/Dark390/900/1440cases, including900x640:312parsed CSV/XLSX files across8owners, every projected cell compared,12cancel/denial cases and12recovery files. The loopback real Reporting controller/CQRS/writer passed12authorization/file/empty-input cases. Zero outer overflow. Evidence and45source hashes are in verification/verification-2026-11-07.json. The Countries development build preserves its production gate. Hosted acceptance remains PROD-032; no real business writes or deployment occurred.

No dependencies, schema changes, migrations or business-data writes are introduced. Hosted coordinated endpoint/client publication, catalog permission seeding/assignment and real browser-auth acceptance remain PROD-032. Existing tenant formatter authorization is preserved. Local loopback fixture authentication proves controller role/grant boundaries, not hosted Cookie/CSRF acceptance.

Phase07 completed after Phase06 Verified and540recipe check. Arabic customer education is documentation/plans/business/web-angular-migration/education/angular-collection-export.md.

S4-A4a bounded API/Web/integrated acceptance is Verified. New native functionality is Excluded and existing native consumers are retained; no device acceptance is implied. Documentation and Arabic education are Closed for the bounded local implementation. The final Super Admin review remains Required; production Countries and hosted/provider gates are separate and open.

Verified current source paths are registered by required-files.json. The version2 contract owns exact rule/edge-case/impact/permission matrices. No optional business capability is inherited from Countries. Existing exporter is reused; no API/domain/native rewrite. The original Phase00 findings are resolved in source: CSV is escaped/protected, the independent authorized global formatter is implemented and Angular reads all filtered pages. Hosted publication remains PROD-032.
