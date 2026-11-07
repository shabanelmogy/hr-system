# Global Crystal Template Manager — api profile

Status: source and technical gates Verified for the expanded scope; integrated hosted/browser/native acceptance Active. Phase06 Not Verified; Phase07 not started.

## 1. Implemented boundary

### Current evidence registration — 2026-11-05

The requester-authorized [current Reporting evidence baseline](../../CURRENT_EVIDENCE_BASELINE_2026-11-05.md)
registers existing sources and retained receipts only. Unavailable historical raw
logs are preserved in an inventory, not claimed as recovered or replayable proof.
FOLLOW-025 owns future reliance on those logs. This documentation-only correction
does not re-run runtime tests, change platform scope or close release gates. Earlier
verification statements below retain their original dates and bounded scope.

Reporting owns CQRS and ISender-only controllers. Management remains super_admin + global View + persisted entity Edit/action. Public list/render/current-source are authenticated and use GlobalCrystalReportAuthorizeAttribute to invoke the existing live platform or tenant permission policy. Application policy and persisted grants independently enforce scope. Existing tenant report controller remains TenantMember.

### Programmatic Verify Database and automatic publication — 2026-11-07

Reporting now exposes a protected `POST /api/v1/global-crystal-reports/manage/{id}/versions/{versionId}/verify-database` action. It reads the immutable stored RPT, delegates `ReportDocument.VerifyDatabase()` to the internal Crystal runtime, stores the adapted file as a new version, re-inspects it against the current managed contract, and publishes that version atomically. The previous version remains preserved if any stage fails. See [automation evidence](VERIFY_DATABASE_AUTOMATION_2026-11-07.md).

## 2. Reuse inventory

Reuse canonical ManagedCrystalReportContractRegistry, ICrystalReportFileStorage/PrivateCrystalReportFileStorage, native inspector/renderer, Reporting unit of work/SQL locks, existing response DTOs/errors/validation rules and upload body-size filter. IGlobalCrystalReportIdentity isolates Infrastructure hashing behind an Application port.

## 3. Persistence

Additive rpt.GlobalCrystalReports, GlobalCrystalReportVersions and GlobalCrystalReportRoleGrants, all globally audited. Grants have an active filtered unique report/role index, rights constraint, audited deletion and FK to the global report. Composite owned-publication FK, root/version uniqueness, private immutable bytes and rowversion remain. Default global reads/writes require super_admin; only the narrow grant-filtered consumer port selectively disables GlobalActorFilter.

## 4. HTTP contracts

Existing manage entities/list/detail/schema/create/import/inspect/version/source/revalidate/publish endpoints remain. List accepts optional entity All and status draft/published/archived plus bounded search/page/pageSize. Discovery returns {items,totalCount}, including rejected/registered metadata. Add GET manage/roles, GET and PUT manage/{id}/access and DELETE manage/{id} with expected RowVersion. Add GET global-crystal-reports/{sourceId}/source?entityKey&expectedSha256 for current granted publication only. Public catalog adds CanDownloadSource. No private paths or credentials are returned.

## 5. Authorization

See the exact matrix in PARITY_SCOPE_2026-11-01.md and PARITY_IMPLEMENTATION_2026-11-02.md. Archive and ACL View/Edit join the existing global actions. ACL Edit implies ACL read, including archived history; archived ACL stays immutable. Role choices identify tenant and validate current role IDs. Company role membership intersects trusted tenant-assignable roles; grants do not bypass live tenant/module entitlement, owning View or report Run/Download authority. Startup synchronizes new system-role permission claims; refresh sign-in after deployment.

## 6. Source and schema

Private file storage validates extension/size/signature, upload inspection, native exact contract, and saves immutable GUID sources with hash/length. Global create/append verifies inspection schema/fingerprint against the current registry before commit. Advisory inspect never saves. XSD exports canonical ordered fields/types/nullability through IManagedCrystalReportSchemaSource. Invalid or unavailable runtime never promotes a version.

## 7. Publication/revalidation

Explicit publication under the root resource lock checks expected SQL RowVersion, owned version, Valid state and current fingerprint. Upload leaves the publication pointer unchanged. Revalidation preserves immutable bytes and treats transient inspection failure as no change. Current invalid/stale managed publication cannot render or fall back to deployment bytes.

## 8. Transactions and concurrency

Create identity locks/unique indexes, append/publish/revalidate/grant/archive root locks and expected RowVersion protect mutations. ACL replacement advances root version and audits removed grants. Archive records deletion actor/time, preserves versions and continues deployment shadowing. Archived reports deny mutation/download. Failed uploads compensate only uncommitted private files. Null/unknown/duplicate/over-limit ACL input is rejected by validators.

## 9. Actual migration

Both 20261101123802_AddGlobalCrystalReportVersions and 20261102075822_AddGlobalCrystalReportAccess were generated/applied through the owning migration scripts. Direct configured Development/test-host inspection verifies three tables, seven grant/audit contract columns, one filtered unique index, one grant FK and access migration history. No business rows were written by schema inspection; no remote site was published.

## 10. Consumption compatibility

Platform catalog retains non-shadowed deployment sources and current managed publications. Company catalog/render/source uses only explicitly granted active current valid managed publications. Never deployment fallback, drafts, archive history or invalid fingerprint. Opaque64hex identities/tokens and verified hash/length remain; stale tokens fail before storage/native work. Next/Mobile company consumers require both report/entity permissions and scope catalog caches to user/tenant/company.

## 11. Evidence and limits

1239 API tests passed, 0 failed, 3 existing opt-in browser skips across 12 projects; Reporting 203; architecture 70. Angular full check: 504 tests/90 files, 26 architecture cases, format/lint/strict types/templates/catalog and production build passed. Next reporting: 30 tests plus permission-catalog parity, type-check and architecture passed. Mobile full check: 601 tests/195 suites passed; repository-wide coverage remains limited (28.34% lines), not feature-specific acceptance. Positive compatible native RPT/PDF, hosted authenticated discovery response and final browser acceptance remain FOLLOW-024; no fixture closes them.


### Registration layout correction — 2026-11-02

Registration layout correction: full Angular check passes499tests/89files,26architecture cases, format/lint/strict types/templates and production build with no budget warning. The production-build browser fixture passes40cases across EN/AR, both directions, five palettes, light/dark and1213px/390px. It verifies no clipped action/label, responsive icon-only actions and actual horizontal scrolling in both directions. Native/host/remaining manager acceptance stays FOLLOW-024; Phase06 Not Verified. Canonical report: documentation/plans/business/global-crystal-template-management/REGISTRATION_LAYOUT_2026-11-02.md. No API, permission, persistence or Mobile behavior changed in this correction.


### Existing-report registration rejection2026-11-02

Existing-file rejection correction2026-11-02: the current hosted RPTs have valid OLE signatures and matching hashes, but native inspection rejects database connection metadata. Read-only Crystal10 RDC metadata confirms Command tables/crdb_ado.dll and no Language parameter; the first report also lacks State schema fields. Inspection/storage now preserve SourceRejected, including exact legacy-message compatibility, with no private-file/report/version side effects. Full ERP1223tests pass (188Reporting,70architecture),3existing browser skips; independent Crystal build/contract harness pass. No schema, permission or source-policy change. Original RPTs unchanged; requester installs Crystal2013 before further designer work. FOLLOW-024/native acceptance remains Open. See documentation/plans/business/global-crystal-template-management/IMPORT_REJECTION_2026-11-02.md. Existing clients already support the localized CrystalReport.SourceRejected error; no new client contract or administration surface is added.


## Design-source workflow preflight — 2026-11-02

Authorized GCT-1 revision: `documentation/plans/business/global-crystal-template-management/DESIGN_SOURCE_WORKFLOW_2026-11-02.md`. Current registry/aggregate/store inspected: approved executable sources, zero-version metadata drafts, unchanged native inspection and publication. Angular administration Required; Next/Mobile administration Excluded, consumer compatibility Required. No View Builder or arbitrary SQL execution authorized. Preflight completed; implementation and current technical evidence are recorded in section20 / the manual View implementation report; hosted/native FOLLOW-024 remains open.


## 20. Manual global SQL View and empty-template workflow — 2026-11-02

User-approved GCT-1 revision is implemented: select the server-owned module and approved data structure, manually enter a real schema.ViewName, and create an unpublished metadata draft before uploading an RPT. Reporting persists immutable ViewName/ViewFingerprint; ReferenceData owns bounded parameterized SQL reads through its public Contracts port. Schema-bound definitions may reference only the reviewed global geographical tables; canonical columns/order/types/nullability and definition fingerprint are checked. Missing, changed, tenant-table or unsupported Views fail closed, without fallback. Existing null-bound templates retain their providers. No SQL or connection string is sent by Angular.

Angular reuses shared form/dialog/PrimeNG fields and MyDataGrid; its dedicated design state owns HTTP orchestration, identity cancellation and unsaved drafts. Fields/Language and XSD/metadata/instructions ZIP support Crystal Designer. The empty draft contains no RPT; the first inspected upload becomes version1 and explicit publication/ACL remain unchanged. Manual SQL View entry does not permit arbitrary field shapes: current approved structures are Countries/States/Districts in ReferenceData. Future Builder/additional scoped providers are DEF-027.

Migration20261102120604_BindGlobalCrystalReportViews was applied using the repository migration workflow; the actual configured schema/history/constraint were inspected. All9module models have no drift. Full ERP1239passed/0failed/3existing opt-in skips (Reporting203,Architecture70,Integration188); Angular504tests/90files,26architecture cases and full quality/build gate pass. Production-build fixture browser8cases cover EN/AR,light/dark,desktop/mobile, validation/correction/draft navigation/download and unobscured sticky Save; existing registration smoke passes. The shared FormContainer establishes a content stacking context so nested sticky grid headers cannot obscure its footer. PrimeNG MCP unavailable; official table documentation/CSS isolation and actual browser behavior were used instead.

Next/Mobile administration remains Excluded; consumer list/render/source envelopes remain unchanged. Existing full ERP consumer authorization/regression coverage passes. No new structured input or management UI is Required on those clients. Their previously recorded client suites were not rerun for this Angular/API revision.

Canonical implementation: `documentation/plans/business/global-crystal-template-management/MANUAL_VIEW_IMPLEMENTATION_2026-11-02.md`. Current receipt: verification/manual-view-workflow/verification.json. Earlier parity receipts are historical baselines. No remote application publication, original RPT edit or real positive native PDF proof occurred. FOLLOW-024/PROD-028 remain Open; Phase06 Not Verified and Phase07 not started.


## 22. Database View discovery and prepared LEFT JOIN Views — 2026-11-02

This current GCT-1 revision supersedes manual typing in section20. Angular selects a
real database View through the existing shared searchable/paged ReferenceField,
with refresh, explicit empty/error/retry, disabled incompatibility reasons and
identity/source cancellation. No shared control was duplicated. Native RPT design,
upload, inspection, publication, ACL and immutable binding remain unchanged.

Reporting GET manage/database-views requires super_admin, Global View/Create and
the source entity Edit before ReferenceData metadata access. The public Contracts
port excludes tenant/company, cross-database, unresolved, UDF and unrelated sources.
List and inspection read metadata only. Eligible unbound or incompatible Views are
disabled; Save re-inspects authoritatively. Search/page/timeout/response bounds apply.

ReferenceData migration20261102143015_AddGlobalReferenceReportViews creates
ref.vw_Countries (Countries LEFT JOIN States), ref.vw_States (States LEFT JOIN Country)
and ref.vw_Districts (Districts LEFT JOIN State LEFT JOIN Country). All current root
physical columns are explicitly enumerated; navigation fields use State_/Country_
prefixes. Root and related soft deletion are respected; missing related rows do not
remove roots. Countries repeat per state intentionally. Existing object collisions
fail without overwriting. SCHEMABINDING means future table-column changes require a
reviewed migration to the Views; newly added fields are not picked up automatically.

The configured Development database was migrated using the repository script and
inspected: three schema-bound Views; root/view columns Countries18/40, States16/40,
Districts16/56; zero missing root columns. Wider SQL metadata does not change the
managed Crystal schema: backend projects only its approved6/7/8 fields in exact order.
District AddressesCount is populated by ReferenceData using its existing trusted
tenant/company filters, only during execution. No tenant Address join enters a global
View. SQL tests verify separate company counts, joins, filtering and fingerprints.

Technical evidence: ERP1244 passed/0 failed/3 existing opt-in browser skips across12
projects (Reporting207, Architecture70, Integration189);9 module models have no drift.
Angular full gate509 tests/91 files and26 architecture cases passes, including format,
lint, strict types/templates/catalog and production build. Browser fixtures pass8
production plus8 existing-development cases, EN/AR/light/dark/desktop/mobile, including
disabled choices, invalid View correction, draft navigation and download. No dev
server was started or restarted. PrimeNG MCP is unavailable; installed shared Select
behavior and official documentation were checked; no MCP validation is claimed.

Creation/edit/view/list/mock audit: create uses searchable metadata selection; edit
preserves immutable binding; detail shows ViewName; the manager keeps draft/source
state; fixtures model compatible, disabled, empty and unavailable outcomes. Angular
administration is Required. Next/Mobile administration is Excluded, and their existing
consumer payloads and report schema stay compatible; no new management controls or
client suite rerun is claimed. Prior Next/Mobile receipts are historical baselines.

Current receipt: verification/database-view-discovery/verification.json. The earlier
HTTP401 is not diagnosed or declared fixed by the subsequent HTTP400 InvalidView.
No hosted application deployment or positive native-valid RPT/PDF acceptance occurred.
FOLLOW-024/PROD-028 remain Open; Phase06 Not Verified, Phase07 not started, Builder DEF-027.


## 23. Empty-template work deferred; ready-made RPT first — 2026-11-03

Current requester priority supersedes continuing the empty-template preparation
journey in sections20/22. DEF-028 is the canonical deferral for further preparation
and the proposed reusable base-design Templates folder/library. Current GCT-1 work
is ready-made RPT upload, inspection, explicit publication and real PDF display.
The existing empty drafts, SQL Views, XSD packages and source bindings remain
implemented; no runtime or schema change accompanies this documentation decision.
The base-design library has not been implemented. Angular owns administration;
Next/Mobile administration remains Excluded, existing consumer authorization stays
unchanged. FOLLOW-024/PROD-028 stay Open, Phase06 Not Verified, Phase07 not started.
Reopening DEF-028 requires the recorded real-render check and explicit requester
resumption; DEF-027 View Builder stays separate. Earlier technical receipts remain
historical evidence and do not establish native acceptance.


## 24. Command design source with pushed runtime data — 2026-11-03

Requester clarified that the existing RPT Command and View-based design connection
must stay in the file. Active GCT-1 changes the runtime source policy accordingly;
DEF-028 empty-template/library preparation and DEF-027 Builder remain Deferred.

Design server/database/user/integrated-security/provider values no longer cause
source rejection or select a runtime connection. Inspection accepts one named
table/Command with any alias and the exact approved field count/order/types and
Language contract. Saved rows, subreports, additional tables, SQL-expression fields
and actual embedded passwords remain unsupported. This supersedes the earlier
blanket ADO.NET/XML-only source rule and exact RPT table-alias requirement.

Rendering sets only the received in-memory DataTable alias to the inspected source
name, then calls Table.SetDataSource on that sole table. It never modifies/saves
the original RPT or Command SQL, adds database credentials, calls Refresh or
VerifyDatabase, or falls back to querying SQL after failure. The ERP API remains
the scoped-data provider. Backend XML/XSD table name and approved6/7/8 field contracts
are unchanged; a Command with extra/missing/different fields still fails inspection.

Public EN/AR SourceRejected guidance no longer demands XSD conversion. No endpoint,
permission, schema/migration, client payload or Angular UI change. Angular manager
and existing Next/Mobile consumers retain their prior platform scope and error
adapters. Independent Crystal build and metadata-policy/alias/HTTP contract harness
pass. Full ERP1244 tests pass/0 fail/3 existing opt-in browser skips; Reporting207,
Architecture70, Integration189. No client build/test rerun is claimed for this
runtime/API-localization change.

Native acceptance remains unverified: the local ReportDocument constructor fails
with a type-initializer exception before opening a report; a current user RPT path
has not been supplied. This is an environment blocker, not evidence of a valid PDF
or of the cause of the user's specific Command behavior. Publish the current Crystal
project and ERP API using existing profiles; check a real Command RPT with the design
database unavailable, known API-only rows and an empty payload before release.
Do not use successful compilation/metadata fixtures as proof that Crystal makes
zero database calls. FOLLOW-024/PROD-028 retain that native check, Phase06 remains
Not Verified and Phase07 not started. No remote deployment occurred.

Canonical scope/research/verification:
documentation/plans/business/global-crystal-template-management/COMMAND_PUSH_DATA_2026-11-03.md.
Current technical receipt: verification/command-push-data/verification.json under
the global-crystal-template-manager feature. Earlier receipts remain historical.


## 25. All connection inspection removed; exact user-file diagnosis — 2026-11-03

Requester explicitly superseded section24's remaining embedded-password check:
the RPT receives ERP API rows as a container. Inspection/render admission no longer
reads LogOnInfo, ConnectionInfo or any design connection property, including password.
The obsolete hasEmbeddedCredentials receipt field is omitted, not claimed false;
ERP ignores that property if supplied by older runtimes. Exact managed fields and
parameters, single source, saved-data, subreport and SQL-expression rules remain.
No SQL pull/fallback is introduced; table-specific binding and RPT bytes stay unchanged.

Observed upload causes: Countries1.rpt fails the existing entity-prefix naming rule;
Countries.1.rpt passes naming but deployed native inspection requires a table/Command.
Read-only Crystal10 metadata of G:/Countries.1.rpt reports0tables/fields/parameters.
G:/Countries.test.rpt is natively rejected for saved data. Original hashes are
unchanged. A completely empty RPT cannot display incoming columns without report
field definitions; removing connection inspection does not build that layout.

The hosted service's build matched the previous Command-support build before this
new complete-ignore change. Its Countries.WithStates.rpt fixture passes source and
field checks and reaches parameter mismatch, not a valid PDF. No current-build
deployment, report upload into ERP, file edit or positive render is claimed.

Both Crystal projects build and the contract/HTTP harness passes. Full ERP Release
restore/build/test passes1248/0failed/3existing opt-in browser skips; Reporting211,
Architecture70, Integration189. New tests cover absent/true/false obsolete connection
flags, non-disclosure and retained saved-data rejection. No client UI, authorization,
schema/migration or consumer payload change; client suites were not rerun.

Canonical rules/diagnosis and original file hashes: CONNECTION_IGNORE_2026-11-03.md
under the global-crystal-template-management plan. Current portable evidence:
verification/connection-ignore/ under this feature. The user publishes Crystal and
ERP through existing profiles, then rechecks a designed report with actual fields
and no saved data. Native PDF/empty/filter/no-design-SQL acceptance remains
FOLLOW-024/PROD-028, Phase06 Not Verified; DEF-028/DEF-027 stay Deferred.


## 26. RPT container: connections and saved data accepted — 2026-11-03

Requester explicitly supersedes sections24/25's retained saved-data rejection:
upload the RPT as supplied and use it as a container for ERP API rows. Neither
native admission nor ERP reads/rejects connection/password/saved-data flags.
Obsolete hasSavedData/hasEmbeddedCredentials receipt fields are omitted rather
than asserted false; older receipts' optional flags are ignored. No XSD rebind or
clearing saved rows in the designer is required merely for uploading.

Each render still loads a fresh temporary instance and binds the received table
unconditionally, including zero rows, before PDF export. Dummy-data/save-data/
save-summary options are disabled on the in-memory instance. Save options alone
are not claimed to purge native row caches; native supplied/filtered/empty-record
proof remains Required. No design SQL fallback or original-RPT save occurs.
The retained structural contract is separate: one named table/Command, approved
fields/Language and current subreport/SQL-expression limits. No public endpoint,
permission, persistence or client UI change. Native original source downloads
remain byte-identical and may contain saved rows; RISK-019 owns that distinction.

Both Crystal projects build and their contract/HTTP harness passes. ERP Release
restore/build passes; full1250 tests pass with3existing opt-in browser skips
(Reporting213, Architecture70, Integration189). The default parallel run hit the
unrelated bounded MessageLog Snapshot write timeout. The complete rerun used the
documented xUnit.ParallelizeTestCollections=false switch; no test/timeouts changed
and the first failure is preserved. No client suite rerun is claimed.

Exact G:/Countries.tests.rpt,46592bytes, was rejected by the published prior build
for saved data; the new code removes that gate. It is not declared natively valid
until the new service actually inspects it. Local managed native probes remain
blocked/bounded; no real PDF, filtered/empty cache result, zero-design-SQL proof or
remote deployment occurred. User publishes Crystal and ERP with existing profiles,
then uploads the original file without clearing its data/connection.

Canonical scope/research: CONTAINER_DATA_2026-11-03.md in the current plan. Current
portable receipts: verification/container-data/. FOLLOW-024/PROD-028 stay Open,
Phase06 Not Verified; DEF-028/DEF-027 stay Deferred. Local ERPSYSTEM_Local remains
prepared under LOCAL_SQL_DATABASE_2026-11-03.md; hosted configuration is unchanged.


## 27. Language is optional in the RPT — 2026-11-03

Current GCT-1 correction supersedes earlier mandatory RPT Language instructions.
The render request still selects ar/en, but zero report parameters passes. When
Language exists, its case-insensitive name and String/single-discrete shape are
used to set the requested value; default lists, editable values and prompt-required
options do not block upload. No call to SetParameterValue is made when absent.
Unknown/multiple/ranged/numeric parameter shapes remain separate unsupported inputs.

Exact Countries.tests.rpt passed native fields and reached the previous parameter-set
failure; no actual parameter list or successful new native PDF is inferred. Both
independent Crystal projects and the metadata/HTTP harness pass, including no-Language
cases for all5 entity profiles and supported optional/default/case variations.
Only native validator/binder/harness changed. ERP/client/public transport/canonical
artifact/fingerprint/schema/permissions are unchanged, so full ERP/client suites
were not rerun. Previous1250-test ERP receipt remains historical, not a new run.

Requester publishes CrystalReportGeneratorApi only, then retries the same RPT
without adding Language. Connection/saved-data gates stay removed; native positive
PDF/empty/cache proof remains FOLLOW-024/PROD-028 and Phase06 Not Verified. No file
edit or remote deployment by this work. DEF-028/DEF-027 remain Deferred; further
designer-package guidance stays with DEF-028. RISK-019 original-source contents remain.
Canonical scope/research: OPTIONAL_RPT_LANGUAGE_2026-11-03.md under current plan.
Current portable receipt: verification/optional-rpt-language/verification.json.


## 28. First report display confirmed by requester — 2026-11-03

Requester confirmed «كده تمام والتقرير عرض البيانات». Basic display with data is
now user-confirmed for the current ready-made report journey, superseding earlier
absence of any reported positive display. This turn did not independently capture
a PDF, report ID/version/hash or verify origin/cache/empty/filter/ACL/locale behavior.
Canonical evidence and boundaries: FIRST_REPORT_DISPLAY_2026-11-03.md under the
current plan; verification/first-report-display/confirmation.json. No runtime change
or test rerun. FOLLOW-024/PROD-028 retain the broader checks and Phase06 remains
Not Verified. DEF-028/DEF-027 remain Deferred until explicit requester resumption.


## 29. Report viewer requires explicit publication — 2026-11-03

Verified cause: the platform-reader catalog treated importable deployment files as
published and rendering accepted their unmanaged identities. That compatibility
fallback is removed from viewer queries. Both Super Admin and company consumers
now receive only active managed templates with a valid current published version.
Company scope and grants remain required; source-download rights stay separate.
Unmanaged render identities return NotFound before file/data/native work; managed
unpublished/stale tokens retain the existing conflict response. A newer draft does
not replace the older published version. Archived reports cannot be consumed.

Report Manager keeps draft/archived administration and Register existing reports
keeps deployment discovery. Register/import and explicitly Publish a deployment
file before using it in the viewer; there is no automatic publication/migration.
Angular already consumes this catalog with isPublished=true/isArchived=false;
there is no local dropdown/control change or Angular gate/browser claim. Next.js
and mobile contracts are unchanged and inherit the API publication policy; mobile
manager remains Deferred. Native Crystal and the database schema are unchanged.

Canonical bounded scope: PUBLISHED_VIEWER_CATALOG_2026-11-03.md under the current
plan. Current automated evidence is verification/published-viewer-catalog/.
Publish ErpSystem.Api only, then refresh/reopen the viewer and verify the hosted
selector. No remote deployment or native PDF/empty/cache acceptance is claimed.
FOLLOW-024/PROD-028 remain Open; Phase06 Not Verified. DEF-027/DEF-028 remain Deferred.


Requester subsequently confirmed: «تمام ظهر المنشور فقط». This records the
selector outcome as requester-confirmed; the environment was not independently
observed. Full ERP restore/Release build passed (repository analyzer warnings,
zero errors); 1251 tests passed, zero failed, three existing opt-in browser skips
across12 projects, including214Reporting/70Architecture/189Integration. SQL draft,
older-published/newer-draft and archive projections executed in isolated databases.

The language follow-up needs no runtime change: Angular already sends JSON
`language: "ar" | "en"` from LocalizationRuntime with each render request. ERP
forwards multipart `language`; Crystal assigns the optional RPT `Language`
parameter when present. This is parameter delivery, not automatic translation of
report text/data. Source tracing and current test evidence are in the receipt;
no new native parameter/PDF export is independently claimed.

Existing Angular report tests passed:34tests in4files, covering the render JSON,
HTTP body, applied filters and language-change state/view behavior. No client
source change or full Angular gate/native execution claim.


## 30. Restore API-owned Crystal direction and bilingual Summary Info — 2026-11-03

Requester explicitly asks to restore the historical direction stage and retain the
Arabic/English names authored in Summary Info. Historical commit37b91c6c^ proves
CrystalReportRenderer called CrystalReportDirection.AdjustReportDirection before
PDF export; commit37b91c6c removed the helper. The current native renderer had no
replacement. This correction supersedes earlier no-object-mutation/mirroring
statements only for the narrowly restored layout stage.

CrystalReportDirection now runs once on each fresh temporary ReportDocument after
API table binding and before PDF export. Arabic keeps design coordinates; English
mirrors fields, text, pictures and charts against printable page width. Fields and
text retain historical centered alignment for both languages. Horizontal lines
mirror, English vertical lines remain suppressed per the legacy policy, diagonal
lines retain their design, and other drawings mirror captured original bounds.
All coordinates use SAP SDK twips. No source RPT save, formula injection, design
SQL/connection or extra report parameter is introduced. Language remains optional
inside an RPT and ar/en remains required in the request. Per-field content formulas
may still select NameAr/NameEn; layout mirroring itself needs only request language.

Inspection already reads ReportTitle and ReportSubject into immutable version
metadata. Angular's existing shared report selector displays Title for Arabic and
Subject for English, falling back to displayName when the selected value is empty.
This client runtime behavior is retained; added tests exercise the actual selector
labels and language changes. No frontend production/layout/control change, route,
DTO, permission, publication or database change. Next/mobile consume the same PDF;
mobile manager remains Deferred.

Canonical corrective plan/evidence: RESTORE_DIRECTION_2026-11-03.md under the
current plan and verification/restore-direction/. Publish CrystalReportGeneratorApi
with the existing profile, then compare actual AR/EN PDFs using an Arabic-basis
RPT. Native builds/harness geometry and call-order assertions do not establish
native setter/export/visual results. FOLLOW-024/PROD-028 retain that release proof;
Phase06 Not Verified, DEF-027/DEF-028 still Deferred. Earlier first-display and
published-only user confirmations remain valid historical evidence.


Verification: the regression first failed with the missing direction-stage
message, then the real SDK Release build and complete contract/HTTP harness
passed.12geometry/language cases plus pre-export call-order checks pass. The
first AnyCPU harness invocation could not load the existing x64 runtime; the
recorded red/green cycle uses the existing x64 harness configuration. Full Angular
check passes, including zero-warning lint, architecture/strict types,512unit tests
in91files, format and production build (495.63kB initial). Three new selector tests
verify Summary Info names and bilingual fallback. No Angular production source
change. No ERP/DTO/schema change or fresh ERP full-suite claim.

The actual native AR/EN PDF comparison remains FOLLOW-024/PROD-028. Source/history
review confirms the requested policy and fresh-instance call order; automated
geometry does not execute native shape setters. Current portable receipt:
verification/restore-direction/verification.json. No deployment or server restart.


## 31. Summary Info selector diagnosis — 2026-11-03

Requester confirms direction changed, but the selector name did not load. This is
user-confirmed direction behavior, not independent acceptance of all shape cases.
Read-only hosted inspection of the local G:/Countries.tests.rpt candidate (44544
bytes, SHA256 e9505470cfeb41d6c1dc7f05eb04ad94870435a0387c6c8f1345d10829fa84d7)
returned HTTP200, valid=true, Title=null and Subject=null. Independent OLE property
inspection of its SummaryInformation stream (codepage1256) also found empty Title
and Subject. No source file or business record was modified by these probes.

The local candidate is not yet matched to the report's currently published
version. The public catalog's reportKey/summaryTitle/summarySubject/version was
requested without credentials. Do not infer the hosted stored metadata from the
local file alone. Current source preserves inspection -> immutable version ->
published catalog -> localized Angular selector. The prior three DOM tests prove
Title(ar)/Subject(en) and displayName fallback, not that a user's source has names.

For this same candidate, save Title(ar)/Subject(en) in Crystal Designer's Summary
Info, then upload a new immutable version, inspect, explicitly Publish and refresh
the viewer. A local RPT edit does not alter an already uploaded/published source;
Revalidate updates validation evidence, not immutable source summary metadata.
Do not synthesize names or rewrite existing version bytes to hide missing values.
No runtime change or test rerun is made for this diagnosis. Current evidence:
SUMMARY_NAMES_2026-11-03.md / verification/summary-names/. FOLLOW-024/PROD-028 remain
Open, Phase06 Not Verified and DEF-027/DEF-028 remain Deferred.


Published-catalog follow-up: the requester could not copy Network because DevTools
was attached to the embedded Edge PDF viewer. Native browser inspection observed
the actual authenticated catalog directly: countries-tests, displayName
Countries.tests, summaryTitle=null, summarySubject=null, currentVersionNumber=1,
isPublished=true/isArchived=false. The English ERP selector visibly shows
Countries.tests. This establishes missing persisted names in the published version
and correct fallback presentation; no UI label bug or speculative fix is inferred.
Byte identity with the local file has not been verified, but no longer blocks the
published-metadata diagnosis. No further Network copy is required from the user.

A separate read-only API tab was opened and the original ERP tab restored. No
credential, browser preference, source file or business record was changed. The
observed DevTools target is edge_pdf/index.html; lifecycle closing with replaced
PDF content is an inference, not a verified DevTools configuration diagnosis.
Evidence: verification/summary-names/published-catalog-observation.json. The
correction remains saving Summary Info in the intended RPT, uploading a new
version and explicitly publishing it. No runtime change or test rerun.


## 32. Confirmed duplicate replacement — 2026-11-03

Requester approves duplicate identity by normalized RPT filename within the same
entity, and confirmed save+publication of a new immutable version with the old
publication replaced atomically. Canonical scope, ownership, failure matrix and
execution ledger: DUPLICATE_REPLACEMENT_2026-11-03.md. Extend current GCT-1, reuse
existing aggregate/version/grants/View identity and shared confirmation/Grid.
New files and existing explicit draft-upload/publish contracts remain compatible.
Historical labels use version/date without renaming stored sources or report keys.
API+Angular implementation and all quality gates are required; no native Crystal,
schema, Next/mobile management change or deployment. Existing consumers inherit
publication/token behavior. FOLLOW-024/PROD-028 retain hosted/native acceptance;
DEF-027/028 remain Deferred. Implementation and verification are recorded below.

### 32.1 Implemented API boundary — 2026-11-04

GET /api/v1/global-crystal-reports/manage/upload-target accepts entityKey/fileName
and returns a non-null {report, canReplace} wrapper, including null report for a
new identity. It requires Create authority and uses the existing FileStemToKey
normalization within the entity; Summary Info does not determine duplication.
POST /api/v1/global-crystal-reports/manage/{id}/replace accepts multipart file and
rowVersion. Both Upload and Publish policies are required, alongside entity Edit,
View and the existing per-report rights/access-administrator rule. The handler
checks the snapshot token, inspects/stores, then rechecks state/rights/token under
the existing report resource lock. It appends and publishes in one transaction.
An uncommitted private source is cleaned up; old source/history/grants remain.
No migration or native Crystal change. A real isolated SQL test applies existing
migrations and proves rollback after SaveChanges followed by successful replacement.
All public create/upload/publish contracts remain compatible. Final gate receipt:
verification/duplicate-replacement/verification.json.

### 32.2 Technical verification — 2026-11-04

Full ERP restore/Release build passed; 1266 tests passed across12
projects,0failed and3existing opt-in authentication-browser probes skipped.
Reporting227, architecture70, integration191. The new SQL replacement test proves
rollback after SaveChanges and successful commit using actual existing migrations.
Build retains44 inherited analyzer warnings; replacement sources introduce none.
Angular full check passed521tests/91files, including format/lint/architecture/
strict types/templates/catalog and production build; focused manager35tests pass.
Four isolated production-build browser cases passed EN/AR at1213px/390px, including
warning before write, cancellation, one replacement request and version/date labels.
Selected actual screenshots were visually reviewed. Canonical portable receipt:
verification/duplicate-replacement/verification.json.

The first Angular attempt hit C-drive ENOSPC; a process-scoped G scratch cache/TEMP
resolved it and the full gate passed. Generic API permission metadata verification
was corrected to enumerate multiple policies and now explicitly requires both
Upload and Publish. Official source references and exact test names are in the
receipt. No dev server, deployment, live report writes or native changes occurred.
Phase06 remains Not Verified for overall hosted/native acceptance under FOLLOW-024/
PROD-028; this bounded implementation passed its technical gates.

## 33. Vertical-line mirroring correction — 2026-11-04

The requester requires vertical lines to mirror instead of disappearing. This
supersedes the English vertical suppression rule in section30 and the historical
RESTORE_DIRECTION_2026-11-03.md receipt. Current corrective scope/preflight:
VERTICAL_LINES_2026-11-04.md, existing plan global-crystal-template-management/GCT-1.

CrystalReportDirection now snapshots RAS line objects, deep-clones each axis-aligned
line, changes both X endpoints on the detached clone, and commits through
ReportObjectController.Modify. It retains Y endpoints, start/end sections,
extend-to-bottom, original suppression and formatting. Arabic design coordinates,
English field/text/picture/chart mirroring, centered text and diagonal-line policy
are retained. Horizontal lines use the same atomic path. No original RPT save,
database query, schema, permission, publication or request-contract change.

The actual SAP13.0.4000 Release/x64 build and complete .NET Framework4.8 contract/
HTTP harness pass.14 language/geometry cases and pre-export wiring pass; the new
regression first failed against the previous suppression policy. Native Windows
PowerShell64-bit execution is now available. The optional native verification
script loads Countries.tests.rpt by temporary copy, binds two synthetic API rows,
adds four in-memory fixture lines, and invokes the real compiled Apply method.
Both languages pass endpoint/style/visibility/section assertions and export PDFs.
Visible red vertical, blue horizontal and green cross-section lines are present
and mirrored in the actual PDF vectors; the design-suppressed yellow line remains
absent. Both PDF images were visually reviewed. The source RPT contains no lines;
fixture lines are deliberately injected only in memory and its SHA256 is unchanged.
This proves the shared native correction with fixtures, not every hosted template.

Portable current evidence: verification/vertical-lines/verification.json,
native-direction.json, pdf-lines.json and the two synthetic PDFs. The native
script is Verify-CrystalReportDirection.ps1 in the existing ContractTests project.
Earlier environment-limited receipts remain historical. Publish only
CrystalReportGeneratorApi for this correction, then verify the intended hosted
RPT in AR/EN. No agent deployment or server restart occurred.

Angular and Next consumers inherit the renderer fix through the existing language
request. Their screens are unchanged; no client gate rerun is claimed. Mobile
management remains Excluded; existing viewers inherit the same renderer. The ERP
modular API and database are unchanged. FOLLOW-024/PROD-028 remain Open for the
broader integrated/hosted acceptance, Phase06 remains Not Verified overall and
DEF-027/028 remain Deferred. No Phase07 closure is claimed.

Official research: [SAP clone/modify report objects](https://help.sap.com/doc/1eb6ed2630b940d49d85e22ba94c35bc/4.3.2/en-US/Tomodifyareportobject.html).

## 34. Native PDF viewer theme and new-tab printing — 2026-11-04

Angular-only shared presentation correction. ERP and Crystal APIs, RPT output, language requests, database schema and publication remain unchanged. No API gate rerun is claimed for this client-only correction.

The requester retained the native iframe and original PDF colors. Open PDF uses
a new browser tab for native printing; Edge toolbar theming remains browser-owned.
Shared viewer evidence and the accepted limitation are in section34 of the web
profile and verification/pdf-viewer-theme/verification.json. FOLLOW-024/PROD-028
remain Open for broader integrated acceptance. No backend deployment is needed for
this Angular styling correction.


## 35. Shared sidebar tabs, RTL indicator and manager pagination — 2026-11-04

Endpoint, authorization, report lifecycle and database behavior are unchanged.
The new bilingual reports.viewerOptions label changes the generated embedded UI
catalog fingerprint to13210765d2afb878148664cdfe80c76fd187a4c66b2d8e4160baf9d24be1e219.
Publish ErpSystem.Api catalog and Angular together under the existing exact-version
localization handshake. CrystalReportGeneratorApi needs no publication for these
UI changes. No API behavior gate rerun or database migration is claimed. Angular
and bounded browser evidence live in verification/sidebar-actions/. FOLLOW-024
and PROD-028 retain hosted/integrated acceptance. See web section35 for details.

## 36. Countries column filters in the main manager — 2026-11-04

Requester requires the existing Countries column-filter controls. The main manager
enables MyDataGrid.advancedFilters, controlled filters and filtersChange for all six
data columns: displayName/reportKey text, entityKey/status choices, published
currentVersionNumber integer and updatedOn date. Existing shared PrimeNG ColumnFilter,
GridFilterInput, TextField/NumericField/DateField and OptionSelect are reused. No new
application component, pagination implementation or feature-local filter shell.
Countries recordNavigation=true remains on all three manager grids. Candidate and
version grids retain their existing contracts; these column rules target the main catalog.

Apply/Clear resets pageIndex0. Draft editing does not request data. Multiple field
groups combine with AND; each group supports AND/OR and at most four constraints.
Entity/status labels are translated while the wire uses stable keys. Shared optional
GridColumnFilter.choices accepts bounded unique nonempty values and explicit
equals/notEquals modes. Blank All clears to null; unlisted values are rejected.
Feature service/state retain HTTP, validation, identity reset and criteria ownership.

Reporting extends its current query/handler/store through POST /manage/query, a
32768-byte authenticated read body. Existing GET remains compatible when no rules
exist. Six fields, four rules per field, text200 and strict typed/allowlisted values
are validated; nested unknown members, duplicate fields and bad dates/modes fail.
Existing SuperAdmin/View permission and editable entity allowlist apply unchanged.
Rules run before count/order/page; topbar entity/status/search are additional AND
restrictions. Existing default excludes archived reports: archived column criteria
must also agree with the topbar archive scope. Current version means the displayed
published version, never draft version0. Numeric comparisons exclude null versions;
dateIsNot includes null dates and UTC day ranges handle the maximum date safely.
Text comparisons are case insensitive and expression-based; no SQL interpolation.
No domain entity/schema/migration, business write, company runtime or Crystal change.

Verification is recorded in verification/column-filters/verification.json. Full
Angular check passes530tests/92files,26architecture tests, zero-warning lint,
formatting, strict types/templates and production build (495.63kB initial).
Focused Angular29/4files and API management40tests pass; all231Reporting tests pass.
Six production-asset browser fixture cases EN/AR x1213/780/390 prove six filter
controls, title/status Apply/Clear, draft isolation, translated stable values,
combined criteria/page reset and the Countries footer. Small Arabic and wide English
filter screenshots were visually reviewed. These fixtures do not prove hosted queries.

API solution restore and no-incremental Release build pass (473existing warnings,
zero errors). Full solution tests:1269passed,1failed,3skipped. The unchanged Platform
MessageLogTests.ActualSenderRecordsTruthfulOutcomeWithoutReplayOrLiveSecrets
configuration case finds no recorded row under full-suite load; its isolated9case
diagnostic passes. Root cause is not established and the full gate remains red.
Architecture70 and Integration191passed/3skipped use the available local SQL Server
with Windows integrated authentication and isolated test databases. Initial scratch
root/LocalDB and transient Angular timeout issues are distinguished in the receipt;
no production code or tests were weakened to hide them.

Scope/preflight: COLUMN_FILTERS_2026-11-04.md, approved GCT-1. PrimeNG MCP was unavailable;
official [Table](https://primeng.dev/table#filter) and [Select](https://primeng.dev/select)
documentation and installed source were consulted; no MCP validation claimed.
Publish Angular with ErpSystem.Api for the new query route and synchronized existing
catalog fingerprint13210765d2afb878148664cdfe80c76fd187a4c66b2d8e4160baf9d24be1e219.
No deployment/server start/restart or live report mutation occurred. Next runtime is
unchanged; mobile management remains Excluded. Overall Phase06 remains Not Verified;
FOLLOW-024/PROD-028 stay Open and DEF-027/028 Deferred; Phase07 is not started.

## 37. Report search arrangement and button icons — 2026-11-04

UI-only corrective change: no endpoint, query, authorization, schema or Crystal
runtime change. Angular applies the approved sidebar order, shared footer and icon
presentation documented in web section37 and verification/search-sidebar-layout/.
API was not retested for this UI-only correction. Section36 retains its honest
full-solution failure and focused Reporting proof. Overall Phase06 Not Verified;
FOLLOW-024/PROD-028 Open and DEF-027/028 Deferred.

## 38. Manager action hierarchy and saved metadata review — 2026-11-04

No API/schema/Crystal runtime change. Next create/detail review confirms existing
entity, description, Summary title/subject, versions and access contracts are already
supported; Angular now presents saved metadata and actions clearly. Section38 web
and verification/manager-actions-metadata/ hold531test and6browser-case evidence.
Current-version precedence has a UI regression. Prior section36 full API-suite
finding remains unchanged; API not retested for this UI-only change. Phase06 Not
Verified; FOLLOW-024/PROD-028 Open and DEF-027/028 Deferred.

## 39. Shared PrimeNG action groups — 2026-11-04

Angular-only shared Button Group follow-up; see web section39 and
verification/manager-button-group/. No API/schema/Crystal change; mobile manager
Excluded and Next runtime unchanged. Final Angular532test and6case browser proof
retains existing permissions and metadata. Prior API suite finding stays section36;
no API retest. Phase06 Not Verified, FOLLOW-024/PROD-028 Open, DEF-027/028 Deferred.
